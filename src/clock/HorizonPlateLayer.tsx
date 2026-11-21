import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import globeImage from "../assets/wireframe_globe.jpg";
import {
  avroraInscriptionPlacement,
  babylonianHourDividerCircle,
  babylonianHourNumeralPoint,
  crepvsculvmInscriptionPlacement,
  horizonCircle,
  occasvsInscriptionPlacement,
  ortvsInscriptionPlacement,
  PLATE_OUTER_RADIUS,
  tealBand,
  twilightCircle,
} from "./horizonPlate";
import type { Location } from "./location";

const DAY_COLOR = "#349dd6";
const HORIZON_COLOR = "#e07117";
const NIGHT_COLOR = "#0b1a3a";
const HOUR_ARC_COLOR = "#ffe68e";
const NUMERAL_COLOR = "#0a1024";
// The outer (lighter) and inner (darker) pairs of horizonPlate.ts's
// tealBand circles, bridging DAY_COLOR to HORIZON_COLOR -- picked to
// match the soft-mint/richer-teal pairing in the user's own reference
// trace, not derived from either of the other two colors.
const TEAL_BAND_OUTER_COLOR = "#6cb8a8";
const TEAL_BAND_INNER_COLOR = "#3f9b85";

type InscriptionId = "ortvs" | "avrora" | "occasvs" | "crepvsculvm";

// Click-to-reveal translation, same interaction as the zodiac ring's own
// wedge tooltips (see ZodiacHouseLayer.tsx) -- id doubles as the DOM id
// suffix each inscription's <text> carries, so handleInscriptionClick can
// recover which one was clicked via closest('[id^="inscription-"]').
const INSCRIPTIONS: Record<InscriptionId, { text: string; fontSize: number; translation: string }> = {
  ortvs: { text: "ORTVS", fontSize: 24, translation: "sunrise" },
  avrora: { text: "AVRORA", fontSize: 26, translation: "dawn" },
  occasvs: { text: "OCCASVS", fontSize: 24, translation: "sunset" },
  crepvsculvm: { text: "CREPVSCVLVM", fontSize: 22, translation: "twilight" },
};

const INSCRIPTION_ID_PREFIX = "inscription-";

// Click-to-reveal tooltip for the hour numerals, same interaction as the
// inscriptions above -- id doubles as the DOM id suffix each numeral's
// <text> carries, so handleClick can recover which one was clicked via
// closest('[id^="numeral-"]').
const NUMERAL_ID_PREFIX = "numeral-";

// 1..12 -- one numeral per division's *end* boundary, not its start, so
// hourIndex 0 (sunrise) is deliberately excluded: it has no numeral of its
// own on the real dial either, since it's the starting line, not the end
// of a counted hour.
const HOUR_NUMERALS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// 1..11, skipping 6 -- 13 boundaries for 12 divisions, but only 11 of them
// are drawn as their own circles here. hourIndex 0 (sunrise) and 12
// (sunset) are the other 2: their 3 sample points (winter/equinox/summer
// sunrise or sunset) sit exactly at altitude 0 by construction, so the
// circle fit through them comes out numerically identical to horizonCircle
// itself (confirmed to ~12 decimal places) -- rather than draw two more
// circles exactly coincident with the horizon disc's own boundary (and
// have the disc's fill eat half their stroke width, since it's painted
// right on top at the same radius), the horizon <circle> below is given
// its own matching stroke instead. hourIndex 6 (noon/midnight) is the one
// straight meridian line, drawn separately below, not a curve.
const HOUR_DIVIDER_INDICES = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11];

// Purely decorative, not derived from latitude: a symbolic Ptolemaic Earth
// marking the clock's physical drive shaft, not a map projection of
// anywhere real. Centered exactly on the pivot and sized by eye -- there's
// no astronomical reason for it to be any particular size, unlike the
// horizon/twilight circles around it.
const GLOBE = { center: { x: 600, y: 600 }, radius: 152 };

