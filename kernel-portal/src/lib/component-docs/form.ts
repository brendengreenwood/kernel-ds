import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Form — auto-authored component doc entity; parity-verified against source. */
export const formDoc: ComponentDoc = parseComponentDoc({
  "id": "form",
  "name": "Form",
  "slug": "form",
  "summary": "Form — component entity.",
  "status": "ready",
  "sourceFiles": [
    "form.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Form where its role in the pattern is clear.",
        "Follow the established component conventions when composing Form."
      ],
      "donts": [
        "Don't repurpose Form for a role another component serves better."
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
        "Use Form for its intended component role."
      ],
      "dontUse": [
        "Don't use Form outside its documented purpose."
      ]
    }
  ]
})
