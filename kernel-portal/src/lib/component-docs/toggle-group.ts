import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Toggle Group — auto-authored component doc entity; parity-verified against source. */
export const toggleGroupDoc: ComponentDoc = parseComponentDoc({
  "id": "toggle-group",
  "name": "Toggle Group",
  "slug": "toggle-group",
  "summary": "Toggle Group — component entity.",
  "status": "ready",
  "sourceFiles": [
    "toggle-group.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Toggle Group where its role in the pattern is clear.",
        "Follow the established component conventions when composing Toggle Group."
      ],
      "donts": [
        "Don't repurpose Toggle Group for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "toggle-group",
        "toggle-group-item"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Toggle Group for its intended component role."
      ],
      "dontUse": [
        "Don't use Toggle Group outside its documented purpose."
      ]
    }
  ]
})
