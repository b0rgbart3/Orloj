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
  digesting: ["digesting the question"],
  context: ["determining the context"],
  searching: ["researching the knowledge base", "checking sources"],
  generating: ["formulating a response", "validating"],
};
const STAGE_CYCLE_MS = 1800;

function ThinkingStatus({ stage }: { stage: string | null }) {
  const phrases = (stage && STAGE_PHRASES[stage]) || ["thinking"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    if (phrases.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, STAGE_CYCLE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- phrases is derived from stage
  }, [stage]);

  return <span className="chat-thinking-status">{phrases[index]}</span>;
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
    const parts = text.split(/(\{\{swatch:[a-zA-Z]+\}\}|\*\*[^*]+\*\*)/g);
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
            appendToLastAssistantMessage(event.content);
          } else if (event.type === "error") {
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
          <button
            className="chat-panel-close"
            onClick={onToggle}
            aria-label="Close chat"
          >
            <span />
            <span />
          </button>
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
                  {isPending && <ThinkingStatus stage={stage} />}
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
