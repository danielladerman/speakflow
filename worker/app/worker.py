"""
SpeakFlow Worker - Main job processor.

Consumes jobs from Redis queue and processes audio:
1. Download audio from storage
2. Run Whisper ASR
3. Extract features
4. Score session
5. Generate coaching
6. Update database with results
"""

import asyncio
import json
import signal
from datetime import datetime
from typing import Any
from uuid import UUID

import redis.asyncio as redis
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from .config import settings
from .processors.asr import ASRProcessor, get_asr_processor
from .processors.features import FeatureExtractor
from .processors.scoring import ScoringEngine
from .services.coaching import CoachingService
from .core.storage import StorageClient, LocalStorageClient, S3StorageClient, get_storage
from .models.session import Session, SessionStatus


class Worker:
    """Main worker class that processes analysis jobs."""

    def __init__(self):
        self._running = False

        # Database
        self._engine = create_async_engine(settings.database_url)
        self._session_factory = async_sessionmaker(
            self._engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )

        # Redis
        self._redis: redis.Redis | None = None

        # Processors
        self._asr: ASRProcessor | None = None
        self._feature_extractor = FeatureExtractor()
        self._scoring_engine = ScoringEngine()
        self._coaching_service: CoachingService | None = None

        # Storage
        self._storage: StorageClient | None = None

    async def start(self):
        """Start the worker."""
        print(f"Starting SpeakFlow Worker...")
        print(f"  Queue: {settings.queue_name}")
        print(f"  Whisper model: {settings.whisper_model}")

        # Initialize connections
        self._redis = redis.from_url(settings.redis_url)
        self._storage = self._get_storage()

        # Lazy-load ASR and coaching (heavy resources)
        self._asr = get_asr_processor()
        if settings.openai_api_key:
            self._coaching_service = CoachingService()
        else:
            print("  WARNING: No OpenAI API key - coaching disabled")

        self._running = True
        print("Worker started. Waiting for jobs...")

        # Main loop
        while self._running:
            try:
                await self._process_next_job()
            except Exception as e:
                print(f"Error processing job: {e}")
                await asyncio.sleep(1)

    async def stop(self):
        """Stop the worker gracefully."""
        print("Stopping worker...")
        self._running = False
        if self._redis:
            await self._redis.close()
        if self._engine:
            await self._engine.dispose()

    async def _process_next_job(self):
        """Process the next job from the queue."""
        # Block waiting for job (with timeout for graceful shutdown)
        result = await self._redis.brpop(
            settings.queue_name,
            timeout=int(settings.poll_interval_sec),
        )

        if result is None:
            return  # Timeout, check if still running

        _, job_data = result
        job = json.loads(job_data)

        job_type = job.get("type")
        payload = job.get("payload", {})

        print(f"Processing job: {job_type}")

        if job_type == "analyze_session":
            await self._process_analysis_job(payload)
        else:
            print(f"Unknown job type: {job_type}")

    async def _process_analysis_job(self, payload: dict[str, Any]):
        """
        Process an audio analysis job.

        Steps:
        1. Mark session as processing
        2. Download audio
        3. Run ASR
        4. Extract features
        5. Score
        6. Generate coaching
        7. Update session with results
        """
        session_id = UUID(payload["session_id"])
        audio_key = payload["audio_key"]
        content_type = payload.get("content_type", "audio/wav")

        async with self._session_factory() as db:
            try:
                # 1. Mark as processing
                await db.execute(
                    update(Session)
                    .where(Session.id == session_id)
                    .values(status=SessionStatus.PROCESSING)
                )
                await db.commit()

                # 2. Download audio
                print(f"  Downloading audio: {audio_key}")
                audio_bytes = await self._storage.download(audio_key)

                # 3. Run ASR
                print(f"  Running ASR...")
                suffix = self._get_suffix(content_type)
                transcript = self._asr.transcribe_bytes(audio_bytes, suffix)
                print(f"  Transcribed: {len(transcript.words)} words, {transcript.duration:.1f}s")

                # 4. Extract features
                print(f"  Extracting features...")
                features = self._feature_extractor.extract(transcript, audio_bytes)
                print(f"  Features: WPM={features.wpm}, Fillers={features.filler_per_min}/min")

                # 5. Score
                print(f"  Scoring...")
                score_contract = self._scoring_engine.score(session_id, features)
                print(f"  Scores: Overall={score_contract.scores.overall}, Focus={score_contract.focus_metric.value}")

                # 6. Generate coaching (if available)
                coaching_response = None
                if self._coaching_service:
                    print(f"  Generating coaching...")
                    coaching_response = self._coaching_service.generate_coaching(score_contract)
                    print(f"  Coaching: {len(coaching_response.recommended_drills)} drills recommended")

                # 7. Update session
                transcript_json = [
                    {
                        "word": w.word,
                        "start": w.start,
                        "end": w.end,
                        "confidence": w.confidence,
                    }
                    for w in transcript.words
                ]

                await db.execute(
                    update(Session)
                    .where(Session.id == session_id)
                    .values(
                        status=SessionStatus.COMPLETED,
                        duration_sec=transcript.duration,
                        score_contract=score_contract.model_dump(mode="json"),
                        coaching_response=coaching_response.model_dump(mode="json") if coaching_response else None,
                        transcript=transcript_json,
                        completed_at=datetime.utcnow(),
                    )
                )
                await db.commit()

                print(f"  ✓ Session {session_id} completed")

            except Exception as e:
                print(f"  ✗ Error processing session {session_id}: {e}")
                await db.execute(
                    update(Session)
                    .where(Session.id == session_id)
                    .values(
                        status=SessionStatus.FAILED,
                        error_message=str(e),
                    )
                )
                await db.commit()
                raise

    def _get_storage(self) -> StorageClient:
        """Get storage client based on configuration."""
        return get_storage()

    def _get_suffix(self, content_type: str) -> str:
        """Get file suffix from content type."""
        suffixes = {
            "audio/wav": ".wav",
            "audio/mpeg": ".mp3",
            "audio/mp4": ".m4a",
            "audio/m4a": ".m4a",
            "audio/x-m4a": ".m4a",
        }
        return suffixes.get(content_type, ".wav")


async def main():
    """Main entry point."""
    worker = Worker()

    # Handle graceful shutdown
    loop = asyncio.get_event_loop()

    def shutdown_handler(sig):
        print(f"\nReceived {sig.name}, shutting down...")
        asyncio.create_task(worker.stop())

    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, lambda s=sig: shutdown_handler(s))

    await worker.start()


if __name__ == "__main__":
    asyncio.run(main())
