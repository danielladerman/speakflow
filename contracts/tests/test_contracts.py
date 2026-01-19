"""
Contract Validation Tests.

Ensures Pydantic models match JSON schemas and fixtures are valid.
"""

import json
from pathlib import Path
from uuid import UUID

import pytest

# Add parent to path for imports
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from python.score_contract import ScoreContract, FocusMetric, FlagReason
from python.drill_schema import Drill, DrillLibrary, DrillZone
from python.coaching_response import CoachingResponse


FIXTURES_DIR = Path(__file__).parent.parent / "fixtures"


class TestScoreContract:
    """Test Score Contract validation."""

    def test_valid_score_contract(self):
        """Valid score contract should parse without errors."""
        data = {
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
                {"t_start": 12.5, "t_end": 13.1, "reason": "filler"}
            ]
        }
        contract = ScoreContract(**data)
        assert contract.session_id == UUID("550e8400-e29b-41d4-a716-446655440000")
        assert contract.metrics.wpm == 165.3
        assert contract.scores.overall == 74
        assert contract.focus_metric == FocusMetric.FLUENCY
        assert len(contract.flags) == 1
        assert contract.flags[0].reason == FlagReason.FILLER

    def test_fixture_valid(self):
        """Example fixture should parse without errors."""
        fixture_path = FIXTURES_DIR / "example_score_contract.json"
        with open(fixture_path) as f:
            data = json.load(f)
        # Remove $schema key (not part of model)
        data.pop("$schema", None)
        contract = ScoreContract(**data)
        assert contract.duration_sec == 180.5

    def test_invalid_score_range(self):
        """Scores outside 0-100 should fail."""
        data = {
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
                "pace": 150,  # Invalid: > 100
                "fluency": 65,
                "clarity": 82,
                "vocal_variety": 71,
                "overall": 74
            },
            "focus_metric": "fluency",
            "flags": []
        }
        with pytest.raises(Exception):
            ScoreContract(**data)

    def test_invalid_focus_metric(self):
        """Invalid focus_metric should fail."""
        data = {
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
            "focus_metric": "unknown_metric",  # Invalid
            "flags": []
        }
        with pytest.raises(Exception):
            ScoreContract(**data)

    def test_flag_t_end_before_t_start(self):
        """Flag with t_end < t_start should fail."""
        data = {
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
                {"t_start": 15.0, "t_end": 10.0, "reason": "filler"}  # Invalid
            ]
        }
        with pytest.raises(Exception):
            ScoreContract(**data)


class TestDrillLibrary:
    """Test Drill Library validation."""

    def test_valid_drill(self):
        """Valid drill should parse without errors."""
        data = {
            "drill_id": "drill_pace_metronome",
            "name": "Metronome Pacing",
            "zone": "pace",
            "difficulty": "beginner",
            "targets": ["wpm"],
            "duration_sec": 120,
            "instructions": "Set a metronome to 75 BPM...",
            "success_metric": "WPM within 140-160 range",
            "failure_signals": ["Rushing ahead"],
            "recommended_when": {
                "score_below": 70,
                "metric_threshold": {
                    "metric": "wpm",
                    "operator": "gt",
                    "value": 180
                }
            }
        }
        drill = Drill(**data)
        assert drill.drill_id == "drill_pace_metronome"
        assert drill.zone == DrillZone.PACE

    def test_invalid_drill_id_format(self):
        """Invalid drill_id format should fail."""
        data = {
            "drill_id": "invalid-format",  # Should be drill_xxx
            "name": "Test",
            "zone": "pace",
            "difficulty": "beginner",
            "targets": ["wpm"],
            "duration_sec": 120,
            "instructions": "Test instructions here",
            "success_metric": "Test metric"
        }
        with pytest.raises(Exception):
            Drill(**data)

    def test_drill_library_fixture(self):
        """Full drill library fixture should parse."""
        fixture_path = FIXTURES_DIR / "speakflow_v1_drills.json"
        with open(fixture_path) as f:
            data = json.load(f)
        # Remove $schema key
        data.pop("$schema", None)
        library = DrillLibrary(**data)
        assert len(library.drills) == 15
        assert library.version == "1.0.0"

    def test_drill_library_unique_ids(self):
        """Duplicate drill_ids should fail."""
        data = {
            "version": "1.0.0",
            "drills": [
                {
                    "drill_id": "drill_test_one",
                    "name": "Test One",
                    "zone": "pace",
                    "difficulty": "beginner",
                    "targets": ["wpm"],
                    "duration_sec": 60,
                    "instructions": "Test instructions",
                    "success_metric": "Test"
                },
                {
                    "drill_id": "drill_test_one",  # Duplicate
                    "name": "Test Two",
                    "zone": "fluency",
                    "difficulty": "beginner",
                    "targets": ["filler_per_min"],
                    "duration_sec": 60,
                    "instructions": "Test instructions",
                    "success_metric": "Test"
                }
            ]
        }
        with pytest.raises(Exception):
            DrillLibrary(**data)

    def test_drill_library_helpers(self):
        """Test library helper methods."""
        fixture_path = FIXTURES_DIR / "speakflow_v1_drills.json"
        with open(fixture_path) as f:
            data = json.load(f)
        data.pop("$schema", None)
        library = DrillLibrary(**data)

        # Test get_drill
        drill = library.get_drill("drill_pace_metronome")
        assert drill is not None
        assert drill.name == "Metronome Pacing"

        # Test get_drills_for_zone
        pace_drills = library.get_drills_for_zone(DrillZone.PACE)
        assert len(pace_drills) >= 2

        # Test get_drill with invalid id
        assert library.get_drill("invalid_id") is None


