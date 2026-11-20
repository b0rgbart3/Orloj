import { daylightHalfHourAngleDeg } from './solarPosition'

export type Point = { x: number; y: number }

const PIVOT: Point = { x: 600, y: 600 }

// Tunable: the radius at which the celestial equator (declination 0)
// projects. Not derivable from the zodiac ring's own eccentric circle (see
// the module doc below) -- chosen to balance the horizon and twilight
// circles' fit against a hand-tuned reference match (see projectEquatorialPoint's
// doc comment): the twilight circle matches almost exactly at R≈239, the
// horizon circle at R≈257; 248 splits the difference.
const PLATE_EQUATOR_RADIUS = 248

// Astronomical twilight: the sun is far enough below the horizon that the
// sky is fully dark. Researched and confirmed against the real Orloj's
// documented design (only two almucantars are painted on the plate:
// horizon at 0° and astronomical twilight at -18°).
const TWILIGHT_DEPRESSION_DEG = -18

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
 *
 * Pole convention: this plate is centered on the SOUTH celestial pole, not
 * the north. A standard handheld astrolabe projects from the south pole
 * (putting the north pole at the center), but Jan Šindel's 1410 design for
 * the Orloj deliberately inverts this -- projecting from the north pole
 * instead, so the dial matches the real sky when facing south at midday.
 * Verified numerically: fit against hand-placed reference circles for the
 * horizon (0°) and astronomical twilight (-18°) almucantars, this
 * pole-flipped formula reproduces their offset/radius within a few percent
 * using one shared scale constant, where the standard (north-pole-centered)
 * formula was mathematically provably unable to produce them at any scale
 * (the required declination had no real solution).
 *
 * Southern-hemisphere latitudes (negative) need the declination term
 * negated before projecting (see projectEquatorialPoint) -- without that,
 * this formula centers the plate on the observer's own ELEVATED pole
 * rather than their hidden one (the opposite of the Prague-verified
 * convention above), and for latitudes roughly in the 0 to -40° range,
 * facing due north at a small negative altitude lands close enough to the
 * hidden North Celestial Pole's own declination that r = R·tan(45° +
 * declination/2) blows up (confirmed numerically: Rio, -22.9°, put the
 * twilight circle's radius past 2900 with its center 2800px off-canvas).
 * Negating declination for these latitudes swaps which pole is centered
 * vs. projected-from, removing the blowup -- verified to reproduce the
 * same eccentricity direction and a radius that grows smoothly toward the
 * equator (Prague 50°→323, Cape Town -34°→444, Cairo 30°→495, Rio
 * -23°→637), consistent with the "zero at the pole, maximal at the
 * equator" eccentricity rule this module already relies on.
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
 * plate: r(declination) = R·tan(45° + declination/2) -- note the PLUS,
 * not the textbook minus. A standard astrolabe plate (projected from the
 * south pole, north pole at center) uses tan(45° − δ/2); this plate is
 * centered on the SOUTH celestial pole instead (see this module's doc
 * comment for why), which flips the sign on the declination term. Angle
 * uses the hour angle's position in the hand-baseline convention -- hour
 * angle 0° (local solar noon) lands at 180° (the dial's top, matching
 * where civil noon already sits per sunHandRotationDegrees). This equates
 * hour angle directly with civil angle, ignoring the small longitude/
 * time-zone offset (and the larger, DST-driven seasonal jump)
 * sunsetCivilHour accounts for elsewhere -- consistent with this plate
 * being latitude-only and date-independent.
 *
 * `latitudeDeg` only decides the sign flip below, not the projection
 * itself -- for latitudeDeg < 0 the declination term is negated first, so
 * the plate centers on the observer's own hidden pole rather than their
 * elevated one (see this module's doc comment for why the un-negated
 * formula breaks down south of the equator).
 */
export function projectEquatorialPoint(declinationDeg: number, hourAngleDeg: number, latitudeDeg: number): Point {
  const effectiveDeclinationDeg = latitudeDeg < 0 ? -declinationDeg : declinationDeg
  const r = PLATE_EQUATOR_RADIUS * Math.tan(degToRad(45 + effectiveDeclinationDeg / 2))
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
  return projectEquatorialPoint(declinationDeg, hourAngleDeg, latitudeDeg)
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

export type TealBand = {
  innerLeft: { center: Point; radius: number }
  innerRight: { center: Point; radius: number }
  outerLeft: { center: Point; radius: number }
  outerRight: { center: Point; radius: number }
}

/**
 * The 2 pairs of decorative "teal band" circles behind the horizon disc.
 * Inspired by the user's own traced reference of the real plate
 * (reference2.svg) -- that trace shows 2 pairs of duplicated-and-shifted
 * circles behind the horizon disc, the same technique this reproduces --
 * but NOT positioned using the reference's own numbers: that reference
 * doesn't share this plate's hour-divider arcs at all (it's a plain photo
 * trace, no construction lines), so there was nothing in it to align the
 * bands to, and earlier attempts at an independently-constructed
 * approximate circle (matching radius and/or a single touching point)
 * were visibly off everywhere except the one point/latitude they were
 * tuned for -- two different circles can coincide at, at most, 2 points;
 * matching an arc's curve along its whole length requires actually being
 * that arc's own circle, not a lookalike.
 *
 * So instead, each of the 4 teal circles just *is* one of the plate's own
 * hour-divider circles directly: the inner pair is hourIndex 1 and its
 * mirror hourIndex 11, the outer pair is hourIndex 2 and its mirror
 * hourIndex 10 (confirmed exact mirrors of each other -- same radius and
 * center.y, center.x reflected across the pivot -- in
 * babylonianHourDividerCircle's own doc comment). This guarantees the
 * teal fill's edge exactly coincides with that arc's own gold stroke at
 * every point, for any latitude, by construction -- not an approximation
 * tuned for one case.
 */
export function tealBand(latitudeDeg: number): TealBand {
  const arc1 = babylonianHourDividerCircle(1, latitudeDeg)
  const arc2 = babylonianHourDividerCircle(2, latitudeDeg)
  const arc10 = babylonianHourDividerCircle(10, latitudeDeg)
  const arc11 = babylonianHourDividerCircle(11, latitudeDeg)
  if (!arc1 || !arc2 || !arc10 || !arc11) {
    throw new Error('unexpected null divider circle for tealBand')
  }
  return { innerLeft: arc1, innerRight: arc11, outerLeft: arc2, outerRight: arc10 }
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

/**
 * The circle approximating one of the 11 interior Babylonian-hour
 * boundaries (hourIndex = 1..11, the boundary between hour `hourIndex` and
 * `hourIndex + 1` counting from sunrise) -- the classical astrolabe
 * construction: sample the curve's true position at the winter solstice,
 * the equinox, and the summer solstice, then fit the unique circle through
 * those 3 real points. An unequal-hour curve isn't a true circle across
 * the whole year, but this 3-point fit is the historically-accurate
 * approximation.
 *
 * Two other constructions were tried and rejected. A 2-point fit through
 * just the winter/summer solstice points with the center forced onto the
 * pivot's vertical axis -- motivated by "hourIndex `k` and `12 - k` are
 * mirror images," true, but that's a statement about two *different*
 * curves, not a self-symmetry of curve `k` alone; forcing it produced
 * absurd circles (hourIndex 3 at Prague's latitude: center y = -731,
 * radius 1193). And a fit through the horizon circle's own north/south
 * points plus one hour-specific equinox point -- geometrically tidy (every
 * hour circle's center.y landed exactly on horizon.center.y) but wrong:
 * it forces every arc through the *same* two fixed points near the top and
 * bottom of the horizon circle, so none of them ever cross near its left
 * or right edges the way the real dial's arcs visibly do. The 3-real-point
 * fit below has neither flaw -- confirmed numerically (Prague's latitude):
 * hourIndex 1's circle has its topmost point inside the globe's radius
 * (fanning in from behind it) and its leftmost point outside the horizon
 * circle entirely (crossing out through its left edge into the teal
 * background), matching the real dial.
 *
 * Mirror symmetry between `k` and `12 - k` still holds (same radius, same
 * center.y, center.x mirrored across PIVOT.x) since hourIndex `12 - k`'s
 * hour angle is the exact negation of `k`'s at every declination, so all 3
 * of its sample points are `k`'s sample points mirrored across x = PIVOT.x.
 *
 * hourIndex 6 is the noon/midnight boundary itself (hour angle is exactly
 * 0 at every declination, a real straight meridian line, not a curve, and
 * its 3 sample points are collinear on x = PIVOT.x) and returns null -- the
 * renderer draws that one as a plain vertical line at x = PIVOT.x instead,
 * running the full height of the plate rather than stopping at the
 * solstice points the way this function's own sample points do.
 */
export function babylonianHourDividerCircle(
  hourIndex: number,
  latitudeDeg: number,
): { center: Point; radius: number } | null {
  if (hourIndex === 6) return null
  const angleAt = (declinationDeg: number) => daylightHalfHourAngleDeg(declinationDeg, latitudeDeg) * (hourIndex / 6 - 1)
  const winter = projectEquatorialPoint(-SOLSTICE_DECLINATION_DEG, angleAt(-SOLSTICE_DECLINATION_DEG), latitudeDeg)
  const equinox = projectEquatorialPoint(0, angleAt(0), latitudeDeg)
  const summer = projectEquatorialPoint(SOLSTICE_DECLINATION_DEG, angleAt(SOLSTICE_DECLINATION_DEG), latitudeDeg)
  return circleThroughThreePoints(winter, equinox, summer)
}

// Matches the original hand-traced background.svg's own painted extent
// (its sky circle: cx=600.14,cy=588.29,r=360.5, from before that file was
// retired) rather than the whole 1200x1200 canvas -- everything else
// (roman-ring, ...) is implicitly bounded by its own artwork; this layer
// has to clip itself explicitly instead. Exported so HorizonPlateLayer.tsx's
// own clip-path and this module's numeral placement agree on the same
// boundary by construction, rather than risking two hand-copied 385s
// drifting apart.
export const PLATE_OUTER_RADIUS = 385

// A fixed radius, well inside the roman-numeral ring that sits just
// outside this plate, and well outside the globe -- chosen by eye, not
// derived.
const NUMERAL_RADIUS = 300

// Degrees of margin pulled back from the exact point where the
// NUMERAL_RADIUS circle crosses the horizon circle -- enough to keep
// numeral 1/12 legibly clear of the horizon disc's own edge rather than
// bisected by it, without giving back much of the reach. 9, not 4: a ~5%
// pullback on the resulting half-span, by request -- a prior attempt at
// 14 (a ~10% pullback) overshot.
const NUMERAL_EDGE_MARGIN_DEG = 9

/** The hand-baseline angle (0 = down, clockwise) for a point relative to
 * the pivot -- the inverse of unitDirectionForHandAngle. */
function handAngleForDirection(direction: Point): number {
  return radToDeg(Math.atan2(-direction.x, direction.y))
}

/**
 * Where to place hour number `hourNumber`'s (1-12) numeral: evenly spaced
 * by angle around one fixed circle (NUMERAL_RADIUS), not pinned to each
 * hour's own divider arc -- an earlier version placed each numeral right
 * next to its own arc's position, but the arcs themselves fan out
 * unevenly (tightly bunched near noon, spread wide near sunrise/sunset),
 * so that approach needed an ad hoc per-numeral nudge to stop adjacent
 * labels from colliding near the globe.
 *
 * Numeral 1 and numeral 12's angles aren't derived from the sunrise/
 * sunset hour angle (±daylightHalfHourAngleDeg) -- that bounds where the
 * *sun* crosses the horizon, which is a materially smaller angle than
 * where the NUMERAL_RADIUS circle itself crosses the horizon *disc*
 * (confirmed numerically, Prague's latitude: the horizon crossing is at
 * ±103.2°, well beyond ±halfDaylight's ~±65-70° this time of year) --
 * using the smaller sun-crossing angle was why numeral 1/12 fell well
 * short of the horizon disc's own edge. Instead, 1 and 12 sit just inside
 * (NUMERAL_EDGE_MARGIN_DEG) the angle where their own circle actually
 * crosses the horizon disc, found via circle-circle intersection, so they
 * land just outside the horizon disc's left/right edge as drawn. The
 * other 10 numerals are evenly spaced (by angle) between those two.
 */
export function babylonianHourNumeralPoint(hourNumber: number, latitudeDeg: number): Point {
  const horizon = horizonCircle(latitudeDeg)
  const numeralCircle = { center: PIVOT, radius: NUMERAL_RADIUS }
  const dx = horizon.center.x - PIVOT.x
  const dy = horizon.center.y - PIVOT.y
  const d = Math.hypot(dx, dy)
  const a = (numeralCircle.radius ** 2 - horizon.radius ** 2 + d ** 2) / (2 * d)
  const h = Math.sqrt(Math.max(0, numeralCircle.radius ** 2 - a ** 2))
  const midX = PIVOT.x + (a * dx) / d
  const midY = PIVOT.y + (a * dy) / d
  const rx = (-dy * h) / d
  const ry = (dx * h) / d
  // The crossing on the east/morning (negative hour-angle) side -- the
  // other crossing (midX - rx, midY - ry) is its mirror image.
  const crossingAngleDeg = handAngleForDirection({
    x: (midX + rx - PIVOT.x) / NUMERAL_RADIUS,
    y: (midY + ry - PIVOT.y) / NUMERAL_RADIUS,
  })
  const startHourAngleDeg = crossingAngleDeg - 180 + NUMERAL_EDGE_MARGIN_DEG
  const endHourAngleDeg = -startHourAngleDeg
  const hourAngleDeg = startHourAngleDeg + ((hourNumber - 1) / 11) * (endHourAngleDeg - startHourAngleDeg)
  const direction = unitDirectionForHandAngle(180 + hourAngleDeg)
  return { x: PIVOT.x + NUMERAL_RADIUS * direction.x, y: PIVOT.y + NUMERAL_RADIUS * direction.y }
}

export type LabelPlacement = { point: Point; rotationDeg: number }

// How far inside the globe's own edge (and the plate's own outer clip) a
// candidate point has to stay -- without this margin the scan below would
// happily pick a point one pixel clear of either edge, which looks just as
// clipped in practice as actually overlapping it. Wide enough to also cover
// half the inscription's own rendered width poking past its center point,
// not just the point itself.
const LABEL_GLOBE_CLEARANCE = 35
const LABEL_OUTER_CLIP_CLEARANCE = 15

// The radial thickness a candidate needs for the inscription to actually
// fit without the font crowding the horizon disc on one side and the
// circle's own edge on the other. Candidates below this are only used if
// nothing clears it anywhere (see the pool fallback below) -- a floor to
// aim for, not a hard requirement, since some latitudes' sliver may never
// reach it.
const LABEL_MIN_THICKNESS = 20

// Fixed pixel nudge applied to the final chosen point, back toward the
// horizon-side edge of the sliver (see ortvsInscriptionPlacement's doc
// comment) -- a by-eye correction on top of the equidistant placement
// above, not derived from any geometric constraint.
const LABEL_HORIZON_SIDE_NUDGE = 3.5

/**
 * Shared by ortvsInscriptionPlacement and occasvsInscriptionPlacement --
 * ORTVS (sunrise, hourIndex 1, numeral 1) and OCCASVS (sunset, hourIndex
 * 11, numeral 12) sit in mirror-image teal slivers (hourIndex 11's own
 * circle is the exact x-reflection of hourIndex 1's -- same radius, same
 * center.y, center.x reflected across the pivot, per
 * babylonianHourDividerCircle's own doc comment), so one parameterized
 * scan covers both rather than duplicating it with signs flipped by hand.
 *
 * Finds where to place a word inside the teal sliver that the given
 * hourIndex's own circle leaves visible past the horizon disc's edge (see
 * tealBand's doc comment -- that sliver IS this circle, not an
 * approximation of it), clear of the globe emblem and the plate's own
 * outer edge, and as far as this latitude's geometry allows from the
 * given numeral itself.
 *
 * Scans angularly around the hourIndex circle's own center (not the pivot
 * -- this circle is itself off-center, so a pivot-centered scan would not
 * track its own shape), and at each angle finds the radial sub-range
 * clear of the horizon disc, the globe, and the plate's outer edge. The
 * numeral sits at this sliver's own angular midpoint by construction (see
 * babylonianHourNumeralPoint's doc comment), so among candidates with a
 * workable thickness, this picks whichever has matching clearance to the
 * numeral on one side and the globe's edge on the other -- centered
 * across the whole numeral-to-globe gap, not just pushed as far from the
 * numeral as the scan allows (that was tried first and visually landed
 * hugging the globe, off-center the other way). If no candidate reaches
 * LABEL_MIN_THICKNESS, this falls back to the full candidate pool rather
 * than failing outright, since a cramped-but-visible placement beats none.
 *
 * minNumeralClearancePx further restricts that pool, when possible, to
 * candidates at least this far from the numeral before the equidistant
 * pick runs -- needed because ORTVS and OCCASVS share this one scan but
 * not one word length: OCCASVS (7 letters) rendered at the same
 * clearance ORTVS (5 letters) is comfortable with visibly crowds the
 * numeral at some latitudes (confirmed for Rio, where both sides land at
 * an identical, perfectly mirrored 80.6px by construction -- plenty for
 * ORTVS, not for OCCASVS). If nothing in the thickness-filtered pool
 * reaches this minimum, the equidistant pick falls back to that pool
 * unrestricted, same spirit as the LABEL_MIN_THICKNESS fallback above.
 *
 * Returns a rotation (degrees, already flipped to stay within ±90° of
 * horizontal) matching the tangent of the hourIndex circle at the chosen
 * point, so the inscription follows the same arch the teal sliver itself
 * curves along rather than sitting level against it.
 */
function sunriseOrSunsetSliverPlacement(
  latitudeDeg: number,
  globeRadius: number,
  hourIndex: number,
  numeralNumber: number,
  minNumeralClearancePx: number,
): LabelPlacement {
  const horizon = horizonCircle(latitudeDeg)
  const arc = babylonianHourDividerCircle(hourIndex, latitudeDeg)
  if (!arc) {
    throw new Error(`unexpected null hourIndex=${hourIndex} divider circle for sunriseOrSunsetSliverPlacement`)
  }
  const numeral = babylonianHourNumeralPoint(numeralNumber, latitudeDeg)

  const candidates: {
    angleDeg: number
    thickness: number
    point: Point
    distToNumeral: number
    distToGlobeEdge: number
  }[] = []
  for (let angleDeg = 0; angleDeg < 360; angleDeg += 1) {
    const theta = degToRad(angleDeg)
    const direction = { x: Math.cos(theta), y: Math.sin(theta) }
    let rMin: number | null = null
    let rMax: number | null = null
    for (let r = 10; r <= arc.radius; r += 2) {
      const point = { x: arc.center.x + r * direction.x, y: arc.center.y + r * direction.y }
      const distToHorizonCenter = Math.hypot(point.x - horizon.center.x, point.y - horizon.center.y)
      const distToPivot = Math.hypot(point.x - PIVOT.x, point.y - PIVOT.y)
      const clear =
        distToHorizonCenter > horizon.radius &&
        distToPivot > globeRadius + LABEL_GLOBE_CLEARANCE &&
        distToPivot < PLATE_OUTER_RADIUS - LABEL_OUTER_CLIP_CLEARANCE
      if (clear) {
        if (rMin === null) rMin = r
        rMax = r
      }
    }
    if (rMin === null || rMax === null) continue
    const rMid = (rMin + rMax) / 2
    const point = { x: arc.center.x + rMid * direction.x, y: arc.center.y + rMid * direction.y }
    const distToNumeral = Math.hypot(point.x - numeral.x, point.y - numeral.y)
    const distToGlobeEdge = Math.hypot(point.x - PIVOT.x, point.y - PIVOT.y) - globeRadius
    candidates.push({ angleDeg, thickness: rMax - rMin, point, distToNumeral, distToGlobeEdge })
  }

  // Shouldn't happen for any realistic latitude (there's always some
  // visible sliver once the plate renders at all), but degrade to the
  // numeral's own point rather than throwing if the scan comes up empty.
  if (candidates.length === 0) return { point: numeral, rotationDeg: 0 }

  const thicknessPool = candidates.some((c) => c.thickness >= LABEL_MIN_THICKNESS)
    ? candidates.filter((c) => c.thickness >= LABEL_MIN_THICKNESS)
    : candidates
  const pool = thicknessPool.some((c) => c.distToNumeral >= minNumeralClearancePx)
    ? thicknessPool.filter((c) => c.distToNumeral >= minNumeralClearancePx)
    : thicknessPool
  const best = pool.reduce((a, b) =>
    Math.abs(b.distToNumeral - b.distToGlobeEdge) < Math.abs(a.distToNumeral - a.distToGlobeEdge) ? b : a,
  )

  const theta = degToRad(best.angleDeg)
  // A small fixed nudge back toward the horizon-side edge of the sliver
  // (smaller radius from the hourIndex circle's own center) -- the
  // equidistant point above reads very slightly high within the band;
  // this settles it a touch closer to the gold arc below it, by eye,
  // without disturbing the angular (numeral/globe clearance) placement
  // above.
  const radialDirection = { x: Math.cos(theta), y: Math.sin(theta) }
  const point = {
    x: best.point.x - LABEL_HORIZON_SIDE_NUDGE * radialDirection.x,
    y: best.point.y - LABEL_HORIZON_SIDE_NUDGE * radialDirection.y,
  }
  const tangent = { x: -Math.sin(theta), y: Math.cos(theta) }
  let rotationDeg = radToDeg(Math.atan2(tangent.y, tangent.x))
  if (rotationDeg > 90) rotationDeg -= 180
  else if (rotationDeg < -90) rotationDeg += 180
  return { point, rotationDeg }
}

// ORTVS is 5 letters; a 5-letter word's own half-width at this font size
// rarely exceeds the clearance the equidistant pick already lands on, so
// this just asks for a sane minimum rather than doing much work.
const ORTVS_MIN_NUMERAL_CLEARANCE_PX = 60

// OCCASVS is 7 letters -- rendered at the same clearance ORTVS (5
// letters) is comfortable with, it visibly crowds numeral 12 at some
// latitudes (confirmed for Rio: both sides land at an identical,
// perfectly mirrored 80.6px by construction, plenty for ORTVS but not
// for OCCASVS). Picked by eye against that case, not derived from the
// font metrics.
const OCCASVS_MIN_NUMERAL_CLEARANCE_PX = 110

/** "ORTVS" (sunrise) -- see sunriseOrSunsetSliverPlacement's doc comment. */
export function ortvsInscriptionPlacement(latitudeDeg: number, globeRadius: number): LabelPlacement {
  return sunriseOrSunsetSliverPlacement(latitudeDeg, globeRadius, 1, 1, ORTVS_MIN_NUMERAL_CLEARANCE_PX)
}

/**
 * "OCCASVS" (sunset) -- the mirror of ORTVS (see
 * sunriseOrSunsetSliverPlacement's doc comment for why hourIndex 11 /
 * numeral 12 is that mirror, not hourIndex 12).
 *
 * The rotation returned here is the same raw tangent-based angle
 * sunriseOrSunsetSliverPlacement always produces. Unlike an earlier
 * version of this function, that's used as-is, with no extra flip or
 * string reversal: verified numerically (and visually, across several
 * latitudes) that this raw angle already reads with OCCASVS's first
 * letter closest to the globe -- the mirrored hourIndex/numeral inputs
 * flip which end of the shared ±90°-normalized rotation that is, with no
 * further correction needed.
 */
export function occasvsInscriptionPlacement(latitudeDeg: number, globeRadius: number): LabelPlacement {
  return sunriseOrSunsetSliverPlacement(latitudeDeg, globeRadius, 11, 12, OCCASVS_MIN_NUMERAL_CLEARANCE_PX)
}

// How far around the pivot (degrees) AVRORA sits from ORTVS's own pivot
// angle -- picked, not derived, so that the two inscriptions read as one
// placement continued a bit further around the band rather than as two
// independently-optimized points that happen to land near each other.
// Verified to land inside the orange band (clear of the globe, the
// twilight disc, and the horizon disc's own edge) across every latitude
// tested, from Reykjavik (64°N) to Rio (23°S). CREPVSCVLVM uses the exact
// negation of this offset from OCCASVS's own pivot angle -- the mirror
// (across the pivot's vertical axis) of rotating one way is rotating the
// other way by the same amount, since OCCASVS's angle is itself 180°
// minus ORTVS's (see occasvsInscriptionPlacement's doc comment).
const AVRORA_PIVOT_ANGLE_OFFSET_DEG = -15

// Fixed pixel nudge applied to the final chosen point, back toward the
// twilight (navy) side of the band -- a by-eye correction, not derived
// from any geometric constraint.
const LABEL_AVRORA_TWILIGHT_SIDE_NUDGE = 8

/**
 * Shared by avroraInscriptionPlacement and crepvsculvmInscriptionPlacement
 * -- AVRORA (dawn) continues ORTVS's own placement a fixed angle further
 * around the pivot; CREPVSCVLVM (dusk) does the same from OCCASVS, just
 * with the offset negated (see AVRORA_PIVOT_ANGLE_OFFSET_DEG's doc
 * comment for why that's the correct mirror rather than reusing the same
 * sign).
 *
 * Finds where to place a word inside the orange twilight band itself --
 * the visible crescent of the horizon disc that the twilight disc doesn't
 * cover (see HorizonPlateLayer.tsx's paint order: horizon fills first,
 * twilight fills over it, so this crescent is literally
 * horizon-disc-minus-twilight-disc) -- further round the same arc from
 * the given reference placement, and clear of the globe.
 *
 * Deliberately NOT an independent search for the band's own widest point
 * the way an earlier version worked: that either clipped the rendered
 * word against the plate's outer edge (Rio) or, even when clamped safe,
 * drifted an inconsistent distance from the globe from one latitude to
 * the next (confirmed numerically: Prague's result sat 42px further from
 * the pivot than ORTVS, Rio's only 11px further), reading as unrelated to
 * the reference placement rather than a continuation of it. Rotating the
 * reference's own point around the pivot by a fixed angleOffsetDeg fixes
 * the *angle* relative to it outright; the *radius* is then found fresh
 * by scanning outward from the pivot along that one fixed angle for the
 * sub-range clear of the globe and inside the horizon disc but outside
 * the twilight disc, and taking its midpoint -- so the result ends up
 * centered within the orange band's own local thickness at that angle,
 * not just transplanted at the reference's exact radius (which wouldn't
 * necessarily land inside the band at all, let alone centered in it).
 *
 * Returns a rotation (degrees, already flipped to stay within ±90° of
 * horizontal) matching the horizon circle's own tangent at the chosen
 * point, same convention as sunriseOrSunsetSliverPlacement.
 */
function avroraOrCrepvsculvmPlacement(
  latitudeDeg: number,
  globeRadius: number,
  reference: LabelPlacement,
  angleOffsetDeg: number,
): LabelPlacement {
  const horizon = horizonCircle(latitudeDeg)
  const twilight = twilightCircle(latitudeDeg)

  const referenceAngleDeg = radToDeg(Math.atan2(reference.point.y - PIVOT.y, reference.point.x - PIVOT.x))
  const theta = degToRad(referenceAngleDeg + angleOffsetDeg)
  const direction = { x: Math.cos(theta), y: Math.sin(theta) }

  let rMin: number | null = null
  let rMax: number | null = null
  for (let r = globeRadius + LABEL_GLOBE_CLEARANCE; r <= PLATE_OUTER_RADIUS - LABEL_OUTER_CLIP_CLEARANCE; r += 1) {
    const point = { x: PIVOT.x + r * direction.x, y: PIVOT.y + r * direction.y }
    const distToHorizonCenter = Math.hypot(point.x - horizon.center.x, point.y - horizon.center.y)
    const distToTwilightCenter = Math.hypot(point.x - twilight.center.x, point.y - twilight.center.y)
    const clear = distToHorizonCenter <= horizon.radius && distToTwilightCenter > twilight.radius
    if (clear) {
      if (rMin === null) rMin = r
      rMax = r
    }
  }

  // Shouldn't happen for any realistic latitude, but degrade to a fixed
  // offset below the reference rather than throwing if this ray misses
  // the band entirely.
  if (rMin === null || rMax === null) {
    return { point: { x: reference.point.x, y: reference.point.y + 120 }, rotationDeg: reference.rotationDeg }
  }

  // A small fixed nudge back toward the twilight (navy) side of the band
  // -- by-eye correction on top of the centered placement above, same
  // spirit as sunriseOrSunsetSliverPlacement's own LABEL_HORIZON_SIDE_NUDGE.
  // rMin is the twilight-circle boundary here (the scan starts just past
  // the globe, inside the twilight disc, and rMin is where it first
  // clears that disc), so subtracting from rMid moves toward it.
  const rMid = (rMin + rMax) / 2 - LABEL_AVRORA_TWILIGHT_SIDE_NUDGE
  const point = { x: PIVOT.x + rMid * direction.x, y: PIVOT.y + rMid * direction.y }
  const horizonTheta = Math.atan2(point.y - horizon.center.y, point.x - horizon.center.x)
  const tangent = { x: -Math.sin(horizonTheta), y: Math.cos(horizonTheta) }
  let rotationDeg = radToDeg(Math.atan2(tangent.y, tangent.x))
  if (rotationDeg > 90) rotationDeg -= 180
  else if (rotationDeg < -90) rotationDeg += 180
  return { point, rotationDeg }
}

/** "AVRORA" (dawn) -- see avroraOrCrepvsculvmPlacement's doc comment. */
export function avroraInscriptionPlacement(latitudeDeg: number, globeRadius: number, ortvs: LabelPlacement): LabelPlacement {
  return avroraOrCrepvsculvmPlacement(latitudeDeg, globeRadius, ortvs, AVRORA_PIVOT_ANGLE_OFFSET_DEG)
}

/**
 * "CREPVSCVLVM" (dusk) -- the mirror of AVRORA (see
 * AVRORA_PIVOT_ANGLE_OFFSET_DEG's doc comment for the negated-offset
 * reasoning). Same raw-rotation convention as OCCASVS -- see
 * occasvsInscriptionPlacement's doc comment for why the reading-direction
 * mirror is left to the renderer rather than baked into this rotation.
 */
export function crepvsculvmInscriptionPlacement(
  latitudeDeg: number,
  globeRadius: number,
  occasvs: LabelPlacement,
): LabelPlacement {
  return avroraOrCrepvsculvmPlacement(latitudeDeg, globeRadius, occasvs, -AVRORA_PIVOT_ANGLE_OFFSET_DEG)
}
