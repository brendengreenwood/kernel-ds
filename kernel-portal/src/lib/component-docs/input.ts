import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/**
 * Input — a single-line text field. No CVA, one slot, one export. Authored at
 * Minimal conformance (summary only, empty docs array) to prove the schema's
 * Minimal level and the gate's no-cva-passes-trivially path.
 */
export const inputDoc: ComponentDoc = parseComponentDoc({
  id: "input",
  name: "Input",
  slug: "input",
  summary: "A single-line text field.",
  status: "ready",
  sourceFiles: ["input.tsx"],
})
