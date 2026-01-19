"""
Queue abstraction for async job processing.

Uses Redis for the queue backend. Worker pulls from this queue.
"""

import json
from typing import Any
from uuid import UUID

import redis.asyncio as redis

from .config import settings


class QueueClient:
    """Redis-backed job queue client."""

    def __init__(self, redis_client: redis.Redis, queue_name: str):
        self._redis = redis_client
        self._queue_name = queue_name

    async def enqueue(self, job_type: str, payload: dict[str, Any]) -> str:
        """
        Add a job to the queue.

        Args:
            job_type: Type of job (e.g., 'analyze_session')
            payload: Job data (must be JSON-serializable)

        Returns:
            Job ID
        """
        # Convert UUIDs to strings for JSON serialization
        serializable_payload = self._make_serializable(payload)

        job = {
            "type": job_type,
            "payload": serializable_payload,
        }
        job_data = json.dumps(job)
        await self._redis.lpush(self._queue_name, job_data)

        # Return session_id as job reference
        return str(payload.get("session_id", ""))

    async def get_queue_length(self) -> int:
        """Get current queue length."""
        return await self._redis.llen(self._queue_name)

    def _make_serializable(self, obj: Any) -> Any:
        """Convert non-serializable types to serializable ones."""
        if isinstance(obj, UUID):
            return str(obj)
        elif isinstance(obj, dict):
            return {k: self._make_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._make_serializable(item) for item in obj]
        return obj


# Global client instance
_queue_client: QueueClient | None = None


async def get_queue() -> QueueClient:
    """Get or create queue client."""
    global _queue_client
    if _queue_client is None:
        redis_client = redis.from_url(settings.redis_url)
        _queue_client = QueueClient(redis_client, settings.queue_name)
    return _queue_client


async def close_queue() -> None:
    """Close queue connection."""
    global _queue_client
    if _queue_client is not None:
        await _queue_client._redis.close()
        _queue_client = None
