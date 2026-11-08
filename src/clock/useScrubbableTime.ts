import { useEffect, useRef, useState } from 'react'
import { getPragueTime } from './usePragueTime'

const THREE_MONTHS_MS = 3 * 30.4375 * 24 * 60 * 60 * 1000

export const PLAYBACK_SPEEDS = [1, 2, 3, 6, 12, 24, 48] as const
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Single source of truth for "what time is it on the clock". Effective time
 * is real wall-clock time plus a user-controlled offset. Normally the offset
 * is fixed and the clock keeps ticking forward in real seconds; while
 * playing, the offset itself is animated forward at an accelerated rate
 * (`speedHoursPerSecond` simulated hours per real second) via
 * requestAnimationFrame, until it reaches the edge of the allowed range.
 */
export function useScrubbableTime() {
  const [offsetMs, setOffsetMsState] = useState(0)
  const [realNow, setRealNow] = useState(() => new Date())
  const [isPlaying, setIsPlaying] = useState(false)
  const [speedHoursPerSecond, setSpeedHoursPerSecond] = useState<PlaybackSpeed>(1)

  const minOffsetMs = -THREE_MONTHS_MS
  const maxOffsetMs = THREE_MONTHS_MS

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

  const effectiveDate = new Date(realNow.getTime() + offsetMs)
  const pragueTime = getPragueTime(effectiveDate)

  function setOffsetMs(next: number) {
    setIsPlaying(false)
    setOffsetMsState(clamp(next, minOffsetMs, maxOffsetMs))
  }

  function setExactDate(date: Date) {
    setOffsetMs(date.getTime() - Date.now())
  }

  function resetToNow() {
    setIsPlaying(false)
    setOffsetMsState(0)
  }

  function togglePlay() {
    setIsPlaying((prev) => !prev)
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
    setSpeedHoursPerSecond,
  }
}
