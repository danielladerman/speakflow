"""
Session database model.

Stores metadata about recording sessions and analysis results.
"""

import enum
from datetime import datetime
from typing import Any
from uuid import uuid4

from sqlalchemy import Column, DateTime, Enum, Float, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB

from ..core.database import Base


class SessionStatus(str, enum.Enum):
    """Session processing status."""
    PENDING = "pending"      # Audio uploaded, awaiting processing
    PROCESSING = "processing"  # Worker is analyzing
    COMPLETED = "completed"   # Analysis complete, report ready
    FAILED = "failed"        # Processing failed


class Session(Base):
    """
    Recording session model.

    Stores audio metadata, processing status, and analysis results.
    """
    __tablename__ = "sessions"

    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        index=True,
    )

    # User reference (for future auth)
    user_id = Column(
        UUID(as_uuid=True),
        nullable=True,
        index=True,
    )

    # Audio metadata
    audio_key = Column(
        String(512),
        nullable=False,
        comment="Storage key for audio file",
    )
    audio_url = Column(
        String(1024),
        nullable=True,
        comment="URL to access audio file",
    )
    duration_sec = Column(
        Float,
        nullable=True,
        comment="Audio duration in seconds",
    )
    content_type = Column(
        String(100),
        default="audio/wav",
        comment="MIME type of audio file",
    )

    # Processing status
    status = Column(
        Enum(SessionStatus),
        default=SessionStatus.PENDING,
        nullable=False,
        index=True,
    )
    error_message = Column(
        Text,
        nullable=True,
        comment="Error message if processing failed",
    )

    # Analysis results (stored as JSON matching ScoreContract)
    score_contract = Column(
        JSONB,
        nullable=True,
        comment="Full score contract JSON",
    )

    # Coaching results (stored as JSON matching CoachingResponse)
    coaching_response = Column(
        JSONB,
        nullable=True,
        comment="Full coaching response JSON",
    )

    # Transcript
    transcript = Column(
        JSONB,
        nullable=True,
        comment="Word-level transcript with timestamps",
    )

    # Timestamps
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
    completed_at = Column(
        DateTime,
        nullable=True,
        comment="When analysis completed",
    )

    def __repr__(self) -> str:
        return f"<Session {self.id} status={self.status}>"

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for API responses."""
        return {
            "id": str(self.id),
            "user_id": str(self.user_id) if self.user_id else None,
            "status": self.status.value,
            "duration_sec": self.duration_sec,
            "audio_url": self.audio_url,
            "score_contract": self.score_contract,
            "coaching_response": self.coaching_response,
            "transcript": self.transcript,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }
