'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AppHomePage() {
  const [greeting, setGreeting] = useState('Good morning')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-[80vh] relative overflow-hidden">
      {/* Ambient Background - Floating light */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                   w-[500px] h-[500px] bg-sky-100/50 rounded-full blur-3xl 
                   animate-breathe-in pointer-events-none -z-10"
      />

      <div className="z-10 w-full max-w-md px-6 flex flex-col items-center text-center">
        <header className="mb-12 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-light text-cloud-800 mb-3 tracking-tight">
            {greeting}
          </h1>
          <p className="text-lg text-cloud-500 font-light">
            Ready to find your flow?
          </p>
        </header>

        {/* Primary Action - Single Focus */}
        <Link
          href="/app/daily"
          className="group relative w-full p-8 bg-white/60 surface-glass 
                     rounded-3xl shadow-soft transition-all duration-800 ease-spring
                     hover:shadow-elevated hover:scale-[1.02] hover:-translate-y-1
                     active:scale-[0.98] animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
          aria-label="Start your Daily 5 practice session"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center
                          group-hover:bg-sky-100 transition-colors duration-600 ease-gentle">
              <svg
                className="w-8 h-8 text-sky-600 group-hover:text-sky-700 transition-colors duration-600"
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

            <div>
              <h2 className="text-xl font-medium text-cloud-800 mb-2">
                Daily 5
              </h2>
              <p className="text-cloud-500 font-light leading-relaxed">
                3 breaths. 1 drill. 5 minutes.<br />
                Your space to pause and practice.
              </p>
            </div>

            <div className="mt-2 text-sm text-sky-600/80 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-600 ease-gentle transform translate-y-2 group-hover:translate-y-0">
              Begin practice
            </div>
          </div>
        </Link>
      </div>
    </main>
  )
}
