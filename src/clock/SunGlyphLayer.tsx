import { useCallback, useMemo } from 'react'
import { GradientClockLayer } from './GradientClockLayer'
import { sunHandRotationDegrees } from './rotations'
import { SUN_GLYPH_BASELINE_RADIUS, SUN_GLYPH_LOCAL_Y, sunGlyphRadius } from './sunGlyphRadius'
import type { PragueTime } from './usePragueTime'
import { angleInRingFrame } from './zodiacHouses'

const SUN_GLYPH_SCALE = 1.1

type SunGlyphLayerProps = {
  src: string
  rotation?: number
  filter?: string
  pragueTime: PragueTime
  ringRotation: number
}

/**
 * The Sun glyph (disc + corona), sliding radially to ride the zodiac ring's
 * eccentric circle over the year, instead of sitting at the artwork's fixed
 * baked-in radius. See sunGlyphRadius.ts. Decoupled from the pointer-arm
 * artwork (sun_dial.svg, a plain static layer) so the glyph's own screen
 * position is independently addressable -- e.g. for checking it against the
 * background horizon plate.
 */
export function SunGlyphLayer({ src, rotation, filter, pragueTime, ringRotation }: SunGlyphLayerProps) {
  const radius = useMemo(() => {
    const ringFrameAngle = angleInRingFrame(sunHandRotationDegrees(pragueTime), ringRotation)
    return sunGlyphRadius(ringFrameAngle)
  }, [pragueTime, ringRotation])

  const decorate = useCallback(
    (container: HTMLDivElement) => {
      const glyph = container.querySelector<SVGGElement>('#sun-glyph')
      if (!glyph) return
      const radialOffset = radius - SUN_GLYPH_BASELINE_RADIUS
      glyph.setAttribute(
        'transform',
        `translate(0, ${radialOffset}) translate(600, ${SUN_GLYPH_LOCAL_Y}) scale(${SUN_GLYPH_SCALE}) translate(-600, ${-SUN_GLYPH_LOCAL_Y})`,
      )
    },
    [radius],
  )

  return <GradientClockLayer src={src} rotation={rotation} filter={filter} decorate={decorate} />
}
