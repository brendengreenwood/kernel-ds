import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Filtering — auto-authored pattern doc entity; parity-verified against source. */
export const filteringDoc: ComponentDoc = parseComponentDoc({
  "id": "filtering",
  "name": "Filtering",
  "slug": "filtering",
  "summary": "Filtering — pattern entity.",
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
        "Use Filtering where its role in the pattern is clear.",
        "Follow the established pattern conventions when composing Filtering."
      ],
      "donts": [
        "Don't repurpose Filtering for a role another component serves better."
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Filtering for its intended pattern role."
      ],
      "dontUse": [
        "Don't use Filtering outside its documented purpose."
      ]
    }
  ]
})
