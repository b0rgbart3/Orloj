import { useEffect, useRef, useState } from 'react'
import { getPragueTime } from './usePragueTime'

const MONTH_MS = 30.4375 * 24 * 60 * 60 * 1000
const INCEPTION_DATE = new Date('1410-10-09T00:00:00Z')

export const PLAYBACK_SPEEDS = [1, 2, 3, 6, 12, 24, 48] as const
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number]

export const RANGE_OPTIONS = [6, 12, 36, 48, 'inception'] as const
export type RangeOption = (typeof RANGE_OPTIONS)[number]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Single source of truth for "what time is it on the clock". Effective time
 * is an anchor date plus a user-controlled offset. The anchor is normally
 * real wall-clock time (so the clock keeps ticking forward in real
 * seconds), but becomes a fixed custom date once the user enters one via
 * the date/time modal, and is always the midpoint of the clock's full
 * history while the "since inception" range is selected. While playing,
 * the offset itself is animated forward at an accelerated rate
 * (`speedHoursPerSecond` simulated hours per real second) via
 * requestAnimationFrame, until it reaches the edge of the allowed range.
 */
export function useScrubbableTime() {
  const [offsetMs, setOffsetMsState] = useState(0)
  const [realNow, setRealNow] = useState(() => new Date())
  const [isPlaying, setIsPlaying] = useState(false)
  const [speedHoursPerSecond, setSpeedHoursPerSecond] = useState<PlaybackSpeed>(1)
  const [rangeOption, setRangeOptionState] = useState<RangeOption>(6)
  const [customAnchor, setCustomAnchor] = useState<Date | null>(null)
  const [lastWindowedRange, setLastWindowedRange] = useState<Exclude<RangeOption, 'inception'>>(6)

  const isInception = rangeOption === 'inception'
  const anchorDate = isInception
    ? new Date((INCEPTION_DATE.getTime() + realNow.getTime()) / 2)
    : customAnchor ?? realNow
  const halfRangeMs = isInception
    ? (realNow.getTime() - INCEPTION_DATE.getTime()) / 2
    : (rangeOption / 2) * MONTH_MS

  const minOffsetMs = -halfRangeMs
  const maxOffsetMs = halfRangeMs

  const offsetMsRef = useRef(offsetMs)
  offsetMsRef.current = offsetMs

  useEffect(() => {
    const id = setInterval(() => setRealNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!isPlaying) return

    const startReal = performance.now()
    const startOffset = offsetMsRef.current
    let frameId: number

    const tick = () => {
      const elapsedRealMs = performance.now() - startReal
      // simulated hours passed = speed * (elapsedRealMs / 1000) real seconds,
      // converted to ms by multiplying by 3600 * 1000 / 1000 = 3600.
      const elapsedSimMs = speedHoursPerSecond * elapsedRealMs * 3600
      const nextOffset = startOffset + elapsedSimMs

      if (nextOffset >= maxOffsetMs) {
        setOffsetMsState(maxOffsetMs)
        setIsPlaying(false)
        return
      }

      setOffsetMsState(nextOffset)
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying, speedHoursPerSecond, maxOffsetMs])

  const effectiveDate = new Date(anchorDate.getTime() + offsetMs)
  const pragueTime = getPragueTime(effectiveDate)
  const minDate = new Date(anchorDate.getTime() + minOffsetMs)
  const maxDate = new Date(anchorDate.getTime() + maxOffsetMs)

  function setOffsetMs(next: number) {
    setIsPlaying(false)
    setOffsetMsState(clamp(next, minOffsetMs, maxOffsetMs))
  }

  function setExactDate(date: Date) {
    setIsPlaying(false)
    setCustomAnchor(date)
    setOffsetMsState(0)
    if (isInception) {
      setRangeOptionState(lastWindowedRange)
    }
  }

  function resetToNow() {
    setIsPlaying(false)
    setCustomAnchor(null)
    setOffsetMsState(0)
  }

  function togglePlay() {
    setIsPlaying((prev) => !prev)
  }

  function setSpeed(speed: PlaybackSpeed) {
    setSpeedHoursPerSecond(speed)
    setIsPlaying(true)
  }

  function setRangeOption(next: RangeOption) {
    setIsPlaying(false)
    setRangeOptionState(next)
    setOffsetMsState(0)
    if (next !== 'inception') {
      setLastWindowedRange(next)
    }
  }

  return {
    pragueTime,
    offsetMs,
    setOffsetMs,
    setExactDate,
    resetToNow,
    minOffsetMs,
    maxOffsetMs,
    isPlaying,
    togglePlay,
    speedHoursPerSecond,
    setSpeedHoursPerSecond: setSpeed,
    rangeOption,
    setRangeOption,
    customAnchor,
    anchorDate,
    minDate,
    maxDate,
  }
}
