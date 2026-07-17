"use client"

import * as React from "react"
import { Section, Subhead, Demo } from "../section"
import { StatusBadge, type Status } from "@/components/ui/status-badge"
import { contractModel, contractRows } from "@/lib/objects"

/**
 * Shell — the outermost container in the object-centric IA (decision 0026).
 *
 * A Shell is a persistent chrome around any DS surface: header, sidebar,
 * body slot, footer. It is object-agnostic. Every workspace, dashboard,
 * or single-record page in production is rendered inside a Shell — the
 * Shell owns navigation, identity, and global affordances, and hands the
 * body slot to whatever surface the route says.
 *
 * This page demonstrates a Shell by rendering a mock chrome around a
 * small Contract collection preview. The Shell chrome is DOM-only mock;
 * the interior is a real read of `contractRows` (the same registry the
 * substrate demo uses).
 */
export function ShellSection() {
  return (
    <Section
      id="obj-shell"
      eyebrow="Objects · Shell"
      title="Shell"
      lead="A Shell is the persistent chrome that wraps every DS surface — header, sidebar, body slot, footer. It is object-agnostic: the body slot is where a workspace, dashboard, or record page lives. Decision 0026 names Shell as the outermost container in the object-centric rail."
    >
      <Subhead id="obj-shell-anatomy">Anatomy</Subhead>
      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
        <li><span className="font-medium text-foreground">Header</span> — identity, global search, user affordances.</li>
        <li><span className="font-medium text-foreground">Sidebar</span> — persistent navigation across objects.</li>
        <li><span className="font-medium text-foreground">Body slot</span> — the route-owned region. Every other object page (Workspace, Collection, Record, …) renders here.</li>
        <li><span className="font-medium text-foreground">Footer</span> — status line, version, environment.</li>
      </ul>

      <Subhead id="obj-shell-mock">Mock Shell</Subhead>
      <Demo className="block p-0">
        <MockShell>
          <BodySlotCollectionPreview />
        </MockShell>
      </Demo>
    </Section>
  )
}

function MockShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-[380px] w-full grid-cols-[180px_1fr] grid-rows-[40px_1fr_28px] overflow-hidden rounded-md border">
      {/* Header spans both columns */}
      <div className="col-span-2 flex items-center gap-3 border-b bg-muted/60 px-3 text-xs font-medium">
        <span className="size-5 rounded bg-primary/20" aria-hidden />
        <span>Kernel</span>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">brenden@kernel.dev</span>
      </div>
      {/* Sidebar */}
      <div className="border-r bg-muted/30 p-2 text-[11px]">
        <ul className="space-y-1">
          <li className="rounded bg-sidebar-accent px-2 py-1 font-medium">Contracts</li>
          <li className="px-2 py-1 text-muted-foreground">Settlements</li>
          <li className="px-2 py-1 text-muted-foreground">Dashboards</li>
        </ul>
      </div>
      {/* Body slot */}
      <div className="min-h-0 overflow-y-auto p-3">{children}</div>
      {/* Footer spans both columns */}
      <div className="col-span-2 flex items-center gap-3 border-t bg-muted/60 px-3 font-mono text-[10px] text-muted-foreground">
        <span>v1.0.0</span>
        <span>·</span>
        <span>staging</span>
        <span className="ml-auto">shell · body slot renders route content</span>
      </div>
    </div>
  )
}

function BodySlotCollectionPreview() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {contractModel.plural}
      </p>
      <table className="mt-2 w-full text-[12px]">
        <thead className="text-left text-[10px] uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="pb-1 font-medium">ID</th>
            <th className="pb-1 font-medium">Counterparty</th>
            <th className="pb-1 font-medium">Commodity</th>
            <th className="pb-1 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {contractRows.slice(0, 5).map((row) => (
            <tr key={row.id} className="border-t">
              <td className="py-1 font-mono text-[11px]">{row.id}</td>
              <td className="py-1">{String(row.counterparty ?? "—")}</td>
              <td className="py-1">{String(row.commodity ?? "—")}</td>
              <td className="py-1">
                <StatusBadge status={rowStatus(row.status)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function rowStatus(v: unknown): Status {
  const s = String(v ?? "")
  if (s === "active") return "pending"
  if (s === "settled") return "settled"
  if (s === "cancelled") return "cancelled"
  return "draft"
}
