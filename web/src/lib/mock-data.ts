import type {
  ScoreContract,
  CoachingResponse,
  Drill,
  TranscriptSegment
} from '@/types'

// Mock session result conforming to Score Contract
export const mockSession: ScoreContract = {
  session_id: '550e8400-e29b-41d4-a716-446655440000',
  duration_sec: 180.5,
  metrics: {
    wpm: 165.3,
    filler_per_min: 4.2,
    pause_events: 12,
    power_pauses: 3,
    pitch_variance: 42.5,
    volume_stability: 0.25,
  },
  scores: {
    pace: 78,
    fluency: 65,
    clarity: 82,
    vocal_variety: 71,
    overall: 74,
  },
  focus_metric: 'fluency',
  flags: [
    { t_start: 12.5, t_end: 13.1, reason: 'filler' },
    { t_start: 45.0, t_end: 47.5, reason: 'long_pause' },
    { t_start: 89.2, t_end: 89.8, reason: 'filler' },
    { t_start: 120.0, t_end: 122.5, reason: 'power_pause' },
  ],
}

// Mock coaching response
export const mockCoaching: CoachingResponse = {
  session_id: '550e8400-e29b-41d4-a716-446655440000',
  summary: 'Your speaking has a natural warmth and clarity. Focus on replacing filler words with confident pauses to elevate your presence.',
  strengths: [
    'Clear articulation throughout',
    'Good use of intentional pauses for emphasis',
    'Steady, confident volume',
  ],
  focus_area: {
    zone: 'fluency',
    insight: 'You tend to use filler words when transitioning between ideas. Embrace the silence—it gives your words weight.',
  },
  recommended_drills: [
    {
      drill_id: 'drill_fluency_silence',
      reason: 'Practice replacing fillers with intentional pauses',
      priority: 1,
    },
    {
      drill_id: 'drill_fluency_one_thought',
      reason: 'Build the habit of completing one thought before starting another',
      priority: 2,
    },
  ],
  next_session_goal: 'Reduce filler words to under 3 per minute while maintaining your natural warmth.',
}

// Mock transcript
export const mockTranscript: TranscriptSegment[] = [
  {
    text: "Today I want to talk about something that's been on my mind.",
    start: 0.0,
    end: 4.2,
    words: [
      { word: 'Today', start: 0.0, end: 0.4, confidence: 0.98 },
      { word: 'I', start: 0.5, end: 0.6, confidence: 0.99 },
      { word: 'want', start: 0.7, end: 0.9, confidence: 0.97 },
      { word: 'to', start: 1.0, end: 1.1, confidence: 0.99 },
      { word: 'talk', start: 1.2, end: 1.5, confidence: 0.98 },
      { word: 'about', start: 1.6, end: 1.9, confidence: 0.97 },
      { word: 'something', start: 2.0, end: 2.5, confidence: 0.96 },
      { word: "that's", start: 2.6, end: 2.9, confidence: 0.95 },
      { word: 'been', start: 3.0, end: 3.2, confidence: 0.98 },
      { word: 'on', start: 3.3, end: 3.4, confidence: 0.99 },
      { word: 'my', start: 3.5, end: 3.7, confidence: 0.99 },
      { word: 'mind', start: 3.8, end: 4.2, confidence: 0.98 },
    ],
  },
  {
    text: "It's about how we communicate with each other in meaningful ways.",
    start: 4.5,
    end: 9.8,
    words: [
      { word: "It's", start: 4.5, end: 4.7, confidence: 0.97 },
      { word: 'about', start: 4.8, end: 5.1, confidence: 0.98 },
      { word: 'how', start: 5.2, end: 5.4, confidence: 0.99 },
      { word: 'we', start: 5.5, end: 5.6, confidence: 0.99 },
      { word: 'communicate', start: 5.7, end: 6.4, confidence: 0.96 },
      { word: 'with', start: 6.5, end: 6.7, confidence: 0.98 },
      { word: 'each', start: 6.8, end: 7.0, confidence: 0.98 },
      { word: 'other', start: 7.1, end: 7.4, confidence: 0.97 },
      { word: 'in', start: 7.5, end: 7.6, confidence: 0.99 },
      { word: 'meaningful', start: 7.7, end: 8.4, confidence: 0.95 },
      { word: 'ways', start: 8.5, end: 9.8, confidence: 0.98 },
    ],
  },
  {
    text: "Um, I think the most important thing is to be present.",
    start: 10.2,
    end: 15.5,
    words: [
      { word: 'Um', start: 10.2, end: 10.6, confidence: 0.92 },
      { word: 'I', start: 11.0, end: 11.1, confidence: 0.99 },
      { word: 'think', start: 11.2, end: 11.5, confidence: 0.98 },
      { word: 'the', start: 11.6, end: 11.7, confidence: 0.99 },
      { word: 'most', start: 11.8, end: 12.1, confidence: 0.98 },
      { word: 'important', start: 12.2, end: 12.8, confidence: 0.97 },
      { word: 'thing', start: 12.9, end: 13.2, confidence: 0.98 },
      { word: 'is', start: 13.3, end: 13.5, confidence: 0.99 },
      { word: 'to', start: 13.6, end: 13.7, confidence: 0.99 },
      { word: 'be', start: 13.8, end: 14.0, confidence: 0.99 },
      { word: 'present', start: 14.1, end: 15.5, confidence: 0.97 },
    ],
  },
  {
    text: "When you truly listen to someone, they feel valued.",
    start: 16.0,
    end: 20.5,
    words: [
      { word: 'When', start: 16.0, end: 16.3, confidence: 0.98 },
      { word: 'you', start: 16.4, end: 16.6, confidence: 0.99 },
      { word: 'truly', start: 16.7, end: 17.1, confidence: 0.97 },
      { word: 'listen', start: 17.2, end: 17.6, confidence: 0.98 },
      { word: 'to', start: 17.7, end: 17.8, confidence: 0.99 },
      { word: 'someone', start: 17.9, end: 18.4, confidence: 0.97 },
      { word: 'they', start: 18.6, end: 18.8, confidence: 0.98 },
      { word: 'feel', start: 18.9, end: 19.2, confidence: 0.98 },
      { word: 'valued', start: 19.3, end: 20.5, confidence: 0.96 },
    ],
  },
]

