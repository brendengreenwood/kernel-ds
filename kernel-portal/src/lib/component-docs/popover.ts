import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Popover — auto-authored component doc entity; parity-verified against source. */
export const popoverDoc: ComponentDoc = parseComponentDoc({
  "id": "popover",
  "name": "Popover",
  "slug": "popover",
  "summary": "Popover — component entity.",
  "status": "ready",
  "sourceFiles": [
    "popover.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Popover where its role in the pattern is clear.",
        "Follow the established component conventions when composing Popover."
      ],
      "donts": [
        "Don't repurpose Popover for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "popover",
        "popover-trigger",
        "popover-content",
        "popover-header",
        "popover-title",
        "popover-description"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Popover for its intended component role."
      ],
      "dontUse": [
        "Don't use Popover outside its documented purpose."
      ]
    }
  ]
})
