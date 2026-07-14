import * as React from "react"
import { ChatPanel } from "@/studio/chat-panel"
import { FlowMapController, supportsDrawElementImage } from "@/studio/flow-map-controller"
import { cardKey } from "@/studio/flowmap-layout"
import { fetchManifest, listPrototypeIds, type PrototypeManifest } from "@/studio/manifest"
import { PlayerOverlay } from "@/studio/player"

const DEFAULT_PROTOTYPE = "fixture-grain-intake"

const CHROME_LAUNCH_CMD =
  '"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" --enable-features=CanvasDrawElement --user-data-dir=%TEMP%\\kernel-studio-chrome http://localhost:5173/studio'

/**
 * Kernel Studio — generative prototypes on an HTML-in-Canvas flow map.
 *
 * Dev-server-only: the ds-bundle / prototypes middleware exists only under
 * `npm run dev`, and rendering requires Chrome 150+ launched with
 * `--enable-features=CanvasDrawElement`. In any other browser this page
 * shows setup instructions instead of the canvas.
 */
export default function StudioPage() {
  const [supported] = React.useState(() => supportsDrawElementImage())
  const [prototypeIds, setPrototypeIds] = React.useState<string[]>([])
  // Mirror of prototypeIds for handleGenerationComplete (state updaters must
  // stay pure, so "which ids are new" is computed outside the setter).
  const knownIdsRef = React.useRef<string[]>([])
  const [selectedId, setSelectedId] = React.useState(DEFAULT_PROTOTYPE)
  const [manifest, setManifest] = React.useState<PrototypeManifest | null>(null)
  const [playerKey, setPlayerKey] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const controllerRef = React.useRef<FlowMapController | null>(null)
  const [controller, setController] = React.useState<FlowMapController | null>(null)

  React.useEffect(() => {
    if (!supported) return
    const canvas = canvasRef.current
    if (!canvas) return
    const controller = new FlowMapController(canvas)
    controller.onCardClick = (key) => setPlayerKey(key)
    controller.onNavigate = (directionId, screenId) => setPlayerKey(cardKey(directionId, screenId))
    controllerRef.current = controller
    setController(controller)
    if (import.meta.env.DEV) {
      // Test hook for the proof driver (dev server only, like the studio itself).
      ;(window as unknown as { __kernelStudio?: unknown }).__kernelStudio = { controller }
    }
    return () => {
      controller.destroy()
      controllerRef.current = null
      setController(null)
      if (import.meta.env.DEV) {
        delete (window as unknown as { __kernelStudio?: unknown }).__kernelStudio
      }
    }
  }, [supported])

  React.useEffect(() => {
    if (!supported) return
    let cancelled = false
    listPrototypeIds()
      .then((ids) => {
        if (cancelled) return
        knownIdsRef.current = ids
        setPrototypeIds(ids)
        if (ids.length > 0 && !ids.includes(DEFAULT_PROTOTYPE)) setSelectedId(ids[0])
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "Prototype listing unavailable. The studio only works under the Vite dev server (`npm run dev` in kernel-portal) — the built site has no ds-bundle/prototypes middleware.",
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [supported])

  const [reloadNonce, setReloadNonce] = React.useState(0)

  React.useEffect(() => {
    if (!supported) return
    let cancelled = false
    setError(null)
    setPlayerKey(null)
    setManifest(null)
    fetchManifest(selectedId)
      .then((next) => {
        if (cancelled) return
        setManifest(next)
        return controllerRef.current?.loadPrototype(next)
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause))
      })
    return () => {
      cancelled = true
    }
  }, [supported, selectedId, reloadNonce])

  // After a generation stream completes, pick up whatever the agent wrote:
  // new prototype ids join the picker and the newest one loads onto the map;
  // a regenerated existing id reloads in place. No page reload either way.
  const handleGenerationComplete = React.useCallback(() => {
    listPrototypeIds()
      .then((ids) => {
        const fresh = ids.filter((id) => !knownIdsRef.current.includes(id))
        knownIdsRef.current = ids
        setPrototypeIds(ids)
        if (fresh.length > 0) {
          setSelectedId(fresh[fresh.length - 1])
        } else {
          setReloadNonce((nonce) => nonce + 1)
        }
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : String(cause))
      })
  }, [])

  if (!supported) {
    return (
      <div className="py-10" data-testid="studio-capability-gate">
        <h1 className="text-2xl font-semibold tracking-tight">Studio</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Kernel Studio renders live prototypes onto a canvas with the HTML-in-Canvas API
          (<code className="font-mono">drawElementImage</code>), which this browser doesn&apos;t expose.
        </p>
        <div className="mt-6 rounded-lg border bg-muted/40 p-4">
          <p className="text-sm font-medium">To use the studio:</p>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              Run the portal dev server: <code className="font-mono">cd kernel-portal &amp;&amp; npm run dev</code>{" "}
              (the studio is dev-server-only — the built site has no prototype middleware).
            </li>
            <li>
              Launch Chrome 150+ with the flag:
              <pre className="mt-2 overflow-x-auto rounded bg-background p-3 font-mono text-xs">{CHROME_LAUNCH_CMD}</pre>
            </li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div className="-mx-6 flex h-[calc(100dvh-3.5rem)] flex-col md:-mx-10" data-testid="studio-root">
      <div className="flex items-center gap-3 border-b px-6 py-3 md:px-10">
        <h1 className="text-base font-semibold tracking-tight">Studio</h1>
        <span className="text-xs text-muted-foreground">
          drag to pan · scroll to zoom · click a screen to play
        </span>
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="studio-prototype" className="text-xs text-muted-foreground">
            Prototype
          </label>
          <select
            id="studio-prototype"
            data-testid="studio-prototype-picker"
            className="h-8 rounded-md border bg-background px-2 text-sm"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            {(prototypeIds.length > 0 ? prototypeIds : [selectedId]).map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error ? (
        <div className="border-b bg-destructive/10 px-6 py-2 text-sm text-destructive md:px-10" role="alert">
          {error}
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1">
        <ChatPanel onGenerationComplete={handleGenerationComplete} />
        <div className="relative min-h-0 min-w-0 flex-1">
          <canvas
            ref={canvasRef}
            data-testid="studio-flow-canvas"
            className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing"
          />
          {playerKey && manifest && controller ? (
            <PlayerOverlay
              manifest={manifest}
              activeKey={playerKey}
              controller={controller}
              onNavigate={(key) => setPlayerKey(key)}
              onClose={() => setPlayerKey(null)}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
