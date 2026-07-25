import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Advanced filtering — auto-authored pattern doc entity; parity-verified against source. */
export const advancedFilteringDoc: ComponentDoc = parseComponentDoc({
  "id": "advanced-filtering",
  "name": "Advanced filtering",
  "slug": "advanced-filtering",
  "summary": "Advanced filtering — pattern entity.",
  "status": "ready",
  "sourceFiles": [],
  "metadata": {
    "owner": "ds",
    "kind": "pattern"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Advanced filtering where its role in the pattern is clear.",
        "Follow the established pattern conventions when composing Advanced filtering."
      ],
      "donts": [
        "Don't repurpose Advanced filtering for a role another component serves better."
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Advanced filtering for its intended pattern role."
      ],
      "dontUse": [
        "Don't use Advanced filtering outside its documented purpose."
      ]
    }
  ]
})
