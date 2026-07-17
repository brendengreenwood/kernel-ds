import { Section, Subhead, Demo } from "../section"
import {
  contractModel,
  contractRows,
  settlementModel,
  settlementRows,
} from "@/lib/objects"
import { TraversalPreview } from "./_previews"

/**
 * Traversal — the second cross-cutting Aspect in the object-centric IA
 * (decision 0026). A Traversal walks an object's declared associations
 * to render related rows of another object. Pick a source row, see its
 * associated rows joined by foreign key.
 *
 * The stub declares one directional association (Contract has many
 * Settlements) so the Contract demo shows a rich walk while the
 * Settlement demo demonstrates the same primitive on an object with no
 * outbound associations. Segment 06's Designs page reuses the same
 * component in a loop over `objectRegistry`.
 */
export function TraversalSection() {
  return (
    <Section
      id="obj-traversal"
      eyebrow="Objects · Aspect"
      title="Traversal"
      lead="A Traversal walks an object's declared associations to render related rows. Selecting a source row on the left resolves each association — Contract → Settlements is the only association the stub declares, so Settlement's Traversal is intentionally empty. That empty state is part of the primitive: an object with no outbound associations still renders here, it just has nothing to walk."
    >
      <Subhead id="obj-traversal-contract">Contract traversal</Subhead>
      <Demo className="block p-0">
        <TraversalPreview model={contractModel} rows={contractRows} />
      </Demo>

      <Subhead id="obj-traversal-settlement">Settlement traversal</Subhead>
      <Demo className="block p-0">
        <TraversalPreview model={settlementModel} rows={settlementRows} />
      </Demo>

      <Subhead id="obj-traversal-notes">Notes</Subhead>
      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
        <li>Association shape comes from <code className="font-mono text-[12px]">model.associations</code>. The join rule for the stub matches target rows on <code className="font-mono text-[12px]">&lt;sourceKey&gt;Id</code> (e.g. <code className="font-mono text-[12px]">settlement.contractId === contract.id</code>).</li>
        <li>Target status rendering also flows through <code className="font-mono text-[12px]">statusForObject()</code>, so each side of the walk uses its own object's vocabulary.</li>
        <li>Composes with Record — the source row summary at the top is the same shape a Record page renders in full.</li>
      </ul>
    </Section>
  )
}
