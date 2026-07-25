import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Collapsible — auto-authored component doc entity; parity-verified against source. */
export const collapsibleDoc: ComponentDoc = parseComponentDoc({
  "id": "collapsible",
  "name": "Collapsible",
  "slug": "collapsible",
  "summary": "Collapsible — component entity.",
  "status": "ready",
  "sourceFiles": [
    "collapsible.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Collapsible where its role in the pattern is clear.",
        "Follow the established component conventions when composing Collapsible."
      ],
      "donts": [
        "Don't repurpose Collapsible for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "collapsible",
        "collapsible-trigger",
        "collapsible-content"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Collapsible for its intended component role."
      ],
      "dontUse": [
        "Don't use Collapsible outside its documented purpose."
      ]
    }
  ]
})
