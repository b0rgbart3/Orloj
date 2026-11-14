import { daylightHalfHourAngleDeg } from './solarPosition'

export type Point = { x: number; y: number }

const PIVOT: Point = { x: 600, y: 600 }

// Tunable: the radius at which the celestial equator (declination 0)
// projects. Not derivable from the zodiac ring's own eccentric circle (see
// the module doc below) -- tuned by eye to feel at home next to it.
const PLATE_EQUATOR_RADIUS = 180

// Civil twilight. The real Orloj's plate shows only one twilight boundary;
// no reference photo exists in this repo to confirm its exact depression
// angle, so this is a reasonable starting value, not a researched one.
const TWILIGHT_DEPRESSION_DEG = -6

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI
}

function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360
}

/**
 * This module computes the fixed "horizon plate" -- the astrolabe tympan
 * behind the zodiac ring, latitude-specific and never rotating (see
 * ClockFace.tsx's `liveRotation`, which has no case for the background
 * layer). It deliberately does NOT read sunGlyphRadius.ts's
 * ZODIAC_RING_CENTER/RADIUS: those were hand-measured off one eccentric
 * circle in the ring artwork, which under-determines a stereographic
 * plate's pole/scale (3 unknowns) and is the wrong circle besides (the
 * ecliptic, not a declination parallel). The plate's own scale
 * (PLATE_EQUATOR_RADIUS above) is tuned independently by eye -- same as the
 * real Orloj, where the plate and the zodiac ring are two independently
 * crafted pieces stacked on one spindle, not derived from a shared formula.
 */

/** Unit direction, on screen, for the shared hand-baseline convention used
 * throughout rotations.ts: 0° points straight down (matching the fixed
 * roman_ring's bottom XII), increasing clockwise. Since this layer never
 * rotates, there's no CSS transform to lean on -- every point drawn here
 * has to bake this convention into its own (x,y) directly. */
function unitDirectionForHandAngle(angleDeg: number): Point {
  const theta = degToRad(normalizeDegrees(angleDeg))
  return { x: -Math.sin(theta), y: Math.cos(theta) }
}

/**
 * Stereographic projection of an equatorial-coordinate point onto the
 * plate: r(declination) = R·tan(45° − declination/2) (standard polar
 * stereographic projection, centered on the shared pivot = the north
 * celestial pole), at the hour angle's position in the hand-baseline
 * convention -- hour angle 0° (local solar noon) lands at 180° (the
 * dial's top, matching where civil noon already sits per
 * sunHandRotationDegrees). This equates hour angle directly with civil
 * angle, ignoring the small longitude/time-zone offset (and the larger,
 * DST-driven seasonal jump) sunsetCivilHour accounts for elsewhere --
 * consistent with this plate being latitude-only and date-independent.
 */
export function projectEquatorialPoint(declinationDeg: number, hourAngleDeg: number): Point {
  const r = PLATE_EQUATOR_RADIUS * Math.tan(degToRad(45 - declinationDeg / 2))
  const direction = unitDirectionForHandAngle(180 + hourAngleDeg)
  return { x: PIVOT.x + r * direction.x, y: PIVOT.y + r * direction.y }
}

/** Converts a horizon-system point (altitude, azimuth from North, clockwise
 * through East) to equatorial coordinates (declination, hour angle) for the
 * given latitude -- the inverse of solarAltitudeDeg/solarAzimuthDeg. */
export function equatorialFromHorizontal(
  altitudeDeg: number,
  azimuthDeg: number,
  latitudeDeg: number,
): { declinationDeg: number; hourAngleDeg: number } {
  const alt = degToRad(altitudeDeg)
  const az = degToRad(azimuthDeg)
  const lat = degToRad(latitudeDeg)
  const sinDec = Math.sin(alt) * Math.sin(lat) + Math.cos(alt) * Math.cos(lat) * Math.cos(az)
  const dec = Math.asin(Math.max(-1, Math.min(1, sinDec)))
  const sinH = (-Math.cos(alt) * Math.sin(az)) / Math.cos(dec)
  const cosH = (Math.sin(alt) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec))
  const H = Math.atan2(sinH, cosH)
  return { declinationDeg: radToDeg(dec), hourAngleDeg: radToDeg(H) }
}

/** Projects a point given directly in the horizon system (altitude,
 * azimuth) by converting to equatorial coordinates first. */
