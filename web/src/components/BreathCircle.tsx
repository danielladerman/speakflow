'use client'

import { useState, useEffect, useCallback } from 'react'
import type { BreathPhase } from '@/types'

type BreathCircleProps = {
  /** Whether the breathing animation is active */
  isActive: boolean
  /** Callback when a breath cycle completes */
  onBreathComplete?: () => void
  /** Inhale duration in seconds */
  inhaleSeconds?: number
  /** Exhale duration in seconds */
  exhaleSeconds?: number
  /** Number of breath cycles to complete (0 = infinite) */
  cycles?: number
  /** Size of the circle in pixels */
  size?: number
}

const PHASE_LABELS: Record<BreathPhase, string> = {
  inhale: 'Breathe in',
  exhale: 'Breathe out',
  hold: 'Hold',
}

export const BreathCircle = ({
  isActive,
  onBreathComplete,
  inhaleSeconds = 6,
  exhaleSeconds = 8,
  cycles = 3,
  size = 200,
}: BreathCircleProps) => {
  const [phase, setPhase] = useState<BreathPhase>('inhale')
  const [cycleCount, setCycleCount] = useState(0)
  const [scale, setScale] = useState(0.7)

  const handlePhaseTransition = useCallback(() => {
    if (!isActive) return

    if (phase === 'inhale') {
      setPhase('exhale')
      setScale(0.7)
    } else {
      // Completed one full cycle
      const newCount = cycleCount + 1
      setCycleCount(newCount)

      if (cycles > 0 && newCount >= cycles) {
        onBreathComplete?.()
        return
      }

      setPhase('inhale')
      setScale(1)
    }
  }, [isActive, phase, cycleCount, cycles, onBreathComplete])

  useEffect(() => {
    if (!isActive) {
      setPhase('inhale')
      setCycleCount(0)
      setScale(0.7)
      return
    }

    // Start with inhale
    setScale(1)

    const duration = phase === 'inhale' ? inhaleSeconds : exhaleSeconds
    const timer = setTimeout(handlePhaseTransition, duration * 1000)

    return () => clearTimeout(timer)
  }, [isActive, phase, inhaleSeconds, exhaleSeconds, handlePhaseTransition])

  const transitionDuration = phase === 'inhale' ? inhaleSeconds : exhaleSeconds
  // Refined easing: gentle start, smooth middle, soft landing
  const transitionEasing = phase === 'inhale'
    ? 'cubic-bezier(0.4, 0, 0.2, 1)'  // Ease out for expanding
    : 'cubic-bezier(0.4, 0, 0.6, 1)'  // Slightly different for contracting

  return (
    <div
      className="flex flex-col items-center justify-center gap-8"
      role="timer"
      aria-label={`Breathing exercise: ${PHASE_LABELS[phase]}`}
      aria-live="polite"
    >
      {/* The breathing circle */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Outer glow ring - slowest, most atmospheric */}
        <div
          className="absolute inset-0 rounded-full bg-sage-200/20 blur-2xl"
          style={{
            transform: `scale(${scale * 1.3})`,
            opacity: scale * 0.6,
            transitionProperty: 'transform, opacity',
            transitionDuration: `${transitionDuration * 1.1}s`,
            transitionTimingFunction: transitionEasing,
          }}
        />

        {/* Middle glow ring */}
        <div
          className="absolute inset-0 rounded-full bg-sage-200/30 blur-xl"
          style={{
            transform: `scale(${scale * 1.15})`,
            opacity: scale * 0.8,
            transitionProperty: 'transform, opacity',
            transitionDuration: `${transitionDuration}s`,
            transitionTimingFunction: transitionEasing,
          }}
        />

        {/* Inner ring */}
        <div
          className="absolute rounded-full bg-sage-100/50"
          style={{
            width: size * 0.85,
            height: size * 0.85,
            transform: `scale(${scale * 1.05})`,
            transitionProperty: 'transform',
            transitionDuration: `${transitionDuration * 0.95}s`,
            transitionTimingFunction: transitionEasing,
          }}
        />

        {/* Core circle - the primary visual anchor */}
        <div
          className="relative rounded-full bg-gradient-to-br from-sage-200 to-sage-300
                     shadow-elevated"
          style={{
            width: size * 0.7,
            height: size * 0.7,
            transform: `scale(${scale})`,
            transitionProperty: 'transform',
            transitionDuration: `${transitionDuration}s`,
            transitionTimingFunction: transitionEasing,
          }}
        />
      </div>

      {/* Phase instruction - gentle, guiding text */}
      <div className="text-center">
        <p
          className="text-xl font-medium text-cloud-700 mb-2
                     transition-all duration-500 ease-gentle"
          style={{
            opacity: isActive ? 1 : 0.6,
          }}
        >
          {PHASE_LABELS[phase]}
        </p>
        {cycles > 0 && (
          <p className="text-sm text-cloud-400 transition-opacity duration-300">
            {cycleCount + 1} of {cycles}
          </p>
        )}
      </div>
    </div>
  )
}
