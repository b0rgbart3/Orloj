import {
  activeHouseHighlights,
  angleInRingFrame,
  HAND_COLOR,
  houseAt,
  type HandId,
  type ZodiacSign,
} from './zodiacHouses'
import { trueLunarElongationDeg } from './lunarEphemeris'
import {
  moonHandRotationDegrees,
  normalizeDegrees,
  siderealRotationDegrees,
  sunHandRotationDegrees,
  sunsetCivilHour,
  zodiacRingRotationDegrees,
} from './rotations'
import type { Location } from './location'
import { currentHourAngleDeg, daylightHalfHourAngleDeg, solarDeclinationDeg } from './solarPosition'
import { getPragueDateParts, type PragueDateParts, type PragueTime } from './usePragueTime'

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

/** The most recent sunset at or before `pragueTime`, and the next one after
 * it -- today's sunset if it hasn't happened yet, otherwise tomorrow's;
 * yesterday's if today's hasn't happened yet, otherwise today's. Both the
 * outer ring's hour count and the chatbot's live context are built from
 * this same pair, so "hours since sunset" and "when is sunset" never
 * disagree. */
export function sunsetWindow(pragueTime: PragueTime, location: Location): {
  previous: { date: Date; civilHour: number }
  next: { date: Date; civilHour: number }
} {
  const currentCivilHour = pragueTime.hours + pragueTime.minutes / 60 + pragueTime.seconds / 3600
  const todaySunset = sunsetCivilHour(pragueTime.date, location)
  if (currentCivilHour >= todaySunset) {
    const tomorrow = new Date(pragueTime.date.getTime() + MS_PER_DAY)
    return {
      previous: { date: pragueTime.date, civilHour: todaySunset },
      next: { date: tomorrow, civilHour: sunsetCivilHour(tomorrow, location) },
    }
  }
  const yesterday = new Date(pragueTime.date.getTime() - MS_PER_DAY)
  return {
    previous: { date: yesterday, civilHour: sunsetCivilHour(yesterday, location) },
    next: { date: pragueTime.date, civilHour: todaySunset },
  }
}

