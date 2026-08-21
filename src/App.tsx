import { ClockFace } from './clock/ClockFace'
import { Timeline } from './clock/Timeline'
import { useScrubbableTime } from './clock/useScrubbableTime'

function App() {
  const {
    pragueTime,
    offsetMs,
    setOffsetMs,
    resetToNow,
    minOffsetMs,
    maxOffsetMs,
    isPlaying,
    togglePlay,
    speedHoursPerSecond,
    setSpeedHoursPerSecond,
  } = useScrubbableTime()

  return (
    <main className="app">
      <ClockFace pragueTime={pragueTime} />
      <Timeline
        pragueTime={pragueTime}
        offsetMs={offsetMs}
        minOffsetMs={minOffsetMs}
        maxOffsetMs={maxOffsetMs}
        onOffsetChange={setOffsetMs}
        onReset={resetToNow}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        speedHoursPerSecond={speedHoursPerSecond}
        onSpeedChange={setSpeedHoursPerSecond}
      />
    </main>
  )
}

export default App
