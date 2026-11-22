import { normalizeDegrees, toJulianDate } from './astroMath'
import { trueLunarElongationDeg } from './lunarEphemeris'
import type { Location } from './location'
import { daylightHalfHourAngleDeg, solarDeclinationDeg, utcOffsetHours } from './solarPosition'
import type { PragueTime } from './usePragueTime'

export { normalizeDegrees, toJulianDate }

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

/**
 * Local Sidereal Time in Prague, in degrees [0, 360).
 *
 * Standard IAU GMST formula (Meeus/USNO) plus a longitude correction. This
 * is real astronomy, not an approximated rate — the sidereal day really is
 * ~23h56m4s (Earth's rotation period relative to the stars, slightly
 * shorter than the 24h solar day), so the zodiac ring and the star arm
 * slowly drift relative to the Sun arm exactly as they should.
 */
export function localSiderealTimeDegrees(date: Date, location: Location): number {
  const jd = toJulianDate(date)
  const centuriesSinceJ2000 = (jd - 2451545.0) / 36525
  const gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * centuriesSinceJ2000 ** 2 -
    centuriesSinceJ2000 ** 3 / 38710000
  return normalizeDegrees(normalizeDegrees(gmst) + location.longitudeDeg)
}

/**
 * Raw Local Sidereal Time, as a rotation — used only where the reading
 * itself must stay true LST (the Roman-ring numeral in
 * explainClock.ts's siderealRingNumeral). For rotating the zodiac-ring and
 * star-dial layers themselves, or for resolving which zodiac house a hand
 * sits over, use zodiacRingRotationDegrees below instead — see its doc
 * comment for why these two aren't the same rotation.
 */
export function siderealRotationDegrees(time: PragueTime, location: Location): number {
  return localSiderealTimeDegrees(time.date, location)
}

/**
 * Degrees to rotate the zodiac-ring and star-dial layers — both driven by
 * the same physical sidereal rotation (same spindle), so they share this
 * one value, and it's also the rotation angleInRingFrame expects for
 * resolving which zodiac house a hand currently sits over.
 *
 * This is raw LST plus a 180° correction, not raw LST directly. LST=0h
 * means "the First Point of Aries is at *upper* culmination" (on the
 * meridian, at its highest) — the natural zero-point for sidereal time,
 * analogous to how civil noon is the sun's own upper culmination. But the
 * artwork's unrotated baseline (0°, pointing down) was built to mirror the
 * civil-time hand's own baseline, which points down at *midnight* —
 * civil time's lower culmination of the sun, the opposite transit from
 * noon. Pairing "0°, down" with LST 0h (upper culmination) instead of
 * LST 12h (lower culmination, the actual down-pointing match) mixes the
 * two civil-time transits up: it's the sidereal equivalent of defining the
 * sun-hand's baseline against solar noon instead of solar midnight.
 * Verified against the ring's own artwork: with this correction (and
 * ZODIAC_HOUSES.ts's angle ranges, independently verified correct against
 * real solar ecliptic longitude), the sun/moon hands land on the wedge
 * whose own drawn glyph matches the real current sign -- without it, they
 * land on that sign's glyph's opposite-pair partner, consistently, for
 * every sign.
 */
export function zodiacRingRotationDegrees(time: PragueTime, location: Location): number {
  return normalizeDegrees(siderealRotationDegrees(time, location) + 180)
}

/**
 * Degrees to rotate the moon-dial layer.
 *
 * The Sun and Moon arms share one pivot and turn at very nearly the same
 * rate (a "lunar day" is ~24h50m vs the Sun's 24h00m — diagram calls them
 * three collars on one spindle). We derive the Moon's angle directly from
 * the Sun's live angle minus the actual Sun-Moon elongation: at new moon
 * (elongation 0°) the Moon sits exactly on the Sun; at full moon
 * (elongation 180°) it sits exactly opposite.
 *
 * Unlike the real Orloj — whose Moon hand is geared to a fixed 29.53-day
 * mean synodic month and drifts out of sync with the sky over time, needing
 * periodic hand-correction — this uses `trueLunarElongationDeg`, computed
 * from the Moon's and Sun's real apparent ecliptic longitudes (see
 * lunarEphemeris.ts/solarEphemeris.ts). The Moon's real orbital speed varies
 * by several percent across its elliptical orbit; a fixed gear ratio can't
 * capture that, but this calculation does, so the dial never needs winding
 * back onto the real sky.
 */
export function moonHandRotationDegrees(time: PragueTime): number {
  return normalizeDegrees(sunHandRotationDegrees(time) - trueLunarElongationDeg(time.date))
}

/**
 * Sunset time at the given location, as a civil-clock hour (e.g. 20.5 =
 * 20:30), for the given date. Standard sunrise-equation solar declination +
 * hour-angle formula (the altitude=0° case of solarPosition.ts's general
 * daylightHalfHourAngleDeg). Ignores the equation of time (a few minutes at
 * most) — the numeric ring moves so slowly over the year that error is
 * imperceptible.
 */
export function sunsetCivilHour(date: Date, location: Location): number {
  const declinationDeg = solarDeclinationDeg(date)
  const hourAngleDeg = daylightHalfHourAngleDeg(declinationDeg, location.latitudeDeg)
  const sunsetApparentSolarHour = 12 + hourAngleDeg / 15
  const longitudeCorrectionHours = location.longitudeDeg / 15
  return sunsetApparentSolarHour + (utcOffsetHours(date, location.timeZone) - longitudeCorrectionHours)
}

// Where "24" sits in numeric_ring.svg's unrotated baseline, in this file's
// usual convention (clockwise from the bottom, same as sunHandRotationDegrees):
// one 15° step past the three-quarter (270°) mark. Measured directly from
// the glyph's own bounding box in numeric_ring.svg -- confirmed against the
// "12" glyph sitting exactly opposite it, 180° away.
const NUMERIC_RING_24_BASELINE_DEG = 285

/**
 * Degrees to rotate the numeric-ring layer.
 *
 * In the real Orloj this ring is geared to creep around over the year so
 * its "24" mark always lines up with the Sun hand at the moment of sunset
 * — Old Bohemian/Italian hours count up to 24 at sunset. We compute
 * sunset's civil-clock hour for today, convert that to the angle the Sun
 * hand will be at then, and rotate the ring so its 24 meets that angle.
 */
export function numericRingRotationDegrees(date: Date, location: Location): number {
  const sunAngleAtSunset = sunsetCivilHour(date, location) * 15
  return normalizeDegrees(sunAngleAtSunset - NUMERIC_RING_24_BASELINE_DEG)
}
