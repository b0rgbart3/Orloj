import { useCallback, useMemo } from 'react'
import { GradientClockLayer } from './GradientClockLayer'
import { trueLunarElongationDeg } from './lunarEphemeris'
import { MOON_GLYPH_BASELINE_RADIUS, MOON_GLYPH_LOCAL_Y, moonGlyphRadius } from './moonGlyphRadius'
import { moonPhaseBrightPathD } from './moonPhaseShape'
import { moonHandRotationDegrees } from './rotations'
import type { PragueTime } from './usePragueTime'
import { angleInRingFrame } from './zodiacHouses'

const MOON_GLYPH_SCALE = 1.1
const MOON_PHASE_RADIUS = 18.19

type MoonGlyphLayerProps = {
  src: string
  rotation?: number
  filter?: string
  pragueTime: PragueTime
  ringRotation: number
}

/**
 * The Moon glyph (the bicolor sphere), sliding radially to ride the zodiac
 * ring's eccentric circle like the Sun glyph (see SunGlyphLayer/
 * moonGlyphRadius.ts), and redrawing its own bright region every tick from
 * the real Sun-Moon elongation (see moonPhaseShape.ts) so it shows the
 * Moon's true current phase shape instead of a fixed half-and-half split.
 * Decoupled from the pointer-arm artwork (moon_dial.svg, a plain static
 * layer) for the same reason the Sun glyph is.
 */
export function MoonGlyphLayer({ src, rotation, filter, pragueTime, ringRotation }: MoonGlyphLayerProps) {
  const radius = useMemo(() => {
    const ringFrameAngle = angleInRingFrame(moonHandRotationDegrees(pragueTime), ringRotation)
    return moonGlyphRadius(ringFrameAngle)
  }, [pragueTime, ringRotation])

  const elongationDeg = useMemo(() => trueLunarElongationDeg(pragueTime.date), [pragueTime])

  const decorate = useCallback(
    (container: HTMLDivElement) => {
      const glyph = container.querySelector<SVGGElement>('#moon-glyph')
      if (glyph) {
        const radialOffset = radius - MOON_GLYPH_BASELINE_RADIUS
        glyph.setAttribute(
          'transform',
          `translate(0, ${radialOffset}) translate(600, ${MOON_GLYPH_LOCAL_Y}) scale(${MOON_GLYPH_SCALE}) translate(-600, ${-MOON_GLYPH_LOCAL_Y})`,
        )
      }
      const brightPath = container.querySelector<SVGPathElement>('#moon-phase-bright')
      if (brightPath) {
        brightPath.setAttribute('d', moonPhaseBrightPathD(600, MOON_GLYPH_LOCAL_Y, MOON_PHASE_RADIUS, elongationDeg))
      }
    },
    [radius, elongationDeg],
  )

  return <GradientClockLayer src={src} rotation={rotation} filter={filter} decorate={decorate} />
}
