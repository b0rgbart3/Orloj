import { eccentricRingRadius } from './eccentricRingRadius'

// Same ring as the Sun glyph rides (see sunGlyphRadius.ts) -- one physical
// zodiac ring, shared pivot.
const ZODIAC_RING_CENTER = { x: 714.12, y: 600.06 }
const ZODIAC_RING_RADIUS = 269.5

// moon_glyph.svg's ball is drawn at a fixed cx=600, cy=881.29 in its own
// unrotated frame -- i.e. 281.29 units straight "down" (the Moon arm's own
// 0° baseline) from the shared pivot.
export const MOON_GLYPH_LOCAL_Y = 881.29
export const MOON_GLYPH_BASELINE_RADIUS = MOON_GLYPH_LOCAL_Y - 600

/**
 * Distance from the shared pivot (600,600) to where the moon glyph should
 * sit, riding the zodiac ring's own eccentric circle -- given the moon
 * hand's angle expressed in the ring's own unrotated frame (see
 * `zodiacHouses.angleInRingFrame`). See eccentricRingRadius.ts for the
 * geometry, shared with the Sun glyph.
 */
export function moonGlyphRadius(ringFrameAngleDeg: number): number {
  return eccentricRingRadius(ringFrameAngleDeg, ZODIAC_RING_CENTER, ZODIAC_RING_RADIUS)
}
