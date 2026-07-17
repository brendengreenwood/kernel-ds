import { Section, Subhead, Demo } from "../section"
import {
  contractModel,
  contractRows,
  settlementModel,
  settlementRows,
} from "@/lib/objects"
import { QueryPreview } from "./_previews"

/**
 * Query — one of two cross-cutting Aspects in the object-centric IA
 * (decision 0026). A Query narrows any object's row set with predicates
 * (text search, status filter, later: field ranges). A Query yields a
 * Collection; a Query renders as filter chrome over the Collection it
 * produces.
 *
 * This page demonstrates the aspect against both stub objects using the
 * same generic `QueryPreview` component so segment 06's Designs page
 * can iterate `objectRegistry` and render one per object.
 */
export function QuerySection() {
  return (
    <Section
      id="obj-query"
      eyebrow="Objects · Aspect"
      title="Query"
      lead="A Query narrows an object's rows with predicates. Text search runs against text and reference fields; a status chip row narrows to one vocabulary value. The result is a Collection — Query is Collection with a lens in front of it. Both demos below share the same generic component; the model drives the filter chips and columns."
    >
      <Subhead id="obj-query-contract">Contract query</Subhead>
      <Demo className="block p-0">
        <QueryPreview model={contractModel} rows={contractRows} />
      </Demo>

      <Subhead id="obj-query-settlement">Settlement query</Subhead>
      <Demo className="block p-0">
        <QueryPreview model={settlementModel} rows={settlementRows} />
      </Demo>

      <Subhead id="obj-query-notes">Notes</Subhead>
      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
        <li>Filter chrome is derived from <code className="font-mono text-[12px]">model.statuses</code>; text search targets every field of type <code className="font-mono text-[12px]">text</code> or <code className="font-mono text-[12px]">ref</code>.</li>
        <li>Status rendering flows through <code className="font-mono text-[12px]">statusForObject()</code> — Amendment A4 (2026-07-17) maps Contract <code className="font-mono text-[12px]">active → booked</code>, so the filter chip and the row badge always agree.</li>
        <li>Query <em>composes</em> with Collection — the filtered result <em>is</em> the Collection this page renders.</li>
      </ul>
    </Section>
  )
}
