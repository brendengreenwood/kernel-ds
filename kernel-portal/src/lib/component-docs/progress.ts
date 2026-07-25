import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Progress — auto-authored component doc entity; parity-verified against source. */
export const progressDoc: ComponentDoc = parseComponentDoc({
  "id": "progress",
  "name": "Progress",
  "slug": "progress",
  "summary": "Progress — component entity.",
  "status": "ready",
  "sourceFiles": [
    "progress.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Progress where its role in the pattern is clear.",
        "Follow the established component conventions when composing Progress."
      ],
      "donts": [
        "Don't repurpose Progress for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "progress",
        "progress-track",
        "progress-indicator",
        "progress-label",
        "progress-value"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Progress for its intended component role."
      ],
      "dontUse": [
        "Don't use Progress outside its documented purpose."
      ]
    }
  ]
})
