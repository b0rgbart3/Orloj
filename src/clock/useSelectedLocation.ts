import { useState } from "react";
import { DEFAULT_LOCATION, LOCATIONS, type NamedLocation } from "./location";
import { useLocationFromUrl } from "./useLocationFromUrl";

const STORAGE_KEY = "orloj:location-id";

function readPersistedLocation(): NamedLocation | null {
  const id = localStorage.getItem(STORAGE_KEY);
  return LOCATIONS.find((location) => location.id === id) ?? null;
}

function writeLocationToUrl(id: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("location", id);
  window.history.replaceState(window.history.state, "", url);
}

/** The clock's current location, user-selectable via the location picker.
 * `?location=<id>` (see useLocationFromUrl) wins on first load; otherwise
 * the last picker selection is restored from localStorage; otherwise
 * DEFAULT_LOCATION (Prague). A picker selection persists immediately (so
 * it survives a reload) and is also written into the URL's `?location=`
 * parameter, so copying the address bar shares the current city with
 * whoever opens the link -- `replaceState` rather than `pushState`, so
 * trying several cities doesn't fill up browser history. */
export function useSelectedLocation(): [NamedLocation, (location: NamedLocation) => void] {
  const urlLocation = useLocationFromUrl();
  const [location, setLocationState] = useState<NamedLocation>(
    () => urlLocation ?? readPersistedLocation() ?? DEFAULT_LOCATION,
  );

  function setLocation(next: NamedLocation) {
    setLocationState(next);
    localStorage.setItem(STORAGE_KEY, next.id);
    writeLocationToUrl(next.id);
  }

  return [location, setLocation];
}
