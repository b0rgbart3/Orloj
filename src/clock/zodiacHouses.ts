import { moonHandRotationDegrees, normalizeDegrees, sunHandRotationDegrees } from './rotations'
import type { PragueTime } from './usePragueTime'

export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces'

type ZodiacHouse = {
  sign: ZodiacSign
  /** [startDeg, endDeg) clockwise from the ring artwork's own unrotated "up"
   * (0°), measured from the shared hand pivot (600,600). */
  startDeg: number
  endDeg: number
}

// Measured directly from zodiac_ring_separated.svg: each wedge's true area
// centroid (via proper SVG path parsing, not the ring's own eccentric
// center — the wedges are angularly bucketed from the shared hand pivot
// (600,600), confirmed by fitting their radial cut-edges), then the sign
// for each was read off a rendered overlay marking each centroid angle
// against the zodiac glyphs. Order runs *against* standard zodiac order
// (Virgo, Leo, Cancer, ... instead of Aries, Taurus, Gemini, ...) — a
// mirrored convention that's normal for this kind of sky projection, since
// the dial represents looking up at the sky rather than down at a map.
export const ZODIAC_HOUSES: ZodiacHouse[] = [
  { sign: 'virgo', startDeg: 359.835, endDeg: 29.885 },
  { sign: 'leo', startDeg: 29.885, endDeg: 58.64 },
  { sign: 'cancer', startDeg: 58.64, endDeg: 88.31 },
  { sign: 'gemini', startDeg: 88.31, endDeg: 116.515 },
  { sign: 'taurus', startDeg: 116.515, endDeg: 145.285 },
  { sign: 'aries', startDeg: 145.285, endDeg: 174.905 },
  { sign: 'pisces', startDeg: 174.905, endDeg: 203.43 },
  { sign: 'aquarius', startDeg: 203.43, endDeg: 234.08 },
  { sign: 'capricorn', startDeg: 234.08, endDeg: 266.0 },
  { sign: 'sagittarius', startDeg: 266.0, endDeg: 297.105 },
  { sign: 'scorpio', startDeg: 297.105, endDeg: 327.54 },
  { sign: 'libra', startDeg: 327.54, endDeg: 359.835 },
]

/** Which house contains the given angle (handles the house that wraps past 360°/0°). */
export function houseAt(angleDeg: number): ZodiacHouse {
  const a = normalizeDegrees(angleDeg)
  const house = ZODIAC_HOUSES.find((h) =>
    h.startDeg < h.endDeg ? a >= h.startDeg && a < h.endDeg : a >= h.startDeg || a < h.endDeg,
  )
  if (!house) throw new Error(`angle ${angleDeg} did not match any zodiac house`)
  return house
}

// The star hand deliberately has no HandId of its own here — see the note
// on activeHouseHighlights below for why it's excluded from ring painting.
export type HandId = 'sun' | 'moon'

// Fixed priority order for contested houses — first match wins.
const HAND_PRIORITY: HandId[] = ['sun', 'moon']

export const HAND_COLOR: Record<HandId, string> = {
  sun: '#800080',
  moon: '#000000',
}

/**
 * A hand's angle expressed relative to the (rotating) zodiac ring's own
 * unrotated frame — i.e. "which of the ring's own fixed 0-360° positions is
 * this hand currently over." Both hand and ring rotations share the same
 * "0°/pointing down" baseline convention, so this is a plain difference.
 */
export function angleInRingFrame(handRotationDeg: number, ringRotationDeg: number): number {
  return normalizeDegrees(handRotationDeg - ringRotationDeg)
}

/**
 * Sign -> highlight color for the given moment. Sun beats Moon when both
 * hands share a house.
 *
 * The Star hand is deliberately excluded: it shares its rotation value with
 * the zodiac ring itself (siderealRotationDegrees), so its angle-in-ring-frame
 * is always exactly 0° — a constant, landing on whatever wedge sits at 0°
 * (Virgo, in this artwork) every day forever. Painting that wedge would look
 * like a live reading but never actually convey one. The Star's real,
 * changing reading is sidereal time itself — see siderealRingNumeral in
 * explainClock.ts.
 */
export function activeHouseHighlights(pragueTime: PragueTime, ringRotationDeg: number): Map<ZodiacSign, string> {
  const handAngle: Record<HandId, number> = {
    sun: angleInRingFrame(sunHandRotationDegrees(pragueTime), ringRotationDeg),
    moon: angleInRingFrame(moonHandRotationDegrees(pragueTime), ringRotationDeg),
  }
  const result = new Map<ZodiacSign, string>()
  for (const hand of HAND_PRIORITY) {
    const sign = houseAt(handAngle[hand]).sign
    if (!result.has(sign)) result.set(sign, HAND_COLOR[hand])
  }
  return result
}

/** Applies (or clears) fill overrides on the 12 wedge <path>s inside `container`. */
export function applyZodiacHighlights(container: Element, highlights: ReadonlyMap<ZodiacSign, string>): void {
  for (const house of ZODIAC_HOUSES) {
    const el = container.querySelector<SVGPathElement>(`#zodiac-wedge-${house.sign}`)
    if (!el) continue
    el.style.fill = highlights.get(house.sign) ?? ''
  }
}
