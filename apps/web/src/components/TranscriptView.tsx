'use client'

import { useMemo } from 'react'
import type { TranscriptSegment, Flag } from '@/types'

type TranscriptViewProps = {
  /** Transcript segments to display */
  segments: TranscriptSegment[]
  /** Flags for highlighting (fillers, pauses, etc.) */
  flags?: Flag[]
  /** Currently playing timestamp (for highlighting) */
  currentTime?: number
  /** Callback when a segment is clicked */
  onSegmentClick?: (startTime: number) => void
}

// Map flag reasons to gentle visual indicators
const FLAG_STYLES: Record<string, string> = {
  filler: 'bg-warmth-100 text-warmth-700',
  long_pause: 'text-cloud-400 italic',
  power_pause: 'bg-sage-50 text-sage-700',
  rush: 'text-warmth-600',
  mumble: 'text-cloud-400',
}

export const TranscriptView = ({
  segments,
  flags = [],
  currentTime,
  onSegmentClick,
}: TranscriptViewProps) => {
  // Build a map of flagged time ranges
  const flagMap = useMemo(() => {
    const map = new Map<number, Flag>()
    flags.forEach((flag) => {
      // Round to nearest 0.1s for matching
      const key = Math.round(flag.t_start * 10)
      map.set(key, flag)
    })
    return map
  }, [flags])

  const getFlagForWord = (start: number): Flag | undefined => {
    const key = Math.round(start * 10)
    // Check nearby timestamps
    for (let i = -2; i <= 2; i++) {
      const flag = flagMap.get(key + i)
      if (flag) return flag
    }
    return undefined
  }

  const isCurrentSegment = (start: number, end: number): boolean => {
    if (currentTime === undefined) return false
    return currentTime >= start && currentTime <= end
  }

  const handleSegmentClick = (startTime: number) => {
    onSegmentClick?.(startTime)
  }

  const handleKeyDown = (
    event: React.KeyboardEvent,
    startTime: number
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSegmentClick?.(startTime)
    }
  }

  if (segments.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-cloud-400">
        <p>No transcript available</p>
      </div>
    )
  }

  return (
    <div
      className="space-y-1 scrollbar-hide"
      role="log"
      aria-label="Transcript"
    >
      {segments.map((segment, index) => {
        const isCurrent = isCurrentSegment(segment.start, segment.end)
        const isInteractive = Boolean(onSegmentClick)

        return (
          <div
            key={`${segment.start}-${index}`}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            onClick={() => isInteractive && handleSegmentClick(segment.start)}
            onKeyDown={(e) =>
              isInteractive && handleKeyDown(e, segment.start)
            }
            className={`transcript-line ${isCurrent ? 'highlighted' : ''}
                       ${isInteractive ? 'cursor-pointer hover:bg-cloud-50' : ''}`}
            aria-current={isCurrent ? 'true' : undefined}
          >
            <p className="text-cloud-700 leading-relaxed">
              {segment.words.map((word, wordIndex) => {
                const flag = getFlagForWord(word.start)
                const flagStyle = flag ? FLAG_STYLES[flag.reason] || '' : ''

                // Add space before word (except first)
                const prefix = wordIndex > 0 ? ' ' : ''

                // Check if this is a filler word
                const isFiller =
                  flag?.reason === 'filler' ||
                  ['um', 'uh', 'like', 'you know', 'basically'].includes(
                    word.word.toLowerCase()
                  )

                return (
                  <span
                    key={`${word.start}-${wordIndex}`}
                    className={`transition-colors duration-200 ${flagStyle}
                               ${isFiller ? 'px-1 rounded' : ''}`}
                  >
                    {prefix}
                    {word.word}
                  </span>
                )
              })}
            </p>

            {/* Timestamp - very subtle */}
            <p className="text-xs text-cloud-300 mt-1">
              {formatTime(segment.start)}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
