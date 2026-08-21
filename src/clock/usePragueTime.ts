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

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  dateStyle: 'medium',
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

export function formatPragueDate(date: Date): string {
  return dateFormatter.format(date)
}
