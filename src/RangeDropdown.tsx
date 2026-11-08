import { useEffect, useRef, useState } from "react";
import { RANGE_OPTIONS, type RangeOption } from "./clock/useScrubbableTime";
import "./RangeDropdown.css";

function rangeLabel(option: RangeOption) {
  return option === "inception" ? "Since inception" : `${option} months`;
}

export function RangeDropdown({
  value,
  onChange,
}: {
  value: RangeOption;
  onChange: (option: RangeOption) => void;
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
    <div className="range-dropdown" ref={containerRef}>
      <button
        type="button"
        className="range-dropdown-trigger"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {rangeLabel(value)}
        <svg className="range-dropdown-caret" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M0 0l5 6 5-6z" fill="#000" />
        </svg>
      </button>
      {open && (
        <ul className="range-dropdown-list" role="listbox">
          {RANGE_OPTIONS.map((option) => (
            <li key={option}>
              <button
                type="button"
                className={option === value ? "range-dropdown-option range-dropdown-option-active" : "range-dropdown-option"}
                role="option"
                aria-selected={option === value}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                {rangeLabel(option)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
