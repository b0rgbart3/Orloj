import { useEffect, useState } from "react";
import { DEBUG_LOCATIONS } from "./location";
import type { NamedLocation } from "./location";

/** Reads `?location=<key>` from the URL (e.g. `?location=cairo`) to
 * override the clock's location for visual testing. Validated against
 * DEBUG_LOCATIONS so a missing or unrecognized value always falls back to
 * `null` (the caller's default location) rather than crashing. Also used
 * as the location picker's own id lookup, so a debug link and a picker
 * selection resolve to the exact same NamedLocation. */
export function useLocationDebug(): NamedLocation | null {
  const read = () => {
    const value = new URLSearchParams(window.location.search).get("location");
    return value && value in DEBUG_LOCATIONS ? DEBUG_LOCATIONS[value] : null;
  };

  const [location, setLocation] = useState<NamedLocation | null>(read);

  useEffect(() => {
    const onPopState = () => setLocation(read());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return location;
}
