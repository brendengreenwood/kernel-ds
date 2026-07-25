import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Pagination — auto-authored component doc entity; parity-verified against source. */
export const paginationDoc: ComponentDoc = parseComponentDoc({
  "id": "pagination",
  "name": "Pagination",
  "slug": "pagination",
  "summary": "Pagination — component entity.",
  "status": "ready",
  "sourceFiles": [
    "pagination.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Pagination where its role in the pattern is clear.",
        "Follow the established component conventions when composing Pagination."
      ],
      "donts": [
        "Don't repurpose Pagination for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "pagination",
        "pagination-content",
        "pagination-item",
        "pagination-link",
        "pagination-ellipsis"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Pagination for its intended component role."
      ],
      "dontUse": [
        "Don't use Pagination outside its documented purpose."
      ]
    }
  ]
})
