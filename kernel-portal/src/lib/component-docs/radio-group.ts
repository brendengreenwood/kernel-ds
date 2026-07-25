import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Radio Group — auto-authored component doc entity; parity-verified against source. */
export const radioGroupDoc: ComponentDoc = parseComponentDoc({
  "id": "radio-group",
  "name": "Radio Group",
  "slug": "radio-group",
  "summary": "Radio Group — component entity.",
  "status": "ready",
  "sourceFiles": [
    "radio-group.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Radio Group where its role in the pattern is clear.",
        "Follow the established component conventions when composing Radio Group."
      ],
      "donts": [
        "Don't repurpose Radio Group for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "radio-group",
        "radio-group-item",
        "radio-group-indicator"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Radio Group for its intended component role."
      ],
      "dontUse": [
        "Don't use Radio Group outside its documented purpose."
      ]
    }
  ]
})