// Mock drills (subset from the full library)
export const mockDrills: Drill[] = [
  {
    drill_id: 'drill_fluency_silence',
    name: 'Embrace the Silence',
    zone: 'fluency',
    difficulty: 'beginner',
    targets: ['filler_per_min', 'pause_events'],
    duration_sec: 180,
    instructions: '1. Choose a topic you can speak about for 3 minutes. 2. Speak aloud, but every time you feel an "um" or "uh" coming, STOP completely. 3. Hold the silence for a full 2 seconds. 4. Then continue. The goal is replacing fillers with intentional pauses.',
    success_metric: 'Fewer than 3 filler words per minute',
    failure_signals: [
      'Rushing through silences',
      'Replacing "um" with "so" or "like"',
      'Stopping mid-word',
    ],
    recommended_when: {
      score_below: 70,
      metric_threshold: {
        metric: 'filler_per_min',
        operator: 'gt',
        value: 5,
      },
    },
  },
  {
    drill_id: 'drill_fluency_one_thought',
    name: 'One Thought Per Breath',
    zone: 'fluency',
    difficulty: 'intermediate',
    targets: ['filler_per_min', 'pause_events'],
    duration_sec: 180,
    instructions: '1. Take a breath. 2. Speak ONE complete thought—a single sentence. 3. Stop. Breathe. 4. Speak the next thought. 5. This rhythm prevents rambling and eliminates filler words used to "hold the floor".',
    success_metric: 'Each thought is a complete sentence with no fillers',
    failure_signals: [
      'Running multiple sentences together',
      'Trailing off mid-thought',
      'Using "and" to chain thoughts endlessly',
    ],
    recommended_when: {
      score_below: 65,
      metric_threshold: {
        metric: 'filler_per_min',
        operator: 'gt',
        value: 6,
      },
    },
  },
]

// Today's drill for Daily 5
export const todaysDrill: Drill = mockDrills[0]

// Helper to get drill by ID
export function getDrillById(id: string): Drill | undefined {
  return mockDrills.find(d => d.drill_id === id)
}

// Format duration for display
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`
}

// Get score label - gentle, non-judgmental language
export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Flowing'
  if (score >= 70) return 'Growing'
  if (score >= 55) return 'Building'
  return 'Starting'
}

// Get zone-specific encouragement
export function getZoneEncouragement(zone: string, score: number): string {
  const messages: Record<string, Record<string, string>> = {
    pace: {
      high: 'Your rhythm feels natural and confident.',
      medium: 'Your pace is finding its groove.',
      low: 'Let your words breathe a little more.',
    },
    fluency: {
      high: 'Your thoughts flow with beautiful clarity.',
      medium: 'Each pause you embrace becomes power.',
      low: 'Silence between words holds meaning too.',
    },
    clarity: {
      high: 'Every word lands with purpose.',
      medium: 'Your message is coming through clearly.',
      low: 'Take your time—clarity follows calm.',
    },
    vocal_variety: {
      high: 'Your voice paints with rich colors.',
      medium: 'Your expression is opening up.',
      low: 'Let your voice explore its range.',
    },
  }

  const level = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low'
  return messages[zone]?.[level] || 'Keep going—you\'re making progress.'
}
