import type { PragueTime } from './usePragueTime'

/**
 * Degrees to rotate the sun-dial layer for the given Prague time.
 *
 * The artwork's unrotated baseline points straight down toward the sphere,
 * which lines up with the fixed roman_ring's bottom XII (midnight). Civil
 * hours advance clockwise at 15°/hour (24 numeral positions over 360° on
 * the doubled I-XII ring), so noon — top XII — is exactly 180° from the
 * baseline.
 */
export function sunHandRotationDegrees({ hours, minutes, seconds }: PragueTime): number {
  const fractionalHour = hours + minutes / 60 + seconds / 3600
  return fractionalHour * 15
}
