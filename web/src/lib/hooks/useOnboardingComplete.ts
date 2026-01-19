'use client'

import { useState, useEffect, useCallback } from 'react'

const ONBOARDING_KEY = 'speakflow_onboarding_complete'

/**
 * Hook to track and manage onboarding completion state
 * Uses localStorage to persist across sessions
 */
export function useOnboardingComplete() {
  const [isComplete, setIsComplete] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(ONBOARDING_KEY)
    setIsComplete(stored === 'true')
    setIsLoading(false)
  }, [])

  // Mark onboarding as complete
  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setIsComplete(true)
  }, [])

  // Reset onboarding (for testing/debugging)
  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_KEY)
    setIsComplete(false)
  }, [])

  return {
    isComplete,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  }
}
