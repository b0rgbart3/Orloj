import { getPragueDateParts } from "./clock/usePragueTime";
import "./SimpleScrubber.css";

// Beginning, quarter, middle, three-quarter, and end of the range -- the
// quarter marks are drawn shorter than the other three.
const TICK_POSITIONS = [0, 25, 50, 75, 100];

function formatLabelDate(date: Date) {
  const { day, month, year } = getPragueDateParts(date);
  return `${day} ${month} ${year}`;
}

export function SimpleScrubber({
  offsetMs,
  minOffsetMs,
  maxOffsetMs,
  onOffsetChange,
  minDate,
  maxDate,
  anchorDate,
}: {
  offsetMs: number;
  minOffsetMs: number;
  maxOffsetMs: number;
  onOffsetChange: (offsetMs: number) => void;
  minDate: Date;
  maxDate: Date;
  anchorDate: Date;
}) {
  return (
    <div className="simple-scrubber-wrap">
      <div className="simple-scrubber-track-wrap">
        <div className="simple-scrubber-ticks" aria-hidden="true">
          {TICK_POSITIONS.map((percent) => (
            <span
              key={percent}
              className={
                percent % 50 === 0
                  ? "simple-scrubber-tick simple-scrubber-tick-tall"
                  : "simple-scrubber-tick"
              }
              style={{ left: `${percent}%` }}
            />
          ))}
        </div>
        <input
          type="range"
          className="simple-scrubber"
          min={minOffsetMs}
          max={maxOffsetMs}
          step={60000}
          value={offsetMs}
          onChange={(event) => onOffsetChange(Number(event.target.value))}
          aria-label="Scrub through time"
        />
      </div>
      <div className="simple-scrubber-labels" aria-hidden="true">
        <span className="simple-scrubber-label simple-scrubber-label-start">
          {formatLabelDate(minDate)}
        </span>
        <span className="simple-scrubber-label simple-scrubber-label-center">
          {formatLabelDate(anchorDate)}
        </span>
        <span className="simple-scrubber-label simple-scrubber-label-end">
          {formatLabelDate(maxDate)}
        </span>
      </div>
    </div>
  );
}
