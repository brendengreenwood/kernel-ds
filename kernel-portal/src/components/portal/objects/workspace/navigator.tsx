import * as React from "react"
import { objectRegistry, type ObjectRow } from "@/lib/objects"
import { cn } from "@/lib/utils"
import type { WorkspaceContext, WorkspaceMode } from "./types"

/**
 * Navigator — mode-owned navigation (decision 0029, doctrine #5).
 * Object modes render a grouped, collapsible tree with counts; the
 * query aspect renders a saved-query list; the traversal aspect
 * renders the selected record's association links. Different idioms
 * per mode is the point — this is not a generic tree component forced
 * onto every mode.
 */
export interface NavigatorProps {
  mode: WorkspaceMode
  ctx: WorkspaceContext
  groupBy: string
  onGroupByChange: (groupBy: string) => void
}

const groupOptionsByMode: Partial<Record<WorkspaceMode, ReadonlyArray<string>>> = {
  contract: ["commodity", "counterparty", "status"],
  settlement: ["status"],
}

const cannedQueries = [
  "Active contracts this quarter",
  "Settlements pending confirmation",
  "Canola above $15.00",
  "Cancelled with notes",
] as const

export function Navigator({ mode, ctx, groupBy, onGroupByChange }: NavigatorProps) {
  return (
    <div
      data-slot="workspace-navigator"
      className="flex min-h-0 flex-col overflow-hidden border-r bg-muted/20"
    >
      {mode === "query" ? (
        <QueryNavigator />
      ) : mode === "traversal" ? (
        <TraversalNavigator ctx={ctx} />
      ) : (
        <ObjectNavigator mode={mode} ctx={ctx} groupBy={groupBy} onGroupByChange={onGroupByChange} />
      )}
    </div>
  )
}

// ---------- Object modes: grouped tree ----------

function groupLabelFor(ctx: WorkspaceContext, groupBy: string, value: string): string {
  if (groupBy !== "status") return value || "—"
  return ctx.model.statuses.find((s) => s.key === value)?.label ?? value
}

function salientFieldKey(ctx: WorkspaceContext): string | null {
  const f = ctx.model.fields.find(
    (field) => field.key !== "id" && (field.type === "text" || field.type === "ref")
  )
  return f?.key ?? null
}

