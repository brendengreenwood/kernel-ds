import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Tooltip — auto-authored component doc entity; parity-verified against source. */
export const tooltipDoc: ComponentDoc = parseComponentDoc({
  "id": "tooltip",
  "name": "Tooltip",
  "slug": "tooltip",
  "summary": "Tooltip — component entity.",
  "status": "ready",
  "sourceFiles": [
    "tooltip.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Tooltip where its role in the pattern is clear.",
        "Follow the established component conventions when composing Tooltip."
      ],
      "donts": [
        "Don't repurpose Tooltip for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "tooltip-provider",
        "tooltip",
        "tooltip-trigger",
        "tooltip-content"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Tooltip for its intended component role."
      ],
      "dontUse": [
        "Don't use Tooltip outside its documented purpose."
      ]
    }
  ]
})
