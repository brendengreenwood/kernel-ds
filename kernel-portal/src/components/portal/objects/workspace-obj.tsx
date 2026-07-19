import * as React from "react"
import { Section, Subhead, Demo } from "../section"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  getObjectModel,
  getObjectRows,
  parseWorkspacePreset,
  type ObjectModel,
  type ObjectRow,
  type WorkspacePresetMode,
} from "@/lib/objects"
import { demoDataset } from "@/lib/objects/dataset"
import {
  ActivityRail,
  Navigator,
  Panel,
  recordView,
  workspaceViews,
  type WorkspaceContext,
  type WorkspaceView,
} from "./workspace"

/**
 * Workspace — the object-centric container for working across many
 * records of one or more objects (decisions 0026 + 0029).
 *
 * Anatomy is IDE-shaped: activity rail → navigator → canvas → dock.
 * Every region right of the navigator is built from the same two
 * primitives — `Panel` (an anonymous slot) hosting `WorkspaceView`s
 * (pure functions of context). The "inspector" is not a component:
 * it is just the default dock panel, hosting Record + Write views.
 *
 * The whole anatomy derives from a workspace PRESET — a validated JSON
 * document (decision 0032). The preset declares rail modes; each mode
 * binds an object key, a navigator idiom, canvas view keys, and default
 * dock panels. Nothing below hardcodes a mode list: the current
 * four-mode workspace is just the default preset document.
 *
 * This is documentation, not the real workspace at `/workspace`. The
 * live workspace demo (an experiment from decision 0018) lives at its
 * own route and remains unchanged. This page teaches the pattern.
 */

/**
 * The default workspace, authored as JSON — the schema's first real
 * consumer. Pixel-parity contract: this document expresses exactly the
 * workspace that was previously hardcoded here as consts.
 */
const defaultWorkspacePresetJson = `{
  "key": "default",
  "label": "Default workspace",
  "modes": [
    {
      "key": "contract",
      "label": "Contracts",
      "icon": "table",
      "objectKey": "contract",
      "navigator": {
        "idiom": "grouped",
        "groupByOptions": ["commodity", "counterparty", "status"],
        "defaultGroupBy": "commodity"
      },
      "canvasViews": ["spatial", "table"],
      "dockPanels": [{ "title": "Inspector", "views": ["record", "write"] }]
    },
    {
      "key": "settlement",
      "label": "Settlements",
      "icon": "file",
      "objectKey": "settlement",
      "navigator": {
        "idiom": "grouped",
        "groupByOptions": ["status"],
        "defaultGroupBy": "status"
      },
      "canvasViews": ["spatial", "table"],
      "dockPanels": [{ "title": "Inspector", "views": ["record", "write"] }]
    },
    {
      "key": "query",
      "label": "Query",
      "icon": "search",
      "objectKey": "contract",
      "navigator": {
        "idiom": "queries",
        "savedQueries": [
          "Active contracts this quarter",
          "Settlements pending confirmation",
          "Canola above $15.00",
          "Cancelled with notes"
        ]
      },
      "canvasViews": ["query"],
      "dockPanels": [{ "title": "Inspector", "views": ["record", "write"] }]
    },
    {
      "key": "traversal",
      "label": "Traversal",
      "icon": "route",
      "objectKey": "contract",
      "navigator": { "idiom": "associations" },
      "canvasViews": ["traversal"],
      "dockPanels": [{ "title": "Inspector", "views": ["record", "write"] }]
    }
  ]
}`

const defaultPreset = parseWorkspacePreset(defaultWorkspacePresetJson)

interface DockPanelSpec {
  id: number
  title: string
  views: WorkspaceView[]
  /** When set, the panel is frozen to a snapshot ctx (a pinned inspector). */
  ctx?: WorkspaceContext
}

/** Demo rows indexable by any object key (dataset covers a subset). */
const demoRowsByKey: Record<string, ReadonlyArray<ObjectRow> | undefined> = demoDataset

/**
 * Host data policy (decision 0032): a preset declares WHICH object a
 * mode binds; resolving objectKey → rows is this page's job, not the
 * preset's. Modes with the `associations` idiom bind registry rows
 * (stubs — association joins resolve through the shared registry);
 * otherwise the demo dataset when it covers the key, else registry
 * rows — which is how a runtime-registered object gets its rows with
 * zero special-casing.
 */
