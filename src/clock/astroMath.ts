export function toJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5
}

export function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360
}
