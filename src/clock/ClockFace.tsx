import { ClockLayer } from './ClockLayer'
import { GradientClockLayer } from './GradientClockLayer'
import {
  moonHandRotationDegrees,
  numericRingRotationDegrees,
  siderealRotationDegrees,
  sunHandRotationDegrees,
} from './rotations'
import { usePragueTime } from './usePragueTime'
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
  {
    id: 'zodiac-ring',
    kind: 'gradient',
    src: '/clock/zodiac_ring.svg',
    gradientId: 'zodiac-gold-gradient',
    filter: DROP_SHADOW,
  },
  {
    id: 'numeric-ring',
    kind: 'gradient',
    src: '/clock/numeric_ring.svg',
    gradientId: 'numericGoldGradient',
    filter: DROP_SHADOW,
  },
  // Artwork not finalized yet — plain <img> import, on top of everything else.
  { id: 'sun-dial', kind: 'image', src: '/clock/sun_dial.svg', filter: DROP_SHADOW },
  { id: 'moon-dial', kind: 'image', src: '/clock/moon_dial.svg', filter: DROP_SHADOW },
  { id: 'star-dial', kind: 'image', src: '/clock/star_dial.svg', filter: DROP_SHADOW },
]

// Layers whose rotation is computed live from Prague time, rather than
// fixed in the layer config above.
function liveRotation(id: string, pragueTime: ReturnType<typeof usePragueTime>): number | undefined {
  switch (id) {
    case 'sun-dial':
      return sunHandRotationDegrees(pragueTime)
    case 'moon-dial':
      return moonHandRotationDegrees(pragueTime)
    // Zodiac ring and star-dial share one sidereal rotation — same physical
    // motion (Earth relative to the fixed stars), same spindle.
    case 'zodiac-ring':
    case 'star-dial':
      return siderealRotationDegrees(pragueTime)
    case 'numeric-ring':
      return numericRingRotationDegrees(pragueTime.date)
    default:
      return undefined
  }
}

export function ClockFace() {
  const pragueTime = usePragueTime()

  return (
    <div className="clock-stage">
      {LAYERS.map((layer) => {
        const rotation = liveRotation(layer.id, pragueTime) ?? layer.rotation
        return layer.kind === 'gradient' ? (
          <GradientClockLayer
            key={layer.id}
            src={layer.src}
            gradientId={layer.gradientId}
            rotation={rotation}
            filter={layer.filter}
          />
        ) : (
          <ClockLayer key={layer.id} src={layer.src} rotation={rotation} filter={layer.filter} />
        )
      })}
    </div>
  )
}
