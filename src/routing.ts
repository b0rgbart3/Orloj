import { useCallback, useEffect, useState } from "react";

// `about/<section>` targets a specific section of the About page (see
// AboutPage's SECTIONS); `learn/<slug>` is a deep-dive topic page (see
// src/learn/).
export type Page = "home" | "about" | `about/${string}` | `learn/${string}`;

/** Only hashes that name a page we actually route to return a Page here.
 * Anything else (`null`) is left for the browser's native same-page anchor
 * scrolling to handle -- so, e.g., an in-page jump to an element id that
 * isn't a registered route doesn't get reinterpreted as "go home". */
function matchPage(hash: string): Page | null {
  const path = hash.replace(/^#\/?/, "");
  if (path === "") return "home";
  if (path === "about") return "about";
  if (path.startsWith("about/") && path.length > "about/".length) return path as Page;
  if (path.startsWith("learn/") && path.length > "learn/".length) return path as Page;
  return null;
}

/** Hash-based routing: the URL hash is the single source of truth for the
 * current page, so deep-dive topic pages and About's sections are real,
 * bookmarkable, shareable links (e.g. #learn/sidereal-time,
 * #about/how-it-works) with no server-side rewrite rules needed -- the hash
 * never reaches the server. */
export function usePageRoute(): [Page, (page: Page) => void] {
  const [page, setPage] = useState<Page>(() => matchPage(window.location.hash) ?? "home");

  useEffect(() => {
    const onHashChange = () => {
      const matched = matchPage(window.location.hash);
      if (matched) setPage(matched);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((next: Page) => {
    window.location.hash = next === "home" ? "" : `#${next}`;
  }, []);

  return [page, navigate];
}