function resolveBinding(mode: WorkspacePresetMode): {
  model: ObjectModel | null
  rows: ReadonlyArray<ObjectRow>
} {
  const model = getObjectModel(mode.objectKey) ?? null
  if (!model) return { model: null, rows: [] }
  if (mode.navigator.idiom === "associations") {
    return { model, rows: getObjectRows(mode.objectKey) }
  }
  return { model, rows: demoRowsByKey[mode.objectKey] ?? getObjectRows(mode.objectKey) }
}

/** Resolve view keys through the registry; unknown keys are skipped, not fatal. */
function resolveViewKeys(keys: ReadonlyArray<string>): {
  views: WorkspaceView[]
  unknown: string[]
} {
  const views: WorkspaceView[] = []
  const unknown: string[] = []
  for (const key of keys) {
    const view = workspaceViews[key]
    if (view) views.push(view)
    else unknown.push(key)
  }
  return { views, unknown }
}

function initialGroupByFor(mode: WorkspacePresetMode): string {
  // Non-grouped idioms never read groupBy — the fallback chain just
  // keeps the state defined.
  return mode.navigator.defaultGroupBy ?? mode.navigator.groupByOptions?.[0] ?? ""
}

function defaultDockPanelsFor(mode: WorkspacePresetMode): DockPanelSpec[] {
  return mode.dockPanels
    .map((p, i) => ({ id: i, title: p.title, views: resolveViewKeys(p.views).views }))
    .filter((p) => p.views.length > 0)
}

