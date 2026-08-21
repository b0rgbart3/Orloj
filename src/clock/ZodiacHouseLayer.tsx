import { useCallback, useMemo } from 'react'
import { GradientClockLayer } from './GradientClockLayer'
import type { PragueTime } from './usePragueTime'
import { activeHouseHighlights, applyZodiacHighlights } from './zodiacHouses'

type ZodiacHouseLayerProps = {
  src: string
  gradientId: string
  rotation?: number
  filter?: string
  pragueTime: PragueTime
  ringRotation: number
}

/**
 * The zodiac-ring layer, plus per-house highlight coloring showing which
 * sign each hand (Sun/Moon/Star) currently sits over. Wraps
 * GradientClockLayer rather than duplicating its fetch/inline-SVG plumbing —
 * the highlight fills are applied via the same `decorate` hook that runs
 * inside its existing gradient-counter-rotation layout effect, so both land
 * in the same paint.
 */
export function ZodiacHouseLayer({ src, gradientId, rotation, filter, pragueTime, ringRotation }: ZodiacHouseLayerProps) {
  const highlights = useMemo(() => activeHouseHighlights(pragueTime, ringRotation), [pragueTime, ringRotation])

  const decorate = useCallback((container: HTMLDivElement) => applyZodiacHighlights(container, highlights), [highlights])

  return <GradientClockLayer src={src} gradientId={gradientId} rotation={rotation} filter={filter} decorate={decorate} />
}
