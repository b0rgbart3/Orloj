import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { GradientClockLayer } from './GradientClockLayer'
import { zodiacName, zodiacSymbol } from './explainClock'
import type { PragueTime } from './usePragueTime'
import { activeHouseHighlights, applyZodiacHighlights, zodiacSignFromWedgeId, type ZodiacSign } from './zodiacHouses'
import './ZodiacHouseLayer.css'

type ZodiacHouseLayerProps = {
  src: string
  gradientId: string
  rotation?: number
  filter?: string
  pragueTime: PragueTime
  ringRotation: number
}

type TooltipState = {
  sign: ZodiacSign
  /** Position as a percentage of the layer's own box, so it stays put under the click regardless of the clock's responsive size. */
  xPct: number
  yPct: number
}

/**
 * The zodiac-ring layer, plus per-house highlight coloring showing which
 * sign each hand (Sun/Moon/Star) currently sits over. Wraps
 * GradientClockLayer rather than duplicating its fetch/inline-SVG plumbing —
 * the highlight fills are applied via the same `decorate` hook that runs
 * inside its existing gradient-counter-rotation layout effect, so both land
 * in the same paint.
 *
 * Also makes the ring clickable: tapping a wedge shows which sign it is.
 */
export function ZodiacHouseLayer({ src, gradientId, rotation, filter, pragueTime, ringRotation }: ZodiacHouseLayerProps) {
  const highlights = useMemo(() => activeHouseHighlights(pragueTime, ringRotation), [pragueTime, ringRotation])

  const decorate = useCallback((container: HTMLDivElement) => applyZodiacHighlights(container, highlights), [highlights])

  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    const wedgeEl = (event.target as Element).closest('[id^="zodiac-wedge-"]')
    const sign = wedgeEl && zodiacSignFromWedgeId(wedgeEl.id)
    if (!sign) return
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltip({
      sign,
      xPct: ((event.clientX - rect.left) / rect.width) * 100,
      yPct: ((event.clientY - rect.top) / rect.height) * 100,
    })
  }, [])

  useEffect(() => {
    if (!tooltip) return
    const handleClickOutside = (event: MouseEvent) => {
      if (!tooltipRef.current?.contains(event.target as Node)) setTooltip(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [tooltip])

  return (
    <>
      <GradientClockLayer
        src={src}
        gradientId={gradientId}
        rotation={rotation}
        filter={filter}
        decorate={decorate}
        onClick={handleClick}
      />
      {tooltip && (
        <div
          ref={tooltipRef}
          className="zodiac-sign-tooltip"
          style={{ left: `${tooltip.xPct}%`, top: `${tooltip.yPct}%` }}
        >
          {zodiacName(tooltip.sign)} <span className="zodiac-symbol">{zodiacSymbol(tooltip.sign)}</span>
        </div>
      )}
    </>
  )
}
