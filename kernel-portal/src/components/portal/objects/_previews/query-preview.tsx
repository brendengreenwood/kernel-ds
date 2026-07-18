import * as React from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import type { ObjectModel, ObjectRow } from "@/lib/objects"
import { statusForObject, statusLabelForObject } from "@/lib/objects/status-map"

/**
 * Query preview — generic filter + search over an object's rows.
 * Used by the Query page (segment 05) and re-usable by the Designs
 * page (segment 06). Nothing object-specific: status filter chips are
 * derived from `model.statuses`, text search runs against every text
 * field. Status rendering flows through `statusForObject()`.
 */
export interface QueryPreviewProps {
  model: ObjectModel
  rows: ReadonlyArray<ObjectRow>
}

function cellText(field: ObjectModel["fields"][number], value: unknown): string {
  if (value == null) return ""
  if (field.type === "money") {
    const n = typeof value === "number" ? value : Number(value)
    return Number.isFinite(n) ? `$${n.toFixed(2)}` : String(value)
  }
  if (field.type === "number") {
    const n = typeof value === "number" ? value : Number(value)
    return Number.isFinite(n) ? n.toLocaleString() : String(value)
  }
  return String(value)
}

export function QueryPreview({ model, rows }: QueryPreviewProps) {
  const objectKey = model.key
  const [q, setQ] = React.useState("")
  const [activeStatus, setActiveStatus] = React.useState<string | null>(null)

  const statusField = model.fields.find((f) => f.type === "status")
  const textFields = model.fields.filter((f) => f.type === "text" || f.type === "ref")
  const displayFields = model.fields.filter((f) => f.type !== "status")

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase()
    return rows.filter((row) => {
      if (activeStatus && statusField) {
        if (String(row[statusField.key]) !== activeStatus) return false
      }
      if (!needle) return true
      return textFields.some((f) => String(row[f.key] ?? "").toLowerCase().includes(needle))
    })
  }, [rows, q, activeStatus, statusField, textFields])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-[220px]">
          <label className="sr-only" htmlFor={`query-${model.key}-search`}>
            Search {model.plural.toLowerCase()}
          </label>
          <Input
            id={`query-${model.key}-search`}
            type="search"
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
            placeholder={`Search ${model.plural.toLowerCase()}…`}
          />
        </div>
        {statusField && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveStatus(null)}
              className={
                "rounded-md border px-2 py-0.5 text-xs transition-colors " +
                (activeStatus === null
                  ? "border-foreground/40 bg-foreground/10 text-foreground"
                  : "border-border/60 bg-transparent text-muted-foreground hover:bg-muted/40")
              }
              aria-pressed={activeStatus === null}
            >
              All
            </button>
            {model.statuses.map((s) => {
              const isActive = activeStatus === s.key
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActiveStatus(isActive ? null : s.key)}
                  aria-pressed={isActive}
                  className={
                    "rounded-md border px-2 py-0.5 text-xs transition-colors " +
                    (isActive
                      ? "border-foreground/40 bg-foreground/10 text-foreground"
                      : "border-border/60 bg-transparent text-muted-foreground hover:bg-muted/40")
                  }
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {filtered.length} of {rows.length} {model.plural.toLowerCase()}
        </span>
        {(q || activeStatus) && (
          <span className="flex items-center gap-1.5">
            {q && <Badge variant="outline">query: {q}</Badge>}
            {activeStatus && statusField && (
              <Badge variant="outline">
                {statusField.label}: {model.statuses.find((s) => s.key === activeStatus)?.label ?? activeStatus}
              </Badge>
            )}
          </span>
        )}
      </div>

      <div className="rounded-md border border-border/60 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                {displayFields.map((f) => (
                  <th key={f.key} className="px-4 py-2 font-medium">
                    {f.label}
                  </th>
                ))}
                {statusField && <th className="px-4 py-2 font-medium">{statusField.label}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={displayFields.length + (statusField ? 1 : 0)}
                    className="px-4 py-4 text-center text-muted-foreground text-[12px]"
                  >
                    No {model.plural.toLowerCase()} match this query.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id}>
                    {displayFields.map((f) => (
                      <td
                        key={f.key}
                        className={`px-4 py-2 ${f.key === "id" ? "font-mono text-[12px]" : ""}`}
                      >
                        {cellText(f, row[f.key])}
                      </td>
                    ))}
                    {statusField && (
                      <td className="px-4 py-2">
                        <StatusBadge status={statusForObject(objectKey, row[statusField.key])}>
                          {statusLabelForObject(objectKey, row[statusField.key])}
                        </StatusBadge>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
