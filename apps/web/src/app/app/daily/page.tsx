'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Daily5Phase } from '@/types'
import { BreathCircle } from '@/components/BreathCircle'
import { RecordButton } from '@/components/RecordButton'
import { SoftRingScore } from '@/components/SoftRingScore'
import { MetricChip } from '@/components/MetricChip'
import { TranscriptView } from '@/components/TranscriptView'
import {
  todaysDrill,
  mockSession,
  mockCoaching,
  mockTranscript,
  formatDuration,
  getScoreLabel,
  getZoneEncouragement,
} from '@/lib/mock-data'

type ResultsTab = 'summary' | 'transcript' | 'coaching'

export default function DailyPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Daily5Phase>('entry')
  const [resultsTab, setResultsTab] = useState<ResultsTab>('summary')
  const [recordingTime, setRecordingTime] = useState(0)

  // Recording timer
  useEffect(() => {
    if (phase !== 'recording') return

    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [phase])

  const handleBegin = useCallback(() => {
    setPhase('warmup')
  }, [])

  const handleWarmupComplete = useCallback(() => {
    setPhase('recording')
  }, [])

  const handleStartRecording = useCallback(() => {
    // Recording starts automatically after warmup
  }, [])

  const handleStopRecording = useCallback(() => {
    setPhase('processing')
    // Simulate processing delay
    setTimeout(() => {
      setPhase('results')
    }, 2500)
  }, [])

  const handleClose = useCallback(() => {
    router.push('/app')
  }, [router])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    },
    [handleClose]
  )

  return (
    <main
      className="flex-1 flex flex-col min-h-screen"
      onKeyDown={handleKeyDown}
    >
      {/* Header - minimal, context-aware */}
      <header className="flex items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center
                     rounded-full text-cloud-500
                     transition-colors duration-200
                     hover:bg-cloud-100 hover:text-cloud-700"
          aria-label="Close and return to home"
          tabIndex={0}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Phase indicator - subtle breadcrumb */}
        <div className="flex items-center gap-2">
          {(['warmup', 'recording', 'results'] as const).map((p, index) => (
            <div
              key={p}
              className={`w-2 h-2 rounded-full transition-colors duration-400
                         ${phase === p || (phase === 'processing' && p === 'results')
                           ? 'bg-sage-400'
                           : phase === 'entry' || index > getPhaseIndex(phase)
                           ? 'bg-cloud-200'
                           : 'bg-sage-300'
                         }`}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Spacer for layout balance */}
        <div className="w-10" />
      </header>

      {/* Content - phase-specific */}
      <div className="flex-1 flex flex-col">
        {phase === 'entry' && (
          <EntryPhase drill={todaysDrill} onBegin={handleBegin} />
        )}

        {phase === 'warmup' && (
          <WarmupPhase onComplete={handleWarmupComplete} />
        )}

        {phase === 'recording' && (
          <RecordingPhase
            drill={todaysDrill}
            recordingTime={recordingTime}
            onStart={handleStartRecording}
            onStop={handleStopRecording}
          />
        )}

        {phase === 'processing' && <ProcessingPhase />}

        {phase === 'results' && (
          <ResultsPhase
            session={mockSession}
            coaching={mockCoaching}
            transcript={mockTranscript}
            activeTab={resultsTab}
            onTabChange={setResultsTab}
            onDone={handleClose}
          />
        )}
      </div>
    </main>
  )
}

// Helper to get phase index for progress indicator
function getPhaseIndex(phase: Daily5Phase): number {
  const order: Daily5Phase[] = ['entry', 'warmup', 'recording', 'processing', 'results']
  return order.indexOf(phase)
}

// ============================================================
// Entry Phase - Warm welcome, sets intention
// ============================================================

type EntryPhaseProps = {
  drill: typeof todaysDrill
  onBegin: () => void
}

function EntryPhase({ drill, onBegin }: EntryPhaseProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onBegin()
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center px-6 pb-12 animate-fade-in">
      {/* Greeting */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-medium text-cloud-800 mb-3">
          Daily 5
        </h1>
        <p className="text-cloud-500 leading-relaxed">
          3 breaths. 1 drill. 5 minutes.
        </p>
      </div>

      {/* Today&apos;s drill card */}
      <div className="bg-white rounded-2xl shadow-soft p-6 mb-12">
        <p className="text-xs uppercase tracking-wide text-cloud-400 mb-2">
          Today&apos;s focus
        </p>
        <h2 className="text-lg font-medium text-cloud-800 mb-2">
          {drill.name}
        </h2>
        <p className="text-sm text-cloud-600 leading-relaxed mb-4">
          {drill.instructions.split('.')[0]}.
        </p>
        <div className="flex items-center gap-4 text-sm text-cloud-500">
          <span className="capitalize">{drill.zone}</span>
          <span>·</span>
          <span>{formatDuration(drill.duration_sec)}</span>
        </div>
      </div>

      {/* Begin button */}
      <button
        type="button"
        onClick={onBegin}
        onKeyDown={handleKeyDown}
        className="w-full py-4 px-6 bg-sage-500 text-white
                   rounded-xl font-medium text-lg
                   transition-all duration-300 ease-gentle
                   hover:bg-sage-600 active:scale-[0.98]
                   focus-visible:ring-2 focus-visible:ring-sage-300 focus-visible:ring-offset-2"
        tabIndex={0}
        aria-label="Begin daily practice"
      >
        Begin
      </button>
    </div>
  )
}

