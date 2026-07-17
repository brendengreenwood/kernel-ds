"use client"

import { Section, Subhead, Demo } from "../section"
import {
  contractModel,
  contractRows,
  settlementModel,
  settlementRows,
} from "@/lib/objects"
import { CollectionPreview } from "./_previews"

/**
 * Collection — one of two Read primitives in the object-centric IA
 * (decision 0026). A Collection renders many rows of a single object
 * for scanning, sorting, and selection. Every workspace list, dashboard
 * table, and picker in the product is a Collection at heart.
 *
 * This page demonstrates the primitive against both stub objects
 * (Contract, Settlement) using the same `CollectionPreview` component,
 * proving the primitive is object-agnostic. Segment 06's Designs page
 * consumes the same component in a loop over `objectRegistry`.
 */
export function CollectionSection() {
  return (
    <Section
      id="obj-collection"
      eyebrow="Objects · Read"
      title="Collection"
      lead="A Collection renders many rows of a single object for scanning, sorting, and selection. It is the first of the two Read primitives (decision 0026). The preview below runs the same generic component against Contract and Settlement rows to demonstrate that Collections are object-agnostic — the object model drives the columns and status vocabulary."
    >
      <Subhead id="obj-collection-contract">Contract collection</Subhead>
      <Demo className="block p-0">
        <CollectionPreview model={contractModel} rows={contractRows} maxRows={6} />
      </Demo>

      <Subhead id="obj-collection-settlement">Settlement collection</Subhead>
      <Demo className="block p-0">
        <CollectionPreview model={settlementModel} rows={settlementRows} maxRows={6} />
      </Demo>

      <Subhead id="obj-collection-notes">Notes</Subhead>
      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
        <li>Columns are derived from <code className="font-mono text-[12px]">model.fields</code>; the status field is elevated to the last column and rendered via <code className="font-mono text-[12px]">StatusBadge</code>.</li>
        <li>Status mapping lives in <code className="font-mono text-[12px]">@/lib/objects/status-map</code>. Amendment A4 (2026-07-17) maps <code className="font-mono text-[12px]">active → booked</code> for Contract rows.</li>
        <li>Composes with the Query aspect (segment 05) — a Collection is what a Query returns.</li>
      </ul>
    </Section>
  )
}
