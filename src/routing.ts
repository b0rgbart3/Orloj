import { useCallback, useEffect, useState } from "react";

// `learn/<slug>` is reserved for deep-dive topic pages (see src/learn/).
export type Page = "home" | "about" | `learn/${string}`;

function parsePage(hash: string): Page {
  const path = hash.replace(/^#\/?/, "");
  if (path === "about") return "about";
  if (path.startsWith("learn/") && path.length > "learn/".length) return path as Page;
  return "home";
}

/** Hash-based routing: the URL hash is the single source of truth for the
 * current page, so deep-dive topic pages are real, bookmarkable, shareable
 * links (e.g. #learn/sidereal-time) with no server-side rewrite rules
 * needed -- the hash never reaches the server. */
export function usePageRoute(): [Page, (page: Page) => void] {
  const [page, setPage] = useState<Page>(() => parsePage(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setPage(parsePage(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((next: Page) => {
    window.location.hash = next === "home" ? "" : `#${next}`;
  }, []);

  return [page, navigate];
}
