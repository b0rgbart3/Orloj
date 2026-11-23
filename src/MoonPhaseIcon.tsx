import { useMemo } from "react";
import { trueLunarElongationDeg } from "./clock/lunarEphemeris";
import { moonPhaseBrightPathD } from "./clock/moonPhaseShape";

type MoonPhaseIconProps = {
  date: Date;
  className?: string;
};

const CENTER = 50;
const RADIUS = 46;

/** A small, non-rotating version of the clock face's moon glyph, showing
 * the same live phase shape (see moonPhaseShape.ts) rather than the old
 * static icons/moon-icon.svg's frozen half-and-half split -- used wherever
 * the drawer needs a moon icon that actually matches what {moonPhase} and
 * {moonIllumination}% lit are saying next to it. */
export function MoonPhaseIcon({ date, className }: MoonPhaseIconProps) {
  const brightPathD = useMemo(
    () => moonPhaseBrightPathD(CENTER, CENTER, RADIUS, trueLunarElongationDeg(date)),
    [date],
  );

  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#2b2b36" />
      <path d={brightPathD} fill="#F4F6FC" />
    </svg>
  );
}
