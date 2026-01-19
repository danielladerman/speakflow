"""
Session API endpoints.

Handles audio upload, session creation, and report retrieval.
"""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings
from ..core.database import get_db
from ..core.queue import QueueClient, get_queue
from ..core.storage import StorageClient, get_storage
from ..models.session import Session, SessionStatus


router = APIRouter(prefix="/sessions", tags=["sessions"])


# Request/Response schemas
from pydantic import BaseModel


class SessionCreateResponse(BaseModel):
    """Response after creating a session."""
    session_id: str
    status: str
    message: str


class SessionStatusResponse(BaseModel):
    """Session status response."""
    session_id: str
    status: str
    duration_sec: float | None = None
    error_message: str | None = None
    created_at: str | None = None
    completed_at: str | None = None


class SessionReportResponse(BaseModel):
    """Full session report with scores and coaching."""
    session_id: str
    status: str
    duration_sec: float | None = None
    audio_url: str | None = None
    score_contract: dict[str, Any] | None = None
    coaching_response: dict[str, Any] | None = None
    transcript: list[dict[str, Any]] | None = None


@router.post(
    "/",
    response_model=SessionCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_session(
    audio: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    storage: StorageClient = Depends(get_storage),
    queue: QueueClient = Depends(get_queue),
) -> SessionCreateResponse:
    """
    Upload audio and create a new session.

    Flow:
    1. Validate audio file
    2. Store audio in object storage
    3. Create session record in database
    4. Enqueue analysis job
    5. Return session ID

    Mobile app should poll /sessions/{id}/status until complete.
    """
    # Validate file type
    if audio.content_type not in ["audio/wav", "audio/mpeg", "audio/mp4", "audio/m4a", "audio/x-m4a"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported audio format: {audio.content_type}. Use WAV, MP3, or M4A.",
        )

    # Validate file size
    audio.file.seek(0, 2)  # Seek to end
    file_size = audio.file.tell()
    audio.file.seek(0)  # Reset to beginning

    if file_size > settings.max_upload_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {settings.max_upload_size_mb}MB.",
        )

    # Create session record
    session = Session(
        status=SessionStatus.PENDING,
        content_type=audio.content_type,
    )
    db.add(session)
    await db.flush()  # Get the ID

    # Store audio
    audio_key = f"sessions/{session.id}/audio{_get_extension(audio.content_type)}"
    audio_url = await storage.upload(audio_key, audio.file, audio.content_type)

    # Update session with storage info
    session.audio_key = audio_key
    session.audio_url = audio_url

    await db.commit()
    await db.refresh(session)

    # Enqueue analysis job
    await queue.enqueue(
        job_type="analyze_session",
        payload={
            "session_id": session.id,
            "audio_key": audio_key,
            "content_type": audio.content_type,
        },
    )

    return SessionCreateResponse(
        session_id=str(session.id),
        status=session.status.value,
        message="Audio uploaded. Analysis queued.",
    )


@router.get(
    "/{session_id}/status",
    response_model=SessionStatusResponse,
)
async def get_session_status(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> SessionStatusResponse:
    """
    Get session processing status.

    Mobile app polls this endpoint until status is 'completed' or 'failed'.
    """
    result = await db.execute(
        select(Session).where(Session.id == session_id)
    )
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found",
        )

    return SessionStatusResponse(
        session_id=str(session.id),
        status=session.status.value,
        duration_sec=session.duration_sec,
        error_message=session.error_message,
        created_at=session.created_at.isoformat() if session.created_at else None,
        completed_at=session.completed_at.isoformat() if session.completed_at else None,
    )


@router.get(
    "/{session_id}",
    response_model=SessionReportResponse,
)
async def get_session_report(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> SessionReportResponse:
    """
    Get full session report with scores, coaching, and transcript.

    Only returns data if status is 'completed'.
    """
    result = await db.execute(
        select(Session).where(Session.id == session_id)
    )
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found",
        )

    if session.status == SessionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail="Session is pending analysis",
        )

    if session.status == SessionStatus.PROCESSING:
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail="Session is being analyzed",
        )

    if session.status == SessionStatus.FAILED:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {session.error_message}",
        )

    return SessionReportResponse(
        session_id=str(session.id),
        status=session.status.value,
        duration_sec=session.duration_sec,
        audio_url=session.audio_url,
        score_contract=session.score_contract,
        coaching_response=session.coaching_response,
        transcript=session.transcript,
    )


@router.get("/")
async def list_sessions(
    db: AsyncSession = Depends(get_db),
    limit: int = 20,
    offset: int = 0,
) -> list[SessionStatusResponse]:
    """List recent sessions (for debugging/development)."""
    result = await db.execute(
        select(Session)
        .order_by(Session.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    sessions = result.scalars().all()

    return [
        SessionStatusResponse(
            session_id=str(s.id),
            status=s.status.value,
            duration_sec=s.duration_sec,
            error_message=s.error_message,
            created_at=s.created_at.isoformat() if s.created_at else None,
            completed_at=s.completed_at.isoformat() if s.completed_at else None,
        )
        for s in sessions
    ]


def _get_extension(content_type: str) -> str:
    """Get file extension from content type."""
    extensions = {
        "audio/wav": ".wav",
        "audio/mpeg": ".mp3",
        "audio/mp4": ".m4a",
        "audio/m4a": ".m4a",
        "audio/x-m4a": ".m4a",
    }
    return extensions.get(content_type, ".audio")
