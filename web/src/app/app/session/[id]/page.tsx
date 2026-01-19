'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SoftRingScore } from '@/components/SoftRingScore'
import { MetricChip } from '@/components/MetricChip'
import { TranscriptView } from '@/components/TranscriptView'
import {
  mockSession,
  mockCoaching,
  mockTranscript,
  formatDuration,
  getScoreLabel,
  getZoneEncouragement,
} from '@/lib/mock-data'

type SessionTab = 'summary' | 'transcript' | 'coaching'

type SessionPageProps = {
  params: Promise<{ id: string }>
}

export default function SessionPage({ params }: SessionPageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<SessionTab>('summary')

  // In a real app, we'd fetch the session by ID
  // For now, use mock data
  const session = mockSession
  const coaching = mockCoaching
  const transcript = mockTranscript

  const { scores } = session
  const overallLabel = getScoreLabel(scores.overall)
  const focusEncouragement = getZoneEncouragement(
    session.focus_metric,
    scores[session.focus_metric as keyof typeof scores] || scores.overall
  )

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const handleTabKeyDown = (
    event: React.KeyboardEvent,
    tab: SessionTab
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setActiveTab(tab)
    }
  }

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-cloud-100">
        <button
          type="button"
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center
                     rounded-full text-cloud-500
                     transition-colors duration-200
                     hover:bg-cloud-100 hover:text-cloud-700"
          aria-label="Go back"
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
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        <div className="flex-1">
          <h1 className="font-medium text-cloud-800">Session</h1>
          <p className="text-sm text-cloud-500">
            {formatDuration(session.duration_sec)}
          </p>
        </div>
      </header>

      {/* Score header */}
      <div className="flex items-center gap-6 px-6 py-6 bg-white border-b border-cloud-100">
        <SoftRingScore score={scores.overall} size={80} strokeWidth={6} />
        <div>
          <p className="text-xl font-medium text-cloud-800">
            {overallLabel}
          </p>
          <p className="text-sm text-cloud-500 mt-1">
            {focusEncouragement}
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="px-6 py-4 bg-white">
        <div className="tab-nav" role="tablist" aria-label="Session tabs">
          {(['summary', 'transcript', 'coaching'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`panel-${tab}`}
              onClick={() => setActiveTab(tab)}
              onKeyDown={(e) => handleTabKeyDown(e, tab)}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              tabIndex={0}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
        {activeTab === 'summary' && (
          <div
            id="panel-summary"
            role="tabpanel"
            aria-labelledby="tab-summary"
            className="space-y-6 animate-fade-in"
          >
            {/* Metrics grid */}
            <div className="flex flex-wrap gap-2">
              <MetricChip label="Pace" value={scores.pace} />
              <MetricChip label="Fluency" value={scores.fluency} />
              <MetricChip label="Clarity" value={scores.clarity} />
              <MetricChip label="Variety" value={scores.vocal_variety} />
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl p-4 shadow-soft">
              <p className="text-cloud-700 leading-relaxed">
                {coaching.summary}
              </p>
            </div>

            {/* Strengths */}
            <div>
              <h3 className="text-sm font-medium text-cloud-500 mb-3">
                What went well
              </h3>
              <ul className="space-y-2">
                {coaching.strengths.map((strength, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-cloud-700"
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

            {/* Raw metrics - for users who want details */}
            <div>
              <h3 className="text-sm font-medium text-cloud-500 mb-3">
                Details
              </h3>
              <div className="bg-cloud-50 rounded-xl p-4 space-y-2 text-sm">
                <MetricRow
                  label="Words per minute"
                  value={session.metrics.wpm.toFixed(0)}
                />
                <MetricRow
                  label="Fillers per minute"
                  value={session.metrics.filler_per_min.toFixed(1)}
                />
                <MetricRow
                  label="Pause events"
                  value={String(session.metrics.pause_events)}
                />
                <MetricRow
                  label="Power pauses"
                  value={String(session.metrics.power_pauses)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transcript' && (
          <div
            id="panel-transcript"
            role="tabpanel"
            aria-labelledby="tab-transcript"
            className="animate-fade-in"
          >
            <TranscriptView segments={transcript} flags={session.flags} />
          </div>
        )}

        {activeTab === 'coaching' && (
          <div
            id="panel-coaching"
            role="tabpanel"
            aria-labelledby="tab-coaching"
            className="space-y-6 animate-fade-in"
          >
            {/* Focus area */}
            <div className="bg-warmth-50 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-warmth-600 mb-2">
                Area to explore
              </p>
              <p className="text-cloud-700 leading-relaxed">
                {coaching.focus_area.insight}
              </p>
            </div>

            {/* Recommended drills */}
            <div>
              <h3 className="text-sm font-medium text-cloud-500 mb-3">
                Suggested drills
              </h3>
              <div className="space-y-3">
                {coaching.recommended_drills.map((rec) => (
                  <div
                    key={rec.drill_id}
                    className="bg-white rounded-xl p-4 shadow-soft"
                  >
                    <p className="font-medium text-cloud-800 mb-1 capitalize">
                      {rec.drill_id.replace('drill_', '').replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-cloud-600">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Next goal */}
            <div className="bg-sage-50 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-sage-600 mb-2">
                Your next goal
              </p>
              <p className="text-cloud-700 leading-relaxed">
                {coaching.next_session_goal}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

type MetricRowProps = {
  label: string
  value: string
}

function MetricRow({ label, value }: MetricRowProps) {
  return (
    <div className="flex justify-between text-cloud-600">
      <span>{label}</span>
      <span className="font-medium text-cloud-700">{value}</span>
    </div>
  )
}
