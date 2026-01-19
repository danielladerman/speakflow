"""
Session database model.

Must stay in sync with API's Session model.
"""

import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, DateTime, Enum, Float, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB

from ..core.database import Base


class SessionStatus(str, enum.Enum):
    """Session processing status."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Session(Base):
    """Recording session model."""
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    audio_key = Column(String(512), nullable=False)
    audio_url = Column(String(1024), nullable=True)
    duration_sec = Column(Float, nullable=True)
    content_type = Column(String(100), default="audio/wav")
    status = Column(Enum(SessionStatus), default=SessionStatus.PENDING, nullable=False, index=True)
    error_message = Column(Text, nullable=True)
    score_contract = Column(JSONB, nullable=True)
    coaching_response = Column(JSONB, nullable=True)
    transcript = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
