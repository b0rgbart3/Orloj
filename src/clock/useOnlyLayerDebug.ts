import { useEffect, useState } from "react";

/** Reads `?onlyLayer=<id>` from the URL for isolating a single clock layer
 * during development (e.g. `?onlyLayer=zodiac-ring`). Validated against the
 * caller's own known layer ids so a missing or unrecognized value always
 * falls back to `null` (the full layer stack) rather than an empty clock.
 * A permanent debugging aid, not removed after any particular feature. */
export function useOnlyLayerDebug(validIds: readonly string[]): string | null {
  const read = () => {
    const value = new URLSearchParams(window.location.search).get("onlyLayer");
    return value && validIds.includes(value) ? value : null;
  };

  const [onlyLayer, setOnlyLayer] = useState<string | null>(read);

  useEffect(() => {
    const onPopState = () => setOnlyLayer(read());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validIds.join(",")]);

  return onlyLayer;
}
