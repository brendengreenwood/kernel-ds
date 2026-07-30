"use client"

import * as React from "react"
import { Section, Subhead, Demo } from "../section"
import { Pin, Plot, ClusterBadge, LegendSwatch } from "@kernel/ui/marks"
import { contractRows } from "@/lib/objects"

/**
 * Substrate demo — DOM compose vs. Canvas boundary (decision 0027).
 *
 * The two panels use the same object model (`contractRows`) and the same
 * mark components (`Pin`, `Plot`, `ClusterBadge`, `LegendSwatch`). What
 * differs is the substrate: on the left, the DS composes the interior
 * with tokened DOM nodes; on the right, an opaque surface (a real
 * `<canvas>` in production) is fenced behind a projection contract, and
 * overlays are anchored via DOM marks.
 *
 * Both panels are DOM-only demos — no canvas engine is wired in this
 * segment. The right panel simulates the boundary with a `<div>` acting
 * as the opaque region.
 */
export function SubstrateSection() {
  return (
    <Section
      id="obj-substrate"
      eyebrow="Objects · Substrate"
      title="Substrate"
      lead="Every object gets rendered on a substrate. The DS composes DOM substrates directly; canvas substrates are opaque and governed by a projection contract (data in, event vocabulary out, marks anchored via DOM overlays). Decision 0027 describes the split."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <SubstratePanel
          heading="DOM compose"
          note="DS composes the interior — every mark is a tokened DOM node."
          tint="bg-muted/40"
        >
          <DomCompose />
        </SubstratePanel>

        <SubstratePanel
          heading="Canvas boundary"
          note="Opaque interior; DS governs the boundary and anchors overlays via DOM marks."
          tint="bg-muted"
        >
          <CanvasBoundary />
        </SubstratePanel>
      </div>

      <Subhead id="obj-substrate-legend">Legend</Subhead>
      <Demo className="items-center gap-4">
        <LegendRow color="var(--color-primary)" label="Active" />
        <LegendRow color="var(--color-muted-foreground)" label="Draft" />
        <LegendRow color="var(--color-destructive)" label="Cancelled" />
      </Demo>
    </Section>
  )
}

function SubstratePanel({
  heading,
  note,
  tint,
  children,
}: {
  heading: string
  note: string
  tint: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-semibold">{heading}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      <div
        className={`mt-3 relative aspect-[4/3] w-full overflow-hidden rounded-md border ${tint}`}
      >
        {children}
      </div>
    </div>
  )
}

/** DOM compose — every mark is a positioned DOM node reading coord from the row registry. */
function DomCompose() {
  return (
    <>
      {contractRows.map((row) => {
        const status = String(row.status ?? "")
        const quantity = typeof row.quantity === "number" ? row.quantity : 0
        return (
          <span
            key={row.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${row.coord.x}%`, top: `${row.coord.y}%` }}
          >
            <Plot
              shape={status === "cancelled" ? "diamond" : "dot"}
              size={quantity > 20000 ? "lg" : "default"}
              className={toneClass(status)}
            />
          </span>
        )
      })}
      <span className="absolute left-2 top-2 rounded-sm bg-background/80 px-1.5 py-0.5 text-[10px] font-medium">
        DOM · {contractRows.length} contracts
      </span>
    </>
  )
}

/** Canvas boundary — a shaded surface stands in for the opaque canvas; DOM marks anchor to it. */
function CanvasBoundary() {
  const clusters = [
    { x: 30, y: 30, count: 3, label: "KC hub" },
    { x: 65, y: 55, count: 5, label: "MSP hub" },
  ]
  return (
    <>
      {/* The opaque region — a real canvas in production. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(45deg, transparent 0 8px, oklch(from currentColor l c h / 0.05) 8px 10px)",
        }}
        aria-hidden="true"
      />
      {clusters.map((c) => (
        <span
          key={c.label}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${c.x}%`, top: `${c.y}%` }}
        >
          <ClusterBadge count={c.count} />
        </span>
      ))}
      <span
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `20%`, top: `70%` }}
      >
        <Pin variant="destructive" size="default" />
      </span>
      <span className="absolute left-2 top-2 rounded-sm bg-background/80 px-1.5 py-0.5 text-[10px] font-medium">
        Canvas · overlays via DOM
      </span>
    </>
  )
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs">
      <LegendSwatch shape="circle" style={{ color }} />
      {label}
    </span>
  )
}

function toneClass(status: string): string {
  switch (status) {
    case "cancelled":
      return "text-destructive"
    case "draft":
      return "text-muted-foreground"
    case "settled":
      return "text-primary/70"
    case "active":
    default:
      return "text-primary"
  }
}
