// Small shared helpers so the hand-built diagrams in this folder don't each
// re-derive their own trig. Angles are degrees, 0 = straight up, increasing
// clockwise -- the usual "clock face" convention, easiest to reason about
// when sketching a diagram by eye before converting it to numbers.

export function polarPoint(cx: number, cy: number, r: number, deg: number): { x: number; y: number } {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = polarPoint(cx, cy, r, startDeg);
  const end = polarPoint(cx, cy, r, endDeg);
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  const sweep = endDeg >= startDeg ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

/** Triangle points for an arrowhead tip at (tipX, tipY), pointing in
 * direction `deg`. Drawn as a plain polygon rather than an SVG <marker> so
 * multiple diagrams can share one document without id collisions. */
export function arrowheadPoints(tipX: number, tipY: number, deg: number, size = 7): string {
  const back1 = polarPoint(tipX, tipY, size, deg + 150);
  const back2 = polarPoint(tipX, tipY, size, deg - 150);
  return `${tipX.toFixed(2)},${tipY.toFixed(2)} ${back1.x.toFixed(2)},${back1.y.toFixed(2)} ${back2.x.toFixed(2)},${back2.y.toFixed(2)}`;
}

export const DIAGRAM_INK = "#2a2a2a";
export const DIAGRAM_GOLD = "#9a6b00";
export const DIAGRAM_FONT = "Helvetica, Arial, sans-serif";
