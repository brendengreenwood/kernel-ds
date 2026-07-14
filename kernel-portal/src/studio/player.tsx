import * as React from "react"
import type { FlowMapController } from "./flow-map-controller"
import { cardKey } from "./flowmap-layout"
import type { PrototypeManifest } from "./manifest"

/**
 * Player mode: one prototype screen full-size and fully interactive.
 *
 * The screen's pool container is BORROWED from the flow-map canvas (reparented
 * into this overlay — real DOM, so forms/tabs/dialogs work) and RETURNED on
 * close or navigation, where it becomes drawable on the map again. The map's
 * pan/zoom state lives in the controller and is untouched by the player.
 */

const PLAYER_CONTAINER_STYLE = [
  "position:relative",
  "width:100%",
  "min-height:100%",
  "background:var(--background)",
  "pointer-events:auto",
].join(";")

export interface PlayerOverlayProps {
  manifest: PrototypeManifest
  activeKey: string
  controller: FlowMapController
  onNavigate: (cardKey: string) => void
  onClose: () => void
}

export function PlayerOverlay({ manifest, activeKey, controller, onNavigate, onClose }: PlayerOverlayProps) {
  const stageRef = React.useRef<HTMLDivElement>(null)
  const [loadError, setLoadError] = React.useState<string | null>(null)

  const slash = activeKey.indexOf("/")
  const directionId = activeKey.slice(0, slash)
  const screenId = activeKey.slice(slash + 1)
  const direction = manifest.directions.find((candidate) => candidate.id === directionId)
  const screen = direction?.screens.find((candidate) => candidate.id === screenId)
  const outgoing = direction?.edges.filter((edge) => edge.from === screenId) ?? []
  const screenTitle = (id: string) => direction?.screens.find((candidate) => candidate.id === id)?.title ?? id

  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    let cancelled = false
    setLoadError(null)
    controller
      .borrowScreen(activeKey)
      .then((container) => {
        if (!container) return
        if (cancelled) return // cleanup already returned it to the canvas pool
        container.style.cssText = PLAYER_CONTAINER_STYLE
        stage.appendChild(container)
      })
      .catch((cause: unknown) => {
        if (!cancelled) setLoadError(cause instanceof Error ? cause.message : String(cause))
      })
    return () => {
      cancelled = true
      controller.returnScreen(activeKey)
    }
  }, [controller, activeKey])

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-background" data-testid="studio-player">
      <div className="flex items-center gap-3 border-b px-6 py-2.5 md:px-10">
        <button
          type="button"
          data-testid="studio-player-back"
          onClick={onClose}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-sm font-medium hover:bg-muted"
        >
          <span aria-hidden>←</span> Map
        </button>
        <div className="min-w-0 truncate text-sm">
          <span className="text-muted-foreground">{direction?.title ?? directionId}</span>
          <span className="mx-1.5 text-muted-foreground">·</span>
          <span className="font-medium">{screen?.title ?? screenId}</span>
        </div>
        {outgoing.length > 0 ? (
          <div className="ml-auto flex items-center gap-2">
            {outgoing.map((edge) => (
              <button
                key={`${edge.to}-${edge.label ?? ""}`}
                type="button"
                data-testid={`studio-player-nav-${edge.to}`}
                onClick={() => onNavigate(cardKey(directionId, edge.to))}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-sm hover:bg-muted"
              >
                {edge.label ?? screenTitle(edge.to)} <span aria-hidden>→</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {loadError ? (
        <div className="border-b bg-destructive/10 px-6 py-2 text-sm text-destructive md:px-10" role="alert">
          {loadError}
        </div>
      ) : null}
      <div ref={stageRef} data-testid="studio-player-stage" className="min-h-0 flex-1 overflow-auto" />
    </div>
  )
}
