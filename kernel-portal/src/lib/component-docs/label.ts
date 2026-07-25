import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Label — auto-authored component doc entity; parity-verified against source. */
export const labelDoc: ComponentDoc = parseComponentDoc({
  "id": "label",
  "name": "Label",
  "slug": "label",
  "summary": "Label — component entity.",
  "status": "ready",
  "sourceFiles": [
    "label.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Label where its role in the pattern is clear.",
        "Follow the established component conventions when composing Label."
      ],
      "donts": [
        "Don't repurpose Label for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "label"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Label for its intended component role."
      ],
      "dontUse": [
        "Don't use Label outside its documented purpose."
      ]
    }
  ]
})
