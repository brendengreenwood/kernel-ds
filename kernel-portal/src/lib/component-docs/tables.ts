import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Tables — auto-authored element doc entity; parity-verified against source. */
export const tablesDoc: ComponentDoc = parseComponentDoc({
  "id": "tables",
  "name": "Tables",
  "slug": "tables",
  "summary": "Tables — element entity.",
  "status": "ready",
  "sourceFiles": [
    "table.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "element"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Tables where its role in the pattern is clear.",
        "Follow the established element conventions when composing Tables."
      ],
      "donts": [
        "Don't repurpose Tables for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "table-container",
        "table",
        "table-header",
        "table-body",
        "table-footer",
        "table-row",
        "table-head",
        "table-cell",
        "table-caption"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Tables for its intended element role."
      ],
      "dontUse": [
        "Don't use Tables outside its documented purpose."
      ]
    }
  ]
})
