import { normalizeDegrees } from './astroMath'

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Distance from the shared hand pivot (600,600) to where a glyph riding the
 * zodiac ring's own eccentric circle should sit, given the glyph's angle
 * expressed in the ring's own unrotated frame (see
 * `zodiacHouses.angleInRingFrame`).
 *
 * In the real Orloj the Sun and Moon icons each ride a peg constrained to
 * the (rotating) eccentric zodiac ring, so their distance from the pivot
 * slides in and out as their angle sweeps around. The pivot sits inside the
 * ring's circle, so a ray from the pivot at any angle crosses the circle
 * boundary exactly once going outward -- solving
 * |pivot + r*direction - ringCenter| = ringRadius for r (the positive root
 * of the resulting quadratic) gives that crossing distance directly.
 * Because rotation about the shared pivot preserves distance from it, this
 * radius -- computed entirely in the ring's own unrotated frame -- is
 * exactly the radius to use for the glyph at its actual (rotated) on-screen
 * angle too.
 */
export function eccentricRingRadius(
  ringFrameAngleDeg: number,
  ringCenter: { x: number; y: number },
  ringRadius: number,
): number {
  const theta = degToRad(normalizeDegrees(ringFrameAngleDeg))
  // Direction of a ray from the pivot at this ring-frame angle, using the
  // ring's own "up = 0°, clockwise" baseline convention (see
  // ZODIAC_HOUSES' angle comments in zodiacHouses.ts).
  const dirX = Math.sin(theta)
  const dirY = -Math.cos(theta)

  const vx = 600 - ringCenter.x
  const vy = 600 - ringCenter.y
  const vDotD = vx * dirX + vy * dirY
  const vLengthSq = vx * vx + vy * vy

  return -vDotD + Math.sqrt(vDotD * vDotD + (ringRadius ** 2 - vLengthSq))
}
