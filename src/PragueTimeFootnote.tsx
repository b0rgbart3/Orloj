import { useEffect, useRef, useState } from "react";
import "./PragueTimeFootnote.css";

export function PragueTimeFootnote() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

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
    <span className="prague-time-footnote" ref={containerRef}>
      <button
        type="button"
        className="prague-time-footnote-mark"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
      >
        &#10059;
      </button>
      {open && <span className="prague-time-footnote-tooltip">Date and time in Prague, Czech Republic</span>}
    </span>
  );
}
