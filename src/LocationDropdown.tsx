import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { locationLabel, LOCATIONS, type NamedLocation } from "./clock/location";
import "./LocationDropdown.css";

export function LocationDropdown({
  value,
  onChange,
}: {
  value: NamedLocation;
  onChange: (location: NamedLocation) => void;
}) {
  const [open, setOpen] = useState(false);
  const [listRect, setListRect] = useState<{ top: number; right: number; minWidth: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // The list is portaled straight to <body> (see below) rather than
  // rendered inline, so it's no longer confined to app-header's own
  // stacking context -- that context sits behind the clock face's
  // (ClockFace.css's .clock-stage, deliberately the highest z-plane in the
  // layout), so no z-index set *inside* the header could ever win against
  // it. Portaling out, then positioning with fixed coordinates computed
  // from the trigger's own rect, is what lets just this dropdown -- not
  // the whole header -- stack above the clock.
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
    <div className="location-dropdown">
      <button
        ref={triggerRef}
        type="button"
        className="location-dropdown-trigger"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {locationLabel(value)}
        <svg className="location-dropdown-caret" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M0 0l5 6 5-6z" fill="#000" />
        </svg>
      </button>
      {open &&
        listRect &&
        createPortal(
          <ul
            ref={listRef}
            className="location-dropdown-list"
            role="listbox"
            style={{ top: listRect.top, right: listRect.right, minWidth: listRect.minWidth }}
          >
            {LOCATIONS.map((location) => {
              const isDefault = location.id === "prague";
              const classNames = ["location-dropdown-option"];
              if (location.id === value.id) classNames.push("location-dropdown-option-active");
              if (isDefault) classNames.push("location-dropdown-option-default");
              return (
                <li key={location.id}>
                  <button
                    type="button"
                    className={classNames.join(" ")}
                    role="option"
                    aria-selected={location.id === value.id}
                    onClick={() => {
                      onChange(location);
                      setOpen(false);
                    }}
                  >
                    {isDefault && (
                      <svg className="location-dropdown-default-star" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M8 0l1.9 5.6H16l-4.8 3.5 1.9 5.6L8 11.2 3 14.7l1.9-5.6L0 5.6h6.1z" />
                      </svg>
                    )}
                    {locationLabel(location)}
                    {isDefault && <span className="location-dropdown-default-tag">default</span>}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}
