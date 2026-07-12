import * as React from "react"
import {
  fileToImagePart,
  streamDesignAgent,
  type UserContentPart,
} from "./chat"

/**
 * Chat panel: prompt (text + optional image attachments) → design agent
 * stream → prototype files land on disk → parent refreshes the flow map.
 */

interface ChatEntry {
  id: number
  role: "user" | "assistant"
  text: string
  imageCount?: number
  tools: string[]
}

export interface ChatPanelProps {
  /** Called after a generation stream completes so the map can refresh. */
  onGenerationComplete: () => void
}

export function ChatPanel({ onGenerationComplete }: ChatPanelProps) {
  const [entries, setEntries] = React.useState<ChatEntry[]>([])
  const [prompt, setPrompt] = React.useState("")
  const [images, setImages] = React.useState<File[]>([])
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const nextId = React.useRef(1)
  const logRef = React.useRef<HTMLDivElement>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const pasteCount = React.useRef(1)

  // Clipboard screenshots all arrive named "image.png" — give each paste a
  // distinct name so the attachment chips are tellable apart.
  const handlePaste = (event: React.ClipboardEvent) => {
    const pasted = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null)
    if (pasted.length === 0) return
    event.preventDefault()
    const named = pasted.map((file) => {
      const ext = file.type.split("/")[1] ?? "png"
      return new File([file], `pasted-${pasteCount.current++}.${ext}`, { type: file.type })
    })
    setImages((prev) => [...prev, ...named])
  }

  React.useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [entries])

  const appendAssistant = (patch: (entry: ChatEntry) => ChatEntry, id: number) => {
    setEntries((prev) => prev.map((entry) => (entry.id === id ? patch(entry) : entry)))
  }

  const send = async () => {
    const text = prompt.trim()
    if (!text || busy) return
    setBusy(true)
    setError(null)

    const userId = nextId.current++
    const assistantId = nextId.current++
    setEntries((prev) => [
      ...prev,
      { id: userId, role: "user", text, imageCount: images.length || undefined, tools: [] },
      { id: assistantId, role: "assistant", text: "", tools: [] },
    ])
    const attached = images
    setPrompt("")
    setImages([])

    try {
      const parts: UserContentPart[] = [{ type: "text", text }]
      for (const file of attached) parts.push(await fileToImagePart(file))
      await streamDesignAgent(parts, {
        onTextDelta: (delta) =>
          appendAssistant((entry) => ({ ...entry, text: entry.text + delta }), assistantId),
        onToolCall: (toolName) =>
          appendAssistant((entry) => ({ ...entry, tools: [...entry.tools, toolName] }), assistantId),
        onError: (message) => setError(message),
      })
      onGenerationComplete()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex w-[22rem] shrink-0 flex-col border-r" data-testid="studio-chat">
      <div
        ref={logRef}
        data-testid="studio-chat-log"
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3"
      >
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Describe a workflow (e.g. &ldquo;two design directions for a farm contract review
            flow&rdquo;). The design agent builds it from real Kernel components and it lands on the
            map.
          </p>
        ) : null}
        {entries.map((entry) => (
          <div key={entry.id} data-testid={`studio-chat-${entry.role}`}>
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {entry.role === "user" ? "You" : "Design agent"}
              {entry.imageCount ? ` · ${entry.imageCount} image${entry.imageCount > 1 ? "s" : ""}` : ""}
            </div>
            {entry.tools.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1" data-testid="studio-chat-tools">
                {entry.tools.map((tool, index) => (
                  <span
                    key={`${tool}-${index}`}
                    className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-1 whitespace-pre-wrap text-sm">
              {entry.text || (entry.role === "assistant" && busy ? "…" : entry.text)}
            </div>
          </div>
        ))}
      </div>
      {error ? (
        <div className="border-t bg-destructive/10 px-4 py-2 text-xs text-destructive" role="alert">
          {error}
        </div>
      ) : null}
      <div className="border-t p-3">
        {images.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-1.5" data-testid="studio-chat-attachments">
            {images.map((file, index) => (
              <span
                key={`${file.name}-${index}`}
                className="inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[11px]"
              >
                {file.name}
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <textarea
          data-testid="studio-chat-input"
          className="h-20 w-full resize-none rounded-md border bg-background p-2 text-sm"
          placeholder="Prompt the design agent… (paste or attach images)"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onPaste={handlePaste}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              void send()
            }
          }}
          disabled={busy}
        />
        <div className="mt-2 flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            data-testid="studio-chat-file"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? [])
              if (files.length) setImages((prev) => [...prev, ...files])
              event.target.value = ""
            }}
          />
          <button
            type="button"
            data-testid="studio-chat-attach"
            className="inline-flex h-8 items-center rounded-md border bg-background px-3 text-sm hover:bg-muted"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            Attach image
          </button>
          <button
            type="button"
            data-testid="studio-chat-send"
            className="ml-auto inline-flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            onClick={() => void send()}
            disabled={busy || !prompt.trim()}
          >
            {busy ? "Generating…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  )
}
