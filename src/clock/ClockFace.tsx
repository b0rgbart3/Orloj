import { ClockLayer } from './ClockLayer'
import { GradientClockLayer } from './GradientClockLayer'
import { HorizonPlateLayer } from './HorizonPlateLayer'
import type { Location } from './location'
import { MoonGlyphLayer } from './MoonGlyphLayer'
import {
  moonHandRotationDegrees,
  numericRingRotationDegrees,
  sunHandRotationDegrees,
  zodiacRingRotationDegrees,
} from './rotations'
import { SunGlyphLayer } from './SunGlyphLayer'
import { useOnlyLayerDebug } from './useOnlyLayerDebug'
import type { PragueTime } from './usePragueTime'
import { ZodiacHouseLayer } from './ZodiacHouseLayer'
import './ClockFace.css'

// Layers are stacked bottom to top. Every SVG shares the same 1200x1200
// viewBox (center at 600,600), so they line up automatically.
const DROP_SHADOW = 'drop-shadow(0 0 8px #000000)'
// The sun glyph's shadow reads as cool blue-gray against its warm gold fill
// when it's plain black, so it gets its own warm dark-brown shadow instead.
// Stacked twice (a tight core + a wider falloff) since a single drop-shadow
// at this blur radius faded out too quickly to read as a strong shadow.
const SUN_GLYPH_DROP_SHADOW = 'drop-shadow(0 0 3px #1A0F08) drop-shadow(0 0 8px #1A0F08)'
const CENTER_CAP_DROP_SHADOW = 'drop-shadow(0 0 3px rgba(0,0,0,0.7))'

type Layer =
  | { id: string; kind: 'image'; src: string; filter?: string; rotation?: number }
  | { id: string; kind: 'gradient'; src: string; gradientId: string; filter?: string; rotation?: number }

