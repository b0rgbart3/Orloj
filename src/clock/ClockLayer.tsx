type ClockLayerProps = {
  src: string
  alt?: string
  /** Rotation in degrees, applied around the layer's center. */
  rotation?: number
  /** CSS filter, e.g. a drop-shadow. */
  filter?: string
}

export function ClockLayer({ src, alt = '', rotation = 0, filter }: ClockLayerProps) {
  return (
    <img
      src={src}
      alt={alt}
      className="clock-layer"
      style={{ transform: `rotate(${rotation}deg)`, filter }}
      draggable={false}
    />
  )
}
