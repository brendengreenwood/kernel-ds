import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Table — auto-authored component doc entity; parity-verified against source. */
export const tableDoc: ComponentDoc = parseComponentDoc({
  "id": "table",
  "name": "Table",
  "slug": "table",
  "summary": "Table — component entity.",
  "status": "ready",
  "sourceFiles": [
    "table.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Table where its role in the pattern is clear.",
        "Follow the established component conventions when composing Table."
      ],
      "donts": [
        "Don't repurpose Table for a role another component serves better."
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
        "Use Table for its intended component role."
      ],
      "dontUse": [
        "Don't use Table outside its documented purpose."
      ]
    }
  ]
})