// ============================================================
// Warmup Phase - 3 breaths, 6s in / 8s out
// ============================================================

type WarmupPhaseProps = {
  onComplete: () => void
}

function WarmupPhase({ onComplete }: WarmupPhaseProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-lg font-medium text-cloud-700 mb-2">
          Find your center
        </h2>
        <p className="text-sm text-cloud-500">
          Three deep breaths to settle in
        </p>
      </div>

      <BreathCircle
        isActive={true}
        onBreathComplete={onComplete}
        inhaleSeconds={6}
        exhaleSeconds={8}
        cycles={3}
        size={220}
      />
    </div>
  )
}

// ============================================================
// Recording Phase - Clean, focused recording
// ============================================================

type RecordingPhaseProps = {
  drill: typeof todaysDrill
  recordingTime: number
  onStart: () => void
  onStop: () => void
}

function RecordingPhase({
  drill,
  recordingTime,
  onStart,
  onStop,
}: RecordingPhaseProps) {
  const isRecording = recordingTime > 0
  const formattedTime = formatRecordingTime(recordingTime)

  const handleStart = useCallback(() => {
    onStart()
  }, [onStart])

  return (
    <div className="flex-1 flex flex-col px-6 pb-12 animate-fade-in">
      {/* Drill reminder - subtle, not distracting */}
      <div className="text-center mb-8 pt-4">
        <p className="text-sm text-cloud-400 mb-1">
          {drill.name}
        </p>
        {/* No numbers during recording - just gentle time awareness */}
        <p className="text-2xl font-light text-cloud-700 tabular-nums">
          {isRecording ? formattedTime : 'Ready'}
        </p>
      </div>

      {/* Central recording area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <RecordButton
          isRecording={isRecording}
          onStart={handleStart}
          onStop={onStop}
          size={100}
        />
      </div>

      {/* Instructions - visible but not overwhelming */}
      <div className="bg-cloud-50 rounded-xl p-4 mt-8">
        <p className="text-sm text-cloud-600 leading-relaxed text-center">
          {drill.instructions.split('.').slice(0, 2).join('.')}...
        </p>
      </div>
    </div>
  )
}

function formatRecordingTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// ============================================================
// Processing Phase - Calm patience
// ============================================================

function ProcessingPhase() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 animate-fade-in">
      {/* Processing animation - gentle, not urgent */}
      <div className="flex items-center gap-2 mb-8">
        <span className="processing-dot" />
        <span className="processing-dot" />
        <span className="processing-dot" />
      </div>

      <p className="text-cloud-600 text-center">
        Listening to your voice...
      </p>
    </div>
  )
}

// ============================================================
// Results Phase - Gentle insights, tabbed view
// ============================================================

type ResultsPhaseProps = {
  session: typeof mockSession
  coaching: typeof mockCoaching
  transcript: typeof mockTranscript
  activeTab: ResultsTab
  onTabChange: (tab: ResultsTab) => void
  onDone: () => void
}

function ResultsPhase({
  session,
  coaching,
  transcript,
  activeTab,
  onTabChange,
  onDone,
}: ResultsPhaseProps) {
  const { scores } = session
  const overallLabel = getScoreLabel(scores.overall)
  const focusEncouragement = getZoneEncouragement(
    session.focus_metric,
    scores[session.focus_metric as keyof typeof scores] || scores.overall
  )

  const handleTabKeyDown = (
    event: React.KeyboardEvent,
    tab: ResultsTab
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onTabChange(tab)
    }
  }

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 animate-fade-in">
      {/* Header with score */}
      <div className="flex items-center gap-6 py-6">
        <SoftRingScore score={scores.overall} size={90} strokeWidth={7} />
        <div>
          <p className="text-2xl font-medium text-cloud-800">
            {overallLabel}
          </p>
          <p className="text-sm text-cloud-500 mt-1">
            {focusEncouragement}
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="tab-nav mb-6" role="tablist" aria-label="Results tabs">
        {(['summary', 'transcript', 'coaching'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`panel-${tab}`}
            onClick={() => onTabChange(tab)}
            onKeyDown={(e) => handleTabKeyDown(e, tab)}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            tabIndex={0}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {activeTab === 'summary' && (
          <SummaryPanel session={session} coaching={coaching} />
        )}

        {activeTab === 'transcript' && (
          <TranscriptPanel transcript={transcript} flags={session.flags} />
        )}

        {activeTab === 'coaching' && (
          <CoachingPanel coaching={coaching} />
        )}
      </div>

      {/* Done button */}
      <button
        type="button"
        onClick={onDone}
        className="w-full py-4 px-6 bg-white text-cloud-700
                   rounded-xl font-medium border border-cloud-200
                   transition-all duration-300 ease-gentle
                   hover:bg-cloud-50 active:scale-[0.98]
                   mt-6"
        tabIndex={0}
        aria-label="Done, return to home"
      >
        Done
      </button>
    </div>
  )
}

