import { useEffect, useRef, useState, type ReactNode } from "react";
import { describeCurrentMoment } from "./clock/explainClock";
import type { PragueDateParts, PragueTime } from "./clock/usePragueTime";
import janSindel from "./assets/jan_sindel.jpg";
import "./ChatPanel.css";

type ChatMessage = { role: "user" | "assistant"; content: string };

type StreamEvent =
  | { type: "stage"; stage: string; sources?: string[] }
  | { type: "token"; content: string }
  | { type: "done"; answer: string; passages: unknown[] }
  | { type: "error"; message: string };

type ChatPanelProps = {
  open: boolean;
  onToggle: () => void;
  pragueTime: PragueTime;
  dateParts: PragueDateParts;
};

// Each backend pipeline stage maps to one or more visitor-facing phrases;
// stages with more than one phrase cycle through them while that stage is
// still in progress, so the status line keeps moving even on a slow step.
const STAGE_PHRASES: Record<string, string[]> = {
  digesting: [
    "divining your question",
    "unraveling your words",
    "weighing the question",
  ],
  context: [
    "reading the celestial alignment",
    "aligning the spheres",
    "taking the measure of the moment",
  ],
  searching: [
    "consulting the ancient texts",
    "cross-referencing the stars",
    "scanning the old manuscripts",
  ],
  generating: [
    "pondering",
    "contacting the oracle",
    "divining the answer",
    "consulting the gears",
    "charting the answer",
    "casting the horoscope",
  ],
};
const STAGE_CYCLE_MS = 1800;

const SITE_ORIGIN = "https://orloj.moon-math.online/";

// Topics the chatbot might touch on, mapped to the About/Learn page that
// covers them in depth. Checked against the user's question as well as the
// assistant's answer, since the answer doesn't always repeat the keyword
// the question used.
const LINK_RULES: Array<{
  match: RegExp;
  href: string;
  label: string;
  kind: "about-section" | "learn-page";
}> = [
  {
    match: /\bthe real (clock|orloj)\b|\bmikul[aá]š? (of )?kada[nň]\b|\bjan š?indel\b/i,
    href: `${SITE_ORIGIN}#about/real-clock`,
    label: "The real clock",
    kind: "about-section",
  },
  {
    match:
      /\bhow it works\b|\bzodiac ring\b|\bkalendarium\b|\bthree rings\b|\bfour dials\b|\b(roman ring|old bohemian)\b/i,
    href: `${SITE_ORIGIN}#about/how-it-works`,
    label: "How it works",
    kind: "about-section",
  },
  {
    match: /\bthis digital version\b|\bdigital version\b/i,
    href: `${SITE_ORIGIN}#about/digital-version`,
    label: "About this digital version",
    kind: "about-section",
  },
  {
    match: /\bbart dority\b|\bmoon-math\.online\b|\bthe developer\b/i,
    href: `${SITE_ORIGIN}#about/developer`,
    label: "About the developer",
    kind: "about-section",
  },
  {
    match: /\bsidereal (time|day)\b/i,
    href: `${SITE_ORIGIN}#learn/sidereal-time`,
    label: "Local Sidereal Time",
    kind: "learn-page",
  },
  {
    match:
      /\bastrological zodiac\b|\bzodiac sign(s)?\b|\b(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)\b/i,
    href: `${SITE_ORIGIN}#learn/astrological-zodiac`,
    label: "The Astrological Zodiac",
    kind: "learn-page",
  },
];
const MAX_LEARN_MORE_LINKS = 2;

// Builds a short "learn more" footer out of whichever About/Learn pages the
// conversation touched on, so visitors get pointed at the deeper material
// instead of it staying buried in the About page.
function buildLearnMoreFooter(question: string, answer: string): string {
  const haystack = `${question}\n${answer}`;
  const seen = new Set<string>();
  const lines: string[] = [];

  for (const rule of LINK_RULES) {
    if (lines.length >= MAX_LEARN_MORE_LINKS) break;
    if (seen.has(rule.href) || !rule.match.test(haystack)) continue;
    seen.add(rule.href);
    const link = `[${rule.label}](${rule.href})`;
    const where =
      rule.kind === "about-section"
        ? `the ${link} section of the About page`
        : `the ${link} page`;
    lines.push(
      lines.length === 0
        ? `To learn more, visit ${where}.`
        : `Or learn more about ${where}.`,
    );
  }

  return lines.length ? `\n\n${lines.join("\n")}` : "";
}

// Picks a random phrase other than the one currently showing, so repeated
// cycles within a long stage don't keep landing on the same line.
function pickNextIndex(phraseCount: number, currentIndex: number) {
  if (phraseCount < 2) return 0;
  let next = Math.floor(Math.random() * phraseCount);
  while (next === currentIndex) {
    next = Math.floor(Math.random() * phraseCount);
  }
  return next;
}

