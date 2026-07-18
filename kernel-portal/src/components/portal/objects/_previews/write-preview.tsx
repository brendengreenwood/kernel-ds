import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import type { ObjectModel, ObjectRow } from "@/lib/objects"
import { statusForObject } from "@/lib/objects/status-map"

/**
 * Write preview — generic (`{ model, rows }` → JSX) write surface used
 * by the Write page (segment 05) and re-used by the Designs page
 * (segment 06). Demonstrates the two write postures described in the
 * restructure document:
 *
 *   1. **Form** — a labelled input per field, submitted as a whole.
 *   2. **In-place** — clicking a cell in a Collection swaps it for an
 *      editable input; the edit commits on blur.
 *
 * **In-place isolation.** Both postures operate on a local `useState`
 * copy of the row. Neither writes back to `objectRowsRegistry`
 * (imported as a `const` across the app). The reset button restores
 * the initial rows from props.
 */
export interface WritePreviewProps {
  model: ObjectModel
  rows: ReadonlyArray<ObjectRow>
  /** Optional cap for the in-place editor grid. */
  maxRows?: number
}

type EditableField = { key: string; label: string; type: "text" | "number" | "money" }

function editableFieldsFor(model: ObjectModel): EditableField[] {
  return model.fields
    .filter((f) => f.type === "text" || f.type === "number" || f.type === "money")
    .filter((f) => f.key !== "id")
    .map((f) => ({ key: f.key, label: f.label, type: f.type as EditableField["type"] }))
}

function toDisplay(value: unknown): string {
  if (value == null) return ""
  return String(value)
}

function parseValue(raw: string, type: EditableField["type"]): unknown {
  if (type === "text") return raw
  if (raw === "") return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : raw
}

// ---------- Form posture ----------

function FormPreview({ model, rows }: { model: ObjectModel; rows: ReadonlyArray<ObjectRow> }) {
  const editable = editableFieldsFor(model)
  const seed = rows[0] ?? { id: "" }
  const [draft, setDraft] = React.useState<Record<string, unknown>>(() => {
    const acc: Record<string, unknown> = {}
    for (const f of editable) acc[f.key] = seed[f.key] ?? ""
    return acc
  })
  const [submitted, setSubmitted] = React.useState<Record<string, unknown> | null>(null)

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(draft)
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {editable.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={`write-${model.key}-${f.key}`}>{f.label}</Label>
            <Input
              id={`write-${model.key}-${f.key}`}
              type={f.type === "text" ? "text" : "number"}
              inputMode={f.type === "text" ? undefined : "decimal"}
              value={toDisplay(draft[f.key])}
              onChange={(e) =>
                setDraft((d) => ({ ...d, [f.key]: parseValue(e.target.value, f.type) }))
              }
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm">Save {model.label.toLowerCase()}</Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            const reset: Record<string, unknown> = {}
            for (const f of editable) reset[f.key] = seed[f.key] ?? ""
            setDraft(reset)
            setSubmitted(null)
          }}
        >
          Reset
        </Button>
      </div>
      {submitted && (
        <pre className="mt-2 rounded-md border border-border/60 bg-muted/40 px-3 py-2 font-mono text-[12px] leading-relaxed overflow-x-auto">
{`// submitted (local state only — objectRowsRegistry not mutated)\n${JSON.stringify(submitted, null, 2)}`}
        </pre>
      )}
    </form>
  )
}

// ---------- In-place posture ----------

function InPlacePreview({ model, rows, maxRows }: { model: ObjectModel; rows: ReadonlyArray<ObjectRow>; maxRows?: number }) {
  const editable = editableFieldsFor(model)
  const statusField = model.fields.find((f) => f.type === "status")
  const objectKey = model.key

  const [localRows, setLocalRows] = React.useState<ObjectRow[]>(() => rows.map((r) => ({ ...r })))
  const [editing, setEditing] = React.useState<{ id: string; key: string } | null>(null)
  const [dirty, setDirty] = React.useState(false)

  const capped = typeof maxRows === "number" ? localRows.slice(0, maxRows) : localRows

  function commit(rowId: string, key: string, raw: string, type: EditableField["type"]) {
    setLocalRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [key]: parseValue(raw, type) } : r)),
    )
    setEditing(null)
    setDirty(true)
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border border-border/60 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-3 py-2">Id</th>
              {editable.slice(0, 3).map((f) => (
                <th key={f.key} className="text-left font-medium px-3 py-2">{f.label}</th>
              ))}
              {statusField && <th className="text-left font-medium px-3 py-2">Status</th>}
            </tr>
          </thead>
          <tbody>
            {capped.map((row) => (
              <tr key={String(row.id)} className="border-t border-border/60">
                <td className="px-3 py-2 font-mono text-[12px]">{String(row.id)}</td>
                {editable.slice(0, 3).map((f) => {
                  const isEditing = editing?.id === String(row.id) && editing.key === f.key
                  return (
                    <td key={f.key} className="px-3 py-2">
                      {isEditing ? (
                        <Input
                          autoFocus
                          defaultValue={toDisplay(row[f.key])}
                          type={f.type === "text" ? "text" : "number"}
                          className="h-7 text-sm"
                          onBlur={(e) => commit(String(row.id), f.key, e.target.value, f.type)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") (e.target as HTMLInputElement).blur()
                            if (e.key === "Escape") setEditing(null)
                          }}
                        />
                      ) : (
                        <button
                          type="button"
                          className="rounded px-1 -mx-1 text-left hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring"
                          onClick={() => setEditing({ id: String(row.id), key: f.key })}
                          aria-label={`Edit ${f.label} for ${String(row.id)}`}
                        >
                          {toDisplay(row[f.key]) || <span className="text-muted-foreground">—</span>}
                        </button>
                      )}
                    </td>
                  )
                })}
                {statusField && (
                  <td className="px-3 py-2">
                    <StatusBadge status={statusForObject(objectKey, row[statusField.key])} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!dirty}
          onClick={() => {
            setLocalRows(rows.map((r) => ({ ...r })))
            setEditing(null)
            setDirty(false)
          }}
        >
          Reset
        </Button>
        <span className="text-[12px] text-muted-foreground">
          Edits live in local <code className="font-mono text-[11px]">useState</code>; the shared <code className="font-mono text-[11px]">objectRowsRegistry</code> is never mutated.
        </span>
      </div>
    </div>
  )
}

// ---------- Public ----------

export function WritePreview({ model, rows, maxRows }: WritePreviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
          Form · new {model.label.toLowerCase()}
        </div>
        <FormPreview model={model} rows={rows} />
      </div>
      <div>
        <div className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
          In-place · edit existing {model.plural.toLowerCase()}
        </div>
        <InPlacePreview model={model} rows={rows} maxRows={maxRows} />
      </div>
    </div>
  )
}
