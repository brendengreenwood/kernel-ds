import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Accordion — auto-authored component doc entity; parity-verified against source. */
export const accordionDoc: ComponentDoc = parseComponentDoc({
  "id": "accordion",
  "name": "Accordion",
  "slug": "accordion",
  "summary": "Accordion — component entity.",
  "status": "ready",
  "sourceFiles": [
    "accordion.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Accordion where its role in the pattern is clear.",
        "Follow the established component conventions when composing Accordion."
      ],
      "donts": [
        "Don't repurpose Accordion for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "accordion",
        "accordion-item",
        "accordion-trigger",
        "accordion-trigger-icon",
        "accordion-content"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Accordion for its intended component role."
      ],
      "dontUse": [
        "Don't use Accordion outside its documented purpose."
      ]
    }
  ]
})
