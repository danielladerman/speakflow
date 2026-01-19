'use client'

import Link from 'next/link'
import { SoftRingScore } from '@/components/SoftRingScore'
import { MetricChip } from '@/components/MetricChip'
import { mockSession, getScoreLabel } from '@/lib/mock-data'

export default function AppHomePage() {
  const { scores } = mockSession
  const overallLabel = getScoreLabel(scores.overall)

  return (
    <main className="flex-1 flex flex-col px-6 py-8">
      {/* Header - minimal, breathing space */}
      <header className="mb-12">
        <p className="text-cloud-500 text-sm mb-1">Welcome back</p>
        <h1 className="text-2xl font-medium text-cloud-800">
          Ready to practice?
        </h1>
      </header>

      {/* Daily 5 Card - Primary CTA */}
      <Link
        href="/app/daily"
        className="block mb-8 p-6 bg-white rounded-2xl shadow-soft
                   transition-all duration-400 ease-gentle
                   hover:shadow-elevated active:scale-[0.98]"
        aria-label="Start your Daily 5 practice session"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-cloud-800 mb-1">
              Daily 5
            </h2>
            <p className="text-sm text-cloud-500">
              3 breaths. 1 drill. 5 minutes.
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-sage-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
              />
            </svg>
          </div>
        </div>
        <div className="text-sm text-sage-600 font-medium">
          Begin your practice
        </div>
      </Link>

      {/* Recent Progress - Soft, non-judgmental */}
      <section className="mb-8">
        <h3 className="text-sm font-medium text-cloud-500 mb-4">
          Your progress
        </h3>

        <div className="bg-white rounded-2xl shadow-soft p-6">
          <div className="flex items-center gap-6 mb-6">
            <SoftRingScore
              score={scores.overall}
              size={80}
              strokeWidth={6}
            />
            <div>
              <p className="text-2xl font-medium text-cloud-800">
                {overallLabel}
              </p>
              <p className="text-sm text-cloud-500">
                Overall flow
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <MetricChip label="Pace" value={scores.pace} />
            <MetricChip label="Fluency" value={scores.fluency} />
            <MetricChip label="Clarity" value={scores.clarity} />
            <MetricChip label="Variety" value={scores.vocal_variety} />
          </div>
        </div>
      </section>

      {/* Recent Sessions - Gentle history */}
      <section>
        <h3 className="text-sm font-medium text-cloud-500 mb-4">
          Recent sessions
        </h3>

        <Link
          href={`/app/session/${mockSession.session_id}`}
          className="block p-4 bg-white rounded-xl shadow-soft
                     transition-all duration-300 ease-gentle
                     hover:shadow-elevated"
          aria-label="View session details"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-cloud-800 mb-1">
                Practice session
              </p>
              <p className="text-sm text-cloud-500">
                3:00 min
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-cloud-700">
                {scores.overall}
              </span>
              <svg
                className="w-5 h-5 text-cloud-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </div>
          </div>
        </Link>
      </section>
    </main>
  )
}