/**
 * The astrolabe horizon plate: the fixed background disc behind the zodiac
 * ring. Never rotates (see ClockFace.tsx's liveRotation, which has no case
 * for this layer).
 *
 * Horizon (orange) and astronomical-twilight (navy) are real almucantars,
 * computed from latitude via horizonPlate.ts's pole-flipped stereographic
 * projection (see that module's doc comment) -- verified to reproduce a
 * hand-placed reference within a few percent using one shared scale
 * constant. The globe at the center is the one deliberately non-derived
 * piece: a symbolic Earth emblem, not a projected almucantar -- its border
 * matches the hour-divider arcs' color, width, and shadow, for visual
 * consistency, not because it's geometrically one of them.
 *
 * The hour-divider arcs (gold) are real too: each is a circle fit through 3
 * real sampled points (winter solstice, equinox, summer solstice), the
 * classical astrolabe construction (see horizonPlate.ts's
 * babylonianHourDividerCircle doc comment) -- 13 of them for 12 divisions.
 * 11 are drawn as their own circles, painted before the horizon/twilight
 * discs so those opaque fills cover them within the day/twilight zones.
 * The other 2 (sunrise/sunset) aren't drawn as their own circles at all:
 * they coincide exactly with the horizon disc's own boundary, so that
 * boundary gets a second, stroke-only circle instead (same center/radius,
 * drawn after both discs). Two reasons it's a separate circle rather than
 * a stroke+filter on the fill circle directly: drawing it in the occluded
 * group above would leave only half its stroke width visible (the horizon
 * disc's fill is painted right on top at the same radius); and even stroke
 * +filter directly on the fill circle would hide half of *its own* shadow
 * the same way, since feDropShadow composites behind the filtered element,
 * so the fill paints right over the inward half of its own shadow.
 *
 * The hour numerals (1-12, gold, upright) sit just inside the plate's
 * outer edge, next to the point where each hour's own divider arc crosses
 * it (see horizonPlate.ts's babylonianHourNumeralPoint doc comment) --
 * hourIndex 0 has no numeral of its own, since it's the start of hour 1,
 * not the end of a counted hour.
 *
 * The teal band (4 circles, 2 lighter-outer + 2 darker-inner) sits behind
 * everything else -- painted before the hour arcs and horizon/twilight
 * discs, so only the slivers that poke out past the horizon disc's own
 * edge remain visible. Inspired by a decorative duplicate-and-shift
 * technique in the user's own traced reference of the real plate, but
 * each of the 4 circles is literally one of the plate's own hour-divider
 * circles (hourIndex 1/11 for the inner pair, 2/10 for the outer), not an
 * independent approximation -- see horizonPlate.ts's tealBand doc comment
 * for why that's what makes the band's edge exactly coincide with the
 * matching gold arc at every point, for any latitude.
 *
 * Inscriptions are still removed for now, not gone for good.
 */
