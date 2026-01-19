// Types conforming to SpeakFlow Score Contract and Drill Schema

export interface Metrics {
  wpm: number
  filler_per_min: number
  pause_events: number
  power_pauses: number
  pitch_variance: number
  volume_stability: number
}

export interface Scores {
  pace: number
  fluency: number
  clarity: number
  vocal_variety: number
  overall: number
}

export type FocusMetric = 'pace' | 'fluency' | 'clarity' | 'vocal_variety' | 'structure' | 'confidence'

export type FlagReason = 'filler' | 'long_pause' | 'rush' | 'mumble' | 'power_pause'

export interface Flag {
  t_start: number
  t_end: number
  reason: FlagReason
}

export interface ScoreContract {
  session_id: string
  duration_sec: number
  metrics: Metrics
  scores: Scores
  focus_metric: FocusMetric
  flags: Flag[]
}

export type Zone = 'pace' | 'fluency' | 'clarity' | 'vocal_variety' | 'structure' | 'confidence'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type MetricName = keyof Metrics

export interface MetricThreshold {
  metric: MetricName
  operator: 'gt' | 'lt' | 'gte' | 'lte'
  value: number
}

export interface RecommendedWhen {
  score_below?: number
  metric_threshold?: MetricThreshold
}

export interface Drill {
  drill_id: string
  name: string
  zone: Zone
  difficulty: Difficulty
  targets: MetricName[]
  duration_sec: number
  instructions: string
  success_metric: string
  failure_signals: string[]
  recommended_when: RecommendedWhen
}

export interface CoachingResponse {
  session_id: string
  summary: string
  strengths: string[]
  focus_area: {
    zone: Zone
    insight: string
  }
  recommended_drills: {
    drill_id: string
    reason: string
    priority: number
  }[]
  next_session_goal: string
}

// Daily 5 Flow States
export type Daily5Phase =
  | 'entry'
  | 'warmup'
  | 'recording'
  | 'processing'
  | 'results'

export type BreathPhase = 'inhale' | 'exhale' | 'hold'

export interface TranscriptWord {
  word: string
  start: number
  end: number
  confidence: number
}

export interface TranscriptSegment {
  text: string
  start: number
  end: number
  words: TranscriptWord[]
}
