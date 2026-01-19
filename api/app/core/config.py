"""
Application configuration.

All settings loaded from environment variables with sensible defaults.
"""

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # App
    app_name: str = "SpeakFlow API"
    debug: bool = False
    environment: Literal["development", "staging", "production"] = "development"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/speakflow"

    # Queue (Redis)
    redis_url: str = "redis://localhost:6379/0"
    queue_name: str = "speakflow:analysis"

    # Object Storage (S3-compatible)
    storage_backend: Literal["s3", "local"] = "local"
    s3_bucket: str = "speakflow-audio"
    s3_region: str = "us-east-1"
    s3_endpoint_url: str | None = None  # For MinIO/LocalStack
    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None
    local_storage_path: str = "/tmp/speakflow/audio"

    # API
    api_prefix: str = "/api/v1"
    max_upload_size_mb: int = 50

    # Authentication
    jwt_secret: str = "your-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
