import { PLAYBACK_SPEEDS, type PlaybackSpeed } from './useScrubbableTime'
import { formatPragueDate, type PragueTime } from './usePragueTime'
import './Timeline.css'

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export function Timeline({
  pragueTime,
  offsetMs,
  minOffsetMs,
  maxOffsetMs,
  onOffsetChange,
  onReset,
  isPlaying,
  onTogglePlay,
  speedHoursPerSecond,
  onSpeedChange,
}: {
  pragueTime: PragueTime
  offsetMs: number
  minOffsetMs: number
  maxOffsetMs: number
  onOffsetChange: (offsetMs: number) => void
  onReset: () => void
  isPlaying: boolean
  onTogglePlay: () => void
  speedHoursPerSecond: PlaybackSpeed
  onSpeedChange: (speed: PlaybackSpeed) => void
}) {
  return (
    <div className="timeline">
      <div className="timeline-readout">
        <span>{formatPragueDate(pragueTime.date)}</span>
        <span>
          {pad(pragueTime.hours)}:{pad(pragueTime.minutes)}:{pad(pragueTime.seconds)}
        </span>
      </div>
      <div className="timeline-controls">
        <button type="button" className="timeline-play-button" onClick={onTogglePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <select
          className="timeline-speed-select"
          value={speedHoursPerSecond}
          onChange={(event) => onSpeedChange(Number(event.target.value) as PlaybackSpeed)}
          aria-label="Playback speed"
        >
          {PLAYBACK_SPEEDS.map((speed) => (
            <option key={speed} value={speed}>
              {speed} hr/sec
            </option>
          ))}
        </select>
        <button
          type="button"
          className="timeline-now-button"
          onClick={onReset}
          disabled={offsetMs === 0 && !isPlaying}
        >
          Now
        </button>
      </div>
      <input
        type="range"
        className="timeline-slider"
        min={minOffsetMs}
        max={maxOffsetMs}
        step={60000}
        value={offsetMs}
        onChange={(event) => onOffsetChange(Number(event.target.value))}
        aria-label="Scrub through time"
      />
    </div>
  )
}
