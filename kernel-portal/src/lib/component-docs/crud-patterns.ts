import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** CRUD patterns — auto-authored pattern doc entity; parity-verified against source. */
export const crudPatternsDoc: ComponentDoc = parseComponentDoc({
  "id": "crud-patterns",
  "name": "CRUD patterns",
  "slug": "crud-patterns",
  "summary": "CRUD patterns — pattern entity.",
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
        "Use CRUD patterns where its role in the pattern is clear.",
        "Follow the established pattern conventions when composing CRUD patterns."
      ],
      "donts": [
        "Don't repurpose CRUD patterns for a role another component serves better."
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use CRUD patterns for its intended pattern role."
      ],
      "dontUse": [
        "Don't use CRUD patterns outside its documented purpose."
      ]
    }
  ]
})
