import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

type GradientClockLayerProps = {
  src: string
  /** id of the <linearGradient> inside the SVG to counter-rotate so it stays vertical on screen. */
  gradientId: string
  /** Rotation in degrees, applied around the layer's center. */
  rotation?: number
  /** CSS filter, e.g. a drop-shadow. */
  filter?: string
}

// Every layer shares the same 1200x1200 viewBox, centered at (600,600).
const CENTER: [number, number] = [600, 600]

/**
 * Renders an SVG layer inline (rather than via <img>) so that its internal
 * <linearGradient> can be counter-rotated at runtime, keeping the gradient
 * visually vertical even while the layer itself rotates.
 */
export function GradientClockLayer({ src, gradientId, rotation = 0, filter }: GradientClockLayerProps) {
  const [markup, setMarkup] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    fetch(src)
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) setMarkup(text)
      })
    return () => {
      cancelled = true
    }
  }, [src])

  // Layout effect (not a plain effect): this must apply in the same paint as
  // the layer's own rotation. A plain useEffect runs after paint, so for one
  // frame each update the artwork would show the new rotation with the
  // gradient still counter-rotated for the old one — a visible flicker on
  // any layer whose rotation changes continuously (e.g. the zodiac ring's
  // live sidereal rotation).
  useLayoutEffect(() => {
    const gradient = containerRef.current?.querySelector(`#${gradientId}`)
    if (!gradient) return
    const [cx, cy] = CENTER
    gradient.setAttribute('gradientTransform', `rotate(${-rotation} ${cx} ${cy})`)
  }, [rotation, gradientId, markup])

  // Memoized so this object's identity is stable across renders where markup
  // hasn't changed — without this, a fresh { __html: markup } object every
  // render made React re-assign innerHTML on every re-render (e.g. every
  // second, from the live clock tick), silently recreating the
  // <linearGradient> element and wiping out whatever gradientTransform the
  // layout effect above had applied to the previous one.
  const innerHtml = useMemo(() => (markup ? { __html: markup } : undefined), [markup])

  return (
    <div
      ref={containerRef}
      className="clock-layer"
      style={{ transform: `rotate(${rotation}deg)`, filter }}
      dangerouslySetInnerHTML={innerHtml}
    />
  )
}
