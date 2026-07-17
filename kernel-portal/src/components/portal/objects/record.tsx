"use client"

import { Section, Subhead, Demo } from "../section"
import {
  contractModel,
  contractRows,
  settlementModel,
  settlementRows,
} from "@/lib/objects"
import { RecordPreview } from "./_previews"

/**
 * Record — the second Read primitive (decision 0026). A Record renders
 * one row of one object with every field and its associations. Every
 * detail page, inspector panel, and expanded row in the product is a
 * Record at heart.
 *
 * This page demonstrates the primitive against both stub objects
 * (Contract, Settlement) using the same `RecordPreview` component,
 * proving the primitive is object-agnostic. Segment 06's Designs page
 * consumes the same component in a loop over `objectRegistry`.
 */
export function RecordSection() {
  const contract = contractRows[0]
  const settlement = settlementRows[0]

  return (
    <Section
      id="obj-record"
      eyebrow="Objects · Read"
      title="Record"
      lead="A Record renders one row of one object with every field and its associations. It is the second of the two Read primitives (decision 0026). The two previews below run the same generic component against a Contract row and a Settlement row — the object model drives which fields render, which one carries status, and which associations to list."
    >
      <Subhead id="obj-record-contract">Contract record</Subhead>
      <Demo className="block p-0">
        <RecordPreview model={contractModel} row={contract} />
      </Demo>

      <Subhead id="obj-record-settlement">Settlement record</Subhead>
      <Demo className="block p-0">
        <RecordPreview model={settlementModel} row={settlement} />
      </Demo>

      <Subhead id="obj-record-notes">Notes</Subhead>
      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
        <li>Fields are read from <code className="font-mono text-[12px]">model.fields</code>; the status field is elevated to the header, the id field pins the header caption, and every other field lands in the definition list.</li>
        <li>Associations render as a footer row — the Traversal aspect (segment 05) is what makes them navigable.</li>
        <li>A Record is what a Collection selects into. Together they close the Read primitive.</li>
      </ul>
    </Section>
  )
}
