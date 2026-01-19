"""
Drill Schema Pydantic Model.

Drills are structured data objects. The LLM selects from this library
but NEVER invents new drills.
"""

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class DrillZone(str, Enum):
    """Primary skill zone a drill targets."""
    PACE = "pace"
    FLUENCY = "fluency"
    CLARITY = "clarity"
    VOCAL_VARIETY = "vocal_variety"
    STRUCTURE = "structure"
    CONFIDENCE = "confidence"


class DrillDifficulty(str, Enum):
    """Drill difficulty level."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class MetricName(str, Enum):
    """Valid metric names for targeting."""
    WPM = "wpm"
    FILLER_PER_MIN = "filler_per_min"
    PAUSE_EVENTS = "pause_events"
    POWER_PAUSES = "power_pauses"
    PITCH_VARIANCE = "pitch_variance"
    VOLUME_STABILITY = "volume_stability"


class Operator(str, Enum):
    """Comparison operators for thresholds."""
    GT = "gt"
    LT = "lt"
    GTE = "gte"
    LTE = "lte"


class MetricThreshold(BaseModel):
    """Metric-specific threshold for drill recommendation."""
    model_config = ConfigDict(extra="forbid")

    metric: MetricName
    operator: Operator
    value: float


class RecommendedWhen(BaseModel):
    """Conditions under which a drill should be suggested."""
    model_config = ConfigDict(extra="forbid")

    score_below: Optional[int] = Field(
        default=None,
        ge=0, le=100,
        description="Suggest when zone score is below this threshold"
    )
    metric_threshold: Optional[MetricThreshold] = Field(
        default=None,
        description="Metric-specific threshold"
    )


class Drill(BaseModel):
    """
    A single practice drill from the library.

    Drills are static—LLM selects from them, never invents them.
    """
    model_config = ConfigDict(extra="forbid")

    drill_id: str = Field(
        pattern=r"^drill_[a-z0-9_]+$",
        description="Unique identifier (e.g., drill_pace_metronome)"
    )
    name: str = Field(
        min_length=1, max_length=100,
        description="Human-readable drill name"
    )
    zone: DrillZone = Field(
        description="Primary skill zone this drill targets"
    )
    difficulty: DrillDifficulty = Field(
        description="Difficulty level"
    )
    targets: List[MetricName] = Field(
        min_length=1,
        description="Metrics this drill aims to improve"
    )
    duration_sec: int = Field(
        ge=30, le=600,
        description="Recommended drill duration in seconds"
    )
    instructions: str = Field(
        min_length=10,
        description="Step-by-step instructions for the drill"
    )
    success_metric: str = Field(
        description="How to measure if drill was performed correctly"
    )
    failure_signals: List[str] = Field(
        default_factory=list,
        description="Signs the user is doing the drill incorrectly"
    )
    recommended_when: Optional[RecommendedWhen] = Field(
        default=None,
        description="Conditions under which this drill should be suggested"
    )


class DrillLibrary(BaseModel):
    """
    Collection of drills for a specific version.

    The speakflow_v1 library ships with 15 drills.
    """
    model_config = ConfigDict(extra="forbid")

    version: str = Field(
        pattern=r"^\d+\.\d+\.\d+$",
        description="Semantic version of the drill library"
    )
    drills: List[Drill] = Field(
        description="List of available drills"
    )

    @field_validator("drills")
    @classmethod
    def unique_drill_ids(cls, v: List[Drill]) -> List[Drill]:
        """Ensure all drill_ids are unique."""
        ids = [d.drill_id for d in v]
        if len(ids) != len(set(ids)):
            raise ValueError("Duplicate drill_id found in library")
        return v

    def get_drill(self, drill_id: str) -> Optional[Drill]:
        """Retrieve a drill by ID."""
        for drill in self.drills:
            if drill.drill_id == drill_id:
                return drill
        return None

    def get_drills_for_zone(self, zone: DrillZone) -> List[Drill]:
        """Get all drills targeting a specific zone."""
        return [d for d in self.drills if d.zone == zone]

    def get_drills_for_metric(self, metric: MetricName) -> List[Drill]:
        """Get all drills that target a specific metric."""
        return [d for d in self.drills if metric in d.targets]
