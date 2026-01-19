"""
ASR Processor - Whisper-based speech recognition.

Produces word-level transcription with timestamps.
"""

import tempfile
from dataclasses import dataclass
from pathlib import Path

import whisper

from ..config import settings


@dataclass
class TranscriptWord:
    """A single word with timing information."""
    word: str
    start: float  # Start time in seconds
    end: float    # End time in seconds
    confidence: float = 1.0


@dataclass
class TranscriptResult:
    """Full transcription result."""
    text: str
    words: list[TranscriptWord]
    language: str
    duration: float


class ASRProcessor:
    """Whisper-based ASR processor."""

    def __init__(self, model_name: str | None = None):
        """
        Initialize ASR processor.

        Args:
            model_name: Whisper model name (tiny, base, small, medium, large)
        """
        self._model_name = model_name or settings.whisper_model
        self._model = None

    def _load_model(self):
        """Lazy load the Whisper model."""
        if self._model is None:
            self._model = whisper.load_model(
                self._model_name,
                device=settings.whisper_device,
            )
        return self._model

    def transcribe(self, audio_path: str | Path) -> TranscriptResult:
        """
        Transcribe audio file.

        Args:
            audio_path: Path to audio file

        Returns:
            TranscriptResult with word-level timestamps
        """
        model = self._load_model()

        # Transcribe with word timestamps
        result = model.transcribe(
            str(audio_path),
            word_timestamps=True,
            language="en",
        )

        # Extract words from segments
        words = []
        for segment in result.get("segments", []):
            for word_info in segment.get("words", []):
                words.append(TranscriptWord(
                    word=word_info["word"].strip(),
                    start=word_info["start"],
                    end=word_info["end"],
                    confidence=word_info.get("probability", 1.0),
                ))

        # Calculate duration from last word or segments
        duration = 0.0
        if words:
            duration = words[-1].end
        elif result.get("segments"):
            duration = result["segments"][-1]["end"]

        return TranscriptResult(
            text=result["text"].strip(),
            words=words,
            language=result.get("language", "en"),
            duration=duration,
        )

    def transcribe_bytes(self, audio_bytes: bytes, suffix: str = ".wav") -> TranscriptResult:
        """
        Transcribe audio from bytes.

        Args:
            audio_bytes: Raw audio bytes
            suffix: File extension hint

        Returns:
            TranscriptResult with word-level timestamps
        """
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=True) as f:
            f.write(audio_bytes)
            f.flush()
            return self.transcribe(f.name)


# Singleton instance
_asr_processor: ASRProcessor | None = None


def get_asr_processor() -> ASRProcessor:
    """Get or create ASR processor singleton."""
    global _asr_processor
    if _asr_processor is None:
        _asr_processor = ASRProcessor()
    return _asr_processor
