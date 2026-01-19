"""
User database model.

Stores user account information for authentication.
"""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..core.database import Base


class User(Base):
    """
    User account model.

    Stores authentication and profile information.
    """
    __tablename__ = "users"

    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        index=True,
    )

    # Authentication
    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    hashed_password = Column(
        String(255),
        nullable=False,
    )

    # Profile
    display_name = Column(
        String(100),
        nullable=True,
    )

    # Status
    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
    )
    is_verified = Column(
        Boolean,
        default=False,
        nullable=False,
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
    last_login_at = Column(
        DateTime,
        nullable=True,
    )

    # Relationships
    sessions = relationship("Session", backref="user", lazy="dynamic")

    def __repr__(self) -> str:
        return f"<User {self.email}>"

    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": str(self.id),
            "email": self.email,
            "display_name": self.display_name,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
