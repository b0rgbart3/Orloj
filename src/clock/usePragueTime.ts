const TIME_ZONE = 'Europe/Prague'

export type PragueTime = {
  date: Date
  hours: number
  minutes: number
  seconds: number
}

// Intl's timeZone support resolves Prague's UTC offset (CET/CEST) from the
// browser's own tz database, so daylight saving is handled automatically —
// no manual offset math, no DST bugs around the March/October switchover.
const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

const datePartsFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function getPragueTime(date: Date): PragueTime {
  const parts = timeFormatter.formatToParts(date)
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

export function getPragueDateParts(date: Date): PragueDateParts {
  const parts = datePartsFormatter.formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return {
    day: get('day'),
    month: get('month'),
    year: get('year'),
  }
}

const inputValuesFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

// Values pre-formatted for native <input type="date"> / <input type="time">,
// which require "YYYY-MM-DD" and "HH:MM" regardless of locale.
export function getPragueDateTimeInputValues(date: Date): { date: string; time: string } {
  const parts = inputValuesFormatter.formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
  }
}

// Resolves Prague's UTC offset (CET/CEST) at a given instant by comparing
// how that instant renders in Prague vs. its own UTC components.
function getPragueOffsetMs(utcInstantMs: number): number {
  const parts = inputValuesFormatter.formatToParts(new Date(utcInstantMs))
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  const asIfUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'))
  return asIfUtc - utcInstantMs
}

// Converts a wall-clock date/time meant as Prague local time (e.g. from a
// date/time picker) into the UTC instant it represents. Two passes handle
// the (rare) case where the offset itself shifts within the adjustment.
export function pragueWallTimeToUtc(input: {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}): Date {
  const naiveUtcMs = Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute)
  let instantMs = naiveUtcMs - getPragueOffsetMs(naiveUtcMs)
  instantMs = naiveUtcMs - getPragueOffsetMs(instantMs)
  return new Date(instantMs)
}