/** Formats a fractional civil hour (e.g. 16.05) as "HH:MM". */
function formatCivilHour(civilHour: number): string {
  const totalMinutes = Math.round(civilHour * 60)
  const h = Math.floor(totalMinutes / 60) % 24
  const m = totalMinutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

/** The old Bohemian/Italian hour (1-24, counting up from the most recent
 * sunset) that the outer numeric ring currently reads under the hand. */
export function outerRingHour(pragueTime: PragueTime, location: Location): number {
  const currentCivilHour = pragueTime.hours + pragueTime.minutes / 60 + pragueTime.seconds / 3600
  const { previous } = sunsetWindow(pragueTime, location)
  let hoursSinceSunset = currentCivilHour - previous.civilHour
  if (hoursSinceSunset < 0) hoursSinceSunset += 24
  const rounded = Math.round(hoursSinceSunset)
  return rounded <= 0 ? 24 : rounded
}

/** The old Babylonian/unequal hour (1-12, counting from sunrise) that the
 * sun's actual position corresponds to right now, or 'night' if the sun is
 * below the horizon -- real sun-position math (declination, hour angle,
 * latitude), the same real daylight window sunsetCivilHour/outerRingHour
 * are built from, not a visual/pixel-derived reading. */
export function babylonianHour(pragueTime: PragueTime, location: Location): number | 'night' {
  const declinationDeg = solarDeclinationDeg(pragueTime.date)
  const halfDaylightDeg = daylightHalfHourAngleDeg(declinationDeg, location.latitudeDeg)
  const hourAngleDeg = currentHourAngleDeg(pragueTime, location)
  if (hourAngleDeg < -halfDaylightDeg || hourAngleDeg > halfDaylightDeg) return 'night'
  const fractionOfDaylight = (hourAngleDeg + halfDaylightDeg) / (2 * halfDaylightDeg)
  return Math.min(12, Math.floor(fractionOfDaylight * 12) + 1)
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
  babylonianHour: number | 'night'
}

/** The Roman numeral the star pointer reads off the fixed Roman ring --
 * true Local Sidereal Time, using the same "0°/pointing down = XII"
 * baseline convention as the civil-time hand. Unlike the star's position
 * against the (rigidly linked) zodiac ring, this reading actually changes
 * from moment to moment. */
export function siderealRingNumeral(pragueTime: PragueTime, location: Location): string {
  const hourIndex = Math.floor(normalizeDegrees(siderealRotationDegrees(pragueTime, location)) / 15) % 12
  return ROMAN_HOUR_NUMERALS[hourIndex]
}

/** Plain-language description of where every dial on the clock face
 * currently sits, derived from the same angle math that drives the
 * artwork's live rotations. */
export function explainClock(pragueTime: PragueTime, location: Location): ClockExplanation {
  const ringRotation = zodiacRingRotationDegrees(pragueTime, location)
  const sunAngle = angleInRingFrame(sunHandRotationDegrees(pragueTime), ringRotation)
  const moonAngle = angleInRingFrame(moonHandRotationDegrees(pragueTime), ringRotation)
  const phaseDeg = trueLunarElongationDeg(pragueTime.date)

  const sunSign = houseAt(sunAngle).sign
  const moonSign = houseAt(moonAngle).sign
  const highlights = activeHouseHighlights(pragueTime, ringRotation)

  const fractionalHour = pragueTime.hours + pragueTime.minutes / 60 + pragueTime.seconds / 3600

  return {
    innerRingNumeral: innerRingNumeral(fractionalHour),
    outerRingHour: outerRingHour(pragueTime, location),
    starRingNumeral: siderealRingNumeral(pragueTime, location),
    sunSign,
    moonSign,
    sunHighlightHand: COLOR_TO_HAND[highlights.get(sunSign)!],
    moonHighlightHand: COLOR_TO_HAND[highlights.get(moonSign)!],
    moonPhase: moonPhaseName(phaseDeg),
    moonIllumination: moonIlluminationPercent(phaseDeg),
    babylonianHour: babylonianHour(pragueTime, location),
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
export function describeCurrentMoment(pragueTime: PragueTime, dateParts: PragueDateParts, location: Location): string {
  const e = explainClock(pragueTime, location)
  const pad = (n: number) => n.toString().padStart(2, '0')
  const { previous, next } = sunsetWindow(pragueTime, location)
  const previousParts = getPragueDateParts(previous.date, location)
  const nextParts = getPragueDateParts(next.date, location)
  return [
    `Date/time currently shown on the clock: ${dateParts.month} ${dateParts.day}, ${dateParts.year}, ${pad(pragueTime.hours)}:${pad(pragueTime.minutes)} local time.`,
    `Sun dial: ${zodiacName(e.sunSign)} ${zodiacSymbol(e.sunSign)} -- ${describeHighlight('sun', e.sunHighlightHand)}.`,
    `Moon dial: ${zodiacName(e.moonSign)} ${zodiacSymbol(e.moonSign)} -- ${e.moonPhase}, ${e.moonIllumination}% lit -- ${describeHighlight('moon', e.moonHighlightHand)}.`,
    `Star pointer (true local sidereal time, fixed Roman ring): ${e.starRingNumeral}.`,
    `Hand -- inner ring (civil hour): ${e.innerRingNumeral}; outer ring (old Bohemian hour count since sunset): ${e.outerRingHour}.`,
    `Sunset (computed live for this location's latitude, not read off the hand): most recent was ${previousParts.month} ${previousParts.day} at ${formatCivilHour(previous.civilHour)} local time -- hour 0 that the outer ring's count of ${e.outerRingHour} is measured from; the next one is ${nextParts.month} ${nextParts.day} at ${formatCivilHour(next.civilHour)}.`,
    `Babylonian hour (unequal hour since sunrise, dividing today's daylight into 12 equal parts): ${e.babylonianHour === 'night' ? 'night (the sun is below the horizon)' : e.babylonianHour}.`,
  ].join('\n')
}
