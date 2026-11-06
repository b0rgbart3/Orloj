import dialDetail from "../assets/prague-orloj-01.jpg";
import { arcPath, arrowheadPoints, DIAGRAM_FONT, DIAGRAM_GOLD, DIAGRAM_INK, polarPoint } from "./diagramGeometry";

const LABEL = { fontFamily: DIAGRAM_FONT, fontSize: 11, fill: DIAGRAM_INK } as const;
const LABEL_GOLD = { ...LABEL, fill: DIAGRAM_GOLD } as const;

/** Paragraph 1: a solar day is measured noon-to-noon, sun in the same
 * direction both times. */
export function SolarDayDiagram() {
  const sun = { x: 360, y: 85 };
  const earth1 = { x: 70, y: 85 };
  const earth2 = { x: 248, y: 85 };
  const arrowTip = { x: 200, y: 85 };
  return (
    <svg viewBox="0 0 400 170" role="img" aria-label="Two snapshots of Earth, a day apart, both facing the sun the same way at noon">
      <circle cx={sun.x} cy={sun.y} r="12" fill={DIAGRAM_GOLD} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const a = polarPoint(sun.x, sun.y, 16, deg);
        const b = polarPoint(sun.x, sun.y, 22, deg);
        return <line key={deg} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={DIAGRAM_GOLD} strokeWidth="1.5" />;
      })}

      <circle cx={earth1.x} cy={earth1.y} r="34" fill="none" stroke={DIAGRAM_INK} strokeWidth="1.5" />
      <line x1={earth1.x} y1={earth1.y} x2={earth1.x + 34} y2={earth1.y} stroke={DIAGRAM_INK} strokeWidth="2" />
      <circle cx={earth1.x + 34} cy={earth1.y} r="3" fill={DIAGRAM_INK} />
      <text x={earth1.x} y="136" textAnchor="middle" {...LABEL}>Day 1, noon</text>

      <line x1="118" y1={arrowTip.y} x2={arrowTip.x} y2={arrowTip.y} stroke={DIAGRAM_INK} strokeWidth="1.5" />
      <polygon points={arrowheadPoints(arrowTip.x, arrowTip.y, 90, 7)} fill={DIAGRAM_INK} />
      <text x="159" y="72" textAnchor="middle" {...LABEL}>one full turn, 24h</text>

      <circle cx={earth2.x} cy={earth2.y} r="34" fill="none" stroke={DIAGRAM_INK} strokeWidth="1.5" />
      <line x1={earth2.x} y1={earth2.y} x2={earth2.x + 34} y2={earth2.y} stroke={DIAGRAM_INK} strokeWidth="2" />
      <circle cx={earth2.x + 34} cy={earth2.y} r="3" fill={DIAGRAM_INK} />
      <text x={earth2.x} y="136" textAnchor="middle" {...LABEL}>Day 2, noon</text>
    </svg>
  );
}

/** Paragraph 2: a sidereal day (aligned to a fixed star) is a hair shorter
 * than the extra spin needed to re-align with the sun. */
export function SiderealDayDiagram() {
  const earth = { x: 130, y: 110 };
  const star = polarPoint(earth.x, earth.y, 80, 0);
  const sun = polarPoint(earth.x, earth.y, 96, 20);
  const starEdge = polarPoint(earth.x, earth.y, 26, 0);
  const sunEdge = polarPoint(earth.x, earth.y, 26, 20);
  const arcMid = polarPoint(earth.x, earth.y, 52, 10);
  return (
    <svg viewBox="0 0 400 190" role="img" aria-label="Earth must spin a little past a full turn relative to the stars to face the sun again">
      <text x={star.x} y="22" textAnchor="middle" {...LABEL}>a fixed, distant star</text>
      <line x1={star.x} y1="30" x2={starEdge.x} y2={starEdge.y} stroke={DIAGRAM_INK} strokeWidth="1.5" strokeDasharray="3,3" />

      <circle cx={earth.x} cy={earth.y} r="26" fill="none" stroke={DIAGRAM_INK} strokeWidth="1.5" />

      <line x1={starEdge.x} y1={starEdge.y} x2={star.x} y2={star.y + 4} stroke={DIAGRAM_INK} strokeWidth="1.5" />
      <line x1={sunEdge.x} y1={sunEdge.y} x2={sun.x} y2={sun.y} stroke={DIAGRAM_GOLD} strokeWidth="2" />
      <circle cx={sun.x} cy={sun.y} r="13" fill={DIAGRAM_GOLD} />
      <text x={sun.x + 20} y={sun.y + 4} {...LABEL}>the sun</text>

      <path d={arcPath(earth.x, earth.y, 40, 0, 20)} fill="none" stroke={DIAGRAM_GOLD} strokeWidth="1.5" />
      <text x={arcMid.x + 12} y={arcMid.y + 4} {...LABEL_GOLD}>≈4 extra minutes of spin</text>

      <text x={earth.x} y="165" textAnchor="middle" {...LABEL}>one full turn vs. the stars ≠ facing the sun again</text>
    </svg>
  );
}

