import { eccentricRingRadius } from './eccentricRingRadius'

// The zodiac ring's own decorative outer border, measured directly from
// zodiac_ring_separated.svg (the two concentric bezier-circle boundaries at
// the top of the file): center (714.12, 600.06), outer radius 273.64, inner
// radius ~265.4. Real astrolabe eccentricity, same one the README describes
// for the ring artwork -- the shared hand pivot (600,600) sits well inside
// this circle, ~114 units from its center.
const ZODIAC_RING_CENTER = { x: 714.12, y: 600.06 }
const ZODIAC_RING_RADIUS = 269.5

// sun_dial.svg's sun glyph (`#sun-glyph`, disc + rays) is drawn at a fixed
// cx=600, cy=786.92 in its own unrotated frame -- i.e. 186.92 units straight
// "down" (the Sun arm's own 0° baseline) from the shared pivot.
export const SUN_GLYPH_LOCAL_Y = 786.92
export const SUN_GLYPH_BASELINE_RADIUS = SUN_GLYPH_LOCAL_Y - 600

/**
 * Distance from the shared pivot (600,600) to where the sun glyph should
 * sit, riding the zodiac ring's own eccentric circle -- given the sun
 * hand's angle expressed in the ring's own unrotated frame (see
 * `zodiacHouses.angleInRingFrame`). See eccentricRingRadius.ts for the
 * geometry (shared with the Moon glyph -- same ring, same pivot, only the
 * glyph's own baseline differs).
 */
export function sunGlyphRadius(ringFrameAngleDeg: number): number {
  return eccentricRingRadius(ringFrameAngleDeg, ZODIAC_RING_CENTER, ZODIAC_RING_RADIUS)
}
