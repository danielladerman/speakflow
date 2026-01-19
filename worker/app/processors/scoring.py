"""
Scoring Engine - Rule-based, deterministic scoring.

Converts raw metrics into 0-100 scores.
All scoring logic is explicit and testable.
"""

from dataclasses import dataclass
from typing import Literal
from uuid import UUID

from .features import ExtractedFeatures, FlagEvent


# Import contracts from installed package
from speakflow_contracts import (
    ScoreContract,
    Metrics,
    Scores,
    Flag,
    FocusMetric,
    FlagReason,
)


@dataclass
class ScoringConfig:
    """Configuration for score calculation thresholds."""
    # Pace thresholds (WPM)
    pace_optimal: float = 150.0
    pace_range: float = 30.0  # +/- from optimal

    # Fluency thresholds (fillers per minute)
    fluency_excellent: float = 1.0
    fluency_good: float = 3.0
    fluency_acceptable: float = 6.0

    # Vocal variety thresholds
    pitch_variance_good: float = 40.0
    volume_stability_good: float = 0.3

    # Score weights for overall
    weight_pace: float = 0.20
    weight_fluency: float = 0.25
    weight_clarity: float = 0.20
    weight_vocal_variety: float = 0.20
    weight_confidence: float = 0.15  # Derived from other metrics


