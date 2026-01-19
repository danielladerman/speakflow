"""Health check endpoints."""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict:
    """Basic health check."""
    return {"status": "healthy", "service": "speakflow-api"}


@router.get("/ready")
async def readiness_check() -> dict:
    """Readiness check - verifies dependencies are available."""
    # TODO: Add database and Redis connectivity checks
    return {"status": "ready"}
