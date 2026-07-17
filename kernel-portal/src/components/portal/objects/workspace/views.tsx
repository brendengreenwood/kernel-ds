import { Plot } from "@/components/ui/marks"
import {
  CollectionPreview,
  QueryPreview,
  RecordPreview,
  TraversalPreview,
  WritePreview,
} from "../_previews"
import type { WorkspaceContext, WorkspaceView } from "./types"

/**
 * View registry — thin adapters that make the existing `_previews`
 * components mountable in any workspace panel (decision 0029,
 * doctrine #1). Preview props are unchanged; the adapters only bind
 * them to a `WorkspaceContext`. No view here knows whether it renders
 * in the canvas, the dock, or anywhere else.
 */

function findSelected(ctx: WorkspaceContext) {
  if (ctx.selectedId == null) return null
  return ctx.rows.find((r) => String(r.id) === ctx.selectedId) ?? null
}

function EmptyState({ hint }: { hint: string }) {
  return (
    <div className="flex h-full min-h-24 items-center justify-center p-4 text-center text-xs text-muted-foreground">
      {hint}
    </div>
  )
}

/** Spatial surface — marks by `coord`, selection highlight, click-to-select. */
function SpatialSurface({ ctx }: { ctx: WorkspaceContext }) {
  return (
    <div className="relative h-full min-h-64 bg-muted/10">
      {ctx.rows.map((row) => {
        const isSelected = String(row.id) === ctx.selectedId
        return (
          <button
            key={String(row.id)}
            type="button"
            onClick={() => ctx.select(String(row.id))}
            aria-label={`Select ${row.id}`}
            aria-pressed={isSelected}
            className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
            style={{ left: `${row.coord.x}%`, top: `${row.coord.y}%` }}
          >
            <Plot
              shape="dot"
              size={isSelected ? "lg" : "default"}
              className={isSelected ? "text-primary" : "text-primary/50"}
            />
          </button>
        )
      })}
    </div>
  )
}

export const spatialView: WorkspaceView = {
  key: "spatial",
  label: "Spatial",
  render: (ctx) => <SpatialSurface ctx={ctx} />,
}

export const tableView: WorkspaceView = {
  key: "table",
  label: "Table",
  render: (ctx) => <CollectionPreview model={ctx.model} rows={ctx.rows} maxRows={12} />,
}

export const recordView: WorkspaceView = {
  key: "record",
  label: "Record",
  render: (ctx) => {
    const row = findSelected(ctx)
    if (!row) return <EmptyState hint="No record selected — pick one in the navigator or canvas." />
    return <RecordPreview model={ctx.model} row={row} />
  },
}

export const writeView: WorkspaceView = {
  key: "write",
  label: "Write",
  render: (ctx) => {
    const row = findSelected(ctx)
    if (!row) return <EmptyState hint="No record selected — Write binds to the selection." />
    // Key by row id so WritePreview's internal useState re-seeds when
    // the selection changes (its initializer runs on mount only).
    return <WritePreview key={String(row.id)} model={ctx.model} rows={[row]} maxRows={1} />
  },
}

export const queryView: WorkspaceView = {
  key: "query",
  label: "Query",
  render: (ctx) => <QueryPreview model={ctx.model} rows={ctx.rows} />,
}

export const traversalView: WorkspaceView = {
  key: "traversal",
  label: "Traversal",
  render: (ctx) => <TraversalPreview model={ctx.model} rows={ctx.rows} />,
}

/** Registry — any view can mount in any panel; keys are the lookup contract. */
export const workspaceViews: Record<string, WorkspaceView> = {
  spatial: spatialView,
  table: tableView,
  record: recordView,
  write: writeView,
  query: queryView,
  traversal: traversalView,
}