/** Paragraph 3: the four-minute gap compounds into one extra lap a year,
 * which is why the zodiac ring slowly laps the sun dial. */
export function AnnualLapDiagram() {
  const center = { x: 200, y: 105 };
  const ringR = 66;
  const ticks = Array.from({ length: 12 }, (_, i) => i * 30);
  const snapshots = [0, 60, 120, 180, 240, 300, 360];
  const sunMarker = polarPoint(center.x, center.y, 80, 0);
  return (
    <svg viewBox="0 0 400 190" role="img" aria-label="Over a year, a marker on the zodiac ring sweeps all the way around and laps the sun's fixed reference direction">
      <circle cx={center.x} cy={center.y} r={ringR} fill="none" stroke={DIAGRAM_INK} strokeWidth="1" opacity="0.5" />
      {ticks.map((deg) => {
        const a = polarPoint(center.x, center.y, ringR - 5, deg);
        const b = polarPoint(center.x, center.y, ringR + 2, deg);
        return <line key={deg} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={DIAGRAM_INK} strokeWidth="1" opacity="0.5" />;
      })}

      <line x1={center.x} y1={center.y} x2={sunMarker.x} y2={sunMarker.y} stroke={DIAGRAM_INK} strokeWidth="2.5" />
      <text x={sunMarker.x} y={sunMarker.y - 10} textAnchor="middle" {...LABEL}>sun (reference direction)</text>

      {snapshots.map((deg, i) => {
        const tip = polarPoint(center.x, center.y, 58, deg);
        const opacity = 0.12 + (i / (snapshots.length - 1)) * 0.88;
        return (
          <line
            key={deg}
            x1={center.x}
            y1={center.y}
            x2={tip.x}
            y2={tip.y}
            stroke={DIAGRAM_GOLD}
            strokeWidth="2"
            opacity={opacity}
          />
        );
      })}
      <text x={center.x} y="178" textAnchor="middle" {...LABEL_GOLD}>zodiac-ring marker, Jan → Dec: one extra full lap</text>
    </svg>
  );
}

/** Paragraph 4: the ecliptic crosses the celestial equator at the vernal
 * equinox point, sidereal time's zero mark. */
