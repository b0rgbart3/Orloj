import katex from "katex";
import { useMemo } from "react";

/** Renders a LaTeX expression via KaTeX. `display` picks block (centered,
 * own line) vs inline (sized to match surrounding text) layout -- the same
 * distinction LaTeX itself makes between \[...\] and $...$. */
export function Math({
  tex,
  display = false,
}: {
  tex: string;
  display?: boolean;
}) {
  const html = useMemo(
    () =>
      katex.renderToString(tex, {
        displayMode: display,
        throwOnError: false,
      }),
    [tex, display],
  );
  const Tag = display ? "div" : "span";
  return (
    <Tag
      className={display ? "math-display" : undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
