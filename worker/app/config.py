"""
Worker configuration.

All settings loaded from environment variables.
"""

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Worker settings."""
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/speakflow"

    # Queue (Redis)
    redis_url: str = "redis://localhost:6379/0"
    queue_name: str = "speakflow:analysis"
    poll_interval_sec: float = 1.0

    # Object Storage
    storage_backend: Literal["s3", "local"] = "local"
    s3_bucket: str = "speakflow-audio"
    s3_region: str = "us-east-1"
    s3_endpoint_url: str | None = None
    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None
    local_storage_path: str = "/tmp/speakflow/audio"

    # Whisper ASR
    whisper_model: str = "base"  # tiny, base, small, medium, large
    whisper_device: str = "cpu"  # cpu or cuda

    # OpenAI (for coaching)
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"

    # Drill library path (Docker: /app/contracts/fixtures/...)
    drill_library_path: str = "/app/contracts/fixtures/speakflow_v1_drills.json"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
