/**
 * Client for the kernel-studio-server design agent's stream endpoint
 * (`POST /api/agents/:agentId/stream`, SSE `data: {json}` events — shape
 * verified against the running @mastra/core 1.50.1 server).
 */

export const STUDIO_SERVER_URL = "http://localhost:4111"
export const DESIGN_AGENT_ID = "kernel-design-agent"

export const SERVER_UNREACHABLE_HELP =
  "Design agent server unreachable. Start it with `cd kernel-studio-server && npx mastra dev` " +
  `(expected at ${STUDIO_SERVER_URL}; it needs ANTHROPIC_API_KEY in kernel-studio-server/.env).`

/** AI-SDK-style user content parts: text plus optional attached images. */
export type UserContentPart =
  | { type: "text"; text: string }
  | { type: "image"; image: string; mimeType: string }

export interface StreamCallbacks {
  onTextDelta: (text: string) => void
  onToolCall: (toolName: string) => void
  onError: (message: string) => void
}

interface StreamEvent {
  type: string
  payload?: {
    text?: string
    toolName?: string
    error?: unknown
    message?: string
  }
}

export async function streamDesignAgent(
  parts: UserContentPart[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  let res: Response
  try {
    res = await fetch(`${STUDIO_SERVER_URL}/api/agents/${DESIGN_AGENT_ID}/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: parts }] }),
      signal,
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") return
    throw new Error(SERVER_UNREACHABLE_HELP)
  }
  if (!res.ok || !res.body) {
    throw new Error(`Design agent request failed: HTTP ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let boundary: number
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data: ")) continue
        let event: StreamEvent
        try {
          event = JSON.parse(line.slice(6)) as StreamEvent
        } catch {
          continue // non-JSON keepalive frame
        }
        handleEvent(event, callbacks)
      }
    }
  }
}

function handleEvent(event: StreamEvent, callbacks: StreamCallbacks): void {
  switch (event.type) {
    case "text-delta":
      if (typeof event.payload?.text === "string") callbacks.onTextDelta(event.payload.text)
      break
    case "tool-call":
      callbacks.onToolCall(event.payload?.toolName ?? "tool")
      break
    case "error": {
      const raw = event.payload?.error ?? event.payload?.message ?? "agent stream error"
      callbacks.onError(typeof raw === "string" ? raw : JSON.stringify(raw))
      break
    }
    default:
      break // start / step-start / text-start / tool-result / finish etc.
  }
}

/** Read an attached image file into an AI-SDK image part (base64 data URL). */
export function fileToImagePart(file: File): Promise<UserContentPart> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ type: "image", image: reader.result as string, mimeType: file.type })
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`))
    reader.readAsDataURL(file)
  })
}
