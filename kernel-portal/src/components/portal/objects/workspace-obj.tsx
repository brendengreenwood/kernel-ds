"use client"

import * as React from "react"
import { Section, Subhead, Demo } from "../section"
import { Plot } from "@/components/ui/marks"
import { StatusBadge } from "@/components/ui/status-badge"
import {
  contractModel,
  contractRows,
  settlementModel,
  settlementRows,
} from "@/lib/objects"
import { contractStatus } from "@/lib/objects/status-map"

/**
 * Workspace — the object-centric container for working across many
 * records of one or more objects (decision 0026).
 *
 * A Workspace composes three regions: a rail (navigation across
 * collections), a canvas (the current object's spatial or tabular
 * surface), and an inspector (the selected record's detail). This
 * page renders a mock workspace built on the Contract + Settlement
 * stubs from `@/lib/objects`.
 *
 * This is documentation, not the real workspace at `/workspace`. The
 * live workspace demo (an experiment from decision 0018) lives at its
 * own route and remains unchanged. This page teaches the pattern.
 */
export function WorkspaceObjectSection() {
  const [selectedId, setSelectedId] = React.useState<string>(
    contractRows[0]?.id ?? ""
  )
  const selected = contractRows.find((r) => r.id === selectedId) ?? contractRows[0]

  return (
    <Section
      id="obj-workspace"
      eyebrow="Objects · Workspace"
      title="Workspace"
      lead="A Workspace composes three regions — rail, canvas, inspector — so a user can move across many records of one or more objects. Decision 0026 places Workspace alongside Shell as a container: Shell wraps the surface, Workspace organizes the work inside the body slot."
    >
      <Subhead id="obj-workspace-anatomy">Anatomy</Subhead>
      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
        <li><span className="font-medium text-foreground">Rail</span> — the collections available in this workspace (one entry per object).</li>
        <li><span className="font-medium text-foreground">Canvas</span> — the current collection rendered as a spatial or tabular surface.</li>
        <li><span className="font-medium text-foreground">Inspector</span> — the selected record's fields and associations.</li>
      </ul>

      <Subhead id="obj-workspace-mock">Mock Workspace</Subhead>
      <Demo className="block p-0">
        <div className="grid h-[420px] w-full grid-cols-[140px_1fr_220px] overflow-hidden rounded-md border">
          <WorkspaceRail />
          <WorkspaceCanvas
            selectedId={selected?.id ?? ""}
            onSelect={setSelectedId}
          />
          <WorkspaceInspector row={selected} />
        </div>
      </Demo>
    </Section>
  )
}

function WorkspaceRail() {
  return (
    <div className="border-r bg-muted/30 p-2 text-[11px]">
      <p className="mb-2 px-2 pt-1 font-mono uppercase tracking-wide text-[9.5px] text-muted-foreground">
        Collections
      </p>
      <ul className="space-y-1">
        <li className="flex items-center justify-between rounded bg-sidebar-accent px-2 py-1 font-medium">
          <span>{contractModel.plural}</span>
          <span className="font-mono text-muted-foreground">{contractRows.length}</span>
        </li>
        <li className="flex items-center justify-between rounded px-2 py-1 text-muted-foreground">
          <span>{settlementModel.plural}</span>
          <span className="font-mono">{settlementRows.length}</span>
        </li>
      </ul>
    </div>
  )
}

function WorkspaceCanvas({
  selectedId,
  onSelect,
}: {
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="relative bg-muted/10">
      <div className="flex items-center gap-2 border-b px-3 py-1.5 text-[11px] font-medium">
        <span>Canvas</span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          spatial view · {contractRows.length} pins
        </span>
      </div>
      <div className="relative h-[calc(100%-28px)]">
        {contractRows.map((row) => {
          const isSelected = row.id === selectedId
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => onSelect(row.id)}
              aria-label={`Select ${row.id}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
              style={{ left: `${row.coord.x}%`, top: `${row.coord.y}%` }}
            >
              <Plot
                shape="dot"
                size={isSelected ? "lg" : "default"}
                className={isSelected ? "text-primary" : "text-primary/60"}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function WorkspaceInspector({
  row,
}: {
  row: (typeof contractRows)[number] | undefined
}) {
  if (!row) {
    return (
      <div className="border-l p-3 text-xs text-muted-foreground">
        No record selected.
      </div>
    )
  }
  return (
    <div className="border-l p-3 text-xs">
      <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
        {contractModel.label}
      </p>
      <p className="mt-1 font-mono text-[12px] font-semibold">{row.id}</p>
      <StatusBadge className="mt-2" status={contractStatus(row.status)} />
      <dl className="mt-3 space-y-1.5">
        <InspectorField label="Counterparty" value={String(row.counterparty ?? "—")} />
        <InspectorField label="Commodity" value={String(row.commodity ?? "—")} />
        <InspectorField label="Quantity" value={String(row.quantity ?? "—")} />
        <InspectorField label="Unit price" value={String(row.unitPrice ?? "—")} />
      </dl>
    </div>
  )
}

function InspectorField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[9.5px] uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-[11.5px]">{value}</dd>
    </div>
  )
}

