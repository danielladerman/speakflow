"""
Coaching Response Pydantic Model.

Schema for LLM-generated coaching output.
LLM interprets scores and selects drills from library—never invents new drills or metrics.
"""

from typing import List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .score_contract import FocusMetric


class Strength(BaseModel):
    """An area where the user performed well."""
    model_config = ConfigDict(extra="forbid")

    area: FocusMetric = Field(
        description="Skill area showing strength"
    )
    observation: str = Field(
        max_length=200,
        description="Specific observation about what went well"
    )


class FocusArea(BaseModel):
    """Primary area to focus on for improvement."""
    model_config = ConfigDict(extra="forbid")

    area: FocusMetric = Field(
        description="Primary area to focus on"
    )
    current_score: int = Field(
        ge=0, le=100,
        description="Current score in this area"
    )
    target_score: int = Field(
        ge=0, le=100,
        description="Achievable target for next session"
    )
    observation: str = Field(
        max_length=300,
        description="Specific observation about what needs improvement"
    )
    impact: str = Field(
        max_length=200,
        description="Why improving this area matters"
    )

    @field_validator("target_score")
    @classmethod
    def target_above_current(cls, v: int, info) -> int:
        """Target should be higher than or equal to current."""
        if "current_score" in info.data and v < info.data["current_score"]:
            raise ValueError("target_score should be >= current_score")
        return v


class RecommendedDrill(BaseModel):
    """A drill recommendation from the library."""
    model_config = ConfigDict(extra="forbid")

    drill_id: str = Field(
        pattern=r"^drill_[a-z0-9_]+$",
        description="Must reference an existing drill from the library"
    )
    reason: str = Field(
        max_length=200,
        description="Why this drill is recommended based on the scores"
    )
    priority: int = Field(
        ge=1, le=3,
        description="Priority order (1 = most important)"
    )


class CoachingResponse(BaseModel):
    """
    Schema for LLM-generated coaching output.

    The LLM must:
    - Interpret the score contract
    - Select drills from the speakflow_v1 library
    - NEVER invent new drills or metrics
    """
    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "example": {
                "session_id": "550e8400-e29b-41d4-a716-446655440000",
                "summary": "You maintained a clear structure with three distinct points, but your fluency was impacted by frequent filler words, especially 'um' and 'you know'. Your pacing was good overall.",
                "strengths": [
                    {
                        "area": "pace",
                        "observation": "Your speaking rate of 145 WPM is right in the sweet spot for clear communication"
                    },
                    {
                        "area": "clarity",
                        "observation": "Your articulation was crisp and words were easy to understand"
                    }
                ],
                "focus_area": {
                    "area": "fluency",
                    "current_score": 59,
                    "target_score": 70,
                    "observation": "You used 6.2 filler words per minute, particularly 'um' during transitions between points",
                    "impact": "Reducing fillers will make you sound more confident and authoritative"
                },
                "recommended_drills": [
                    {
                        "drill_id": "drill_fluency_silence",
                        "reason": "This drill trains you to replace filler words with intentional pauses",
                        "priority": 1
                    },
                    {
                        "drill_id": "drill_fluency_one_thought",
                        "reason": "Speaking one complete thought per breath prevents filler word buildup",
                        "priority": 2
                    }
                ],
                "next_session_goal": "Reduce filler words to under 4 per minute while maintaining your current pace"
            }
        }
    )

    session_id: UUID = Field(
        description="Links back to the scored session"
    )
    summary: str = Field(
        min_length=50, max_length=500,
        description="2-3 sentence overview of the session performance"
    )
    strengths: List[Strength] = Field(
        min_length=1, max_length=3,
        description="Areas where the user performed well"
    )
    focus_area: FocusArea = Field(
        description="Primary area to focus on"
    )
    recommended_drills: List[RecommendedDrill] = Field(
        min_length=1, max_length=3,
        description="Drills selected from speakflow_v1 library"
    )
    next_session_goal: str = Field(
        min_length=20, max_length=200,
        description="Specific, measurable goal for the next practice session"
    )

    @field_validator("recommended_drills")
    @classmethod
    def unique_priorities(cls, v: List[RecommendedDrill]) -> List[RecommendedDrill]:
        """Ensure priorities are unique."""
        priorities = [d.priority for d in v]
        if len(priorities) != len(set(priorities)):
            raise ValueError("Duplicate priority values in recommended_drills")
        return v
