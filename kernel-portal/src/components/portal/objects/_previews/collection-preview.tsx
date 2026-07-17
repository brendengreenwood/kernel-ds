"use client"

import * as React from "react"
import { StatusBadge } from "@/components/ui/status-badge"
import type { ObjectModel, ObjectRow } from "@/lib/objects"
import { statusForObject } from "@/lib/objects/status-map"

/**
 * Collection preview — generic (`{ model, rows }` → JSX) table view of an
 * object's rows. Used by the Collection page (segment 04) and re-used by
 * the Designs page (segment 06) which iterates `objectRegistry`. Nothing
 * here is object-specific; status rendering flows through
 * `statusForObject()` in `@/lib/objects/status-map`.
 */
export interface CollectionPreviewProps {
  model: ObjectModel
  rows: ReadonlyArray<ObjectRow>
  /**
   * Cap the number of rows rendered. Defaults to `Infinity`; the
   * collection page passes a real number for a compact preview.
   */
  maxRows?: number
}

function formatCell(field: ObjectModel["fields"][number], value: unknown): React.ReactNode {
  if (value == null) return <span className="text-muted-foreground">—</span>
  if (field.type === "money") {
    const n = typeof value === "number" ? value : Number(value)
    if (!Number.isFinite(n)) return String(value)
    return `$${n.toFixed(2)}`
  }
  if (field.type === "number") {
    const n = typeof value === "number" ? value : Number(value)
    if (!Number.isFinite(n)) return String(value)
    return n.toLocaleString()
  }
  return String(value)
}

export function CollectionPreview({ model, rows, maxRows = Infinity }: CollectionPreviewProps) {
  const objectKey = model.key as Parameters<typeof statusForObject>[0]
  const shown = rows.slice(0, maxRows)
  const nonStatusFields = model.fields.filter((f) => f.type !== "status")
  const statusField = model.fields.find((f) => f.type === "status")

  return (
    <div className="rounded-md border border-border/60 bg-card overflow-hidden">
      <div className="flex items-baseline justify-between border-b border-border/60 px-4 py-2 bg-muted/30">
        <div className="text-xs font-semibold text-foreground">{model.plural}</div>
        <div className="text-[11px] text-muted-foreground">
          {shown.length} of {rows.length}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              {nonStatusFields.map((f) => (
                <th key={f.key} className="px-4 py-2 font-medium">
                  {f.label}
                </th>
              ))}
              {statusField && <th className="px-4 py-2 font-medium">{statusField.label}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {shown.map((row) => (
              <tr key={row.id}>
                {nonStatusFields.map((f) => (
                  <td key={f.key} className={`px-4 py-2 ${f.key === "id" ? "font-mono text-[12px]" : ""}`}>
                    {formatCell(f, row[f.key])}
                  </td>
                ))}
                {statusField && (
                  <td className="px-4 py-2">
                    <StatusBadge status={statusForObject(objectKey, row[statusField.key])} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
