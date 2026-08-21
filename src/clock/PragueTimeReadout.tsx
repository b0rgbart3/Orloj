import { usePragueTime } from './usePragueTime'

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export function PragueTimeReadout() {
  const { hours, minutes, seconds } = usePragueTime()
  return (
    <div className="prague-time-readout">
      Prague time: {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </div>
  )
}