// Summary panel
type SummaryPanelProps = {
  session: typeof mockSession
  coaching: typeof mockCoaching
}

function SummaryPanel({ session, coaching }: SummaryPanelProps) {
  const { scores } = session

  return (
    <div
      id="panel-summary"
      role="tabpanel"
      aria-labelledby="tab-summary"
      className="space-y-6"
    >
      {/* Metrics grid - staggered entrance */}
      <div className="flex flex-wrap gap-2">
        <div className="animate-scale-in" style={{ animationDelay: '0ms' }}>
          <MetricChip label="Pace" value={scores.pace} />
        </div>
        <div className="animate-scale-in" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
          <MetricChip label="Fluency" value={scores.fluency} />
        </div>
        <div className="animate-scale-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <MetricChip label="Clarity" value={scores.clarity} />
        </div>
        <div className="animate-scale-in" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
          <MetricChip label="Variety" value={scores.vocal_variety} />
        </div>
      </div>

      {/* Summary text */}
      <div
        className="bg-white rounded-xl p-4 shadow-soft animate-slide-up"
        style={{ animationDelay: '200ms', animationFillMode: 'both' }}
      >
        <p className="text-cloud-700 leading-relaxed">
          {coaching.summary}
        </p>
      </div>

      {/* Strengths */}
      <div
        className="animate-slide-up"
        style={{ animationDelay: '300ms', animationFillMode: 'both' }}
      >
        <h3 className="text-sm font-medium text-cloud-500 mb-3">
          What went well
        </h3>
        <ul className="space-y-2">
          {coaching.strengths.map((strength, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-cloud-700 animate-slide-up"
              style={{
                animationDelay: `${350 + index * 80}ms`,
                animationFillMode: 'both',
              }}
            >
              <span
                className="w-5 h-5 rounded-full bg-sage-100 flex items-center justify-center
                           flex-shrink-0 mt-0.5"
                aria-hidden="true"
              >
                <svg
                  className="w-3 h-3 text-sage-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <span className="text-sm">{strength}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Transcript panel
type TranscriptPanelProps = {
  transcript: typeof mockTranscript
  flags: typeof mockSession.flags
}

function TranscriptPanel({ transcript, flags }: TranscriptPanelProps) {
  return (
    <div
      id="panel-transcript"
      role="tabpanel"
      aria-labelledby="tab-transcript"
      className="animate-slide-up"
    >
      <TranscriptView segments={transcript} flags={flags} />
    </div>
  )
}

// Coaching panel
type CoachingPanelProps = {
  coaching: typeof mockCoaching
}

function CoachingPanel({ coaching }: CoachingPanelProps) {
  return (
    <div
      id="panel-coaching"
      role="tabpanel"
      aria-labelledby="tab-coaching"
      className="space-y-6"
    >
      {/* Focus area */}
      <div
        className="bg-warmth-50 rounded-xl p-4 animate-slide-up"
        style={{ animationFillMode: 'both' }}
      >
        <p className="text-xs uppercase tracking-wide text-warmth-600 mb-2">
          Area to explore
        </p>
        <p className="text-cloud-700 leading-relaxed">
          {coaching.focus_area.insight}
        </p>
      </div>

      {/* Recommended drills */}
      <div
        className="animate-slide-up"
        style={{ animationDelay: '100ms', animationFillMode: 'both' }}
      >
        <h3 className="text-sm font-medium text-cloud-500 mb-3">
          Try these drills
        </h3>
        <div className="space-y-3">
          {coaching.recommended_drills.map((rec, index) => (
            <div
              key={rec.drill_id}
              className="bg-white rounded-xl p-4 shadow-soft animate-slide-up"
              style={{
                animationDelay: `${150 + index * 80}ms`,
                animationFillMode: 'both',
              }}
            >
              <p className="font-medium text-cloud-800 mb-1">
                {rec.drill_id.replace('drill_', '').replace(/_/g, ' ')}
              </p>
              <p className="text-sm text-cloud-600">{rec.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Next session goal */}
      <div
        className="bg-sage-50 rounded-xl p-4 animate-slide-up"
        style={{ animationDelay: '300ms', animationFillMode: 'both' }}
      >
        <p className="text-xs uppercase tracking-wide text-sage-600 mb-2">
          Your next goal
        </p>
        <p className="text-cloud-700 leading-relaxed">
          {coaching.next_session_goal}
        </p>
      </div>
    </div>
  )
}
