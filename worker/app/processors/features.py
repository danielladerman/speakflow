"""
Feature Extractor - Extract speech metrics from audio and transcript.

Extracts:
- WPM (words per minute)
- Filler words per minute
- Pause events (>0.5s gaps)
- Power pauses (1-3s intentional pauses)
- Pitch variance (Hz standard deviation)
- Volume stability (coefficient of variation)
"""

import tempfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal

import numpy as np

from .asr import TranscriptResult, TranscriptWord


# Filler words to detect
FILLER_WORDS = {
    "um", "uh", "uhh", "umm", "er", "ah", "ahh",
    "like", "you know", "basically", "actually",
    "literally", "so", "well", "right", "okay",
    "i mean", "sort of", "kind of",
}

# Single-word fillers for simple detection
SINGLE_WORD_FILLERS = {
    "um", "uh", "uhh", "umm", "er", "ah", "ahh",
    "like", "basically", "actually", "literally",
}


@dataclass
class FlagEvent:
    """A flagged event in the recording."""
    t_start: float
    t_end: float
    reason: Literal["filler", "long_pause", "rush", "mumble", "power_pause"]


@dataclass
class ExtractedFeatures:
    """All extracted features from audio analysis."""
    duration_sec: float
    wpm: float
    filler_per_min: float
    pause_events: int
    power_pauses: int
    pitch_variance: float
    volume_stability: float
    flags: list[FlagEvent] = field(default_factory=list)
    word_count: int = 0
    filler_count: int = 0


class FeatureExtractor:
    """Extract speech features from audio and transcript."""

    def extract(
        self,
        transcript: TranscriptResult,
        audio_bytes: bytes | None = None,
    ) -> ExtractedFeatures:
        """
        Extract all features from transcript and optionally audio.

        Args:
            transcript: Word-level transcript from ASR
            audio_bytes: Optional raw audio for pitch/volume analysis

        Returns:
            ExtractedFeatures with all metrics
        """
        duration = transcript.duration
        words = transcript.words

        if duration <= 0:
            return ExtractedFeatures(
                duration_sec=0,
                wpm=0,
                filler_per_min=0,
                pause_events=0,
                power_pauses=0,
                pitch_variance=0,
                volume_stability=0,
            )

        # Extract text-based features
        word_count = len([w for w in words if w.word.strip()])
        wpm = (word_count / duration) * 60 if duration > 0 else 0

        # Detect fillers
        fillers, filler_flags = self._detect_fillers(words)
        filler_per_min = (len(fillers) / duration) * 60 if duration > 0 else 0

        # Detect pauses
        pause_events, power_pauses, pause_flags = self._detect_pauses(words)

        # Extract audio features if available
        pitch_variance = 0.0
        volume_stability = 0.0
        if audio_bytes:
            pitch_variance, volume_stability = self._extract_audio_features(audio_bytes)

        # Combine all flags
        all_flags = filler_flags + pause_flags

        return ExtractedFeatures(
            duration_sec=duration,
            wpm=round(wpm, 1),
            filler_per_min=round(filler_per_min, 1),
            pause_events=pause_events,
            power_pauses=power_pauses,
            pitch_variance=round(pitch_variance, 1),
            volume_stability=round(volume_stability, 3),
            flags=all_flags,
            word_count=word_count,
            filler_count=len(fillers),
        )

    def _detect_fillers(
        self,
        words: list[TranscriptWord],
    ) -> tuple[list[TranscriptWord], list[FlagEvent]]:
        """Detect filler words in transcript."""
        fillers = []
        flags = []

        for word in words:
            cleaned = word.word.lower().strip().strip(".,!?")
            if cleaned in SINGLE_WORD_FILLERS:
                fillers.append(word)
                flags.append(FlagEvent(
                    t_start=word.start,
                    t_end=word.end,
                    reason="filler",
                ))

        return fillers, flags

    def _detect_pauses(
        self,
        words: list[TranscriptWord],
    ) -> tuple[int, int, list[FlagEvent]]:
        """
        Detect pause events in transcript.

        Returns:
            Tuple of (pause_events, power_pauses, flags)
        """
        if len(words) < 2:
            return 0, 0, []

        pause_events = 0
        power_pauses = 0
        flags = []

        for i in range(1, len(words)):
            gap = words[i].start - words[i - 1].end

            # Long pause (>3s) - potentially problematic
            if gap > 3.0:
                pause_events += 1
                flags.append(FlagEvent(
                    t_start=words[i - 1].end,
                    t_end=words[i].start,
                    reason="long_pause",
                ))

            # Power pause (1-3s) - intentional emphasis
            elif gap >= 1.0:
                power_pauses += 1
                flags.append(FlagEvent(
                    t_start=words[i - 1].end,
                    t_end=words[i].start,
                    reason="power_pause",
                ))

            # Regular pause (0.5-1s) - counted but not flagged
            elif gap >= 0.5:
                pause_events += 1

        return pause_events, power_pauses, flags

    def _extract_audio_features(
        self,
        audio_bytes: bytes,
    ) -> tuple[float, float]:
        """
        Extract pitch variance and volume stability from audio.

        Returns:
            Tuple of (pitch_variance_hz, volume_stability_cv)
        """
        try:
            import librosa
            import soundfile as sf

            # Write to temp file for librosa
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as f:
                f.write(audio_bytes)
                f.flush()

                # Load audio
                y, sr = librosa.load(f.name, sr=22050)

                # Pitch analysis using pyin
                f0, voiced_flag, voiced_probs = librosa.pyin(
                    y,
                    fmin=librosa.note_to_hz('C2'),
                    fmax=librosa.note_to_hz('C7'),
                    sr=sr,
                )

                # Filter to voiced segments only
                voiced_f0 = f0[~np.isnan(f0)]
                pitch_variance = float(np.std(voiced_f0)) if len(voiced_f0) > 0 else 0.0

                # Volume analysis (RMS energy)
                rms = librosa.feature.rms(y=y)[0]
                mean_rms = np.mean(rms)
                std_rms = np.std(rms)
                # Coefficient of variation (0 = perfectly stable, higher = more variable)
                volume_stability = float(std_rms / mean_rms) if mean_rms > 0 else 0.0
                # Clamp to 0-1 range
                volume_stability = min(1.0, max(0.0, volume_stability))

                return pitch_variance, volume_stability

        except Exception as e:
            # If audio analysis fails, return defaults
            print(f"Audio feature extraction failed: {e}")
            return 0.0, 0.0