function ThinkingStatus({ stage }: { stage: string | null }) {
  const phrases = (stage && STAGE_PHRASES[stage]) || ["thinking"];
  // `gen` bumps on every pick (even if `index` lands on a repeat across a
  // stage change) so the key below always changes, forcing the entrance
  // animation to replay instead of silently patching the text in place.
  const [pick, setPick] = useState(() => ({
    index: Math.floor(Math.random() * phrases.length),
    gen: 0,
  }));

  useEffect(() => {
    setPick((p) => ({
      index: Math.floor(Math.random() * phrases.length),
      gen: p.gen + 1,
    }));
    if (phrases.length < 2) return;
    const id = setInterval(() => {
      setPick((p) => ({
        index: pickNextIndex(phrases.length, p.index),
        gen: p.gen + 1,
      }));
    }, STAGE_CYCLE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- phrases is derived from stage
  }, [stage]);

  return (
    <span className="chat-thinking-status">
      <span key={pick.gen} className="chat-thinking-phrase">
        {phrases[pick.index]}
      </span>
    </span>
  );
}

function ArmillarySphere() {
  return (
    <div className="chat-armillary" aria-hidden="true">
      <div className="chat-armillary-axis chat-armillary-axis--1">
        <div className="chat-armillary-ring" />
      </div>
      <div className="chat-armillary-axis chat-armillary-axis--2">
        <div className="chat-armillary-ring" />
      </div>
      <div className="chat-armillary-axis chat-armillary-axis--3">
        <div className="chat-armillary-ring" />
      </div>
      <div className="chat-armillary-core" />
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="chat-thinking-dots">
      <span />
      <span />
      <span />
    </span>
  );
}

export function ChatPanel({
  open,
  onToggle,
  pragueTime,
  dateParts,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [stage, setStage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingTokensRef = useRef("");
  const isDrainingRef = useRef(false);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function appendToLastAssistantMessage(delta: string) {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      next[next.length - 1] = { ...last, content: last.content + delta };
      return next;
    });
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    });
  }

  // Streamed tokens are buffered here instead of rendered immediately so
  // that paragraph breaks ("\n\n") can introduce a brief reading pause --
  // otherwise the full answer flows out at network speed with no rhythm.
  const PARAGRAPH_PAUSE_MS = 1000;

  async function drainPendingTokens() {
    if (isDrainingRef.current) return;
    isDrainingRef.current = true;
    while (pendingTokensRef.current.length > 0) {
      const buffer = pendingTokensRef.current;
      const breakIndex = buffer.indexOf("\n\n");
      if (breakIndex === -1) {
        pendingTokensRef.current = "";
        appendToLastAssistantMessage(buffer);
        break;
      }
      const chunk = buffer.slice(0, breakIndex + 2);
      pendingTokensRef.current = buffer.slice(breakIndex + 2);
      appendToLastAssistantMessage(chunk);
      await new Promise((resolve) =>
        setTimeout(resolve, PARAGRAPH_PAUSE_MS),
      );
    }
    isDrainingRef.current = false;
  }

  // Turns bare "https://..." runs within a plain-text segment into real
  // links, trimming trailing sentence punctuation (periods, commas, closing
  // quotes) that isn't actually part of the URL.
  function autoLink(text: string, keyPrefix: string): ReactNode[] {
    const urlRegex = /https?:\/\/[^\s<>]+/g;
    const nodes: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let linkIndex = 0;

    while ((match = urlRegex.exec(text))) {
      if (match.index > lastIndex)
        nodes.push(text.slice(lastIndex, match.index));

      let url = match[0];
      const trailingPunctuation = url.match(/[.,;:!?)'"]+$/)?.[0] ?? "";
      if (trailingPunctuation) url = url.slice(0, -trailingPunctuation.length);

      nodes.push(
        <a
          key={`${keyPrefix}-link-${linkIndex++}`}
          className="chat-link"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {url}
        </a>,
      );
      if (trailingPunctuation) nodes.push(trailingPunctuation);
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
    return nodes;
  }

  function renderInline(text: string, keyPrefix: string): ReactNode[] {
    const parts = text.split(
      /(\{\{swatch:[a-zA-Z]+\}\}|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g,
    );
    return parts.flatMap((part, index): ReactNode[] => {
      const swatchMatch = part.match(/^\{\{swatch:([a-zA-Z]+)\}\}$/);
      if (swatchMatch) {
        return [
          <span
            key={`${keyPrefix}-${index}`}
            className="chat-swatch"
            style={{ background: swatchMatch[1] }}
            aria-hidden="true"
          />,
        ];
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return [
          <a
            key={`${keyPrefix}-${index}`}
            className="chat-link"
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkMatch[1]}
          </a>,
        ];
      }
      const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
      if (boldMatch) {
        return [<strong key={`${keyPrefix}-${index}`}>{boldMatch[1]}</strong>];
      }
      return autoLink(part, `${keyPrefix}-${index}`);
    });
  }

  // A line that's *entirely* a bold span (e.g. "**The real clock:**") is a
  // section label -- rendered as its own block with vertical breathing room,
  // rather than inline bold text running into the following sentence.
  function renderContent(content: string) {
    const lines = content.split("\n");
    const nodes: ReactNode[] = [];
    lines.forEach((line, index) => {
      const labelMatch = line.trim().match(/^\*\*([^*]+)\*\*$/);
      if (labelMatch) {
        nodes.push(
          <div key={`label-${index}`} className="chat-section-label">
            {labelMatch[1]}
          </div>,
        );
      } else {
        nodes.push(
          <span key={`line-${index}`}>{renderInline(line, `l${index}`)}</span>,
        );
        if (index < lines.length - 1) nodes.push("\n");
      }
    });
    return nodes;
  }

  function handleClose() {
    pendingTokensRef.current = "";
    setMessages([]);
    setInput("");
    onToggle();
  }

  function replaceLastAssistantMessage(content: string) {
    setMessages((prev) => {
      const next = [...prev];
      next[next.length - 1] = { role: "assistant", content };
      return next;
    });
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || isStreaming) return;

    const history = messages.map(({ role, content }) => ({ role, content }));
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ]);
    setInput("");
    setIsStreaming(true);
    setStage("digesting");

    try {
      const context = describeCurrentMoment(pragueTime, dateParts);
      const response = await fetch("/api/ask/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, context }),
      });
      if (!response.ok || !response.body)
        throw new Error(`Request failed (${response.status})`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const event = JSON.parse(
            line.slice("data:".length).trim(),
          ) as StreamEvent;

          if (event.type === "stage") {
            setStage(event.stage);
          } else if (event.type === "token") {
            pendingTokensRef.current += event.content;
            void drainPendingTokens();
          } else if (event.type === "done") {
            const footer = buildLearnMoreFooter(text, event.answer);
            if (footer) {
              pendingTokensRef.current += footer;
              void drainPendingTokens();
            }
          } else if (event.type === "error") {
            pendingTokensRef.current = "";
            replaceLastAssistantMessage(
              `Sorry, something went wrong: ${event.message}`,
            );
          }
        }
      }
    } catch {
      replaceLastAssistantMessage(
        "Sorry, something went wrong reaching the Orloj expert.",
      );
    } finally {
      setIsStreaming(false);
      setStage(null);
    }
  }

  return (
    <div
      className={`chat-panel${open ? " chat-panel--open" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      {open && (
        <>
          <div className="chat-panel-header">
            <span className="chat-panel-title">Ask the Orloj Expert:</span>
            <button
              className="chat-panel-close"
              onClick={handleClose}
              aria-label="Close chat"
            >
              <span />
              <span />
            </button>
          </div>
          <div className="chat-panel-scroll" ref={scrollRef}>
            <div className="chat-panel-intro">
              <div className="chat-panel-avatar-wrap">
                <img
                  className="chat-panel-avatar"
                  src={janSindel}
                  alt="Jan Sindel"
                />
                <span className="chat-panel-avatar-caption">
                  Jan Sindel, mathematician
                </span>
              </div>
              <p className="chat-panel-empty">
                The best way to learn and expand your knowledge is to ask
                questions. <br />
                <br />
                So go ahead — ask me anything you want to know about the Pražský
                Orloj — its history, mechanics, the geometry, the math, or the
                astronomy and astrology behind it.
              </p>
            </div>
            {messages.map((message, index) => {
              const isPending =
                isStreaming &&
                index === messages.length - 1 &&
                !message.content;
              return (
                <div
                  key={index}
                  className={`chat-message-wrap chat-message-wrap--${message.role}`}
                >
                  {isPending && (
                    <div className="chat-thinking-row">
                      <ArmillarySphere />
                      <ThinkingStatus stage={stage} />
                    </div>
                  )}
                  <div className={`chat-message chat-message--${message.role}`}>
                    {message.content ? (
                      renderContent(message.content)
                    ) : isPending ? (
                      <ThinkingDots />
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <form
            className="chat-panel-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
          >
            <input
              ref={inputRef}
              className="chat-panel-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Jan about the Orloj...."
              disabled={isStreaming}
            />
            <button
              className="chat-panel-send"
              type="submit"
              disabled={isStreaming || !input.trim()}
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}
