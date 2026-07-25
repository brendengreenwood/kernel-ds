import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Hover Card — auto-authored component doc entity; parity-verified against source. */
export const hoverCardDoc: ComponentDoc = parseComponentDoc({
  "id": "hover-card",
  "name": "Hover Card",
  "slug": "hover-card",
  "summary": "Hover Card — component entity.",
  "status": "ready",
  "sourceFiles": [
    "hover-card.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Hover Card where its role in the pattern is clear.",
        "Follow the established component conventions when composing Hover Card."
      ],
      "donts": [
        "Don't repurpose Hover Card for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "hover-card",
        "hover-card-trigger",
        "hover-card-portal",
        "hover-card-content"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Hover Card for its intended component role."
      ],
      "dontUse": [
        "Don't use Hover Card outside its documented purpose."
      ]
    }
  ]
})
