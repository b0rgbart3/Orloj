import "./SimpleScrubber.css";

// Beginning, quarter, middle, three-quarter, and end of the range -- the
// quarter marks are drawn shorter than the other three.
const TICK_POSITIONS = [0, 25, 50, 75, 100];

export function SimpleScrubber({
  offsetMs,
  minOffsetMs,
  maxOffsetMs,
  onOffsetChange,
}: {
  offsetMs: number;
  minOffsetMs: number;
  maxOffsetMs: number;
  onOffsetChange: (offsetMs: number) => void;
}) {
  return (
    <div className="simple-scrubber-wrap">
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
  );
}
