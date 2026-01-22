'use client'

import { useState, useCallback } from 'react'

type RecordButtonProps = {
  /** Whether currently recording */
  isRecording: boolean
  /** Called when recording starts */
  onStart: () => void
  /** Called when recording stops */
  onStop: () => void
  /** Whether the button is disabled */
  disabled?: boolean
  /** Size of the button in pixels */
  size?: number
}

export const RecordButton = ({
  isRecording,
  onStart,
  onStop,
  disabled = false,
  size = 80,
}: RecordButtonProps) => {
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = useCallback(() => {
    if (disabled) return

    if (isRecording) {
      onStop()
    } else {
      onStart()
    }
  }, [disabled, isRecording, onStart, onStop])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleClick()
      }
    },
    [handleClick]
  )

  const handlePointerDown = useCallback(() => {
    if (!disabled) setIsPressed(true)
  }, [disabled])

  const handlePointerUp = useCallback(() => {
    setIsPressed(false)
  }, [])

  const innerSize = isRecording ? size * 0.35 : size * 0.7
  const borderRadius = isRecording ? '20%' : '50%'

  return (
    <div className="flex flex-col items-center gap-4">
      {/* The button */}
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        disabled={disabled}
        className="relative flex items-center justify-center
                   transition-transform duration-300 ease-gentle
                   focus-visible:ring-2 focus-visible:ring-sage-300 focus-visible:ring-offset-4
                   disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          width: size,
          height: size,
          transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        }}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        aria-pressed={isRecording}
        tabIndex={0}
      >
        {/* Outer ring - pulses when recording */}
        <div
          className={`absolute inset-0 rounded-full border-2 border-cloud-300
                      transition-all duration-400 ease-gentle
                      ${isRecording ? 'animate-pulse-soft border-sage-300' : ''}`}
        />

        {/* Background circle */}
        <div
          className="absolute inset-2 rounded-full bg-cloud-100
                     transition-colors duration-300 ease-gentle"
        />

        {/* Inner shape - circle when idle, rounded square when recording */}
        <div
          className={`relative transition-all duration-400 ease-gentle
                      ${isRecording ? 'bg-sage-500' : 'bg-sage-400'}`}
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius,
          }}
        />
      </button>

      {/* Hint text - subtle, not demanding attention */}
      <p className="text-sm text-cloud-400 transition-opacity duration-300">
        {isRecording ? 'Tap to finish' : 'Tap to begin'}
      </p>
    </div>
  )
}
