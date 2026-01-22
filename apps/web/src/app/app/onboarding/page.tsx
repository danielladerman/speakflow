'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  OnboardingSlide,
  SlideIndicator,
  BreathingVisual,
  HowItWorksVisual,
  MicrophoneVisual,
  ReadyVisual,
} from '@/components/OnboardingSlide'
import { useOnboardingComplete } from '@/lib/hooks/useOnboardingComplete'

type SlideId = 'welcome' | 'how-it-works' | 'microphone' | 'ready'

const SLIDES: SlideId[] = ['welcome', 'how-it-works', 'microphone', 'ready']

export default function OnboardingPage() {
  const router = useRouter()
  const { completeOnboarding } = useOnboardingComplete()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt')

  // Check existing microphone permission on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
        setMicPermission(result.state as 'prompt' | 'granted' | 'denied')
      }).catch(() => {
        // Permissions API not supported, assume prompt
        setMicPermission('prompt')
      })
    }
  }, [])

  const handleNext = useCallback(() => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1)
    }
  }, [currentSlide])

  const handleBack = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1)
    }
  }, [currentSlide])

  const handleRequestMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach((track) => track.stop())
      setMicPermission('granted')
      // Auto-advance after permission granted
      setTimeout(() => {
        setCurrentSlide(SLIDES.indexOf('ready'))
      }, 500)
    } catch (err) {
      setMicPermission('denied')
    }
  }, [])

  const handleComplete = useCallback(() => {
    completeOnboarding()
    router.push('/app/daily')
  }, [completeOnboarding, router])

  const handleSkip = useCallback(() => {
    completeOnboarding()
    router.push('/app')
  }, [completeOnboarding, router])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault()
        if (currentSlide === SLIDES.indexOf('microphone') && micPermission !== 'granted') {
          handleRequestMicrophone()
        } else if (currentSlide === SLIDES.length - 1) {
          handleComplete()
        } else {
          handleNext()
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        handleBack()
      } else if (event.key === 'Escape') {
        handleSkip()
      }
    },
    [currentSlide, micPermission, handleNext, handleBack, handleRequestMicrophone, handleComplete, handleSkip]
  )

  const currentSlideId = SLIDES[currentSlide]

  return (
    <main
      className="flex-1 flex flex-col min-h-screen bg-cloud-50"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Skip button - always available */}
      <header className="flex justify-end px-6 py-4">
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-cloud-400 hover:text-cloud-600
                     transition-colors duration-200"
        >
          Skip
        </button>
      </header>

      {/* Slides container */}
      <div className="flex-1 relative">
        {/* Welcome slide */}
        <OnboardingSlide
          title="Find your voice"
          description="SpeakFlow helps you speak with clarity and confidence through gentle daily practice."
          visual={<BreathingVisual />}
          isActive={currentSlideId === 'welcome'}
        />

        {/* How it works slide */}
        <OnboardingSlide
          title="Simple daily practice"
          description="3 calming breaths. 1 focused drill. Gentle insights to help you grow."
          visual={<HowItWorksVisual />}
          isActive={currentSlideId === 'how-it-works'}
        />

        {/* Microphone permission slide */}
        <OnboardingSlide
          title="Your voice, your space"
          description={
            micPermission === 'granted'
              ? "Perfect. Your microphone is ready."
              : micPermission === 'denied'
              ? "No worries. You can enable microphone access in your browser settings."
              : "We'll need access to your microphone to hear you practice. Your audio stays private."
          }
          visual={<MicrophoneVisual hasPermission={micPermission === 'granted'} />}
          isActive={currentSlideId === 'microphone'}
        />

        {/* Ready slide */}
        <OnboardingSlide
          title="You're ready"
          description="Let's start with your first Daily 5 practice session."
          visual={<ReadyVisual />}
          isActive={currentSlideId === 'ready'}
        />
      </div>

      {/* Navigation */}
      <footer className="px-6 py-8 flex flex-col items-center gap-6">
        {/* Slide indicator */}
        <SlideIndicator
          total={SLIDES.length}
          current={currentSlide}
          onSelect={setCurrentSlide}
        />

        {/* Action buttons */}
        <div className="w-full max-w-sm">
          {currentSlideId === 'microphone' && micPermission !== 'granted' ? (
            <button
              type="button"
              onClick={handleRequestMicrophone}
              className="w-full py-4 px-6 bg-sage-500 text-white
                         rounded-xl font-medium text-lg
                         transition-all duration-300 ease-gentle
                         hover:bg-sage-600 active:scale-[0.98]"
            >
              {micPermission === 'denied' ? 'Continue anyway' : 'Enable microphone'}
            </button>
          ) : currentSlideId === 'ready' ? (
            <button
              type="button"
              onClick={handleComplete}
              className="w-full py-4 px-6 bg-sage-500 text-white
                         rounded-xl font-medium text-lg
                         transition-all duration-300 ease-gentle
                         hover:bg-sage-600 active:scale-[0.98]"
            >
              Begin your practice
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-4 px-6 bg-sage-500 text-white
                         rounded-xl font-medium text-lg
                         transition-all duration-300 ease-gentle
                         hover:bg-sage-600 active:scale-[0.98]"
            >
              Continue
            </button>
          )}

          {/* Back button (for non-first slides) */}
          {currentSlide > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="w-full mt-3 py-3 px-6 text-cloud-500
                         rounded-xl font-medium
                         transition-colors duration-200
                         hover:text-cloud-700"
            >
              Back
            </button>
          )}
        </div>
      </footer>
    </main>
  )
}
