import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Advanced Filtering — pattern doc entity. */
export const advancedFilteringDoc: ComponentDoc = parseComponentDoc({
  id: "advanced-filtering",
  name: "Advanced Filtering",
  slug: "advanced-filtering",
  summary:
    "The power-user layer on top of basic filtering — composable conditions (field, operator, value), grouped with AND/OR, and saveable as reusable views. Use it when simple facets can't express the query; keep the everyday case simple and let this depth stay opt-in.",
  status: "ready",
  sourceFiles: [],
  metadata: { owner: "ds", kind: "pattern" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Build conditions from a clear field/operator/value triple so each rule reads as a sentence.",
        "Let users group conditions and choose AND/OR, and preview the result count before applying.",
        "Allow saving a filter set as a named view so a complex query can be reused.",
      ],
      donts: [
        "Don't make every user pass through the advanced builder — keep simple filtering the default path.",
        "Don't expose operators that don't apply to a field's type (no \"greater than\" on a free-text field).",
        "Don't lose a user's carefully built query on refresh — persist it.",
      ],
    },
    {
      kind: "useCases",
      use: [
        "Composing multi-condition queries over a large collection.",
        "Saving and reusing named filter views.",
        "Expressing AND/OR logic simple facets can't.",
      ],
      dontUse: [
        "Everyday narrowing by one or two facets — use basic filtering.",
        "A single-value selection — use a Select.",
        "Sorting or column visibility — those are table concerns.",
      ],
    },
  ],
})
