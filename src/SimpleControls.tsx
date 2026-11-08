import type { PlaybackSpeed, RangeOption } from "./clock/useScrubbableTime";
import "./SimpleControls.css";
import { RangeDropdown } from "./RangeDropdown";
import { SpeedDropdown } from "./SpeedDropdown";

export function SimpleControls({
  offsetMs,
  customAnchor,
  onReset,
  isPlaying,
  onTogglePlay,
  speedHoursPerSecond,
  onSpeedChange,
  rangeOption,
  onRangeChange,
}: {
  offsetMs: number;
  customAnchor: Date | null;
  onReset: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  speedHoursPerSecond: PlaybackSpeed;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  rangeOption: RangeOption;
  onRangeChange: (option: RangeOption) => void;
}) {
  return (
    <div className="simple-controls">
      <button
        type="button"
        className="simple-controls-button simple-controls-play-button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="4" width="5" height="16" fill="#000" />
            <rect x="14" y="4" width="5" height="16" fill="#000" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 4l14 8-14 8V4z" fill="#000" />
          </svg>
        )}
      </button>
      <SpeedDropdown value={speedHoursPerSecond} onChange={onSpeedChange} />
      <RangeDropdown value={rangeOption} onChange={onRangeChange} />
      <button
        type="button"
        className="simple-controls-button simple-controls-now-button"
        onClick={onReset}
        disabled={offsetMs === 0 && !isPlaying && customAnchor === null}
      >
        Now
      </button>
    </div>
  );
}
