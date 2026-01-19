"""
SpeakFlow Contracts - Shared Pydantic models for API and Worker.

These models are the Python implementation of the JSON schemas.
All API responses and worker outputs MUST use these models.
"""

from .score_contract import (
    ScoreContract,
    Metrics,
    Scores,
    Flag,
    FocusMetric,
    FlagReason,
)
from .drill_schema import (
    Drill,
    DrillLibrary,
    DrillZone,
    DrillDifficulty,
    MetricName,
    MetricThreshold,
    RecommendedWhen,
)
from .coaching_response import (
    CoachingResponse,
    Strength,
    FocusArea,
    RecommendedDrill,
)

__all__ = [
    # Score Contract
    "ScoreContract",
    "Metrics",
    "Scores",
    "Flag",
    "FocusMetric",
    "FlagReason",
    # Drill Schema
    "Drill",
    "DrillLibrary",
    "DrillZone",
    "DrillDifficulty",
    "MetricName",
    "MetricThreshold",
    "RecommendedWhen",
    # Coaching Response
    "CoachingResponse",
    "Strength",
    "FocusArea",
    "RecommendedDrill",
]
