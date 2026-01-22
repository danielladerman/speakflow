/**
 * TypeScript types matching the shared contracts.
 * These MUST stay in sync with contracts/schemas/*.json
 */

export type FocusMetric =
  | 'pace'
  | 'fluency'
  | 'clarity'
  | 'vocal_variety'
  | 'structure'
  | 'confidence';

export type FlagReason =
  | 'filler'
  | 'long_pause'
  | 'rush'
  | 'mumble'
  | 'power_pause';

export interface Metrics {
  wpm: number;
  filler_per_min: number;
  pause_events: number;
  power_pauses: number;
  pitch_variance: number;
  volume_stability: number;
}

export interface Scores {
  pace: number;
  fluency: number;
  clarity: number;
  vocal_variety: number;
  overall: number;
}

export interface Flag {
  t_start: number;
  t_end: number;
  reason: FlagReason;
}

export interface ScoreContract {
  session_id: string;
  duration_sec: number;
  metrics: Metrics;
  scores: Scores;
  focus_metric: FocusMetric;
  flags: Flag[];
}

export interface Strength {
  area: FocusMetric;
  observation: string;
}

export interface FocusArea {
  area: FocusMetric;
  current_score: number;
  target_score: number;
  observation: string;
  impact: string;
}

export interface RecommendedDrill {
  drill_id: string;
  reason: string;
  priority: number;
}

export interface CoachingResponse {
  session_id: string;
  summary: string;
  strengths: Strength[];
  focus_area: FocusArea;
  recommended_drills: RecommendedDrill[];
  next_session_goal: string;
}

export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export type SessionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SessionReport {
  session_id: string;
  status: SessionStatus;
  duration_sec: number | null;
  audio_url: string | null;
  score_contract: ScoreContract | null;
  coaching_response: CoachingResponse | null;
  transcript: TranscriptWord[] | null;
}

export interface SessionCreateResponse {
  session_id: string;
  status: string;
  message: string;
}

export interface SessionStatusResponse {
  session_id: string;
  status: SessionStatus;
  duration_sec: number | null;
  error_message: string | null;
  created_at: string | null;
  completed_at: string | null;
}
