"""
Score Contract Pydantic Model.

This is the canonical schema for session analysis results.
All API responses and worker outputs MUST conform to this contract.
"""

from enum import Enum
from typing import List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class FocusMetric(str, Enum):
    """Primary area for improvement."""
    PACE = "pace"
    FLUENCY = "fluency"
    CLARITY = "clarity"
    VOCAL_VARIETY = "vocal_variety"
    STRUCTURE = "structure"
    CONFIDENCE = "confidence"


class FlagReason(str, Enum):
    """Type of flagged event in the recording."""
    FILLER = "filler"
    LONG_PAUSE = "long_pause"
    RUSH = "rush"
    MUMBLE = "mumble"
    POWER_PAUSE = "power_pause"


class Metrics(BaseModel):
    """Raw extracted metrics from audio analysis."""
    model_config = ConfigDict(extra="forbid")

    wpm: float = Field(
        ge=0,
        description="Words per minute (speaking rate)"
    )
    filler_per_min: float = Field(
        ge=0,
        description="Filler words (um, uh, like, you know) per minute"
    )
    pause_events: int = Field(
        ge=0,
        description="Total count of pauses > 0.5s"
    )
    power_pauses: int = Field(
        ge=0,
        description="Count of intentional pauses (1-3s) for emphasis"
    )
    pitch_variance: float = Field(
        ge=0,
        description="Standard deviation of pitch in Hz"
    )
    volume_stability: float = Field(
        ge=0,
        le=1,
        description="Coefficient of variation for volume (0=stable, 1=erratic)"
    )


class Scores(BaseModel):
    """Computed scores (0-100) derived from metrics."""
    model_config = ConfigDict(extra="forbid")

    pace: int = Field(
        ge=0, le=100,
        description="Score for speaking pace (optimal ~150 WPM)"
    )
    fluency: int = Field(
        ge=0, le=100,
        description="Score based on filler word frequency"
    )
    clarity: int = Field(
        ge=0, le=100,
        description="Score based on pause patterns and articulation"
    )
    vocal_variety: int = Field(
        ge=0, le=100,
        description="Score based on pitch and volume variation"
    )
    overall: int = Field(
        ge=0, le=100,
        description="Weighted composite score"
    )


class Flag(BaseModel):
    """Timestamped event of note (filler, long pause, etc.)."""
    model_config = ConfigDict(extra="forbid")

    t_start: float = Field(
        ge=0,
        description="Start time in seconds"
    )
    t_end: float = Field(
        ge=0,
        description="End time in seconds"
    )
    reason: FlagReason = Field(
        description="Type of flagged event"
    )

    @field_validator("t_end")
    @classmethod
    def end_after_start(cls, v: float, info) -> float:
        """Validate t_end >= t_start."""
        if "t_start" in info.data and v < info.data["t_start"]:
            raise ValueError("t_end must be >= t_start")
        return v


class ScoreContract(BaseModel):
    """
    Canonical schema for session analysis results.

    This is THE source of truth. All systems must produce/consume this exact shape.
    """
    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "example": {
                "session_id": "550e8400-e29b-41d4-a716-446655440000",
                "duration_sec": 180.5,
                "metrics": {
                    "wpm": 165.3,
                    "filler_per_min": 4.2,
                    "pause_events": 12,
                    "power_pauses": 3,
                    "pitch_variance": 42.5,
                    "volume_stability": 0.25
                },
                "scores": {
                    "pace": 78,
                    "fluency": 65,
                    "clarity": 82,
                    "vocal_variety": 71,
                    "overall": 74
                },
                "focus_metric": "fluency",
                "flags": [
                    {"t_start": 12.5, "t_end": 13.1, "reason": "filler"},
                    {"t_start": 45.0, "t_end": 47.5, "reason": "long_pause"}
                ]
            }
        }
    )

    session_id: UUID = Field(
        description="Unique identifier for the recording session"
    )
    duration_sec: float = Field(
        ge=0,
        description="Total duration of the recording in seconds"
    )
    metrics: Metrics = Field(
        description="Raw extracted metrics from audio analysis"
    )
    scores: Scores = Field(
        description="Computed scores (0-100) derived from metrics"
    )
    focus_metric: FocusMetric = Field(
        description="Primary area for improvement this session"
    )
    flags: List[Flag] = Field(
        default_factory=list,
        description="Timestamped events of note (fillers, long pauses, etc.)"
    )
