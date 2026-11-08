import { useEffect, useRef, useState } from "react";
import {
  getPragueDateTimeInputValues,
  pragueWallTimeToUtc,
} from "./clock/usePragueTime";
import "./DateTimeModal.css";

export function DateTimeModal({
  open,
  initialDate,
  onClose,
  onConfirm,
}: {
  open: boolean;
  initialDate: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
}) {
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const values = getPragueDateTimeInputValues(initialDate);
    setDateValue(values.date);
    setTimeValue(values.time);
    dateInputRef.current?.focus();
    // initialDate intentionally excluded: it ticks every second while the
    // clock runs, and re-syncing on every tick would fight the user's typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const [year, month, day] = dateValue.split("-").map(Number);
    const [hour, minute] = timeValue.split(":").map(Number);
    if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
      return;
    }
    onConfirm(pragueWallTimeToUtc({ year, month, day, hour, minute }));
    onClose();
  }

  return (
    <div className="datetime-modal-backdrop" onClick={onClose}>
      <div
        className="datetime-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Set an exact date and time"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="datetime-modal-title">Set the orloj's date &amp; time</h2>
        <form className="datetime-modal-form" onSubmit={handleSubmit}>
          <label className="datetime-modal-field">
            Date
            <input
              ref={dateInputRef}
              type="date"
              value={dateValue}
              onChange={(event) => setDateValue(event.target.value)}
              required
            />
          </label>
          <label className="datetime-modal-field">
            Time (Prague)
            <input
              type="time"
              value={timeValue}
              onChange={(event) => setTimeValue(event.target.value)}
              required
            />
          </label>
          <div className="datetime-modal-actions">
            <button type="button" className="datetime-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="datetime-modal-confirm">
              Set
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
