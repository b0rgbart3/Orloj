import {
  activeHouseHighlights,
  angleInRingFrame,
  HAND_COLOR,
  houseAt,
  type HandId,
  type ZodiacSign,
} from './zodiacHouses'
import {
  lunarPhaseAngleDegrees,
  moonHandRotationDegrees,
  normalizeDegrees,
  siderealRotationDegrees,
  sunHandRotationDegrees,
  sunsetCivilHour,
} from './rotations'
import type { PragueTime } from './usePragueTime'

const MS_PER_DAY = 86400000

const ROMAN_HOUR_NUMERALS = [
  'XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI',
]

/** The Roman numeral the hand (and inner ring) currently points to -- the
 * inner ring's I-XII numerals appear twice over the 24-hour face. */
export function innerRingNumeral(hours: number): string {
  return ROMAN_HOUR_NUMERALS[hours % 12]
}

const MOON_PHASE_NAMES = [
  'new moon',
  'waxing crescent',
  'first quarter',
  'waxing gibbous',
  'full moon',
  'waning gibbous',
  'last quarter',
  'waning crescent',
]

export function moonPhaseName(phaseDeg: number): string {
  return MOON_PHASE_NAMES[Math.round(normalizeDegrees(phaseDeg) / 45) % 8]
}

export function moonIlluminationPercent(phaseDeg: number): number {
  return Math.round(((1 - Math.cos((phaseDeg * Math.PI) / 180)) / 2) * 100)
}

/** The old Bohemian/Italian hour (1-24, counting up from the most recent
 * sunset) that the outer numeric ring currently reads under the hand. */
export function outerRingHour(pragueTime: PragueTime): number {
  const currentCivilHour = pragueTime.hours + pragueTime.minutes / 60 + pragueTime.seconds / 3600
  const sunsetToday = sunsetCivilHour(pragueTime.date)
  const hoursSinceSunset =
    currentCivilHour >= sunsetToday
      ? currentCivilHour - sunsetToday
      : currentCivilHour - sunsetCivilHour(new Date(pragueTime.date.getTime() - MS_PER_DAY)) + 24
  const rounded = Math.round(hoursSinceSunset)
  return rounded <= 0 ? 24 : rounded
}

const ZODIAC_SYMBOLS: Record<ZodiacSign, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
}

export function zodiacName(sign: ZodiacSign): string {
  return sign[0].toUpperCase() + sign.slice(1)
}

// The trailing U+FE0E forces text presentation, so browsers render the bare
// glyph (stylable via CSS) instead of a platform-specific colored emoji.
export function zodiacSymbol(sign: ZodiacSign): string {
  return `${ZODIAC_SYMBOLS[sign]}︎`
}

export const HAND_COLOR_NAME: Record<HandId, string> = {
  sun: 'purple',
  moon: 'black',
}

const COLOR_TO_HAND: Record<string, HandId> = Object.fromEntries(
  Object.entries(HAND_COLOR).map(([hand, color]) => [color, hand as HandId]),
)

export type ClockExplanation = {
  innerRingNumeral: string
  outerRingHour: number
  starRingNumeral: string
  sunSign: ZodiacSign
  moonSign: ZodiacSign
  // Whichever hand's color actually paints each dial's own wedge, once the
  // sun-beats-moon priority rule has resolved any shared houses.
  sunHighlightHand: HandId
  moonHighlightHand: HandId
  moonPhase: string
  moonIllumination: number
}

/** The Roman numeral the star pointer reads off the fixed Roman ring --
 * true Local Sidereal Time, using the same "0°/pointing down = XII"
 * baseline convention as the civil-time hand. Unlike the star's position
 * against the (rigidly linked) zodiac ring, this reading actually changes
 * from moment to moment. */
export function siderealRingNumeral(pragueTime: PragueTime): string {
  const hourIndex = Math.floor(normalizeDegrees(siderealRotationDegrees(pragueTime)) / 15) % 12
  return ROMAN_HOUR_NUMERALS[hourIndex]
}

/** Plain-language description of where every dial on the clock face
 * currently sits, derived from the same angle math that drives the
 * artwork's live rotations. */
export function explainClock(pragueTime: PragueTime): ClockExplanation {
  const ringRotation = siderealRotationDegrees(pragueTime)
  const sunAngle = angleInRingFrame(sunHandRotationDegrees(pragueTime), ringRotation)
  const moonAngle = angleInRingFrame(moonHandRotationDegrees(pragueTime), ringRotation)
  const phaseDeg = lunarPhaseAngleDegrees(pragueTime.date)

  const sunSign = houseAt(sunAngle).sign
  const moonSign = houseAt(moonAngle).sign
  const highlights = activeHouseHighlights(pragueTime, ringRotation)

  return {
    innerRingNumeral: innerRingNumeral(pragueTime.hours),
    outerRingHour: outerRingHour(pragueTime),
    starRingNumeral: siderealRingNumeral(pragueTime),
    sunSign,
    moonSign,
    sunHighlightHand: COLOR_TO_HAND[highlights.get(sunSign)!],
    moonHighlightHand: COLOR_TO_HAND[highlights.get(moonSign)!],
    moonPhase: moonPhaseName(phaseDeg),
    moonIllumination: moonIlluminationPercent(phaseDeg),
  }
}