export function EclipticEquatorDiagram() {
  const equinox = { x: 209, y: 110 };
  return (
    <svg viewBox="0 0 400 190" role="img" aria-label="The ecliptic crosses the celestial equator at the vernal equinox point">
      <line x1="60" y1="110" x2="340" y2="110" stroke={DIAGRAM_INK} strokeWidth="1.5" />
      <text x="64" y="100" {...LABEL}>celestial equator</text>

      <line x1="80" y1="40" x2="320" y2="170" stroke={DIAGRAM_GOLD} strokeWidth="1.5" />
      <polygon points={arrowheadPoints(320, 170, 118, 7)} fill={DIAGRAM_GOLD} />
      <text x="90" y="36" {...LABEL_GOLD}>ecliptic — sun's yearly path</text>

      <circle cx={equinox.x} cy={equinox.y} r="4.5" fill={DIAGRAM_GOLD} stroke={DIAGRAM_INK} />
      <text x={equinox.x + 10} y={equinox.y + 22} {...LABEL}>♈ vernal equinox point</text>
      <text x={equinox.x + 10} y={equinox.y + 36} {...LABEL}>(sidereal time's zero mark)</text>
    </svg>
  );
}

/** Paragraph 5: the meridian runs horizon-to-zenith-to-horizon; a star
 * transits when it crosses it. */
export function MeridianTransitDiagram() {
  const n = { x: 90, y: 150 };
  const s = { x: 310, y: 150 };
  const zenith = { x: 200, y: 40 };
  const transit = { x: 200, y: 102.5 };
  return (
    <svg viewBox="0 0 400 190" role="img" aria-label="A star's east-to-west path crosses the meridian at its highest point, called transit or culmination">
      <line x1={n.x} y1={n.y} x2={s.x} y2={s.y} stroke={DIAGRAM_INK} strokeWidth="1.5" />
      <text x={n.x - 16} y={n.y + 4} {...LABEL}>N</text>
      <text x={s.x + 10} y={s.y + 4} {...LABEL}>S</text>

      <line x1={zenith.x} y1="150" x2={zenith.x} y2={zenith.y} stroke={DIAGRAM_INK} strokeWidth="1.5" strokeDasharray="3,3" />
      <text x={zenith.x} y="28" textAnchor="middle" {...LABEL}>zenith</text>
      <text x={zenith.x + 10} y="95" {...LABEL}>meridian</text>

      <path d={`M ${n.x + 20} 150 Q 200 55 ${s.x - 20} 150`} fill="none" stroke={DIAGRAM_GOLD} strokeWidth="1.5" strokeDasharray="4,3" />
      <text x={n.x + 8} y="166" {...LABEL_GOLD}>rises</text>
      <text x={s.x - 42} y="166" {...LABEL_GOLD}>sets</text>

      <circle cx={transit.x} cy={transit.y} r="4.5" fill={DIAGRAM_GOLD} stroke={DIAGRAM_INK} />
      <text x={transit.x + 10} y={transit.y - 4} {...LABEL}>transit (culmination):</text>
      <text x={transit.x + 10} y={transit.y + 10} {...LABEL}>highest point, crossing the meridian</text>
    </svg>
  );
}

/** Paragraph 6: Local Sidereal Time is 0h exactly when the vernal equinox
 * point sits on the meridian, counting up from there. */
export function LstZeroDiagram() {
  const center = { x: 200, y: 105 };
  const r = 66;
  const zeroMark = polarPoint(center.x, center.y, r, 0);
  return (
    <svg viewBox="0 0 400 190" role="img" aria-label="A 24-sidereal-hour dial, zero marked where the vernal equinox point sits on the meridian">
      <circle cx={center.x} cy={center.y} r={r} fill="none" stroke={DIAGRAM_INK} strokeWidth="1" opacity="0.6" />
      {Array.from({ length: 24 }, (_, i) => i * 15).map((deg) => {
        const a = polarPoint(center.x, center.y, r - 5, deg);
        const b = polarPoint(center.x, center.y, r + (deg === 0 ? 8 : 3), deg);
        return (
          <line
            key={deg}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={deg === 0 ? DIAGRAM_GOLD : DIAGRAM_INK}
            strokeWidth={deg === 0 ? 2.5 : 1}
            opacity={deg === 0 ? 1 : 0.6}
          />
        );
      })}
      {[
        { deg: 0, label: "0h" },
        { deg: 90, label: "6h" },
        { deg: 180, label: "12h" },
        { deg: 270, label: "18h" },
      ].map(({ deg, label }) => {
        const p = polarPoint(center.x, center.y, r + 20, deg);
        return (
          <text key={deg} x={p.x} y={p.y + 4} textAnchor="middle" {...(deg === 0 ? LABEL_GOLD : LABEL)}>
            {label}
          </text>
        );
      })}

      <line x1={center.x} y1="170" x2={center.x} y2="20" stroke={DIAGRAM_INK} strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
      <text x={center.x} y="184" textAnchor="middle" {...LABEL}>meridian</text>

      <circle cx={zeroMark.x} cy={zeroMark.y} r="4.5" fill={DIAGRAM_GOLD} />
      <text x="330" y="20" {...LABEL_GOLD}>♈ on the meridian = LST 0h</text>
    </svg>
  );
}

/** Paragraph 7: whatever right ascension matches LST is on the meridian
 * right now -- transiting, the best-placed point of the night. */
export function RightAscensionDiagram() {
  const center = { x: 200, y: 105 };
  const lines = [0, 45, 90, 135, 180, 225, 270, 315];
  const transitingStar = polarPoint(center.x, center.y, 55, 0);
  const otherStars = [
    polarPoint(center.x, center.y, 65, 100),
    polarPoint(center.x, center.y, 45, 200),
    polarPoint(center.x, center.y, 70, 290),
  ];
  const lstLabel = polarPoint(center.x, center.y, 88, 0);
  return (
    <svg viewBox="0 0 400 190" role="img" aria-label="Of all the stars' right-ascension lines, the one matching current LST is overhead right now">
      {lines.map((deg) => {
        const p = polarPoint(center.x, center.y, 80, deg);
        const isLst = deg === 0;
        return (
          <line
            key={deg}
            x1={center.x}
            y1={center.y}
            x2={p.x}
            y2={p.y}
            stroke={isLst ? DIAGRAM_GOLD : DIAGRAM_INK}
            strokeWidth={isLst ? 2.5 : 1}
            opacity={isLst ? 1 : 0.35}
          />
        );
      })}
      <text x={lstLabel.x} y={lstLabel.y - 6} textAnchor="middle" {...LABEL_GOLD}>current LST</text>

      {otherStars.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="none" stroke={DIAGRAM_INK} strokeWidth="1.5" opacity="0.5" />
      ))}
      <circle cx={transitingStar.x} cy={transitingStar.y} r="5" fill={DIAGRAM_GOLD} stroke={DIAGRAM_INK} />
      <text x={transitingStar.x + 12} y={transitingStar.y + 4} {...LABEL}>RA = LST: transiting now</text>

      <text x={center.x} y="182" textAnchor="middle" {...LABEL}>other stars wait their turn</text>
    </svg>
  );
}

