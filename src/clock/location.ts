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

/** A named, user-facing entry in the location picker: everywhere a bare
 * Location is needed (rotation math, time formatting, the horizon plate)
 * a NamedLocation works too, since it's a strict superset. */
export type NamedLocation = Location & {
  id: string
  city: string
  country: string
}

/** Renders a NamedLocation the way the picker and its related UI (the
 * date/time footnote, the date/time modal) display it: "City, Country". */
export function locationLabel(location: NamedLocation): string {
  return `${location.city}, ${location.country}`
}

/** Curated list for the location picker -- ~39 cities chosen to spread
 * across every inhabited continent and a wide range of latitudes (from
 * Reykjavik's 64°N to Singapore's near-equatorial 1°N), so the
 * latitude-driven background plate and sidereal/civil time math both get
 * visibly exercised across the set, not just varied in name. Deliberately
 * short rather than exhaustive -- a full IANA city/timezone list would
 * turn the picker into an unmanageable scroll. The first entry (Prague)
 * is the app's default location. Ids are stable identifiers, also used by
 * the `?location=` debug override (see useLocationDebug) -- the original
 * seven ids (prague, reykjavik, cairo, rio, capetown, melbourne, sydney)
 * are kept unchanged so existing debug links keep working. */
export const LOCATIONS: NamedLocation[] = [
  { id: 'prague', city: 'Prague', country: 'Czech Republic', latitudeDeg: 50.0755, longitudeDeg: 14.4378, timeZone: 'Europe/Prague' },
  { id: 'london', city: 'London', country: 'United Kingdom', latitudeDeg: 51.5074, longitudeDeg: -0.1278, timeZone: 'Europe/London' },
  { id: 'paris', city: 'Paris', country: 'France', latitudeDeg: 48.8566, longitudeDeg: 2.3522, timeZone: 'Europe/Paris' },
  { id: 'reykjavik', city: 'Reykjavik', country: 'Iceland', latitudeDeg: 64.1466, longitudeDeg: -21.9426, timeZone: 'Atlantic/Reykjavik' },
  { id: 'moscow', city: 'Moscow', country: 'Russia', latitudeDeg: 55.7558, longitudeDeg: 37.6173, timeZone: 'Europe/Moscow' },
  { id: 'rome', city: 'Rome', country: 'Italy', latitudeDeg: 41.9028, longitudeDeg: 12.4964, timeZone: 'Europe/Rome' },
  { id: 'berlin', city: 'Berlin', country: 'Germany', latitudeDeg: 52.5200, longitudeDeg: 13.4050, timeZone: 'Europe/Berlin' },
  { id: 'istanbul', city: 'Istanbul', country: 'Turkey', latitudeDeg: 41.0082, longitudeDeg: 28.9784, timeZone: 'Europe/Istanbul' },
  { id: 'athens', city: 'Athens', country: 'Greece', latitudeDeg: 37.9838, longitudeDeg: 23.7275, timeZone: 'Europe/Athens' },
  { id: 'cairo', city: 'Cairo', country: 'Egypt', latitudeDeg: 30.0444, longitudeDeg: 31.2357, timeZone: 'Africa/Cairo' },
  { id: 'lagos', city: 'Lagos', country: 'Nigeria', latitudeDeg: 6.5244, longitudeDeg: 3.3792, timeZone: 'Africa/Lagos' },
  { id: 'nairobi', city: 'Nairobi', country: 'Kenya', latitudeDeg: -1.2921, longitudeDeg: 36.8219, timeZone: 'Africa/Nairobi' },
  { id: 'capetown', city: 'Cape Town', country: 'South Africa', latitudeDeg: -33.9249, longitudeDeg: 18.4241, timeZone: 'Africa/Johannesburg' },
  { id: 'johannesburg', city: 'Johannesburg', country: 'South Africa', latitudeDeg: -26.2041, longitudeDeg: 28.0473, timeZone: 'Africa/Johannesburg' },
  { id: 'accra', city: 'Accra', country: 'Ghana', latitudeDeg: 5.6037, longitudeDeg: -0.1870, timeZone: 'Africa/Accra' },
  { id: 'dubai', city: 'Dubai', country: 'UAE', latitudeDeg: 25.2048, longitudeDeg: 55.2708, timeZone: 'Asia/Dubai' },
  { id: 'telaviv', city: 'Tel Aviv', country: 'Israel', latitudeDeg: 32.0853, longitudeDeg: 34.7818, timeZone: 'Asia/Jerusalem' },
  { id: 'delhi', city: 'New Delhi', country: 'India', latitudeDeg: 28.6139, longitudeDeg: 77.2090, timeZone: 'Asia/Kolkata' },
  { id: 'singapore', city: 'Singapore', country: 'Singapore', latitudeDeg: 1.3521, longitudeDeg: 103.8198, timeZone: 'Asia/Singapore' },
  { id: 'beijing', city: 'Beijing', country: 'China', latitudeDeg: 39.9042, longitudeDeg: 116.4074, timeZone: 'Asia/Shanghai' },
  { id: 'hongkong', city: 'Hong Kong', country: 'China', latitudeDeg: 22.3193, longitudeDeg: 114.1694, timeZone: 'Asia/Hong_Kong' },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', latitudeDeg: 35.6762, longitudeDeg: 139.6503, timeZone: 'Asia/Tokyo' },
  { id: 'seoul', city: 'Seoul', country: 'South Korea', latitudeDeg: 37.5665, longitudeDeg: 126.9780, timeZone: 'Asia/Seoul' },
  { id: 'bangkok', city: 'Bangkok', country: 'Thailand', latitudeDeg: 13.7563, longitudeDeg: 100.5018, timeZone: 'Asia/Bangkok' },
  { id: 'jakarta', city: 'Jakarta', country: 'Indonesia', latitudeDeg: -6.2088, longitudeDeg: 106.8456, timeZone: 'Asia/Jakarta' },
  { id: 'manila', city: 'Manila', country: 'Philippines', latitudeDeg: 14.5995, longitudeDeg: 120.9842, timeZone: 'Asia/Manila' },
  { id: 'melbourne', city: 'Melbourne', country: 'Australia', latitudeDeg: -37.8136, longitudeDeg: 144.9631, timeZone: 'Australia/Melbourne' },
  { id: 'sydney', city: 'Sydney', country: 'Australia', latitudeDeg: -33.8688, longitudeDeg: 151.2093, timeZone: 'Australia/Sydney' },
  { id: 'auckland', city: 'Auckland', country: 'New Zealand', latitudeDeg: -36.8509, longitudeDeg: 174.7645, timeZone: 'Pacific/Auckland' },
  { id: 'honolulu', city: 'Honolulu', country: 'USA', latitudeDeg: 21.3069, longitudeDeg: -157.8583, timeZone: 'Pacific/Honolulu' },
  { id: 'losangeles', city: 'Los Angeles', country: 'USA', latitudeDeg: 34.0522, longitudeDeg: -118.2437, timeZone: 'America/Los_Angeles' },
  { id: 'vancouver', city: 'Vancouver', country: 'Canada', latitudeDeg: 49.2827, longitudeDeg: -123.1207, timeZone: 'America/Vancouver' },
  { id: 'chicago', city: 'Chicago', country: 'USA', latitudeDeg: 41.8781, longitudeDeg: -87.6298, timeZone: 'America/Chicago' },
  { id: 'newyork', city: 'New York', country: 'USA', latitudeDeg: 40.7128, longitudeDeg: -74.0060, timeZone: 'America/New_York' },
  { id: 'toronto', city: 'Toronto', country: 'Canada', latitudeDeg: 43.6532, longitudeDeg: -79.3832, timeZone: 'America/Toronto' },
  { id: 'mexicocity', city: 'Mexico City', country: 'Mexico', latitudeDeg: 19.4326, longitudeDeg: -99.1332, timeZone: 'America/Mexico_City' },
  { id: 'rio', city: 'Rio de Janeiro', country: 'Brazil', latitudeDeg: -22.9068, longitudeDeg: -43.1729, timeZone: 'America/Sao_Paulo' },
  { id: 'santiago', city: 'Santiago', country: 'Chile', latitudeDeg: -33.4489, longitudeDeg: -70.6693, timeZone: 'America/Santiago' },
  { id: 'buenosaires', city: 'Buenos Aires', country: 'Argentina', latitudeDeg: -34.6037, longitudeDeg: -58.3816, timeZone: 'America/Argentina/Buenos_Aires' },
]

export const DEFAULT_LOCATION: NamedLocation = LOCATIONS[0]

/** `?location=<key>` debug override lookup (see useLocationDebug), derived
 * from LOCATIONS so the debug links and the picker always agree on each
 * city's coordinates/timezone. */
export const DEBUG_LOCATIONS: Record<string, NamedLocation> = Object.fromEntries(
  LOCATIONS.map((location) => [location.id, location]),
)
