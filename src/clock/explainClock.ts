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
import type { PragueDateParts, PragueTime } from './usePragueTime'

const MS_PER_DAY = 86400000

const ROMAN_HOUR_NUMERALS = [
  'XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI',
]

/** The Roman numeral the hand (and inner ring) currently points to -- the
 * inner ring's I-XII numerals appear twice over the 24-hour face. Rounds to
 * the nearest numeral (not the floor), matching where the hand visually
 * sits: e.g. at :50 past the hour it's already nearly on the next numeral. */
export function innerRingNumeral(fractionalHour: number): string {
  return ROMAN_HOUR_NUMERALS[Math.round(fractionalHour) % 12]
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

// The conventional Western tropical-zodiac "sun sign" date range for each
// house -- the popularly-cited boundaries (e.g. almanacs, horoscope columns),
// not a per-year astronomical computation. The real crossing moment can
// drift by a day across years, but these are the dates people mean when they
// say "I'm a Taurus."
const ZODIAC_DATE_RANGES: Record<ZodiacSign, string> = {
  aries: 'March 21 – April 19',
  taurus: 'April 20 – May 20',
  gemini: 'May 21 – June 20',
  cancer: 'June 21 – July 22',
  leo: 'July 23 – August 22',
  virgo: 'August 23 – September 22',
  libra: 'September 23 – October 22',
  scorpio: 'October 23 – November 21',
  sagittarius: 'November 22 – December 21',
  capricorn: 'December 22 – January 19',
  aquarius: 'January 20 – February 18',
  pisces: 'February 19 – March 20',
}

export function zodiacDateRange(sign: ZodiacSign): string {
  return ZODIAC_DATE_RANGES[sign]
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

  const fractionalHour = pragueTime.hours + pragueTime.minutes / 60 + pragueTime.seconds / 3600

  return {
    innerRingNumeral: innerRingNumeral(fractionalHour),
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

/** Mirrors DrawerClockInfo's <HighlightNote> in plain text: which hand's
 * color actually paints a dial's wedge, once the sun-beats-moon-beats-star
 * priority rule has resolved any ties. */
function describeHighlight(hand: HandId, winner: HandId): string {
  const color = HAND_COLOR_NAME[winner]
  if (winner === hand) {
    return `highlighted in ${color} on the zodiac ring`
  }
  return `sharing that wedge with the ${winner}, so the ring shows the ${winner}'s ${color} there instead of its own`
}

/** Plain-text summary of the current dial state, for handing to the chatbot
 * as live context alongside the user's question -- the same facts the
 * drawer shows, condensed and without the educational prose. The displayed
 * moment may be one the visitor has scrubbed to rather than the real
 * present, so this only describes what the clock currently shows. */
export function describeCurrentMoment(pragueTime: PragueTime, dateParts: PragueDateParts): string {
  const e = explainClock(pragueTime)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return [
    `Date/time currently shown on the clock: ${dateParts.month} ${dateParts.day}, ${dateParts.year}, ${pad(pragueTime.hours)}:${pad(pragueTime.minutes)} Prague local time.`,
    `Sun dial: ${zodiacName(e.sunSign)} ${zodiacSymbol(e.sunSign)} -- ${describeHighlight('sun', e.sunHighlightHand)}.`,
    `Moon dial: ${zodiacName(e.moonSign)} ${zodiacSymbol(e.moonSign)} -- ${e.moonPhase}, ${e.moonIllumination}% lit -- ${describeHighlight('moon', e.moonHighlightHand)}.`,
    `Star pointer (true local sidereal time, fixed Roman ring): ${e.starRingNumeral}.`,
    `Hand -- inner ring (civil hour): ${e.innerRingNumeral}; outer ring (old Bohemian hour count since sunset): ${e.outerRingHour}.`,
  ].join('\n')
}