/** Paragraph 8: a real photo grounds the historical/engineering point --
 * this was a working 15th-century instrument, not a diagram. */
export function OrlojHistoryPhoto() {
  return <img src={dialDetail} alt="Detail of the Prague astronomical clock's dial face with carved apostle figures" />;
}

/** Paragraph 9: on this digital clock, the star hand visibly outruns the
 * civil-time hand by about four minutes a day. */
export function LiveReadingDiagram() {
  const center = { x: 200, y: 105 };
  const r = 66;
  const civilTip = polarPoint(center.x, center.y, 58, 40);
  const starTip = polarPoint(center.x, center.y, 66, 48);
  const gapLabel = polarPoint(center.x, center.y, 80, 44);
  return (
    <svg viewBox="0 0 400 190" role="img" aria-label="The star hand points a little further around the dial than the civil-time hand, at the same instant">
      <circle cx={center.x} cy={center.y} r={r} fill="none" stroke={DIAGRAM_INK} strokeWidth="1" opacity="0.5" />
      {Array.from({ length: 12 }, (_, i) => i * 30).map((deg) => {
        const a = polarPoint(center.x, center.y, r - 4, deg);
        const b = polarPoint(center.x, center.y, r + 2, deg);
        return <line key={deg} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={DIAGRAM_INK} strokeWidth="1" opacity="0.5" />;
      })}

      <line x1={center.x} y1={center.y} x2={civilTip.x} y2={civilTip.y} stroke={DIAGRAM_INK} strokeWidth="2.5" />
      <text {...LABEL} x={civilTip.x - 55} y={civilTip.y - 6}>civil-time hand</text>

      <line x1={center.x} y1={center.y} x2={starTip.x} y2={starTip.y} stroke={DIAGRAM_GOLD} strokeWidth="2.5" />
      <text {...LABEL_GOLD} x={starTip.x + 8} y={starTip.y - 2}>star hand</text>

      <path d={arcPath(center.x, center.y, r + 14, 40, 48)} fill="none" stroke={DIAGRAM_GOLD} strokeWidth="1.5" />
      <text {...LABEL_GOLD} x={gapLabel.x + 10} y={gapLabel.y} textAnchor="start">+4 min/day</text>
    </svg>
  );
}
