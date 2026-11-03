import { useEffect, useRef, useState } from "react";
import { PLAYBACK_SPEEDS, type PlaybackSpeed } from "./clock/useScrubbableTime";
import "./SpeedDropdown.css";

export function SpeedDropdown({
  value,
  onChange,
}: {
  value: PlaybackSpeed;
  onChange: (speed: PlaybackSpeed) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="speed-dropdown" ref={containerRef}>
      <button
        type="button"
        className="speed-dropdown-trigger"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value} hr/sec
        <svg className="speed-dropdown-caret" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M0 0l5 6 5-6z" fill="#000" />
        </svg>
      </button>
      {open && (
        <ul className="speed-dropdown-list" role="listbox">
          {PLAYBACK_SPEEDS.map((speed) => (
            <li key={speed}>
              <button
                type="button"
                className={speed === value ? "speed-dropdown-option speed-dropdown-option-active" : "speed-dropdown-option"}
                role="option"
                aria-selected={speed === value}
                onClick={() => {
                  onChange(speed);
                  setOpen(false);
                }}
              >
                {speed} hr/sec
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