export function projectHorizonPoint(altitudeDeg: number, azimuthDeg: number, latitudeDeg: number): Point {
  const { declinationDeg, hourAngleDeg } = equatorialFromHorizontal(altitudeDeg, azimuthDeg, latitudeDeg)
  return projectEquatorialPoint(declinationDeg, hourAngleDeg)
}

/** Standard circle-through-3-points construction. */
export function circleThroughThreePoints(p1: Point, p2: Point, p3: Point): { center: Point; radius: number } {
  const ax = p1.x, ay = p1.y
  const bx = p2.x, by = p2.y
  const cx = p3.x, cy = p3.y
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
  const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d
  const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d
  const center = { x: ux, y: uy }
  const radius = Math.hypot(ax - ux, ay - uy)
  return { center, radius }
}

// Three well-spread, non-collinear azimuths used to fit the horizon/
// twilight circles -- any 3 distinct points on a true circle pin it down
// exactly, since stereographic projection maps circles to circles. 90°
// (due East) is included deliberately: it's the equinoctial sunrise/sunset
// point (declination 0 always crosses the horizon due east/west, for any
// latitude), reused directly for the "ortus"/"aurora" inscription anchor.
const CIRCLE_FIT_AZIMUTHS_DEG = [0, 90, 180] as const

function circleAtAltitude(altitudeDeg: number, latitudeDeg: number): { center: Point; radius: number } {
  const [p1, p2, p3] = CIRCLE_FIT_AZIMUTHS_DEG.map((az) => projectHorizonPoint(altitudeDeg, az, latitudeDeg))
  return circleThroughThreePoints(p1, p2, p3)
}

/**
 * The horizon circle (altitude 0°) for the given latitude -- the actual
 * day/twilight boundary the background layer paints. Off-center by
 * construction: the pivot is the North Celestial Pole (same point every
 * hand rotates around), and Prague's horizon is tilted relative to it --
 * only an observer standing at the pole itself would see a horizon
 * centered on that point. The eccentricity IS the latitude signal (zero
 * at the pole, maximal at the equator), and it's what lets the sun glyph,
 * sweeping in a circle around the pivot once a day, actually cross from
 * inside this circle to outside it -- a concentric boundary could never be
 * crossed by something moving at constant radius.
 */
export function horizonCircle(latitudeDeg: number): { center: Point; radius: number } {
  return circleAtAltitude(0, latitudeDeg)
}

/** The twilight boundary -- same construction as horizonCircle, 6° further
 * below the horizon, so it's always a bit larger and the two nest into a
 * day disc with a twilight ring around it. */
export function twilightCircle(latitudeDeg: number): { center: Point; radius: number } {
  return circleAtAltitude(TWILIGHT_DEPRESSION_DEG, latitudeDeg)
}

// Due East/West always cross the celestial equator (declination 0°) at the
// horizon, for any latitude -- hour angle ∓90° there. The inscriptions sit
// at fixed radii along those two directions rather than literally on the
// horizon/twilight circles: those circles pass close enough together here
// that the real points leave barely more than a label's-width of gap.
const INSCRIPTION_HORIZON_RADIUS = 230
const INSCRIPTION_TWILIGHT_RADIUS = 300

function equinoxDirectionPoint(hourAngleDeg: number, radius: number): Point {
  const direction = unitDirectionForHandAngle(180 + hourAngleDeg)
  return { x: PIVOT.x + radius * direction.x, y: PIVOT.y + radius * direction.y }
}

/** Anchor for "ortus" (sunrise, East) / "occasus" (sunset, West). */
export function sunriseOrSunsetInscriptionPoint(side: 'east' | 'west'): Point {
  return equinoxDirectionPoint(side === 'east' ? -90 : 90, INSCRIPTION_HORIZON_RADIUS)
}

/** Anchor for "aurora" (dawn, East) / "crepusculum" (dusk, West). */
export function dawnOrDuskInscriptionPoint(side: 'east' | 'west'): Point {
  return equinoxDirectionPoint(side === 'east' ? -90 : 90, INSCRIPTION_TWILIGHT_RADIUS)
}

const SOLSTICE_DECLINATION_DEG = 23.44

