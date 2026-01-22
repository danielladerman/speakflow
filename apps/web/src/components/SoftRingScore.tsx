'use client'

import { useMemo } from 'react'

type SoftRingScoreProps = {
  /** Score value from 0 to 100 */
  score: number
  /** Size of the component in pixels */
  size?: number
  /** Stroke width of the ring */
  strokeWidth?: number
  /** Whether to show the score number (hidden during recording) */
  showScore?: boolean
  /** Optional label to show below the score */
  label?: string
}

export const SoftRingScore = ({
  score,
  size = 120,
  strokeWidth = 8,
  showScore = true,
  label,
}: SoftRingScoreProps) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const normalizedScore = Math.min(100, Math.max(0, score))
  const offset = circumference - (normalizedScore / 100) * circumference

  // Gentle color based on score - no harsh reds
  const strokeColor = useMemo(() => {
    if (normalizedScore >= 80) return '#8fb68f' // sage-400
    if (normalizedScore >= 60) return '#b5cfb5' // sage-300
    if (normalizedScore >= 40) return '#e2c092' // warmth-400
    return '#d3d9e0' // cloud-300
  }, [normalizedScore])

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="meter"
      aria-valuenow={normalizedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Score: ${normalizedScore}`}
    >
      {/* SVG Ring */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        aria-hidden="true"
      >
        {/* Background ring - very subtle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e9ecf0"
          strokeWidth={strokeWidth}
        />

        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-800 ease-gentle"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showScore && (
          <span
            className="text-2xl font-medium text-cloud-700
                       transition-opacity duration-300"
            style={{ fontSize: size * 0.25 }}
          >
            {normalizedScore}
          </span>
        )}
        {label && (
          <span
            className="text-xs text-cloud-500 mt-0.5"
            style={{ fontSize: size * 0.1 }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
