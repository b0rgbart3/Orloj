import { useState } from "react";
import { DEFAULT_LOCATION, LOCATIONS, type NamedLocation } from "./location";
import { useLocationDebug } from "./useLocationDebug";

const STORAGE_KEY = "orloj:location-id";

function readPersistedLocation(): NamedLocation | null {
  const id = localStorage.getItem(STORAGE_KEY);
  return LOCATIONS.find((location) => location.id === id) ?? null;
}

/** The clock's current location, user-selectable via the location picker.
 * `?location=<key>` (see useLocationDebug) wins on first load, for visual
 * testing; otherwise the last picker selection is restored from
 * localStorage; otherwise DEFAULT_LOCATION (Prague). A picker selection
 * persists immediately, so it survives a reload even if the page was
 * first opened via a debug link. */
export function useSelectedLocation(): [NamedLocation, (location: NamedLocation) => void] {
  const debugLocation = useLocationDebug();
  const [location, setLocationState] = useState<NamedLocation>(
    () => debugLocation ?? readPersistedLocation() ?? DEFAULT_LOCATION,
  );

  function setLocation(next: NamedLocation) {
    setLocationState(next);
    localStorage.setItem(STORAGE_KEY, next.id);
  }

  return [location, setLocation];
}