// Layers that carry the vertical gold gradient use `kind: 'gradient'` so
// their SVG is inlined instead of loaded via <img> — that's what lets us
// reach in and counter-rotate the gradient at runtime (see
// GradientClockLayer), keeping it visually vertical once these layers
// start rotating.
const LAYERS: Layer[] = [
  // background's `kind`/`src` here are nominal (the file no longer exists)
  // -- ClockFace special-cases its id to render via HorizonPlateLayer
  // instead (see below), a generated astrolabe plate rather than a static
  // file. The id has to stay in this array regardless, since it's what
  // drives both z-order and the ?onlyLayer= debug toggle.
  { id: 'background', kind: 'image', src: '/clock/background.svg' },
  // gold-trim and center-ring (the original hand-drawn hour-arc fan and
  // globe-in-a-gold-ring) are deliberately gone, not forgotten -- both are
  // now computed live as part of HorizonPlateLayer instead of this static
  // artwork, and keeping both rendered the same elements twice, slightly
  // misaligned.
  {
    id: 'roman-ring',
    kind: 'gradient',
    src: '/clock/roman_ring.svg',
    gradientId: 'roman-gold-gradient',
    filter: DROP_SHADOW,
  },
  // moon-dial-back is the moon hand's short, capped end -- painted here,
  // underneath the zodiac ring, while its long plain end (moon-dial,
  // below) stays layered above the ring. Same rigid hand, same rotation,
  // split into two files purely so the ring can occlude one end of it.
  { id: 'moon-dial-back', kind: 'image', src: '/clock/moon_dial_back.svg', filter: DROP_SHADOW },
  {
    id: 'zodiac-ring',
    kind: 'gradient',
    src: '/clock/zodiac_ring_separated.svg',
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
  // sun-dial is the pointer arm/corona artwork only -- fully static, so it
  // renders through the plain <img> path like moon-dial/star-dial below.
  { id: 'sun-dial', kind: 'image', src: '/clock/sun_dial.svg', filter: DROP_SHADOW },
  // sun-glyph's `kind: 'image'` here is nominal -- ClockFace special-cases
  // its id to render via SunGlyphLayer instead (see below), since the glyph
  // needs to be inlined and repositioned at runtime as it rides the zodiac
  // ring's eccentric circle over the year.
  { id: 'sun-glyph', kind: 'image', src: '/clock/sun_glyph.svg', filter: SUN_GLYPH_DROP_SHADOW },
  { id: 'moon-dial', kind: 'image', src: '/clock/moon_dial.svg', filter: DROP_SHADOW },
  // moon-glyph's `kind: 'image'` here is nominal -- ClockFace special-cases
  // its id to render via MoonGlyphLayer instead (see below), mirroring
  // sun-glyph: the glyph needs to be inlined and repositioned at runtime as
  // it rides the zodiac ring's eccentric circle, and it redraws its own
  // phase shape every tick.
  { id: 'moon-glyph', kind: 'image', src: '/clock/moon_glyph.svg', filter: DROP_SHADOW },
  { id: 'star-dial', kind: 'image', src: '/clock/star_dial.svg', filter: DROP_SHADOW },
  // Static axial end-cap, deliberately last so it sits above every hand and
  // glyph -- it's rotationally symmetric about the clock's center, so it
  // looks identical whether or not it ever gets a rotation of its own.
  { id: 'center-cap', kind: 'image', src: '/clock/center_cap.svg', filter: CENTER_CAP_DROP_SHADOW },
]

// Layers whose rotation is computed live from Prague time, rather than
// fixed in the layer config above.
function liveRotation(id: string, pragueTime: PragueTime, location: Location): number | undefined {
  switch (id) {
    case 'sun-dial':
    case 'sun-glyph':
      return sunHandRotationDegrees(pragueTime)
    case 'moon-dial':
    case 'moon-dial-back':
    case 'moon-glyph':
      return moonHandRotationDegrees(pragueTime)
    // Zodiac ring and star-dial share one sidereal rotation — same physical
    // motion (Earth relative to the fixed stars), same spindle.
    case 'zodiac-ring':
    case 'star-dial':
      return zodiacRingRotationDegrees(pragueTime, location)
    case 'numeric-ring':
      return numericRingRotationDegrees(pragueTime.date, location)
    default:
      return undefined
  }
}

const LAYER_IDS = LAYERS.map((layer) => layer.id)

export function ClockFace({ pragueTime, location }: { pragueTime: PragueTime; location: Location }) {
  const onlyLayer = useOnlyLayerDebug(LAYER_IDS)
  const visibleLayers = onlyLayer ? LAYERS.filter((layer) => layer.id === onlyLayer) : LAYERS

  return (
    <div className="clock-stage">
      {visibleLayers.map((layer) => {
        const rotation = liveRotation(layer.id, pragueTime, location) ?? layer.rotation
        if (layer.id === 'background') {
          return <HorizonPlateLayer key={layer.id} location={location} />
        }
        if (layer.id === 'zodiac-ring' && layer.kind === 'gradient') {
          return (
            <ZodiacHouseLayer
              key={layer.id}
              src={layer.src}
              gradientId={layer.gradientId}
              rotation={rotation}
              filter={layer.filter}
              pragueTime={pragueTime}
              ringRotation={rotation ?? 0}
            />
          )
        }
        if (layer.id === 'sun-glyph') {
          return (
            <SunGlyphLayer
              key={layer.id}
              src={layer.src}
              rotation={rotation}
              filter={layer.filter}
              pragueTime={pragueTime}
              ringRotation={zodiacRingRotationDegrees(pragueTime, location)}
            />
          )
        }
        if (layer.id === 'moon-glyph') {
          return (
            <MoonGlyphLayer
              key={layer.id}
              src={layer.src}
              rotation={rotation}
              filter={layer.filter}
              pragueTime={pragueTime}
              ringRotation={zodiacRingRotationDegrees(pragueTime, location)}
            />
          )
        }
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
