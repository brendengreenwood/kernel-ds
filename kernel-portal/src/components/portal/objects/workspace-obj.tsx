import * as React from "react"
import { Section, Subhead, Demo } from "../section"
import {
  contractModel,
  contractRows,
  settlementModel,
  type ObjectModel,
  type ObjectRow,
} from "@/lib/objects"
import { demoDataset } from "@/lib/objects/dataset"
import {
  ActivityRail,
  Navigator,
  Panel,
  queryView,
  recordView,
  spatialView,
  tableView,
  traversalView,
  writeView,
  type WorkspaceContext,
  type WorkspaceMode,
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
 * This is documentation, not the real workspace at `/workspace`. The
 * live workspace demo (an experiment from decision 0018) lives at its
 * own route and remains unchanged. This page teaches the pattern.
 */

interface DockPanelSpec {
  id: number
  title: string
  views: WorkspaceView[]
  /** When set, the panel is frozen to a snapshot ctx (a pinned inspector). */
  ctx?: WorkspaceContext
}

const modeBindings: Record<
  WorkspaceMode,
  { model: ObjectModel; rows: ReadonlyArray<ObjectRow> }
> = {
  contract: { model: contractModel, rows: demoDataset.contract },
  settlement: { model: settlementModel, rows: demoDataset.settlement },
  query: { model: contractModel, rows: demoDataset.contract },
  // Traversal joins associations through `objectRowsRegistry`, which
  // holds the stub rows — bind those so the joins resolve.
  traversal: { model: contractModel, rows: contractRows },
}

const defaultGroupBy: Record<WorkspaceMode, string> = {
  contract: "commodity",
  settlement: "status",
  query: "status",
  traversal: "status",
}

export function WorkspaceObjectSection() {
  const [mode, setMode] = React.useState<WorkspaceMode>("contract")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [groupBy, setGroupBy] = React.useState<string>(defaultGroupBy.contract)
  const [dockPanels, setDockPanels] = React.useState<DockPanelSpec[]>([
    { id: 0, title: "Inspector", views: [recordView, writeView] },
  ])
  const nextPanelId = React.useRef(1)

  const { model, rows } = modeBindings[mode]
  const ctx: WorkspaceContext = {
    model,
    rows,
    selectedId,
    select: setSelectedId,
  }

  function handleModeChange(next: WorkspaceMode) {
    setMode(next)
    setSelectedId(null)
    setGroupBy(defaultGroupBy[next])
  }

  function pinPanel() {
    if (selectedId == null) return
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

  const canvasViews: WorkspaceView[] =
    mode === "query"
      ? [queryView]
      : mode === "traversal"
        ? [traversalView]
        : [spatialView, tableView]

  return (
    <Section
      id="obj-workspace"
      eyebrow="Objects · Workspace"
      title="Workspace"
      lead="A Workspace composes four regions — activity rail, navigator, canvas, dock — so a user can move across many records of one or more objects. Every region right of the navigator is a Panel hosting views; the anatomy is composition, not fixed chrome (decision 0029)."
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
        <div className="grid h-[560px] w-full grid-cols-[48px_220px_1fr_280px] overflow-hidden rounded-md border">
          <ActivityRail mode={mode} onModeChange={handleModeChange} />
          <Navigator
            mode={mode}
            ctx={ctx}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
          />
          <div className="flex min-h-0 flex-col p-2">
            <Panel key={mode} views={canvasViews} ctx={ctx} className="min-h-0 flex-1" />
          </div>
          <div
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
      </ul>
    </Section>
  )
}
