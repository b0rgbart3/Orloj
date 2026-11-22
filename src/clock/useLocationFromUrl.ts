import { useEffect, useState } from "react";
import { LOCATIONS_BY_ID } from "./location";
import type { NamedLocation } from "./location";

/** Reads `?location=<key>` from the URL (e.g. `?location=cairo`) so a
 * shared link opens to the same city the sharer had selected -- this is
 * also how the location picker's own selection round-trips through a
 * reload. Validated against LOCATIONS_BY_ID so a missing or unrecognized
 * value always falls back to `null` (the caller's default location)
 * rather than crashing. */
export function useLocationFromUrl(): NamedLocation | null {
  const read = () => {
    const value = new URLSearchParams(window.location.search).get("location");
    return value && value in LOCATIONS_BY_ID ? LOCATIONS_BY_ID[value] : null;
  };

  const [location, setLocation] = useState<NamedLocation | null>(read);

  useEffect(() => {
    const onPopState = () => setLocation(read());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return location;
}
