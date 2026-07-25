import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Checkbox — auto-authored component doc entity; parity-verified against source. */
export const checkboxDoc: ComponentDoc = parseComponentDoc({
  "id": "checkbox",
  "name": "Checkbox",
  "slug": "checkbox",
  "summary": "Checkbox — component entity.",
  "status": "ready",
  "sourceFiles": [
    "checkbox.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Checkbox where its role in the pattern is clear.",
        "Follow the established component conventions when composing Checkbox."
      ],
      "donts": [
        "Don't repurpose Checkbox for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "checkbox",
        "checkbox-indicator"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Checkbox for its intended component role."
      ],
      "dontUse": [
        "Don't use Checkbox outside its documented purpose."
      ]
    }
  ]
})