/** The circle through p1 and p2 whose center is constrained to the
 * vertical line x = axisX -- the same constraint nightAccentCircle/
 * twilightAccentCircle's centers already satisfy (both sit on x = PIVOT.x),
 * so any curve built this way automatically shares their curvature family
 * instead of fighting it. Returns null (astronomically degenerate, only
 * hit by the hourIndex=6 case below) if p1/p2 have nearly equal y, which
 * would send the center to infinity. */
function circleThroughTwoPointsOnAxis(p1: Point, p2: Point, axisX: number): { center: Point; radius: number } | null {
  if (Math.abs(p1.y - p2.y) < 1e-6) return null
  const cy =
    ((p1.x ** 2 - p2.x ** 2 + p1.y ** 2 - p2.y ** 2) - 2 * axisX * (p1.x - p2.x)) / (2 * (p1.y - p2.y))
  const center = { x: axisX, y: cy }
  const radius = Math.hypot(p1.x - center.x, p1.y - center.y)
  return { center, radius }
}

/**
 * The circle carrying one of the 11 interior Babylonian-hour boundaries
 * (hourIndex = 1..11, the boundary between hour `hourIndex` and
 * `hourIndex + 1` counting from sunrise) -- fit through its two real
 * endpoints (the winter- and summer-solstice positions) with the center
 * constrained to the same vertical axis as the background's day/twilight/
 * night circles, so it shares their curvature family by construction
 * instead of fighting it.
 *
 * hourIndex `k` and `12 - k` always land on the exact same circle (hour
 * angle at any declination is ±(halfDaylight)·|k/6 − 1|, equal magnitude,
 * opposite sign -- confirmed numerically) -- mirror images across the
 * vertical axis, so the renderer only needs to draw 5 of these (k=1..5),
 * each one covering both k and 12−k's boundary at once; it's drawn as a
 * full circle, with the twilight/night fills painted on top covering the
 * portion that isn't actually in the day zone. hourIndex 6 is the noon/
 * midnight boundary itself (hour angle is exactly 0 at every declination,
 * a real straight meridian line, not a curve) and returns null -- the
 * renderer draws that one as a plain line instead.
 */
export function babylonianHourDividerCircle(
  hourIndex: number,
  latitudeDeg: number,
): { center: Point; radius: number } | null {
  const angleAt = (declinationDeg: number) => daylightHalfHourAngleDeg(declinationDeg, latitudeDeg) * (hourIndex / 6 - 1)
  const start = projectEquatorialPoint(-SOLSTICE_DECLINATION_DEG, angleAt(-SOLSTICE_DECLINATION_DEG))
  const end = projectEquatorialPoint(SOLSTICE_DECLINATION_DEG, angleAt(SOLSTICE_DECLINATION_DEG))
  return circleThroughTwoPointsOnAxis(start, end, PIVOT.x)
}

/** The hourIndex=6 noon/midnight divider's two endpoints -- see
 * babylonianHourDividerCircle's doc comment for why this one is a straight
 * line rather than a circle. Latitude-independent: hour angle is 0 at
 * every declination regardless of latitude, so this is just the vertical
 * extent of the declination range along the axis. */
export function noonMeridianEndpoints(): [Point, Point] {
  return [
    projectEquatorialPoint(-SOLSTICE_DECLINATION_DEG, 0),
    projectEquatorialPoint(SOLSTICE_DECLINATION_DEG, 0),
  ]
}

// Numerals sit at a fixed radius rather than literally on the horizon
// circle: that circle's own radius varies wildly with direction (it blows
// up toward the noon/south side, a real and expected feature of polar
// stereographic projection -- see this module's doc comment -- but it
// would fling the hour-6/7 numerals far off-canvas if used literally).
const NUMERAL_RADIUS = 260

/** Where to place hour number `hourNumber`'s (1-12) numeral: a fixed radius
 * from the pivot, at the dial angle for that hour band's equinoctial
 * midpoint. */
export function babylonianHourLabelPoint(hourNumber: number, latitudeDeg: number): Point {
  const halfDaylightDeg = daylightHalfHourAngleDeg(0, latitudeDeg)
  const hourAngleDeg = halfDaylightDeg * ((hourNumber - 0.5) / 6 - 1)
  const direction = unitDirectionForHandAngle(180 + hourAngleDeg)
  return { x: PIVOT.x + NUMERAL_RADIUS * direction.x, y: PIVOT.y + NUMERAL_RADIUS * direction.y }
}
