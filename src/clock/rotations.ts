import type { PragueTime } from './usePragueTime'

/**
 * Degrees to rotate the sun-dial layer for the given Prague time.
 *
 * The artwork's unrotated baseline points straight down toward the sphere,
 * which lines up with the fixed roman_ring's bottom XII (midnight). Civil
 * hours advance clockwise at 15°/hour (24 numeral positions over 360° on
 * the doubled I-XII ring), so noon — top XII — is exactly 180° from the
 * baseline.
 */
export function sunHandRotationDegrees({ hours, minutes, seconds }: PragueTime): number {
  const fractionalHour = hours + minutes / 60 + seconds / 3600
  return fractionalHour * 15
}

// Prague's geographic longitude — needed to convert Greenwich Sidereal Time
// into Local Sidereal Time.
const PRAGUE_LONGITUDE_DEG = 14.4378

function toJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5
}

export function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360
}

/**
 * Local Sidereal Time in Prague, in degrees [0, 360).
 *
 * Standard IAU GMST formula (Meeus/USNO) plus a longitude correction. This
 * is real astronomy, not an approximated rate — the sidereal day really is
 * ~23h56m4s (Earth's rotation period relative to the stars, slightly
 * shorter than the 24h solar day), so the zodiac ring and the star arm
 * slowly drift relative to the Sun arm exactly as they should.
 */
export function localSiderealTimeDegrees(date: Date): number {
  const jd = toJulianDate(date)
  const centuriesSinceJ2000 = (jd - 2451545.0) / 36525
  const gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * centuriesSinceJ2000 ** 2 -
    centuriesSinceJ2000 ** 3 / 38710000
  return normalizeDegrees(normalizeDegrees(gmst) + PRAGUE_LONGITUDE_DEG)
}

/**
 * Degrees to rotate the zodiac-ring and star-dial layers — both driven by
 * the same physical sidereal rotation, so they share this one value. The
 * artwork's unrotated baseline (pointing down) is defined as LST 0h.
 */
export function siderealRotationDegrees(time: PragueTime): number {
  return localSiderealTimeDegrees(time.date)
}

// Mean synodic month (new moon to new moon). A known reference new moon,
// used purely to anchor the phase — any accurate new-moon timestamp works
// equally well since the cycle is periodic.
const SYNODIC_MONTH_DAYS = 29.530588861
const MS_PER_DAY = 86400000
const REFERENCE_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14)

/**
 * Lunar phase angle in degrees: 0° = new moon, 180° = full moon, increasing
 * over the ~29.53-day synodic month.
 */
export function lunarPhaseAngleDegrees(date: Date): number {
  const daysSinceReference = (date.getTime() - REFERENCE_NEW_MOON_MS) / MS_PER_DAY
  return normalizeDegrees((daysSinceReference / SYNODIC_MONTH_DAYS) * 360)
}

/**
 * Degrees to rotate the moon-dial layer.
 *
 * The Sun and Moon arms share one pivot and turn at very nearly the same
 * rate (a "lunar day" is ~24h50m vs the Sun's 24h00m — diagram calls them
 * three collars on one spindle). Rather than simulate that near-24h gear
 * ratio from an arbitrary starting alignment, we derive the Moon's angle
 * directly from the Sun's live angle minus the actual current lunar phase,
 * anchored to a real reference new moon. Same mechanical relationship,
 * correctly synced to today's real phase: at new moon (phase 0°) the Moon
 * sits exactly on the Sun; at full moon (phase 180°) it sits exactly
 * opposite.
 */
export function moonHandRotationDegrees(time: PragueTime): number {
  return normalizeDegrees(sunHandRotationDegrees(time) - lunarPhaseAngleDegrees(time.date))
}

const PRAGUE_LATITUDE_DEG = 50.0755

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI
}

function dayOfYearUTC(date: Date): number {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1)
  return Math.floor((date.getTime() - startOfYear) / MS_PER_DAY) + 1
}

/** Prague's current UTC offset in hours (1 = CET, 2 = CEST), DST-safe. */
function pragueUtcOffsetHours(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Prague',
    timeZoneName: 'shortOffset',
  }).formatToParts(date)
  const offsetName = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+0'
  const match = /GMT([+-]\d+)/.exec(offsetName)
  return match ? Number(match[1]) : 0
}

/**
 * Sunset time in Prague, as a civil-clock hour (e.g. 20.5 = 20:30), for the
 * given date. Standard sunrise-equation solar declination + hour-angle
 * formula. Ignores the equation of time (a few minutes at most) — the
 * numeric ring moves so slowly over the year that error is imperceptible.
 */
export function sunsetCivilHour(date: Date): number {
  const dayOfYear = dayOfYearUTC(date)
  const declinationDeg = -23.44 * Math.cos(degToRad((360 / 365.24) * (dayOfYear + 10)))
  const cosHourAngle = Math.max(
    -1,
    Math.min(1, -Math.tan(degToRad(PRAGUE_LATITUDE_DEG)) * Math.tan(degToRad(declinationDeg))),
  )
  const hourAngleDeg = radToDeg(Math.acos(cosHourAngle))
  const sunsetApparentSolarHour = 12 + hourAngleDeg / 15
  const longitudeCorrectionHours = PRAGUE_LONGITUDE_DEG / 15
  return sunsetApparentSolarHour + (pragueUtcOffsetHours(date) - longitudeCorrectionHours)
}

// Where "24" sits in numeric_ring.svg's unrotated baseline, clockwise from
// top: one 15° step past the quarter (90°) mark, in the lower-right
// quadrant.
const NUMERIC_RING_24_BASELINE_DEG = 105

/**
 * Degrees to rotate the numeric-ring layer.
 *
 * In the real Orloj this ring is geared to creep around over the year so
 * its "24" mark always lines up with the Sun hand at the moment of sunset
 * — Old Bohemian/Italian hours count up to 24 at sunset. We compute
 * sunset's civil-clock hour for today, convert that to the angle the Sun
 * hand will be at then, and rotate the ring so its 24 meets that angle.
 */
export function numericRingRotationDegrees(date: Date): number {
  const sunAngleAtSunset = sunsetCivilHour(date) * 15
  return normalizeDegrees(sunAngleAtSunset - NUMERIC_RING_24_BASELINE_DEG)
}
