import "./SimpleScrubber.css";

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
  );
}
