import { normalizeDegrees, toJulianDate } from './astroMath'
import { apparentSolarEclipticLongitudeDeg } from './solarEphemeris'

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * The moon's apparent geocentric ecliptic longitude, in degrees.
 *
 * Truncated ELP2000/Meeus low-precision lunar theory (Meeus, *Astronomical
 * Algorithms* ch. 47, Table 47.A): mean longitude plus the ~19 largest
 * periodic terms (in D, the Moon's mean elongation from the Sun; M, the
 * Sun's mean anomaly; M', the Moon's mean anomaly; and F, the Moon's
 * argument of latitude). The full published series runs to dozens of terms
 * and resolves the Moon's position to arcseconds; this truncation keeps
 * only the terms large enough to matter for a clock face, which gets to
 * roughly 0.05-0.2° -- including the two periodic terms (2M' and 2F)
 * that are individually bigger than several of the smaller terms kept
 * here, so dropping them would cost more accuracy than it saves code.
 * Nutation shifts this by at most ~0.005°, below this series' own
 * truncation error, so it's not applied separately (contrast
 * solarEphemeris.ts's apparent-longitude correction, which matters there
 * because that function is precise enough for it to show).
 */
export function apparentLunarEclipticLongitudeDeg(date: Date): number {
  const t = (toJulianDate(date) - 2451545.0) / 36525

  const meanLongitudeDeg = normalizeDegrees(218.3164477 + 481267.88123421 * t - 0.0015786 * t * t)
  const meanElongationDeg = normalizeDegrees(297.8501921 + 445267.1114034 * t - 0.0018819 * t * t)
  const sunMeanAnomalyDeg = normalizeDegrees(357.5291092 + 35999.0502909 * t - 0.0001536 * t * t)
  const moonMeanAnomalyDeg = normalizeDegrees(134.9633964 + 477198.8675055 * t + 0.0087414 * t * t)
  const moonArgumentOfLatitudeDeg = normalizeDegrees(93.272095 + 483202.0175233 * t - 0.0036539 * t * t)

  const D = degToRad(meanElongationDeg)
  const M = degToRad(sunMeanAnomalyDeg)
  const Mp = degToRad(moonMeanAnomalyDeg)
  const F = degToRad(moonArgumentOfLatitudeDeg)

  const perturbationDeg =
    6.288774 * Math.sin(Mp) -
    1.274027 * Math.sin(2 * D - Mp) +
    0.658314 * Math.sin(2 * D) +
    0.213618 * Math.sin(2 * Mp) -
    0.185116 * Math.sin(M) -
    0.114332 * Math.sin(2 * F) +
    0.058793 * Math.sin(2 * D - 2 * Mp) +
    0.057066 * Math.sin(2 * D - M - Mp) +
    0.053322 * Math.sin(2 * D + Mp) +
    0.045758 * Math.sin(2 * D - M) -
    0.040923 * Math.sin(M - Mp) -
    0.03472 * Math.sin(D) -
    0.030383 * Math.sin(M + Mp) +
    0.015327 * Math.sin(2 * D - 2 * F) -
    0.012528 * Math.sin(Mp + 2 * F) +
    0.01098 * Math.sin(Mp - 2 * F) +
    0.010675 * Math.sin(4 * D - Mp) +
    0.010034 * Math.sin(3 * Mp) +
    0.008548 * Math.sin(4 * D - 2 * Mp)

  return normalizeDegrees(meanLongitudeDeg + perturbationDeg)
}

/**
 * Sun-Moon elongation in degrees: 0° = new moon (conjunction), 180° = full
 * moon (opposition), increasing over the ~29.53-day synodic month. Computed
 * from the real apparent ecliptic longitudes of both bodies, not a fixed
 * mean-motion rate -- the Moon's real orbital speed varies by several
 * percent across its elliptical orbit (Kepler's second law), which a
 * straight-line mean-motion model can't capture.
 */
export function trueLunarElongationDeg(date: Date): number {
  return normalizeDegrees(apparentLunarEclipticLongitudeDeg(date) - apparentSolarEclipticLongitudeDeg(date))
}
