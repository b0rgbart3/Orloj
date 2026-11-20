/** A geographic location the clock's astronomy is computed for: latitude
 * and longitude for the sidereal/sunset/horizon-plate math, plus the IANA
 * time zone used to render civil wall-clock time there. Kept as one unit
 * because a future location change should move all three together -- the
 * clock's civil hour, its sunset ring, and its background plate all need
 * to agree on where "here" is. */
export type Location = {
  latitudeDeg: number
  longitudeDeg: number
  timeZone: string
}

export const PRAGUE_LOCATION: Location = {
  latitudeDeg: 50.0755,
  longitudeDeg: 14.4378,
  timeZone: 'Europe/Prague',
}

/** Named test locations for the `?location=` debug override (see
 * useLocationDebug) -- lets the latitude-driven background plate (and,
 * later, every other location-aware layer) be checked visually at
 * latitudes other than Prague's before a real location picker exists.
 * Includes two southern-hemisphere cities (negative latitude) deliberately,
 * to exercise horizonPlate.ts/solarPosition.ts's formulas outside the
 * northern-hemisphere case they were originally tuned against. */
export const DEBUG_LOCATIONS: Record<string, Location> = {
  prague: PRAGUE_LOCATION,
  reykjavik: { latitudeDeg: 64.1466, longitudeDeg: -21.9426, timeZone: 'Atlantic/Reykjavik' },
  cairo: { latitudeDeg: 30.0444, longitudeDeg: 31.2357, timeZone: 'Africa/Cairo' },
  rio: { latitudeDeg: -22.9068, longitudeDeg: -43.1729, timeZone: 'America/Sao_Paulo' },
  capetown: { latitudeDeg: -33.9249, longitudeDeg: 18.4241, timeZone: 'Africa/Johannesburg' },
  melbourne: { latitudeDeg: -37.8136, longitudeDeg: 144.9631, timeZone: 'Australia/Melbourne' },
  sydney: { latitudeDeg: -33.8688, longitudeDeg: 151.2093, timeZone: 'Australia/Sydney' },
}
