import { Section, Subhead, Demo } from "../section"
import {
  contractModel,
  contractRows,
  settlementModel,
  settlementRows,
} from "@/lib/objects"
import { WritePreview } from "./_previews"

/**
 * Write — the write layer in the object-centric IA (decision 0026).
 * Rather than a screen, Write is a *posture*: how the user commits a
 * change to an object.
 *
 * - **Form** — batch a set of field edits and submit once. Used for
 *   creation and larger multi-field changes. Renders as labelled
 *   inputs.
 * - **In-place** — edit a single cell where you see it. Used for tiny
 *   corrections and status changes inside a Collection.
 *
 * Both postures operate on a local `useState` copy of the row. The
 * shared `objectRowsRegistry` (a `const` imported by every subsequent
 * page) is never mutated — see the write preview implementation.
 */
export function WriteSection() {
  return (
    <Section
      id="obj-write"
      eyebrow="Objects · Write"
      title="Write"
      lead="Write is not a screen; it is a posture. The Form posture batches field edits and submits once — good for creation. The In-place posture edits a single cell where it is displayed — good for tiny corrections and status changes. Both postures below operate on local copies of the row; neither mutates the shared object rows registry."
    >
      <Subhead id="obj-write-contract">Contract writes</Subhead>
      <Demo className="block p-0">
        <WritePreview model={contractModel} rows={contractRows} maxRows={5} />
      </Demo>

      <Subhead id="obj-write-settlement">Settlement writes</Subhead>
      <Demo className="block p-0">
        <WritePreview model={settlementModel} rows={settlementRows} maxRows={5} />
      </Demo>

      <Subhead id="obj-write-notes">Notes</Subhead>
      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
        <li>Editable fields are derived from <code className="font-mono text-[12px]">model.fields</code>: <code className="font-mono text-[12px]">text</code>, <code className="font-mono text-[12px]">number</code>, and <code className="font-mono text-[12px]">money</code> types render as inputs; <code className="font-mono text-[12px]">status</code> is display-only in these demos.</li>
        <li>In-place cells commit on blur or <kbd className="font-mono text-[11px] border border-border/60 rounded px-1">Enter</kbd>; <kbd className="font-mono text-[11px] border border-border/60 rounded px-1">Esc</kbd> cancels. Focus outline follows shadcn button conventions.</li>
        <li>Neither posture mutates <code className="font-mono text-[12px]">objectRowsRegistry</code> — edits live in local <code className="font-mono text-[12px]">useState</code> so navigating away and back resets the demo.</li>
      </ul>
    </Section>
  )
}
