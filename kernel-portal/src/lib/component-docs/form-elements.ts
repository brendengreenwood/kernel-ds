import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Form elements — auto-authored element doc entity; parity-verified against source. */
export const formElementsDoc: ComponentDoc = parseComponentDoc({
  "id": "form-elements",
  "name": "Form elements",
  "slug": "form-elements",
  "summary": "Form elements — element entity.",
  "status": "ready",
  "sourceFiles": [
    "form.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "element"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Form elements where its role in the pattern is clear.",
        "Follow the established element conventions when composing Form elements."
      ],
      "donts": [
        "Don't repurpose Form elements for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "form-item",
        "form-label",
        "form-description",
        "form-message"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Form elements for its intended element role."
      ],
      "dontUse": [
        "Don't use Form elements outside its documented purpose."
      ]
    }
  ]
})
