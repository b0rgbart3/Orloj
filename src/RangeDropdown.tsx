import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [listRect, setListRect] = useState<{ top: number; right: number; minWidth: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Portaled to <body> (see below), same as LocationDropdown, so this list
  // can stack above the clock face rather than being stuck behind it inside
  // app-header's own stacking context.
  useLayoutEffect(() => {
    if (!open) return;
    const updateRect = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setListRect({ top: rect.bottom + 8, right: window.innerWidth - rect.right, minWidth: rect.width });
    };
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="range-dropdown">
      <button
        ref={triggerRef}
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
      {open &&
        listRect &&
        createPortal(
          <ul
            ref={listRef}
            className="range-dropdown-list"
            role="listbox"
            style={{ top: listRect.top, right: listRect.right, minWidth: listRect.minWidth }}
          >
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
          </ul>,
          document.body,
        )}
    </div>
  );
}