class TestCoachingResponse:
    """Test Coaching Response validation."""

    def test_valid_coaching_response(self):
        """Valid coaching response should parse."""
        data = {
            "session_id": "550e8400-e29b-41d4-a716-446655440000",
            "summary": "You delivered a well-structured practice session with clear pacing. Your main opportunity is reducing filler words.",
            "strengths": [
                {"area": "pace", "observation": "Your 165 WPM is optimal"}
            ],
            "focus_area": {
                "area": "fluency",
                "current_score": 65,
                "target_score": 75,
                "observation": "Filler words appeared during transitions",
                "impact": "Reducing fillers increases confidence"
            },
            "recommended_drills": [
                {
                    "drill_id": "drill_fluency_silence",
                    "reason": "Trains you to embrace pauses",
                    "priority": 1
                }
            ],
            "next_session_goal": "Reduce filler words from 4.2 to under 3 per minute"
        }
        response = CoachingResponse(**data)
        assert response.focus_area.current_score == 65
        assert len(response.recommended_drills) == 1

    def test_fixture_valid(self):
        """Example fixture should parse."""
        fixture_path = FIXTURES_DIR / "example_coaching_response.json"
        with open(fixture_path) as f:
            data = json.load(f)
        data.pop("$schema", None)
        response = CoachingResponse(**data)
        assert len(response.strengths) == 2

    def test_invalid_drill_id_format(self):
        """Invalid drill_id in recommendation should fail."""
        data = {
            "session_id": "550e8400-e29b-41d4-a716-446655440000",
            "summary": "Test summary that is long enough to pass validation requirements here.",
            "strengths": [
                {"area": "pace", "observation": "Good pace"}
            ],
            "focus_area": {
                "area": "fluency",
                "current_score": 65,
                "target_score": 75,
                "observation": "Test observation",
                "impact": "Test impact"
            },
            "recommended_drills": [
                {
                    "drill_id": "invalid-format",  # Should be drill_xxx
                    "reason": "Test reason",
                    "priority": 1
                }
            ],
            "next_session_goal": "Test goal that is long enough"
        }
        with pytest.raises(Exception):
            CoachingResponse(**data)

    def test_duplicate_priorities(self):
        """Duplicate priority values should fail."""
        data = {
            "session_id": "550e8400-e29b-41d4-a716-446655440000",
            "summary": "Test summary that is long enough to pass validation requirements here.",
            "strengths": [
                {"area": "pace", "observation": "Good pace"}
            ],
            "focus_area": {
                "area": "fluency",
                "current_score": 65,
                "target_score": 75,
                "observation": "Test observation",
                "impact": "Test impact"
            },
            "recommended_drills": [
                {"drill_id": "drill_fluency_silence", "reason": "Test", "priority": 1},
                {"drill_id": "drill_pace_metronome", "reason": "Test", "priority": 1}  # Duplicate
            ],
            "next_session_goal": "Test goal that is long enough"
        }
        with pytest.raises(Exception):
            CoachingResponse(**data)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
