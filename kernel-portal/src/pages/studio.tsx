import * as React from "react"
import { FlowMapController, supportsDrawElementImage } from "@/studio/flow-map-controller"
import { fetchManifest, listPrototypeIds } from "@/studio/manifest"

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
  const [selectedId, setSelectedId] = React.useState(DEFAULT_PROTOTYPE)
  const [error, setError] = React.useState<string | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const controllerRef = React.useRef<FlowMapController | null>(null)

  React.useEffect(() => {
    if (!supported) return
    const canvas = canvasRef.current
    if (!canvas) return
    const controller = new FlowMapController(canvas)
    controllerRef.current = controller
    return () => {
      controller.destroy()
      controllerRef.current = null
    }
  }, [supported])

  React.useEffect(() => {
    if (!supported) return
    let cancelled = false
    listPrototypeIds()
      .then((ids) => {
        if (cancelled) return
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

  React.useEffect(() => {
    if (!supported) return
    let cancelled = false
    setError(null)
    fetchManifest(selectedId)
      .then((manifest) => {
        if (cancelled) return
        return controllerRef.current?.loadPrototype(manifest)
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause))
      })
    return () => {
      cancelled = true
    }
  }, [supported, selectedId])

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
        <span className="text-xs text-muted-foreground">flow map · drag to pan · scroll to zoom</span>
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
      <div className="relative min-h-0 flex-1">
        <canvas
          ref={canvasRef}
          data-testid="studio-flow-canvas"
          className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing"
        />
      </div>
    </div>
  )
}
