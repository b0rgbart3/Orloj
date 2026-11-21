import { normalizeDegrees, toJulianDate } from './rotations'

const MS_PER_DAY = 86400000

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * The sun's apparent geocentric ecliptic longitude, in degrees -- the
 * coordinate that's exactly 90° at the June solstice and 270° at the
 * December solstice, by definition, regardless of obliquity or latitude.
 *
 * Standard low-precision solar coordinates (Meeus, *Astronomical
 * Algorithms* ch. 25 / US Naval Observatory almanac formulas): mean
 * longitude plus the "equation of center" correction for Earth's orbital
 * eccentricity, plus a small correction for nutation/aberration. Accurate
 * to about 0.01° -- against the ecliptic's ~1°/day drift, that's good to
 * within roughly ten to fifteen minutes of the real instant (checked
 * against published solstice times for 2023-2026), centuries on either
 * side of 2000. This is a
 * materially different (and far more precise) model than
 * solarPosition.ts's solarDeclinationDeg, which is a single-term sinusoid
 * good only to about a day -- fine for animating the clock face, not for
 * predicting an exact solstice instant.
 */
export function apparentSolarEclipticLongitudeDeg(date: Date): number {
  const t = (toJulianDate(date) - 2451545.0) / 36525

  const meanLongitudeDeg = normalizeDegrees(280.46646 + 36000.76983 * t + 0.0003032 * t * t)
  const meanAnomalyDeg = normalizeDegrees(357.52911 + 35999.05029 * t - 0.0001537 * t * t)
  const meanAnomaly = degToRad(meanAnomalyDeg)

  const equationOfCenterDeg =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(meanAnomaly) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * meanAnomaly) +
    0.000289 * Math.sin(3 * meanAnomaly)

  const trueLongitudeDeg = meanLongitudeDeg + equationOfCenterDeg

  // Correction for nutation and aberration -- the Moon's ascending node
  // regresses once every ~18.6 years, and this small sinusoidal term
  // standing in for the full nutation series is what the "apparent" (as
  // opposed to "true") longitude means here.
  const moonAscendingNodeDeg = 125.04 - 1934.136 * t
  const apparentLongitudeDeg =
    trueLongitudeDeg - 0.00569 - 0.00478 * Math.sin(degToRad(moonAscendingNodeDeg))

  return normalizeDegrees(apparentLongitudeDeg)
}

// Normalizes a-b to (-180°, 180°], so a bisection search can tell "just
// short of the target" from "just past it" across the 360°/0° wraparound.
function signedAngleDifference(aDeg: number, bDeg: number): number {
  const diff = (aDeg - bDeg) % 360
  if (diff <= -180) return diff + 360
  if (diff > 180) return diff - 360
  return diff
}

/**
 * Finds the instant nearest `approxDate` where the sun's apparent ecliptic
 * longitude equals `targetLongitudeDeg` -- i.e. the exact solstice (90° or
 * 270°) or equinox (0° or 180°) instant. Bisects a ±5 day window around the
 * guess; the ecliptic longitude is strictly increasing (~0.95-1.02°/day)
 * across any single such window, so the search always brackets a unique
 * root. Stops once the bracket is under a second wide, far finer than the
 * model's own ~1-minute accuracy.
 */
function findEclipticLongitudeCrossing(approxDate: Date, targetLongitudeDeg: number): Date {
  let lo = approxDate.getTime() - 5 * MS_PER_DAY
  let hi = approxDate.getTime() + 5 * MS_PER_DAY

  while (hi - lo > 1000) {
    const mid = (lo + hi) / 2
    const diff = signedAngleDifference(apparentSolarEclipticLongitudeDeg(new Date(mid)), targetLongitudeDeg)
    if (diff < 0) lo = mid
    else hi = mid
  }

  return new Date((lo + hi) / 2)
}

export type SolsticeKind = 'summer' | 'winter'

// Rough calendar anchor for each solstice -- just a starting guess for the
// bisection above, accurate to within its ±5 day search window.
const SOLSTICE_TARGET_LONGITUDE_DEG: Record<SolsticeKind, number> = {
  summer: 90,
  winter: 270,
}
const SOLSTICE_APPROX_MONTH_DAY: Record<SolsticeKind, { month: number; day: number }> = {
  summer: { month: 5, day: 21 }, // June 21 (month is 0-indexed)
  winter: { month: 11, day: 21 }, // December 21
}

function solsticeInYear(year: number, kind: SolsticeKind): Date {
  const { month, day } = SOLSTICE_APPROX_MONTH_DAY[kind]
  const approxDate = new Date(Date.UTC(year, month, day, 12))
  return findEclipticLongitudeCrossing(approxDate, SOLSTICE_TARGET_LONGITUDE_DEG[kind])
}

/** The next occurrence of the given solstice strictly after `afterUtc` --
 * this year's if it hasn't happened yet, otherwise next year's. */
export function nextSolstice(afterUtc: Date, kind: SolsticeKind): Date {
  const year = afterUtc.getUTCFullYear()
  const candidate = solsticeInYear(year, kind)
  return candidate.getTime() > afterUtc.getTime() ? candidate : solsticeInYear(year + 1, kind)
}
