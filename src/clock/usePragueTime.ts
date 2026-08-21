import { useEffect, useState } from 'react'

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
const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

function getPragueTime(date: Date): PragueTime {
  const parts = formatter.formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  return {
    date,
    hours: get('hour') % 24,
    minutes: get('minute'),
    seconds: get('second'),
  }
}

/** Live, continuously-updating current time in Prague. */
export function usePragueTime(): PragueTime {
  const [time, setTime] = useState(() => getPragueTime(new Date()))

  useEffect(() => {
    const id = setInterval(() => setTime(getPragueTime(new Date())), 1000)
    return () => clearInterval(id)
  }, [])

  return time
}
