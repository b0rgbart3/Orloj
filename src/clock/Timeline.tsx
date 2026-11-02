import type { CSSProperties } from 'react'
import { PLAYBACK_SPEEDS, type PlaybackSpeed } from './useScrubbableTime'
import { getPragueDateParts, type PragueTime } from './usePragueTime'
import './Timeline.css'

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function padHour(n: number) {
  return n.toString().padStart(2, ' ')
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
  const { day, month, year } = getPragueDateParts(pragueTime.date)
  const progress = ((offsetMs - minOffsetMs) / (maxOffsetMs - minOffsetMs)) * 100

  return (
    <div className="timeline">
      <div className="timeline-plate">
        <span className="timeline-plate-text">
          <span className="timeline-day">{day}</span>
          <span className="timeline-month">{month}</span>
          <span className="timeline-year">{year}</span>
          <span className="timeline-time">
            {padHour(pragueTime.hours)}:{pad(pragueTime.minutes)}
          </span>
        </span>
      </div>
      <div className="timeline-readout">
        <div className="timeline-controls">
          <button
            type="button"
            className="timeline-play-button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
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
        style={{ '--timeline-progress': `${progress}%` } as CSSProperties}
      />
    </div>
  )
}
