"""
Coaching Service - LLM-powered coaching that selects drills from library.

CRITICAL RULES:
1. LLM interprets scores and selects drills - NEVER invents new drills
2. Output must conform to CoachingResponse schema
3. All drill_ids must exist in speakflow_v1 library
"""

import json
from pathlib import Path
from uuid import UUID

from openai import OpenAI

from ..config import settings

# Import contracts from installed package
from speakflow_contracts import (
    ScoreContract,
    DrillLibrary,
    DrillZone,
    CoachingResponse,
)


SYSTEM_PROMPT = """You are a professional speech coach analyzing session results.

CRITICAL RULES:
1. You MUST select drills from the provided library - NEVER invent new drills
2. All drill_ids in your response MUST exist in the drill library
3. Your response MUST be valid JSON matching the schema exactly
4. Focus on ONE primary area for improvement (the focus_metric)
5. Be encouraging but honest - growth comes from acknowledging areas to improve

You will receive:
- Score contract with metrics and scores
- Available drills from the library

Respond with a coaching plan that:
1. Summarizes the session (2-3 sentences)
2. Identifies 1-3 strengths
3. Focuses on one area for improvement
4. Recommends 1-3 drills from the library
5. Sets a specific, measurable goal for next session"""


class CoachingService:
    """
    LLM-powered coaching service.

    Uses GPT to interpret scores and select appropriate drills.
    """

    def __init__(self, drill_library_path: str | None = None):
        """
        Initialize coaching service.

        Args:
            drill_library_path: Path to drill library JSON
        """
        self._client = OpenAI(api_key=settings.openai_api_key)
        self._model = settings.openai_model

        # Load drill library - try configured path, then relative to app
        if drill_library_path:
            lib_path = Path(drill_library_path)
        elif settings.drill_library_path:
            lib_path = Path(settings.drill_library_path)
        else:
            # Default: relative to app location (works in Docker)
            lib_path = Path(__file__).parent.parent.parent.parent / "contracts/fixtures/speakflow_v1_drills.json"

        with open(lib_path) as f:
            data = json.load(f)
            data.pop("$schema", None)
            self._drill_library = DrillLibrary(**data)

        # Build drill lookup for validation
        self._valid_drill_ids = {d.drill_id for d in self._drill_library.drills}

    def generate_coaching(self, score_contract: ScoreContract) -> CoachingResponse:
        """
        Generate coaching response from scores.

        Args:
            score_contract: Scored session data

        Returns:
            CoachingResponse with recommendations
        """
        # Get relevant drills for the focus area
        focus_zone = DrillZone(score_contract.focus_metric.value)
        relevant_drills = self._drill_library.get_drills_for_zone(focus_zone)

        # Build prompt
        user_prompt = self._build_prompt(score_contract, relevant_drills)

        # Call LLM
        response = self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=1000,
        )

        # Parse response
        response_text = response.choices[0].message.content
        coaching_data = json.loads(response_text)

        # Ensure session_id is set
        coaching_data["session_id"] = str(score_contract.session_id)

        # Validate drill IDs exist in library
        self._validate_drill_ids(coaching_data)

        # Parse into CoachingResponse
        return CoachingResponse(**coaching_data)

    def _build_prompt(
        self,
        score_contract: ScoreContract,
        relevant_drills: list,
    ) -> str:
        """Build the user prompt with score data and drill options."""

        # Format drill options
        drill_options = []
        for drill in relevant_drills:
            drill_options.append({
                "drill_id": drill.drill_id,
                "name": drill.name,
                "zone": drill.zone.value,
                "difficulty": drill.difficulty.value,
                "targets": [t.value for t in drill.targets],
                "duration_sec": drill.duration_sec,
                "instructions": drill.instructions[:200] + "...",  # Truncate for prompt
            })

        # Also include some drills from other zones for variety
        other_zones = [z for z in DrillZone if z.value != score_contract.focus_metric.value]
        for zone in other_zones[:2]:  # Add 2 other zones
            zone_drills = self._drill_library.get_drills_for_zone(zone)[:2]
            for drill in zone_drills:
                drill_options.append({
                    "drill_id": drill.drill_id,
                    "name": drill.name,
                    "zone": drill.zone.value,
                    "difficulty": drill.difficulty.value,
                    "targets": [t.value for t in drill.targets],
                    "duration_sec": drill.duration_sec,
                })

        prompt = f"""## Session Results

**Duration:** {score_contract.duration_sec:.1f} seconds
**Focus Area:** {score_contract.focus_metric.value}

### Metrics
- Words per minute: {score_contract.metrics.wpm}
- Filler words per minute: {score_contract.metrics.filler_per_min}
- Pause events: {score_contract.metrics.pause_events}
- Power pauses: {score_contract.metrics.power_pauses}
- Pitch variance: {score_contract.metrics.pitch_variance} Hz
- Volume stability: {score_contract.metrics.volume_stability}

### Scores (0-100)
- Pace: {score_contract.scores.pace}
- Fluency: {score_contract.scores.fluency}
- Clarity: {score_contract.scores.clarity}
- Vocal Variety: {score_contract.scores.vocal_variety}
- Overall: {score_contract.scores.overall}

### Flagged Events
{self._format_flags(score_contract.flags)}

## Available Drills (SELECT FROM THESE ONLY)

```json
{json.dumps(drill_options, indent=2)}
```

## Required Response Format

Respond with valid JSON matching this structure:
```json
{{
  "session_id": "{score_contract.session_id}",
  "summary": "2-3 sentence overview",
  "strengths": [
    {{"area": "pace|fluency|clarity|vocal_variety|structure|confidence", "observation": "specific observation"}}
  ],
  "focus_area": {{
    "area": "{score_contract.focus_metric.value}",
    "current_score": {self._get_score_for_metric(score_contract)},
    "target_score": [realistic target 5-15 points higher],
    "observation": "specific observation about what needs work",
    "impact": "why improving this matters"
  }},
  "recommended_drills": [
    {{"drill_id": "drill_xxx", "reason": "why this drill helps", "priority": 1}}
  ],
  "next_session_goal": "specific, measurable goal"
}}
```

REMEMBER: All drill_ids MUST come from the Available Drills list above."""

        return prompt

    def _format_flags(self, flags: list) -> str:
        """Format flag events for prompt."""
        if not flags:
            return "None"

        flag_lines = []
        for f in flags[:10]:  # Limit to 10 flags
            flag_lines.append(f"- {f.reason.value} at {f.t_start:.1f}s-{f.t_end:.1f}s")
        return "\n".join(flag_lines)

    def _get_score_for_metric(self, score_contract: ScoreContract) -> int:
        """Get the score for the focus metric."""
        metric = score_contract.focus_metric.value
        scores = score_contract.scores
        return getattr(scores, metric, scores.overall)

    def _validate_drill_ids(self, coaching_data: dict) -> None:
        """Validate all drill IDs exist in library."""
        recommended = coaching_data.get("recommended_drills", [])
        for rec in recommended:
            drill_id = rec.get("drill_id", "")
            if drill_id not in self._valid_drill_ids:
                # Find closest valid drill for the focus area
                focus = coaching_data.get("focus_area", {}).get("area", "fluency")
                try:
                    zone = DrillZone(focus)
                    fallback_drills = self._drill_library.get_drills_for_zone(zone)
                    if fallback_drills:
                        rec["drill_id"] = fallback_drills[0].drill_id
                except ValueError:
                    # Default to first drill in library
                    rec["drill_id"] = self._drill_library.drills[0].drill_id
