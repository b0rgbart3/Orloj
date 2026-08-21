import { normalizeDegrees } from './rotations'

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

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Distance from the shared pivot (600,600) to where the sun glyph should
 * sit, riding the zodiac ring's own eccentric circle -- given the sun
 * hand's angle expressed in the ring's own unrotated frame (see
 * `zodiacHouses.angleInRingFrame`).
 *
 * In the real Orloj the Sun icon rides a peg constrained to the (rotating)
 * eccentric zodiac ring, so its distance from the pivot slides in and out
 * over the year even though its angle is driven by time of day. The pivot
 * sits inside the ring's circle, so a ray from the pivot at any angle
 * crosses the circle boundary exactly once going outward -- solving
 * |pivot + r*direction - ringCenter| = ringRadius for r (the positive root
 * of the resulting quadratic) gives that crossing distance directly.
 * Because rotation about the shared pivot preserves distance from it, this
 * radius -- computed entirely in the ring's own unrotated frame -- is
 * exactly the radius to use for the glyph at the sun hand's actual
 * (rotated) on-screen angle too.
 */
export function sunGlyphRadius(ringFrameAngleDeg: number): number {
  const theta = degToRad(normalizeDegrees(ringFrameAngleDeg))
  // Direction of a ray from the pivot at this ring-frame angle, using the
  // ring's own "up = 0°, clockwise" baseline convention (see
  // ZODIAC_HOUSES' angle comments in zodiacHouses.ts).
  const dirX = Math.sin(theta)
  const dirY = -Math.cos(theta)

  const vx = 600 - ZODIAC_RING_CENTER.x
  const vy = 600 - ZODIAC_RING_CENTER.y
  const vDotD = vx * dirX + vy * dirY
  const vLengthSq = vx * vx + vy * vy

  return -vDotD + Math.sqrt(vDotD * vDotD + (ZODIAC_RING_RADIUS ** 2 - vLengthSq))
}