function ObjectNavigator({
  mode,
  ctx,
  groupBy,
  onGroupByChange,
}: {
  mode: WorkspaceMode
  ctx: WorkspaceContext
  groupBy: string
  onGroupByChange: (groupBy: string) => void
}) {
  const options = groupOptionsByMode[mode] ?? ["status"]
  const activeGroupBy = options.includes(groupBy) ? groupBy : options[0]
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})
  const salientKey = salientFieldKey(ctx)

  const groups = React.useMemo(() => {
    const map = new Map<string, ObjectRow[]>()
    for (const row of ctx.rows) {
      const value = String(row[activeGroupBy] ?? "—")
      const bucket = map.get(value)
      if (bucket) bucket.push(row)
      else map.set(value, [row])
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [ctx.rows, activeGroupBy])

  return (
    <>
      <header className="shrink-0 border-b px-2.5 py-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[11px] font-semibold text-foreground">{ctx.model.plural}</span>
          <span
            data-slot="workspace-navigator-count"
            className="font-mono text-[11px] text-muted-foreground"
          >
            {ctx.rows.length}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-1">
          <span className="text-[9.5px] font-mono uppercase tracking-wide text-muted-foreground">
            Group
          </span>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              aria-pressed={opt === activeGroupBy}
              onClick={() => onGroupByChange(opt)}
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] capitalize",
                opt === activeGroupBy
                  ? "bg-sidebar-accent font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </header>
      <ul className="min-h-0 flex-1 overflow-auto p-1.5 text-[11px]">
        {groups.map(([value, rows]) => {
          // Namespaced by object key: contract and settlement share groupBy
          // values (e.g. "status"), and this component stays mounted across
          // object-mode switches — without the namespace, collapse state
          // would bleed between objects.
          const collapseKey = `${ctx.model.key}:${activeGroupBy}:${value}`
          const isCollapsed = collapsed[collapseKey] ?? false
          return (
            <li key={value}>
              <button
                type="button"
                aria-expanded={!isCollapsed}
                onClick={() =>
                  setCollapsed((prev) => ({
                    ...prev,
                    [collapseKey]: !isCollapsed,
                  }))
                }
                className="flex w-full items-center justify-between gap-2 rounded px-1.5 py-1 text-left font-medium text-foreground hover:bg-muted/40"
              >
                <span className="flex items-center gap-1">
                  <span aria-hidden="true" className="font-mono text-[9px] text-muted-foreground">
                    {isCollapsed ? "▸" : "▾"}
                  </span>
                  {groupLabelFor(ctx, activeGroupBy, value)}
                </span>
                <span className="font-mono text-muted-foreground">{rows.length}</span>
              </button>
              {!isCollapsed && (
                <ul className="mb-1 ml-3 border-l border-border/60 pl-1.5">
                  {rows.map((row) => {
                    const isSelected = String(row.id) === ctx.selectedId
                    return (
                      <li key={String(row.id)}>
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => ctx.select(String(row.id))}
                          className={cn(
                            "flex w-full items-baseline justify-between gap-2 rounded px-1.5 py-0.5 text-left",
                            isSelected
                              ? "bg-sidebar-accent font-medium text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <span className="font-mono text-[10.5px]">{String(row.id)}</span>
                          {salientKey && activeGroupBy !== salientKey && (
                            <span className="truncate text-[10px]">
                              {String(row[salientKey] ?? "")}
                            </span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}

// ---------- Query aspect: saved-query list ----------

function QueryNavigator() {
  return (
    <>
      <header className="shrink-0 border-b px-2.5 py-2">
        <span className="text-[11px] font-semibold text-foreground">Saved queries</span>
      </header>
      <ul className="min-h-0 flex-1 overflow-auto p-1.5 text-[11px]">
        {cannedQueries.map((q) => (
          <li key={q} className="rounded px-1.5 py-1 text-muted-foreground">
            {q}
          </li>
        ))}
      </ul>
      <p className="shrink-0 border-t px-2.5 py-2 text-[10px] text-muted-foreground">
        Saved queries are illustrative — running one is a future Query placement.
      </p>
    </>
  )
}

// ---------- Traversal aspect: association links ----------

function TraversalNavigator({ ctx }: { ctx: WorkspaceContext }) {
  const selected =
    ctx.selectedId != null
      ? ctx.rows.find((r) => String(r.id) === ctx.selectedId) ?? null
      : null

  return (
    <>
      <header className="shrink-0 border-b px-2.5 py-2">
        <span className="text-[11px] font-semibold text-foreground">Associations</span>
        {selected && (
          <span className="ml-2 font-mono text-[10.5px] text-muted-foreground">
            {String(selected.id)}
          </span>
        )}
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-2.5 text-[11px]">
        {/* Row picker: mode switches clear the selection, so traversal owns
            its own way to pick a record — without this the association
            links below would be unreachable. */}
        <ul className="mb-2 space-y-0.5">
          {ctx.rows.map((row) => {
            const isSelected = String(row.id) === ctx.selectedId
            return (
              <li key={String(row.id)}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => ctx.select(String(row.id))}
                  className={cn(
                    "w-full rounded px-1.5 py-0.5 text-left font-mono text-[10.5px]",
                    isSelected
                      ? "bg-sidebar-accent font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {String(row.id)}
                </button>
              </li>
            )
          })}
        </ul>
        {!selected ? (
          <p className="text-muted-foreground">
            Select a record to walk its associations.
          </p>
        ) : ctx.model.associations.length === 0 ? (
          <p className="text-muted-foreground">
            {ctx.model.label} declares no associations.
          </p>
        ) : (
          <ul className="space-y-1">
            {ctx.model.associations.map((a) => {
              const target = objectRegistry[a.targetObjectKey as keyof typeof objectRegistry]
              const targetLabel = target?.plural ?? target?.label ?? a.targetObjectKey
              return (
                <li key={a.key} className="rounded border border-border/60 bg-card px-2 py-1.5">
                  <span className="font-medium text-foreground">{a.label}</span>
                  <span className="text-muted-foreground"> → {targetLabel}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <p className="shrink-0 border-t px-2.5 py-2 text-[10px] text-muted-foreground">
        Traversal browses the stub registry rows — association joins resolve
        through the shared object registry, which the demo dataset stays out of.
      </p>
    </>
  )
}
