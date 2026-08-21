import { ClockLayer } from './ClockLayer'
import './ClockFace.css'

// Layers are stacked bottom to top. Every SVG shares the same 1200x1200
// viewBox (center at 600,600), so they line up automatically.
const DROP_SHADOW = 'drop-shadow(0 0 8px #000000)'

const LAYERS = [
  { id: 'background', src: '/clock/background.svg' },
  { id: 'gold-trim', src: '/clock/gold_trim.svg', filter: DROP_SHADOW },
  { id: 'roman-ring', src: '/clock/roman_ring.svg', filter: DROP_SHADOW },
  { id: 'center-ring', src: '/clock/center_ring.svg', filter: DROP_SHADOW },
  { id: 'numeric-ring', src: '/clock/numeric_ring.svg', filter: DROP_SHADOW },
]

export function ClockFace() {
  return (
    <div className="clock-stage">
      {LAYERS.map((layer) => (
        <ClockLayer key={layer.id} src={layer.src} filter={layer.filter} />
      ))}
    </div>
  )
}
