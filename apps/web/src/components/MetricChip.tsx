'use client'

import { useMemo } from 'react'

type MetricChipProps = {
  /** Display label for the metric */
  label: string
  /** Score value (0-100) */
  value: number
  /** Whether to show the numeric value */
  showValue?: boolean
  /** Optional click handler */
  onClick?: () => void
}

export const MetricChip = ({
  label,
  value,
  showValue = true,
  onClick,
}: MetricChipProps) => {
  // Gentle indicator - no harsh colors
  const indicatorColor = useMemo(() => {
    if (value >= 80) return 'bg-sage-200 text-sage-800'
    if (value >= 60) return 'bg-sky-200 text-sky-800'
    if (value >= 40) return 'bg-cloud-200 text-cloud-700'
    return 'bg-cloud-100 text-cloud-600'
  }, [value])

  const isInteractive = Boolean(onClick)

  const handleClick = () => {
    onClick?.()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isInteractive && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick?.()
    }
  }

  return (
    <div
      role={isInteractive ? 'button' : 'status'}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      className={`metric-chip ${isInteractive ? 'cursor-pointer hover:bg-cloud-200' : ''}`}
      aria-label={`${label}: ${value}`}
    >
      {/* Small indicator dot */}
      <span
        className={`w-2 h-2 rounded-full ${indicatorColor}
                   transition-colors duration-300`}
        aria-hidden="true"
      />

      {/* Label */}
      <span className="text-sm font-medium">{label}</span>

      {/* Value - gentle, not prominent */}
      {showValue && (
        <span className="text-sm text-cloud-500">{value}</span>
      )}
    </div>
  )
}
