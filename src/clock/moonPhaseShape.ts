function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * SVG path data for the Moon glyph's bright (lit) region -- drawn over a
 * static dark base disc of the same radius, so together they form the
 * current phase shape.
 *
 * `elongationDeg` is the Sun-Moon elongation (0°=new, 180°=full, see
 * lunarEphemeris.ts). The bright region is bounded by the disc's own outer
 * edge on one side (a half-circle arc, the "base" half: right when waxing,
 * left when waning -- arbitrary but self-consistent) and a terminator --
 * drawn as a second arc with horizontal half-axis `|R*cos(elongation)|` --
 * on the other. This is the standard construction for a moon-phase icon,
 * and it also happens to be exactly what the real clock's half-silver/
 * half-black sphere would look like from a fixed viewpoint as it spins.
 *
 * Which side the terminator bulges toward depends on the *sign* of
 * `cos(elongation)`, not on waxing/waning: near new moon (elongation within
 * 90° of 0°, cos>0) the terminator sits on the *same* side as the base
 * half, carving a thin crescent out of it; near full moon (elongation
 * within 90° of 180°, cos<0) it sits on the *opposite* side, extending
 * brightness past the half-circle into a gibbous bulge. At the quarters
 * (cos=0) the terminator degenerates to the straight diameter (SVG draws a
 * zero-radius arc as a line), giving an exact half-and-half split. At new
 * moon the terminator exactly retraces the outer edge (zero-area bright
 * region); at full moon it bulges to the far side with the same radius as
 * the outer edge, so together the two arcs trace the whole circle.
 */
export function moonPhaseBrightPathD(cx: number, cy: number, radius: number, elongationDeg: number): string {
  const e = degToRad(elongationDeg)
  const cosE = Math.cos(e)
  const waxing = ((elongationDeg % 360) + 360) % 360 < 180

  // T→B: sweep=1 traces the right half, sweep=0 the left half.
  const outerSweep = waxing ? 1 : 0
  const terminatorRadius = Math.abs(radius * cosE)
  // B→T: sweep=1 traces the left half, sweep=0 the right half -- the
  // opposite mapping from T→B's, which is why matching the *same* physical
  // side as the outer arc (crescent regime) means flipping the flag, while
  // the *opposite* side (gibbous regime) means keeping it as-is.
  const terminatorSweep = cosE > 0 ? 1 - outerSweep : outerSweep

  const top = `${cx} ${cy - radius}`
  const bottom = `${cx} ${cy + radius}`

  return (
    `M ${top} ` +
    `A ${radius} ${radius} 0 0 ${outerSweep} ${bottom} ` +
    `A ${terminatorRadius} ${radius} 0 0 ${terminatorSweep} ${top} Z`
  )
}
