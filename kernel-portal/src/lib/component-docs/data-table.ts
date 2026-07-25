import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Data Table — auto-authored component doc entity; parity-verified against source. */
export const dataTableDoc: ComponentDoc = parseComponentDoc({
  "id": "data-table",
  "name": "Data Table",
  "slug": "data-table",
  "summary": "Data Table — component entity.",
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
        "Use Data Table where its role in the pattern is clear.",
        "Follow the established component conventions when composing Data Table."
      ],
      "donts": [
        "Don't repurpose Data Table for a role another component serves better."
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
        "Use Data Table for its intended component role."
      ],
      "dontUse": [
        "Don't use Data Table outside its documented purpose."
      ]
    }
  ]
})
