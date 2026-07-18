import * as React from "react"
import { StatusBadge } from "@/components/ui/status-badge"
import { getObjectModel, type ObjectModel, type ObjectRow } from "@/lib/objects"
import { statusForObject } from "@/lib/objects/status-map"

/**
 * Record preview — generic (`{ model, row }` → JSX) single-record view.
 * Used by the Record page (segment 04) and re-used by the Designs page
 * (segment 06). Renders a two-column definition list of every field the
 * model declares, with the status field elevated as a badge.
 */
export interface RecordPreviewProps {
  model: ObjectModel
  row: ObjectRow
}

function formatValue(field: ObjectModel["fields"][number], value: unknown): React.ReactNode {
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

export function RecordPreview({ model, row }: RecordPreviewProps) {
  const objectKey = model.key
  const statusField = model.fields.find((f) => f.type === "status")
  const detailFields = model.fields.filter((f) => f.type !== "status" && f.key !== "id")

  return (
    <div className="rounded-md border border-border/60 bg-card overflow-hidden">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 bg-muted/30">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{model.label}</div>
          <div className="mt-0.5 font-mono text-[13px] font-semibold text-foreground">{String(row.id)}</div>
        </div>
        {statusField && (
          <StatusBadge status={statusForObject(objectKey, row[statusField.key])} />
        )}
      </header>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 px-4 py-3 text-[13px]">
        {detailFields.map((f) => (
          <React.Fragment key={f.key}>
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground pt-0.5">
              {f.label}
            </dt>
            <dd className="font-medium text-foreground">{formatValue(f, row[f.key])}</dd>
          </React.Fragment>
        ))}
        {model.associations.length > 0 && (
          <>
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground pt-0.5">
              Associations
            </dt>
            <dd className="text-muted-foreground">
              {model.associations
                .map((a) => {
                  const target = getObjectModel(a.targetObjectKey)
                  const targetLabel = target?.plural ?? target?.label ?? a.targetObjectKey
                  return `${a.label} → ${targetLabel}`
                })
                .join(" · ")}
            </dd>
          </>
        )}
      </dl>
    </div>
  )
}
