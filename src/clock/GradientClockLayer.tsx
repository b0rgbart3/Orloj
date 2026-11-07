import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from 'react'

type GradientClockLayerProps = {
  src: string
  /**
   * id of the <linearGradient> inside the SVG to counter-rotate so it stays
   * vertical on screen. Omit for layers that only need the `decorate` hook
   * (inlined SVG access) without any gradient counter-rotation.
   */
  gradientId?: string
  /** Rotation in degrees, applied around the layer's center. */
  rotation?: number
  /** CSS filter, e.g. a drop-shadow. */
  filter?: string
  /**
   * Extra runtime DOM mutation, applied in the same layout effect as the
   * gradient counter-rotation (same paint, no separate flicker risk).
   */
  decorate?: (container: HTMLDivElement) => void
  /**
   * Click passthrough for the inlined SVG. The container itself keeps
   * `pointer-events: none` (see ClockFace.css) so layers don't block clicks
   * meant for whatever's beneath them; this only fires when the click lands
   * on a descendant that `decorate` has opted into `pointer-events: auto`
   * (e.g. the zodiac wedges), since such clicks still bubble up to the
   * container despite its own pointer-events being off.
   */
  onClick?: (event: MouseEvent<HTMLDivElement>) => void
}

// Every layer shares the same 1200x1200 viewBox, centered at (600,600).
const CENTER: [number, number] = [600, 600]

/**
 * Renders an SVG layer inline (rather than via <img>) so that its internal
 * <linearGradient> can be counter-rotated at runtime, keeping the gradient
 * visually vertical even while the layer itself rotates.
 */
export function GradientClockLayer({ src, gradientId, rotation = 0, filter, decorate, onClick }: GradientClockLayerProps) {
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
    if (gradientId) {
      const gradient = containerRef.current?.querySelector(`#${gradientId}`)
      if (gradient) {
        const [cx, cy] = CENTER
        gradient.setAttribute('gradientTransform', `rotate(${-rotation} ${cx} ${cy})`)
      }
    }
    if (containerRef.current) decorate?.(containerRef.current)
  }, [rotation, gradientId, markup, decorate])

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
      onClick={onClick}
    />
  )
}