class ScoringEngine:
    """
    Rule-based scoring engine.

    All scoring is deterministic and based on explicit thresholds.
    No ML, no black boxes.
    """

    def __init__(self, config: ScoringConfig | None = None):
        self.config = config or ScoringConfig()

    def score(
        self,
        session_id: UUID,
        features: ExtractedFeatures,
    ) -> ScoreContract:
        """
        Calculate scores from extracted features.

        Args:
            session_id: Session identifier
            features: Extracted metrics from audio

        Returns:
            ScoreContract with all scores and focus metric
        """
        # Calculate individual scores
        pace_score = self._score_pace(features.wpm)
        fluency_score = self._score_fluency(features.filler_per_min)
        clarity_score = self._score_clarity(features.pause_events, features.power_pauses, features.duration_sec)
        vocal_variety_score = self._score_vocal_variety(features.pitch_variance, features.volume_stability)

        # Overall is weighted average
        overall_score = self._score_overall(
            pace_score, fluency_score, clarity_score, vocal_variety_score
        )

        # Determine focus metric (lowest scoring area)
        focus_metric = self._determine_focus(
            pace_score, fluency_score, clarity_score, vocal_variety_score
        )

        # Convert flags
        flags = [
            Flag(
                t_start=f.t_start,
                t_end=f.t_end,
                reason=FlagReason(f.reason),
            )
            for f in features.flags
        ]

        return ScoreContract(
            session_id=session_id,
            duration_sec=features.duration_sec,
            metrics=Metrics(
                wpm=features.wpm,
                filler_per_min=features.filler_per_min,
                pause_events=features.pause_events,
                power_pauses=features.power_pauses,
                pitch_variance=features.pitch_variance,
                volume_stability=features.volume_stability,
            ),
            scores=Scores(
                pace=pace_score,
                fluency=fluency_score,
                clarity=clarity_score,
                vocal_variety=vocal_variety_score,
                overall=overall_score,
            ),
            focus_metric=focus_metric,
            flags=flags,
        )

    def _score_pace(self, wpm: float) -> int:
        """
        Score speaking pace.

        Optimal: 140-160 WPM
        Deductions for too fast or too slow.
        """
        optimal = self.config.pace_optimal
        range_val = self.config.pace_range

        if wpm == 0:
            return 0

        # Distance from optimal
        distance = abs(wpm - optimal)

        if distance <= range_val / 2:
            # Within sweet spot (135-165)
            return 100 - int((distance / (range_val / 2)) * 10)
        elif distance <= range_val:
            # Acceptable range (120-180)
            return 85 - int(((distance - range_val / 2) / (range_val / 2)) * 20)
        elif distance <= range_val * 1.5:
            # Suboptimal (105-195)
            return 65 - int(((distance - range_val) / (range_val / 2)) * 25)
        else:
            # Poor (<105 or >195)
            excess = distance - range_val * 1.5
            return max(20, 40 - int(excess / 5))

    def _score_fluency(self, filler_per_min: float) -> int:
        """
        Score fluency based on filler word frequency.

        <1/min: Excellent (90-100)
        1-3/min: Good (70-90)
        3-6/min: Acceptable (50-70)
        >6/min: Needs work (<50)
        """
        if filler_per_min <= self.config.fluency_excellent:
            return 100 - int(filler_per_min * 10)
        elif filler_per_min <= self.config.fluency_good:
            return 90 - int((filler_per_min - 1) * 10)
        elif filler_per_min <= self.config.fluency_acceptable:
            return 70 - int((filler_per_min - 3) * 7)
        else:
            # Rapid dropoff above 6/min
            excess = filler_per_min - 6
            return max(20, 50 - int(excess * 5))

    def _score_clarity(
        self,
        pause_events: int,
        power_pauses: int,
        duration_sec: float,
    ) -> int:
        """
        Score clarity based on pause patterns.

        Power pauses (1-3s): Good for emphasis
        Long pauses (>3s): Usually problematic
        """
        if duration_sec <= 0:
            return 50

        minutes = duration_sec / 60

        # Start at 100
        score = 100

        # Deduct for excessive long pauses
        pause_per_min = pause_events / minutes if minutes > 0 else 0
        if pause_per_min > 2:
            score -= int((pause_per_min - 2) * 10)

        # Bonus for power pauses (up to 3/min is good)
        power_per_min = power_pauses / minutes if minutes > 0 else 0
        if 1 <= power_per_min <= 3:
            score += 5
        elif power_per_min > 4:
            score -= int((power_per_min - 4) * 3)

        return max(20, min(100, score))

    def _score_vocal_variety(
        self,
        pitch_variance: float,
        volume_stability: float,
    ) -> int:
        """
        Score vocal variety based on pitch and volume.

        Pitch variance: Higher is generally better (within reason)
        Volume stability: Some variation is good, too much is bad
        """
        score = 50  # Start at middle

        # Pitch variance contribution (0-50 points)
        if pitch_variance >= self.config.pitch_variance_good:
            score += 40 + min(10, int((pitch_variance - 40) / 5))
        elif pitch_variance >= 20:
            score += int((pitch_variance / 40) * 40)
        else:
            score += int((pitch_variance / 20) * 20)

        # Volume stability contribution (-10 to +10)
        if volume_stability <= self.config.volume_stability_good:
            # Good stability - slight bonus
            score += 5
        elif volume_stability <= 0.5:
            # Acceptable
            pass
        else:
            # Too erratic
            score -= int((volume_stability - 0.5) * 20)

        return max(20, min(100, score))

    def _score_overall(
        self,
        pace: int,
        fluency: int,
        clarity: int,
        vocal_variety: int,
    ) -> int:
        """Calculate weighted overall score."""
        cfg = self.config
        overall = (
            pace * cfg.weight_pace +
            fluency * cfg.weight_fluency +
            clarity * cfg.weight_clarity +
            vocal_variety * cfg.weight_vocal_variety +
            # Confidence derived as average of others
            ((pace + fluency + clarity + vocal_variety) / 4) * cfg.weight_confidence
        )
        return int(overall)

    def _determine_focus(
        self,
        pace: int,
        fluency: int,
        clarity: int,
        vocal_variety: int,
    ) -> FocusMetric:
        """
        Determine which metric to focus on.

        Returns the lowest scoring area (most room for improvement).
        """
        scores = {
            FocusMetric.PACE: pace,
            FocusMetric.FLUENCY: fluency,
            FocusMetric.CLARITY: clarity,
            FocusMetric.VOCAL_VARIETY: vocal_variety,
        }

        # Find minimum score
        min_metric = min(scores, key=scores.get)
        return min_metric
