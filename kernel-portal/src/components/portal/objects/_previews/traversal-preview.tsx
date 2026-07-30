import * as React from "react"
import { StatusBadge } from "@kernel/ui"
import {
  getObjectModel,
  getObjectRows,
  type ObjectModel,
  type ObjectRow,
} from "@/lib/objects"
import { statusForObject, statusLabelForObject } from "@/lib/objects/status-map"

/**
 * Traversal preview — generic association walker for an object.
 * Given a source model + its rows, pick a row, then render each
 * declared association group with target rows joined via the target
 * object's foreign-key field. Used by the Traversal page (segment 05)
 * and re-usable by the Designs page (segment 06).
 *
 * The join rule is intentionally simple for the stub: for association
 * `{ targetObjectKey: T }`, the target rows are those whose field
 * `<sourceModel.key>Id` equals the source row's id (matches the
 * `settlement.contractId → contract.id` shape declared in the stub).
 */
export interface TraversalPreviewProps {
  model: ObjectModel
  rows: ReadonlyArray<ObjectRow>
}

function joinTargetRows(
  sourceModel: ObjectModel,
  sourceRow: ObjectRow,
  targetKey: string
): ReadonlyArray<ObjectRow> {
  const targets = getObjectRows(targetKey)
  const fkField = `${sourceModel.key}Id`
  return targets.filter((t) => String(t[fkField] ?? "") === String(sourceRow.id))
}

function summarizeRow(model: ObjectModel, row: ObjectRow): string {
  const bits: string[] = []
  const commodity = row.commodity ?? row.contractId
  if (commodity != null) bits.push(String(commodity))
  const quantity = row.quantity ?? row.settledQuantity
  if (quantity != null) {
    const n = typeof quantity === "number" ? quantity : Number(quantity)
    if (Number.isFinite(n)) bits.push(`${n.toLocaleString()} bu`)
  }
  const price = row.unitPrice ?? row.settlementPrice
  if (price != null) {
    const n = typeof price === "number" ? price : Number(price)
    if (Number.isFinite(n)) bits.push(`$${n.toFixed(2)}`)
  }
  return bits.length > 0 ? bits.join(" · ") : model.label
}

export function TraversalPreview({ model, rows }: TraversalPreviewProps) {
  const objectKey = model.key
  const statusField = model.fields.find((f) => f.type === "status")
  const [selectedId, setSelectedId] = React.useState<string>(String(rows[0]?.id ?? ""))
  const selected = rows.find((r) => String(r.id) === selectedId) ?? rows[0]

  return (
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      <aside className="rounded-md border border-border/60 bg-card">
        <div className="border-b border-border/60 px-3 py-2 text-[11px] uppercase tracking-wide text-muted-foreground">
          {model.plural}
        </div>
        <ul className="divide-y divide-border/60">
          {rows.map((row) => {
            const isSelected = String(row.id) === String(selected?.id)
            return (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(String(row.id))}
                  aria-pressed={isSelected}
                  className={
                    "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12px] transition-colors " +
                    (isSelected ? "bg-muted/50 text-foreground" : "text-muted-foreground hover:bg-muted/30")
                  }
                >
                  <span className="font-mono">{String(row.id)}</span>
                  {statusField && (
                    <StatusBadge status={statusForObject(objectKey, row[statusField.key])}>
                      {statusLabelForObject(objectKey, row[statusField.key])}
                    </StatusBadge>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      <section className="space-y-3">
        {selected ? (
          <>
            <header className="rounded-md border border-border/60 bg-card px-4 py-3">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {model.label}
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="font-mono text-[13px] font-semibold text-foreground">
                  {String(selected.id)}
                </span>
                <span className="text-[12px] text-muted-foreground">{summarizeRow(model, selected)}</span>
              </div>
            </header>

            {model.associations.length === 0 ? (
              <div className="rounded-md border border-dashed border-border/60 px-4 py-4 text-[12px] text-muted-foreground">
                {model.label} declares no associations.
              </div>
            ) : (
              model.associations.map((assoc) => {
                const targetKey = assoc.targetObjectKey
                const target = getObjectModel(targetKey)
                if (!target) return null
                const targetRows = joinTargetRows(model, selected, targetKey)
                const targetStatusField = target.fields.find((f) => f.type === "status")
                return (
                  <div key={assoc.key} className="rounded-md border border-border/60 bg-card overflow-hidden">
                    <div className="flex items-baseline justify-between border-b border-border/60 px-4 py-2 bg-muted/30">
                      <div className="text-xs font-semibold text-foreground">
                        {assoc.label}{" "}
                        <span className="font-normal text-muted-foreground">→ {target.plural}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{targetRows.length}</div>
                    </div>
                    {targetRows.length === 0 ? (
                      <div className="px-4 py-3 text-[12px] text-muted-foreground">
                        No related {target.plural.toLowerCase()}.
                      </div>
                    ) : (
                      <ul className="divide-y divide-border/60">
                        {targetRows.map((row) => (
                          <li
                            key={String(row.id)}
                            className="flex items-center justify-between gap-3 px-4 py-2 text-[13px]"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-[12px]">{String(row.id)}</span>
                              <span className="text-muted-foreground">{summarizeRow(target, row)}</span>
                            </div>
                            {targetStatusField && (
                              <StatusBadge
                                status={statusForObject(targetKey, row[targetStatusField.key])}
                              >
                                {statusLabelForObject(targetKey, row[targetStatusField.key])}
                              </StatusBadge>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })
            )}
          </>
        ) : (
          <div className="rounded-md border border-dashed border-border/60 px-4 py-6 text-[12px] text-muted-foreground">
            No rows to traverse.
          </div>
        )}
      </section>
    </div>
  )
}
