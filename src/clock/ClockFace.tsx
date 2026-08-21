import { ClockLayer } from './ClockLayer'
import { GradientClockLayer } from './GradientClockLayer'
import './ClockFace.css'

// Layers are stacked bottom to top. Every SVG shares the same 1200x1200
// viewBox (center at 600,600), so they line up automatically.
const DROP_SHADOW = 'drop-shadow(0 0 8px #000000)'

type Layer =
  | { id: string; kind: 'image'; src: string; filter?: string; rotation?: number }
  | { id: string; kind: 'gradient'; src: string; gradientId: string; filter?: string; rotation?: number }

// Layers that carry the vertical gold gradient use `kind: 'gradient'` so
// their SVG is inlined instead of loaded via <img> — that's what lets us
// reach in and counter-rotate the gradient at runtime (see
// GradientClockLayer), keeping it visually vertical once these layers
// start rotating.
const LAYERS: Layer[] = [
  { id: 'background', kind: 'image', src: '/clock/background.svg' },
  {
    id: 'gold-trim',
    kind: 'gradient',
    src: '/clock/gold_trim.svg',
    gradientId: 'goldtrim-gold-gradient',
    filter: DROP_SHADOW,
  },
  {
    id: 'roman-ring',
    kind: 'gradient',
    src: '/clock/roman_ring.svg',
    gradientId: 'roman-gold-gradient',
    filter: DROP_SHADOW,
  },
  {
    id: 'center-ring',
    kind: 'gradient',
    src: '/clock/center_ring.svg',
    gradientId: 'center-gold-gradient',
    filter: DROP_SHADOW,
  },
  { id: 'numeric-ring', kind: 'image', src: '/clock/numeric_ring.svg', filter: DROP_SHADOW },
  // Artwork not finalized yet — plain <img> import, on top of everything else.
  { id: 'sun-dial', kind: 'image', src: '/clock/sun_dial.svg', filter: DROP_SHADOW },
  { id: 'moon-dial', kind: 'image', src: '/clock/moon_dial.svg', filter: DROP_SHADOW },
]

export function ClockFace() {
  return (
    <div className="clock-stage">
      {LAYERS.map((layer) =>
        layer.kind === 'gradient' ? (
          <GradientClockLayer
            key={layer.id}
            src={layer.src}
            gradientId={layer.gradientId}
            rotation={layer.rotation}
            filter={layer.filter}
          />
        ) : (
          <ClockLayer key={layer.id} src={layer.src} rotation={layer.rotation} filter={layer.filter} />
        ),
      )}
    </div>
  )
}
