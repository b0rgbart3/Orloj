import type { Location } from './location'
import type { PragueTime } from './usePragueTime'

const MS_PER_DAY = 86400000

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI
}

function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360
}

function dayOfYearUTC(date: Date): number {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1)
  return Math.floor((date.getTime() - startOfYear) / MS_PER_DAY) + 1
}

/** The given time zone's current UTC offset in hours (e.g. 1 = CET, 2 =
 * CEST for Europe/Prague), DST-safe. Solar-time conversion needs this
 * alongside the declination/hour-angle math below, so it lives here rather
 * than in rotations.ts -- that file depends on this module, not the other
 * way around. */
export function utcOffsetHours(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
  }).formatToParts(date)
  const offsetName = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+0'
  const match = /GMT([+-]\d+)/.exec(offsetName)
  return match ? Number(match[1]) : 0
}

/** Approximate solar declination for the given date, in degrees. Ignores
 * the equation of time, consistent with the rest of this module -- the
 * error is imperceptible at the precision this clock operates at. */
export function solarDeclinationDeg(date: Date): number {
  const dayOfYear = dayOfYearUTC(date)
  return -23.44 * Math.cos(degToRad((360 / 365.24) * (dayOfYear + 10)))
}

/** Half the hour-angle width of the period during which the sun is above
 * the given target altitude, for the given declination and latitude --
 * the general form of the sunrise-equation hour angle, generalized from
 * altitude 0° (horizon) to an arbitrary threshold (e.g. -6° for civil
 * twilight). Clamped for the "never reaches this altitude" / "never drops
 * below it" edge cases. */
export function hourAngleAtAltitudeDeg(targetAltitudeDeg: number, declinationDeg: number, latitudeDeg: number): number {
  const lat = degToRad(latitudeDeg)
  const dec = degToRad(declinationDeg)
  const alt = degToRad(targetAltitudeDeg)
  const cosH = Math.max(
    -1,
    Math.min(1, (Math.sin(alt) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec))),
  )
  return radToDeg(Math.acos(cosH))
}

/** Half the hour-angle width of daylight, in degrees -- the hour angle (±)
 * at which the sun crosses the horizon (altitude 0°) for the given
 * declination and latitude. The altitude-0° case of hourAngleAtAltitudeDeg
 * above, kept as its own named function since it's used throughout the
 * rest of the app (sunset, the outer ring, babylonianHour). */
export function daylightHalfHourAngleDeg(declinationDeg: number, latitudeDeg: number): number {
  return hourAngleAtAltitudeDeg(0, declinationDeg, latitudeDeg)
}

/** Solar altitude above the horizon, in degrees, for a given declination,
 * hour angle (0° = local solar noon, positive in the afternoon), and
 * latitude. */
export function solarAltitudeDeg(declinationDeg: number, hourAngleDeg: number, latitudeDeg: number): number {
  const lat = degToRad(latitudeDeg)
  const dec = degToRad(declinationDeg)
  const hourAngle = degToRad(hourAngleDeg)
  const sinAltitude = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(hourAngle)
  return radToDeg(Math.asin(Math.max(-1, Math.min(1, sinAltitude))))
}

/** Solar azimuth, in degrees, as a compass bearing from North, clockwise
 * through East (0=N, 90=E, 180=S, 270=W). At local solar noon (hour angle
 * 0°) in the northern hemisphere this reads ~180° (due south), as expected. */
export function solarAzimuthDeg(declinationDeg: number, hourAngleDeg: number, latitudeDeg: number): number {
  const lat = degToRad(latitudeDeg)
  const dec = degToRad(declinationDeg)
  const hourAngle = degToRad(hourAngleDeg)
  const azimuthFromSouthWestward = radToDeg(
    Math.atan2(Math.sin(hourAngle), Math.cos(hourAngle) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat)),
  )
  return normalizeDegrees(azimuthFromSouthWestward + 180)
}

/** The current solar hour angle, in degrees, at the given moment and
 * location -- 0° at local solar apparent noon, positive in the afternoon.
 * The exact inverse of the civil<->apparent-solar-time conversion used for
 * sunset (see rotations.ts's sunsetCivilHour), so a moment at the sunset
 * civil hour always yields exactly +daylightHalfHourAngleDeg here. */
export function currentHourAngleDeg(pragueTime: PragueTime, location: Location): number {
  const civilHour = pragueTime.hours + pragueTime.minutes / 60 + pragueTime.seconds / 3600
  const longitudeCorrectionHours = location.longitudeDeg / 15
  const apparentSolarHour = civilHour - utcOffsetHours(pragueTime.date, location.timeZone) + longitudeCorrectionHours
  return (apparentSolarHour - 12) * 15
}
