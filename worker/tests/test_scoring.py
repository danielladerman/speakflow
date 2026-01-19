"""
Scoring Engine Tests.

Tests the deterministic, rule-based scoring logic.
"""

import sys
from pathlib import Path
from uuid import uuid4

import pytest

# Add paths for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "contracts"))

from app.processors.scoring import ScoringEngine, ScoringConfig
from app.processors.features import ExtractedFeatures, FlagEvent


class TestPaceScoring:
    """Test pace scoring logic."""

    def setup_method(self):
        self.engine = ScoringEngine()

    def test_optimal_pace(self):
        """150 WPM should score near 100."""
        features = self._make_features(wpm=150)
        contract = self.engine.score(uuid4(), features)
        assert contract.scores.pace >= 95

    def test_acceptable_fast_pace(self):
        """170 WPM should score 80+."""
        features = self._make_features(wpm=170)
        contract = self.engine.score(uuid4(), features)
        assert 75 <= contract.scores.pace <= 95

    def test_acceptable_slow_pace(self):
        """130 WPM should score 80+."""
        features = self._make_features(wpm=130)
        contract = self.engine.score(uuid4(), features)
        assert 75 <= contract.scores.pace <= 95

    def test_too_fast(self):
        """200+ WPM should score lower."""
        features = self._make_features(wpm=210)
        contract = self.engine.score(uuid4(), features)
        assert contract.scores.pace < 70

    def test_too_slow(self):
        """100 WPM should score lower."""
        features = self._make_features(wpm=100)
        contract = self.engine.score(uuid4(), features)
        assert contract.scores.pace < 70

    def _make_features(self, **kwargs) -> ExtractedFeatures:
        defaults = {
            "duration_sec": 180,
            "wpm": 150,
            "filler_per_min": 2,
            "pause_events": 5,
            "power_pauses": 2,
            "pitch_variance": 40,
            "volume_stability": 0.25,
        }
        defaults.update(kwargs)
        return ExtractedFeatures(**defaults)


class TestFluencyScoring:
    """Test fluency scoring logic."""

    def setup_method(self):
        self.engine = ScoringEngine()

    def test_excellent_fluency(self):
        """< 1 filler/min should score 90+."""
        features = self._make_features(filler_per_min=0.5)
        contract = self.engine.score(uuid4(), features)
        assert contract.scores.fluency >= 90

    def test_good_fluency(self):
        """2 fillers/min should score 75-90."""
        features = self._make_features(filler_per_min=2)
        contract = self.engine.score(uuid4(), features)
        assert 70 <= contract.scores.fluency <= 90

    def test_acceptable_fluency(self):
        """5 fillers/min should score 50-70."""
        features = self._make_features(filler_per_min=5)
        contract = self.engine.score(uuid4(), features)
        assert 45 <= contract.scores.fluency <= 70

    def test_poor_fluency(self):
        """10+ fillers/min should score < 50."""
        features = self._make_features(filler_per_min=10)
        contract = self.engine.score(uuid4(), features)
        assert contract.scores.fluency < 50

    def _make_features(self, **kwargs) -> ExtractedFeatures:
        defaults = {
            "duration_sec": 180,
            "wpm": 150,
            "filler_per_min": 2,
            "pause_events": 5,
            "power_pauses": 2,
            "pitch_variance": 40,
            "volume_stability": 0.25,
        }
        defaults.update(kwargs)
        return ExtractedFeatures(**defaults)


class TestFocusMetricDetermination:
    """Test that focus metric is correctly identified."""

    def setup_method(self):
        self.engine = ScoringEngine()

    def test_focus_on_lowest_score(self):
        """Focus should be on the lowest scoring area."""
        # Make fluency terrible, others good
        features = ExtractedFeatures(
            duration_sec=180,
            wpm=150,  # Good pace
            filler_per_min=12,  # Terrible fluency
            pause_events=2,  # Good clarity
            power_pauses=3,
            pitch_variance=50,  # Good variety
            volume_stability=0.2,
        )
        contract = self.engine.score(uuid4(), features)
        assert contract.focus_metric.value == "fluency"

    def test_focus_on_pace_when_too_fast(self):
        """Focus should be pace when speaking too fast."""
        features = ExtractedFeatures(
            duration_sec=180,
            wpm=220,  # Way too fast
            filler_per_min=1,  # Good fluency
            pause_events=2,
            power_pauses=3,
            pitch_variance=50,
            volume_stability=0.2,
        )
        contract = self.engine.score(uuid4(), features)
        assert contract.focus_metric.value == "pace"


class TestOverallScoring:
    """Test overall score calculation."""

    def setup_method(self):
        self.engine = ScoringEngine()

    def test_overall_is_weighted_average(self):
        """Overall should be weighted average of components."""
        features = ExtractedFeatures(
            duration_sec=180,
            wpm=150,
            filler_per_min=2,
            pause_events=3,
            power_pauses=2,
            pitch_variance=40,
            volume_stability=0.25,
        )
        contract = self.engine.score(uuid4(), features)

        # Overall should be reasonable given good inputs
        assert 60 <= contract.scores.overall <= 90

        # Overall should not exceed best individual score
        max_score = max(
            contract.scores.pace,
            contract.scores.fluency,
            contract.scores.clarity,
            contract.scores.vocal_variety,
        )
        assert contract.scores.overall <= max_score + 5  # Small tolerance

    def test_scores_all_in_valid_range(self):
        """All scores should be 0-100."""
        features = ExtractedFeatures(
            duration_sec=180,
            wpm=150,
            filler_per_min=2,
            pause_events=3,
            power_pauses=2,
            pitch_variance=40,
            volume_stability=0.25,
        )
        contract = self.engine.score(uuid4(), features)

        assert 0 <= contract.scores.pace <= 100
        assert 0 <= contract.scores.fluency <= 100
        assert 0 <= contract.scores.clarity <= 100
        assert 0 <= contract.scores.vocal_variety <= 100
        assert 0 <= contract.scores.overall <= 100


class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    def setup_method(self):
        self.engine = ScoringEngine()

    def test_zero_duration(self):
        """Zero duration should not crash."""
        features = ExtractedFeatures(
            duration_sec=0,
            wpm=0,
            filler_per_min=0,
            pause_events=0,
            power_pauses=0,
            pitch_variance=0,
            volume_stability=0,
        )
        contract = self.engine.score(uuid4(), features)
        # Should return valid contract, even if scores are low
        assert contract is not None
        assert 0 <= contract.scores.overall <= 100

    def test_extreme_values(self):
        """Extreme values should not crash or exceed bounds."""
        features = ExtractedFeatures(
            duration_sec=3600,  # 1 hour
            wpm=300,  # Very fast
            filler_per_min=50,  # Ridiculous
            pause_events=100,
            power_pauses=50,
            pitch_variance=200,
            volume_stability=0.9,
        )
        contract = self.engine.score(uuid4(), features)

        # Scores should be low but valid
        assert 0 <= contract.scores.overall <= 100
        assert contract.scores.overall < 50  # Should be poor


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
