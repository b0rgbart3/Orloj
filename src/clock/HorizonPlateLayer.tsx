import type { Location } from "./location";

const DAY_COLOR = "#047fa0";
const HORIZON_COLOR = "#F6931D";
const NIGHT_COLOR = "#1C1F4D";
const TRUE_DAY_COLOR = "#2cb6e0";

// Placeholder, concrete numbers matching an exact visual spec -- not yet
// tied to latitude. Confirmed: pale blue background = sky; this circle's
// edge = Prague's horizon (0° altitude), with everything below the
// horizon (not yet subdivided into twilight/night) filled orange. Shifted
// down four times now (18.33, then three more steps of 9.165) from its
// original top of 451.67; radius unchanged (355.55).
const PLACEHOLDER_HORIZON_CIRCLE = {
  center: { x: 600, y: 838 },
  radius: 336,
};

// Astronomical twilight boundary (-18° altitude): the curved edge of this
// circle is where the sky goes from "twilight glow" to "zero sunlight,
// true night." 10% smaller than its original size (radius 211.5, was
// 235), shifted down by the same four steps as the horizon circle. Fully
// inside the clip (not cropped): 23 units of margin before the clip's own
// bottom edge at 985.
const PLACEHOLDER_NIGHT_CIRCLE = {
  center: { x: 600, y: 744 },
  radius: 211.5,
};

// The horizon boundary (0° altitude), drawn LAST/on top -- this is the
// circle that's mathematically required to contain the pivot (the North
// Celestial Pole, always above the horizon at any latitude in the
// northern hemisphere), confirmed three independent ways: the pole is
// circumpolar by definition; projecting the zenith lands inside it;
// projecting the nadir lands outside it. It shows through wherever it
// overlaps the orange/navy circles beneath it, since "day" wins
// regardless of what those simpler circles would otherwise claim there.
// Centered exactly on the pivot (both axes) and sized by eye against the
// reference image -- same process as the horizon and twilight-boundary
// circles.
const PLACEHOLDER_DAY_CIRCLE = { center: { x: 600, y: 600 }, radius: 152 };

/**
 * The astrolabe horizon plate: the fixed background disc behind the zodiac
 * ring. Never rotates (see ClockFace.tsx's liveRotation, which has no case
 * for this layer).
 *
 * STRIPPED DOWN to just the single horizon circle while its placement is
 * being verified against a concrete visual spec, with hardcoded numbers
 * rather than a formula for now. Twilight/night subdivision, the day/teal
 * shading, hour-divider arcs, numerals, inscriptions, and globe are all
 * removed for now, not gone for good.
 */
export function HorizonPlateLayer({
  location: _location,
}: {
  location: Location;
}) {
  return (
    <div className="clock-layer">
      <svg viewBox="0 0 1200 1200">
        <defs>
          {/* Matches the original hand-traced background.svg's own painted
              extent (its sky circle: cx=600.14,cy=588.29,r=360.5) rather
              than the whole 1200x1200 canvas -- everything else
              (gold-trim, roman-ring, ...) is implicitly bounded by its own
              artwork; this layer has to clip itself explicitly instead. */}
          <clipPath id="horizon-plate-clip">
            <circle cx={600} cy={600} r={385} />
          </clipPath>
        </defs>
        <g clipPath="url(#horizon-plate-clip)">
          <rect x="0" y="0" width="1200" height="1200" fill={DAY_COLOR} />
          <circle
            cx={PLACEHOLDER_HORIZON_CIRCLE.center.x}
            cy={PLACEHOLDER_HORIZON_CIRCLE.center.y}
            r={PLACEHOLDER_HORIZON_CIRCLE.radius}
            fill={HORIZON_COLOR}
          />
          <circle
            cx={PLACEHOLDER_NIGHT_CIRCLE.center.x}
            cy={PLACEHOLDER_NIGHT_CIRCLE.center.y}
            r={PLACEHOLDER_NIGHT_CIRCLE.radius}
            fill={NIGHT_COLOR}
          />
          <circle
            cx={PLACEHOLDER_DAY_CIRCLE.center.x}
            cy={PLACEHOLDER_DAY_CIRCLE.center.y}
            r={PLACEHOLDER_DAY_CIRCLE.radius}
            fill={TRUE_DAY_COLOR}
          />
        </g>
      </svg>
    </div>
  );
}
