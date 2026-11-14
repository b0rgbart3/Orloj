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