export function HorizonPlateLayer({ location }: { location: Location }) {
  const geometry = useMemo(() => {
    const lat = location.latitudeDeg;
    const ortvs = ortvsInscriptionPlacement(lat, GLOBE.radius);
    const occasvs = occasvsInscriptionPlacement(lat, GLOBE.radius);
    return {
      horizon: horizonCircle(lat),
      twilight: twilightCircle(lat),
      hourDividers: HOUR_DIVIDER_INDICES.map((hourIndex) =>
        babylonianHourDividerCircle(hourIndex, lat),
      ).filter(
        (
          circle,
        ): circle is { center: { x: number; y: number }; radius: number } =>
          circle !== null,
      ),
      numerals: HOUR_NUMERALS.map((hourNumber) => ({
        hourNumber,
        point: babylonianHourNumeralPoint(hourNumber, lat),
      })),
      tealBand: tealBand(lat),
      ortvs,
      avrora: avroraInscriptionPlacement(lat, GLOBE.radius, ortvs),
      occasvs,
      crepvsculvm: crepvsculvmInscriptionPlacement(lat, GLOBE.radius, occasvs),
    };
  }, [location.latitudeDeg]);

  const [tooltip, setTooltip] = useState<{ text: string; xPct: number; yPct: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    const inscriptionEl = target.closest(`[id^="${INSCRIPTION_ID_PREFIX}"]`);
    const numeralEl = target.closest(`[id^="${NUMERAL_ID_PREFIX}"]`);
    if (!inscriptionEl && !numeralEl) return;

    let text: string | undefined;
    if (inscriptionEl) {
      const id = inscriptionEl.id.slice(INSCRIPTION_ID_PREFIX.length) as InscriptionId;
      if (id in INSCRIPTIONS) text = INSCRIPTIONS[id].translation;
    } else if (numeralEl) {
      const hourNumber = numeralEl.id.slice(NUMERAL_ID_PREFIX.length);
      text = `${hourNumber} - Babylonian hours`;
    }
    if (!text) return;

    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      text,
      xPct: ((event.clientX - rect.left) / rect.width) * 100,
      yPct: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  useEffect(() => {
    if (!tooltip) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!tooltipRef.current?.contains(event.target as Node)) setTooltip(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [tooltip]);

  return (
    <>
      <div className="clock-layer" onClick={handleClick}>
        <svg viewBox="0 0 1200 1200">
          <defs>
            {/* Matches the original hand-traced background.svg's own painted
                extent (its sky circle: cx=600.14,cy=588.29,r=360.5, from
                before that file was retired) rather than the whole
                1200x1200 canvas -- everything else (roman-ring, ...) is
                implicitly bounded by its own artwork; this layer has to
                clip itself explicitly instead. */}
            <clipPath id="horizon-plate-clip">
              <circle cx={600} cy={600} r={PLATE_OUTER_RADIUS} />
            </clipPath>
            <clipPath id="horizon-plate-globe-clip">
              <circle cx={GLOBE.center.x} cy={GLOBE.center.y} r={GLOBE.radius} />
            </clipPath>
            {/* An explicit userSpaceOnUse region, not the CSS `filter:
                drop-shadow(...)` shorthand -- that shorthand derives its
                filter region from the filtered element's own bounding box,
                and several hour-divider circles (e.g. hourIndex 5/7) have
                radii over 1200, far outside the visible plate. Sharing a
                group with those balloons the auto-computed region enough
                that the small, horizon-circle-sized edge arcs (hourIndex
                0/12) lost their shadow and rendered thinner than the rest.
                A fixed region sized to the plate itself renders every arc
                identically regardless of its own circle's extent. */}
            <filter
              id="horizon-plate-arc-shadow"
              x={-200}
              y={-200}
              width={1600}
              height={1600}
              filterUnits="userSpaceOnUse"
            >
              <feDropShadow
                dx={0}
                dy={0}
                stdDeviation={3}
                floodColor="#000000"
                floodOpacity={0.4}
              />
            </filter>
          </defs>
          <g clipPath="url(#horizon-plate-clip)">
            <rect x="0" y="0" width="1200" height="1200" fill={DAY_COLOR} />
            {/* The decorative "teal band" -- 2 duplicated-and-shifted circles
                per pair, same construction the real plate's own painter
                used (see horizonPlate.ts's tealBand doc comment). Drawn
                before the hour arcs and horizon/twilight discs, so all of
                those paint over it; only the slivers that poke out past the
                horizon disc's own edge stay visible, same as the reference
                this is traced from. */}
            <circle
              cx={geometry.tealBand.outerLeft.center.x}
              cy={geometry.tealBand.outerLeft.center.y}
              r={geometry.tealBand.outerLeft.radius}
              fill={TEAL_BAND_OUTER_COLOR}
            />
            <circle
              cx={geometry.tealBand.outerRight.center.x}
              cy={geometry.tealBand.outerRight.center.y}
              r={geometry.tealBand.outerRight.radius}
              fill={TEAL_BAND_OUTER_COLOR}
            />
            <circle
              cx={geometry.tealBand.innerLeft.center.x}
              cy={geometry.tealBand.innerLeft.center.y}
              r={geometry.tealBand.innerLeft.radius}
              fill={TEAL_BAND_INNER_COLOR}
            />
            <circle
              cx={geometry.tealBand.innerRight.center.x}
              cy={geometry.tealBand.innerRight.center.y}
              r={geometry.tealBand.innerRight.radius}
              fill={TEAL_BAND_INNER_COLOR}
            />
            {/* Drawn before the horizon/twilight discs, not after -- so those
                opaque fills cover these 11 interior arcs wherever they'd
                otherwise cross the day/twilight zones. */}
            <g
              fill="none"
              stroke={HOUR_ARC_COLOR}
              strokeWidth={4}
              filter="url(#horizon-plate-arc-shadow)"
            >
              {geometry.hourDividers.map((circle, index) => (
                <circle
                  key={index}
                  cx={circle.center.x}
                  cy={circle.center.y}
                  r={circle.radius}
                />
              ))}
              <line x1={600} y1={0} x2={600} y2={1200} />
            </g>
            <circle
              cx={geometry.horizon.center.x}
              cy={geometry.horizon.center.y}
              r={geometry.horizon.radius}
              fill={HORIZON_COLOR}
            />
            <circle
              cx={geometry.twilight.center.x}
              cy={geometry.twilight.center.y}
              r={geometry.twilight.radius}
              fill={NIGHT_COLOR}
            />
            {/* A separate stroke-only circle, not a stroke+filter on the fill
                circle above -- feDropShadow composites its blurred copy
                *behind* the filtered element's own rendering, so a filter on
                the fill circle would have its own opaque fill immediately
                paint over the inward half of its shadow, leaving it visible
                only outside (against the teal background) and never inside
                (against the orange fill). Drawing the stroke on its own,
                after both discs, lets the shadow show on both sides. */}
            <circle
              cx={geometry.horizon.center.x}
              cy={geometry.horizon.center.y}
              r={geometry.horizon.radius}
              fill="none"
              stroke={HOUR_ARC_COLOR}
              strokeWidth={4}
              filter="url(#horizon-plate-arc-shadow)"
            />
            <g clipPath="url(#horizon-plate-globe-clip)">
              <image
                href={globeImage}
                x={GLOBE.center.x - GLOBE.radius}
                y={GLOBE.center.y - GLOBE.radius}
                width={GLOBE.radius * 2}
                height={GLOBE.radius * 2}
                preserveAspectRatio="xMidYMid slice"
              />
            </g>
            <circle
              cx={GLOBE.center.x}
              cy={GLOBE.center.y}
              r={GLOBE.radius}
              fill="none"
              stroke={HOUR_ARC_COLOR}
              strokeWidth={4}
              filter="url(#horizon-plate-arc-shadow)"
            />
            {/* Upright, not rotated to each one's own radial angle -- unlike
                the numeric-ring's digits (which rotate with that ring and
                are meant to be read with the dial), these sit on a layer
                that never rotates, and the real plate's own numerals are
                drawn plumb-vertical regardless of where they fall around the
                dial. */}
            <g
              fill={NUMERAL_COLOR}
              fontSize={32}
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ cursor: "pointer", pointerEvents: "auto" }}
            >
              {geometry.numerals.map(({ hourNumber, point }) => (
                <text
                  key={hourNumber}
                  id={`${NUMERAL_ID_PREFIX}${hourNumber}`}
                  x={point.x}
                  y={point.y}
                >
                  {hourNumber}
                </text>
              ))}
            </g>
            {/* ORTVS/AVRORA/OCCASVS/CREPVSCVLVM -- ORTVS sits inside the teal
                sliver that hourIndex 1's own circle leaves visible past the
                horizon disc's edge (see ortvsInscriptionPlacement's doc
                comment); OCCASVS mirrors it in hourIndex 11's sliver.
                AVRORA/CREPVSCVLVM sit in the orange twilight band, each
                continuing its sunrise/sunset partner's placement a fixed
                angle further round the arc (see avroraInscriptionPlacement's
                doc comment). Each one's rotation follows its own circle's
                tangent at that point, same arch the sliver curves along.

                pointerEvents: "auto" opts each of these four back into click
                events despite .clock-layer's own pointer-events: none (see
                ClockFace.css and GradientClockLayer's onClick doc comment
                for the same pattern used by the zodiac-wedge click
                handler) -- without it, handleClick above would never see
                these clicks land. The id is how handleClick identifies which
                one was clicked. */}
            {(Object.keys(INSCRIPTIONS) as InscriptionId[]).map((id) => {
              const { text, fontSize } = INSCRIPTIONS[id];
              const placement = geometry[id];
              return (
                <text
                  key={id}
                  id={`${INSCRIPTION_ID_PREFIX}${id}`}
                  x={placement.point.x}
                  y={placement.point.y}
                  fill={NUMERAL_COLOR}
                  fontSize={fontSize}
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${placement.rotationDeg} ${placement.point.x} ${placement.point.y})`}
                  style={{ cursor: "pointer", pointerEvents: "auto" }}
                >
                  {text}
                </text>
              );
            })}
          </g>
        </svg>
      </div>
      {tooltip && (
        <div
          ref={tooltipRef}
          className="clock-tooltip"
          style={{ left: `${tooltip.xPct}%`, top: `${tooltip.yPct}%` }}
        >
          {tooltip.text}
        </div>
      )}
    </>
  );
}
