'use client'

import { ReactNode } from 'react'

type OnboardingSlideProps = {
  /** Main heading text */
  title: string
  /** Descriptive text below the title */
  description: string
  /** Optional visual element (icon, animation, etc.) */
  visual?: ReactNode
  /** Whether this slide is currently visible */
  isActive: boolean
}

/**
 * A single slide in the onboarding flow
 * Gentle fade/slide animation when transitioning between slides
 */
export function OnboardingSlide({
  title,
  description,
  visual,
  isActive,
}: OnboardingSlideProps) {
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center px-8
                  transition-all duration-600 ease-gentle
                  ${isActive
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      aria-hidden={!isActive}
    >
      {/* Visual element */}
      {visual && (
        <div className="mb-12">
          {visual}
        </div>
      )}

      {/* Text content */}
      <div className="text-center max-w-sm">
        <h1 className="text-2xl font-medium text-cloud-800 mb-4">
          {title}
        </h1>
        <p className="text-cloud-500 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}

/**
 * Dot indicator for current slide position
 */
type SlideIndicatorProps = {
  total: number
  current: number
  onSelect?: (index: number) => void
}

export function SlideIndicator({ total, current, onSelect }: SlideIndicatorProps) {
  return (
    <div className="flex items-center gap-2" role="tablist" aria-label="Onboarding progress">
      {Array.from({ length: total }, (_, index) => (
        <button
          key={index}
          type="button"
          role="tab"
          aria-selected={current === index}
          aria-label={`Go to slide ${index + 1}`}
          onClick={() => onSelect?.(index)}
          className={`w-2 h-2 rounded-full transition-all duration-400 ease-gentle
                     ${current === index
              ? 'bg-sage-400 w-6'
              : 'bg-cloud-200 hover:bg-cloud-300'
            }`}
        />
      ))}
    </div>
  )
}

/**
 * Breathing visual for the welcome slide
 * A simplified version of BreathCircle for passive display
 */
export function BreathingVisual() {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full bg-sage-200/30 blur-xl
                   animate-pulse-soft"
      />

      {/* Middle ring */}
      <div
        className="absolute w-32 h-32 rounded-full bg-sage-100/50
                   animate-pulse-soft"
        style={{ animationDelay: '0.5s' }}
      />

      {/* Core circle */}
      <div
        className="relative w-24 h-24 rounded-full bg-gradient-to-br from-sage-200 to-sage-300
                   shadow-elevated animate-pulse-soft"
        style={{ animationDelay: '1s' }}
      />
    </div>
  )
}

/**
 * Microphone icon for the permission slide
 */
export function MicrophoneVisual({ hasPermission }: { hasPermission?: boolean }) {
  return (
    <div className={`w-24 h-24 rounded-full flex items-center justify-center
                    transition-colors duration-400 ease-gentle
                    ${hasPermission ? 'bg-sage-100' : 'bg-cloud-100'}`}>
      <svg
        className={`w-10 h-10 transition-colors duration-400 ease-gentle
                   ${hasPermission ? 'text-sage-600' : 'text-cloud-500'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
        />
      </svg>
    </div>
  )
}

/**
 * Flow diagram for the "how it works" slide
 */
export function HowItWorksVisual() {
  return (
    <div className="flex items-center gap-4">
      {/* Breathe step */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-sage-300" />
        </div>
        <span className="text-xs text-cloud-500">Breathe</span>
      </div>

      {/* Arrow */}
      <svg className="w-6 h-6 text-cloud-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>

      {/* Speak step */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-full bg-cloud-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-cloud-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        </div>
        <span className="text-xs text-cloud-500">Speak</span>
      </div>

      {/* Arrow */}
      <svg className="w-6 h-6 text-cloud-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>

      {/* Grow step */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-sage-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
        </div>
        <span className="text-xs text-cloud-500">Grow</span>
      </div>
    </div>
  )
}

/**
 * Ready visual - checkmark/success indicator
 */
export function ReadyVisual() {
  return (
    <div className="w-24 h-24 rounded-full bg-sage-100 flex items-center justify-center
                    animate-fade-in">
      <svg
        className="w-12 h-12 text-sage-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
  )
}