export function WorkspaceObjectSection() {
  const [preset, setPreset] = React.useState(defaultPreset)
  const [modeKey, setModeKey] = React.useState(defaultPreset.modes[0].key)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [groupBy, setGroupBy] = React.useState<string>(
    initialGroupByFor(defaultPreset.modes[0])
  )
  const [dockPanels, setDockPanels] = React.useState<DockPanelSpec[]>(() =>
    defaultDockPanelsFor(defaultPreset.modes[0])
  )
  const nextPanelId = React.useRef(defaultPreset.modes[0].dockPanels.length)
  const [fullscreen, setFullscreen] = React.useState(false)

  React.useEffect(() => {
    if (!fullscreen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setFullscreen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [fullscreen])

  const activeMode =
    preset.modes.find((m) => m.key === modeKey) ?? preset.modes[0]
  const { model, rows } = resolveBinding(activeMode)
  const ctx: WorkspaceContext | null = model
    ? { model, rows, selectedId, select: setSelectedId }
    : null

  function handleModeChange(next: string) {
    const nextMode = preset.modes.find((m) => m.key === next)
    if (!nextMode) return
    setModeKey(next)
    setSelectedId(null)
    setGroupBy(initialGroupByFor(nextMode))
  }

  function pinPanel() {
    if (selectedId == null || ctx == null) return
    // Snapshot the context: the pinned panel stays on this record even
    // as the live selection moves on — an independent second inspector.
    // Spread the live ctx so the snapshot can't drift from the shape
    // of WorkspaceContext as it grows.
    const frozen: WorkspaceContext = { ...ctx, select: () => {} }
    setDockPanels((panels) => [
      ...panels,
      {
        id: nextPanelId.current,
        title: `Pinned ${selectedId}`,
        views: [recordView],
        ctx: frozen,
      },
    ])
    nextPanelId.current += 1
  }

  function closePanel(id: number) {
    setDockPanels((panels) => panels.filter((p) => p.id !== id))
  }

  const canvas = resolveViewKeys(activeMode.canvasViews)

  return (
    <Section
      id="obj-workspace"
      eyebrow="Objects · Workspace"
      title="Workspace"
      lead="A Workspace composes four regions — activity rail, navigator, canvas, dock — so a user can move across many records of one or more objects. Every region right of the navigator is a Panel hosting views; the anatomy is composition, not fixed chrome (decision 0029). The whole configuration arrives as a preset — a validated JSON document (decision 0032)."
    >
      <Subhead id="obj-workspace-anatomy">Anatomy</Subhead>
      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
        <li><span className="font-medium text-foreground">Activity rail</span> — icon-only mode selection; each mode owns everything to its right.</li>
        <li><span className="font-medium text-foreground">Navigator</span> — mode-owned navigation: a grouped tree for object modes, a saved-query list for Query, association links for Traversal.</li>
        <li><span className="font-medium text-foreground">Canvas</span> — the primary panel: the active collection as a spatial or table view.</li>
        <li><span className="font-medium text-foreground">Dock</span> — zero or more panels; the default is one "Inspector" panel hosting Record + Write tabs against the live selection.</li>
      </ul>

      <Subhead id="obj-workspace-mock">Mock Workspace</Subhead>
      <Demo className="block p-0">
        <div className={fullscreen ? "fixed inset-0 z-50 bg-background p-3" : undefined}>
          <div className="flex h-full w-full flex-col overflow-hidden rounded-md border bg-background">
            <div className="flex shrink-0 items-center justify-between border-b bg-muted/20 px-2 py-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Mock workspace · {preset.label}
              </span>
              <button
                type="button"
                onClick={() => setFullscreen((f) => !f)}
                aria-pressed={fullscreen}
                className="rounded border bg-card px-2 py-0.5 text-[11px] font-medium text-foreground hover:bg-accent"
              >
                {fullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
              </button>
            </div>
            <div
              className={
                "flex w-full " + (fullscreen ? "min-h-0 flex-1" : "h-[560px]")
              }
            >
              <ActivityRail
                mode={modeKey}
                modes={preset.modes}
                onModeChange={handleModeChange}
              />
              {ctx == null ? (
                <div className="flex min-h-0 flex-1 items-center justify-center p-4 text-sm text-muted-foreground">
                  Object "{activeMode.objectKey}" is not registered — this mode
                  has nothing to bind.
                </div>
              ) : (
                /* Rule: navigator, canvas, and dock are resizable regions —
                   drag the handles between them. Sizes are percentages,
                   not fixed px. */
                <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
                  <ResizablePanel defaultSize={22} minSize={12}>
                    <Navigator
                      idiom={activeMode.navigator.idiom}
                      ctx={ctx}
                      groupBy={groupBy}
                      onGroupByChange={setGroupBy}
                      groupByOptions={activeMode.navigator.groupByOptions ?? []}
                      savedQueries={activeMode.navigator.savedQueries ?? []}
                    />
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel
                    defaultSize={50}
                    minSize={30}
                    className="flex min-h-0 flex-col p-2"
                  >
                    {canvas.unknown.length > 0 && (
                      <p className="mb-1 shrink-0 text-[10px] text-muted-foreground">
                        Unknown view key(s) skipped: {canvas.unknown.join(", ")}
                      </p>
                    )}
                    <Panel
                      key={activeMode.key}
                      views={canvas.views}
                      ctx={ctx}
                      className="min-h-0 flex-1"
                    />
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel
                    defaultSize={28}
                    minSize={14}
                    data-slot="workspace-dock"
                    className="flex min-h-0 flex-col gap-2 overflow-auto border-l bg-muted/10 p-2"
                  >
                    <button
                      type="button"
                      onClick={pinPanel}
                      disabled={selectedId == null}
                      className="shrink-0 rounded border bg-card px-2 py-1 text-[11px] font-medium text-foreground disabled:opacity-50"
                    >
                      Pin panel
                    </button>
                    {dockPanels.length === 0 && (
                      <p className="px-1 text-[11px] text-muted-foreground">
                        No panels — select a record and pin one.
                      </p>
                    )}
                    {dockPanels.map((spec) => (
                      <Panel
                        key={spec.id}
                        views={spec.views}
                        ctx={spec.ctx ?? ctx}
                        title={spec.title}
                        onClose={() => closePanel(spec.id)}
                        className="shrink-0"
                      />
                    ))}
                  </ResizablePanel>
                </ResizablePanelGroup>
              )}
            </div>
          </div>
        </div>
      </Demo>

      <Subhead id="obj-workspace-composability">Composability</Subhead>
      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
        <li>Views are functions of context — a view renders anywhere it is handed a <code className="font-mono text-[12px]">ctx</code>; it never knows which region hosts it.</li>
        <li>Panels are anonymous slots — "canvas" and "inspector" are roles this page assigns, not component types. The canvas above is the same <code className="font-mono text-[12px]">Panel</code> as the dock's.</li>
        <li>The inspector is a panel, not a component — the default dock panel hosts Record + Write as tabs over the live selection.</li>
        <li>Multiplicity is allowed — pin the current selection to add a second, independent inspector; close any panel, including the default.</li>
        <li>The navigator is owned by the active mode — object modes get a grouped tree, Query gets a saved-query list, Traversal gets association links.</li>
        <li>The workspace is a preset — rail modes, navigator idioms, canvas views, and default dock panels all derive from one JSON document parsed by <code className="font-mono text-[12px]">parseWorkspacePreset</code>.</li>
      </ul>
    </Section>
  )
}
