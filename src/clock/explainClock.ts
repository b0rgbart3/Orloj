import { angleInRingFrame, houseAt, type ZodiacSign } from './zodiacHouses'
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

/** The Roman numeral the hand (and outer ring) currently points to -- the
 * outer ring's I-XII numerals appear twice over the 24-hour face. */
export function outerRingNumeral(hours: number): string {
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
 * sunset) that the inner numeric ring currently reads under the hand. */
export function innerRingHour(pragueTime: PragueTime): number {
  const currentCivilHour = pragueTime.hours + pragueTime.minutes / 60 + pragueTime.seconds / 3600
  const sunsetToday = sunsetCivilHour(pragueTime.date)
  const hoursSinceSunset =
    currentCivilHour >= sunsetToday
      ? currentCivilHour - sunsetToday
      : currentCivilHour - sunsetCivilHour(new Date(pragueTime.date.getTime() - MS_PER_DAY)) + 24
  const rounded = Math.round(hoursSinceSunset)
  return rounded <= 0 ? 24 : rounded
}

export function zodiacLabel(sign: ZodiacSign): string {
  return sign[0].toUpperCase() + sign.slice(1)
}

export type ClockExplanation = {
  outerRingNumeral: string
  innerRingHour: number
  sunSign: ZodiacSign
  moonSign: ZodiacSign
  starSign: ZodiacSign
  moonPhase: string
  moonIllumination: number
}

/** Plain-language description of where every dial on the clock face
 * currently sits, derived from the same angle math that drives the
 * artwork's live rotations. */
export function explainClock(pragueTime: PragueTime): ClockExplanation {
  const ringRotation = siderealRotationDegrees(pragueTime)
  const sunAngle = angleInRingFrame(sunHandRotationDegrees(pragueTime), ringRotation)
  const moonAngle = angleInRingFrame(moonHandRotationDegrees(pragueTime), ringRotation)
  const starAngle = angleInRingFrame(ringRotation, ringRotation)
  const phaseDeg = lunarPhaseAngleDegrees(pragueTime.date)

  return {
    outerRingNumeral: outerRingNumeral(pragueTime.hours),
    innerRingHour: innerRingHour(pragueTime),
    sunSign: houseAt(sunAngle).sign,
    moonSign: houseAt(moonAngle).sign,
    starSign: houseAt(starAngle).sign,
    moonPhase: moonPhaseName(phaseDeg),
    moonIllumination: moonIlluminationPercent(phaseDeg),
  }
}
