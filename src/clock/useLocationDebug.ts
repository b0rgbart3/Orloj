import { useEffect, useState } from "react";
import { DEBUG_LOCATIONS } from "./location";
import type { Location } from "./location";

/** Reads `?location=<key>` from the URL (e.g. `?location=cairo`) to
 * override the clock's location for visual testing, before a real
 * location picker exists. Validated against DEBUG_LOCATIONS so a missing
 * or unrecognized value always falls back to `null` (the caller's default
 * location) rather than crashing. A permanent debugging aid, same pattern
 * as useOnlyLayerDebug. */
export function useLocationDebug(): Location | null {
  const read = () => {
    const value = new URLSearchParams(window.location.search).get("location");
    return value && value in DEBUG_LOCATIONS ? DEBUG_LOCATIONS[value] : null;
  };

  const [location, setLocation] = useState<Location | null>(read);

  useEffect(() => {
    const onPopState = () => setLocation(read());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return location;
}
