import { useEffect, useRef, useState } from 'react'

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

  useEffect(() => {
    const gradient = containerRef.current?.querySelector(`#${gradientId}`)
    if (!gradient) return
    const [cx, cy] = CENTER
    gradient.setAttribute('gradientTransform', `rotate(${-rotation} ${cx} ${cy})`)
  }, [rotation, gradientId, markup])

  return (
    <div
      ref={containerRef}
      className="clock-layer"
      style={{ transform: `rotate(${rotation}deg)`, filter }}
      dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
    />
  )
}
