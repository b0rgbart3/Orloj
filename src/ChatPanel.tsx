import { useRef, useState, type ReactNode } from 'react'
import { describeCurrentMoment } from './clock/explainClock'
import type { PragueDateParts, PragueTime } from './clock/usePragueTime'
import './ChatPanel.css'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

type StreamEvent =
  | { type: 'stage'; stage: string; sources?: string[] }
  | { type: 'token'; content: string }
  | { type: 'done'; answer: string; passages: unknown[] }
  | { type: 'error'; message: string }

type ChatPanelProps = {
  open: boolean
  onToggle: () => void
  pragueTime: PragueTime
  dateParts: PragueDateParts
}

export function ChatPanel({ open, onToggle, pragueTime, dateParts }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  function appendToLastAssistantMessage(delta: string) {
    setMessages((prev) => {
      const next = [...prev]
      const last = next[next.length - 1]
      next[next.length - 1] = { ...last, content: last.content + delta }
      return next
    })
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
    })
  }

  // Turns bare "https://..." runs within a plain-text segment into real
  // links, trimming trailing sentence punctuation (periods, commas, closing
  // quotes) that isn't actually part of the URL.
  function autoLink(text: string, keyPrefix: string): ReactNode[] {
    const urlRegex = /https?:\/\/[^\s<>]+/g
    const nodes: ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null
    let linkIndex = 0

    while ((match = urlRegex.exec(text))) {
      if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index))

      let url = match[0]
      const trailingPunctuation = url.match(/[.,;:!?)'"]+$/)?.[0] ?? ''
      if (trailingPunctuation) url = url.slice(0, -trailingPunctuation.length)

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
      )
      if (trailingPunctuation) nodes.push(trailingPunctuation)
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
    return nodes
  }

  function renderInline(text: string, keyPrefix: string): ReactNode[] {
    const parts = text.split(/(\{\{swatch:[a-zA-Z]+\}\}|\*\*[^*]+\*\*)/g)
    return parts.flatMap((part, index) => {
      const swatchMatch = part.match(/^\{\{swatch:([a-zA-Z]+)\}\}$/)
      if (swatchMatch) {
        return [
          <span
            key={`${keyPrefix}-${index}`}
            className="chat-swatch"
            style={{ background: swatchMatch[1] }}
            aria-hidden="true"
          />,
        ]
      }
      const boldMatch = part.match(/^\*\*([^*]+)\*\*$/)
      if (boldMatch) {
        return [<strong key={`${keyPrefix}-${index}`}>{boldMatch[1]}</strong>]
      }
      return autoLink(part, `${keyPrefix}-${index}`)
    })
  }

  // A line that's *entirely* a bold span (e.g. "**The real clock:**") is a
  // section label -- rendered as its own block with vertical breathing room,
  // rather than inline bold text running into the following sentence.
  function renderContent(content: string) {
    const lines = content.split('\n')
    const nodes: ReactNode[] = []
    lines.forEach((line, index) => {
      const labelMatch = line.trim().match(/^\*\*([^*]+)\*\*$/)
      if (labelMatch) {
        nodes.push(
          <div key={`label-${index}`} className="chat-section-label">
            {labelMatch[1]}
          </div>,
        )
      } else {
        nodes.push(<span key={`line-${index}`}>{renderInline(line, `l${index}`)}</span>)
        if (index < lines.length - 1) nodes.push('\n')
      }
    })
    return nodes
  }

  function replaceLastAssistantMessage(content: string) {
    setMessages((prev) => {
      const next = [...prev]
      next[next.length - 1] = { role: 'assistant', content }
      return next
    })
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || isStreaming) return

    const history = messages.map(({ role, content }) => ({ role, content }))
    setMessages((prev) => [...prev, { role: 'user', content: text }, { role: 'assistant', content: '' }])
    setInput('')
    setIsStreaming(true)

    try {
      const context = describeCurrentMoment(pragueTime, dateParts)
      const response = await fetch('/api/ask/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, context }),
      })
      if (!response.ok || !response.body) throw new Error(`Request failed (${response.status})`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data:')) continue
          const event = JSON.parse(line.slice('data:'.length).trim()) as StreamEvent

          if (event.type === 'token') {
            appendToLastAssistantMessage(event.content)
          } else if (event.type === 'error') {
            replaceLastAssistantMessage(`Sorry, something went wrong: ${event.message}`)
          }
        }
      }
    } catch {
      replaceLastAssistantMessage('Sorry, something went wrong reaching the Orloj expert.')
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div
      className={`chat-panel${open ? ' chat-panel--open' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      {open && (
        <>
          <button className="chat-panel-close" onClick={onToggle} aria-label="Close chat">
            <span />
            <span />
          </button>
          <div className="chat-panel-scroll" ref={scrollRef}>
            {messages.length === 0 && (
              <p className="chat-panel-empty">
                Ask me anything about the pražský orloj — its history, mechanics, or the
                astronomy behind it.
              </p>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`chat-message chat-message--${message.role}`}>
                {message.content
                  ? renderContent(message.content)
                  : isStreaming && index === messages.length - 1
                    ? '…'
                    : ''}
              </div>
            ))}
          </div>
          <form
            className="chat-panel-input-row"
            onSubmit={(e) => {
              e.preventDefault()
              void sendMessage()
            }}
          >
            <input
              className="chat-panel-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the orloj..."
              disabled={isStreaming}
            />
            <button className="chat-panel-send" type="submit" disabled={isStreaming || !input.trim()}>
              Send
            </button>
          </form>
        </>
      )}
    </div>
  )
}
