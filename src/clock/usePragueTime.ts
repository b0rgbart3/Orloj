import type { Location } from './location'

export type PragueTime = {
  date: Date
  hours: number
  minutes: number
  seconds: number
}

// Intl's timeZone support resolves a location's UTC offset (including DST)
// from the browser's own tz database, so daylight saving is handled
// automatically — no manual offset math, no DST bugs around switchovers.
// Formatters are cached per (kind, timeZone) pair rather than built once at
// module scope, since the time zone is now a parameter, not a constant.
const formatterCache = new Map<string, Intl.DateTimeFormat>()

function cachedFormatter(kind: string, timeZone: string, build: () => Intl.DateTimeFormat): Intl.DateTimeFormat {
  const key = `${kind}:${timeZone}`
  let formatter = formatterCache.get(key)
  if (!formatter) {
    formatter = build()
    formatterCache.set(key, formatter)
  }
  return formatter
}

function timeFormatter(timeZone: string): Intl.DateTimeFormat {
  return cachedFormatter('time', timeZone, () =>
    new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  )
}

function datePartsFormatter(timeZone: string): Intl.DateTimeFormat {
  return cachedFormatter('dateParts', timeZone, () =>
    new Intl.DateTimeFormat('en-GB', {
      timeZone,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  )
}

function inputValuesFormatter(timeZone: string): Intl.DateTimeFormat {
  return cachedFormatter('inputValues', timeZone, () =>
    new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
  )
}

export function getPragueTime(date: Date, location: Location): PragueTime {
  const parts = timeFormatter(location.timeZone).formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  return {
    date,
    hours: get('hour') % 24,
    minutes: get('minute'),
    seconds: get('second'),
  }
}

export type PragueDateParts = {
  day: string
  month: string
  year: string
}

export function getPragueDateParts(date: Date, location: Location): PragueDateParts {
  const parts = datePartsFormatter(location.timeZone).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return {
    day: get('day'),
    month: get('month'),
    year: get('year'),
  }
}

// Values pre-formatted for native <input type="date"> / <input type="time">,
// which require "YYYY-MM-DD" and "HH:MM" regardless of locale.
export function getPragueDateTimeInputValues(date: Date, location: Location): { date: string; time: string } {
  const parts = inputValuesFormatter(location.timeZone).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
  }
}

// Resolves a location's UTC offset at a given instant by comparing how that
// instant renders in its time zone vs. its own UTC components.
function getOffsetMs(utcInstantMs: number, timeZone: string): number {
  const parts = inputValuesFormatter(timeZone).formatToParts(new Date(utcInstantMs))
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  const asIfUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'))
  return asIfUtc - utcInstantMs
}

// Converts a wall-clock date/time meant as local time at the given location
// (e.g. from a date/time picker) into the UTC instant it represents. Two
// passes handle the (rare) case where the offset itself shifts within the
// adjustment.
export function pragueWallTimeToUtc(
  input: { year: number; month: number; day: number; hour: number; minute: number },
  location: Location,
): Date {
  const naiveUtcMs = Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute)
  let instantMs = naiveUtcMs - getOffsetMs(naiveUtcMs, location.timeZone)
  instantMs = naiveUtcMs - getOffsetMs(instantMs, location.timeZone)
  return new Date(instantMs)
}
