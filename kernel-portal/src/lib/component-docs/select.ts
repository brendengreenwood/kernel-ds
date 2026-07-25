import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Select — auto-authored component doc entity; parity-verified against source. */
export const selectDoc: ComponentDoc = parseComponentDoc({
  "id": "select",
  "name": "Select",
  "slug": "select",
  "summary": "Select — component entity.",
  "status": "ready",
  "sourceFiles": [
    "select.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Select where its role in the pattern is clear.",
        "Follow the established component conventions when composing Select."
      ],
      "donts": [
        "Don't repurpose Select for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "select-group",
        "select-value",
        "select-trigger",
        "select-content",
        "select-label",
        "select-item",
        "select-separator",
        "select-scroll-up-button",
        "select-scroll-down-button"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Select for its intended component role."
      ],
      "dontUse": [
        "Don't use Select outside its documented purpose."
      ]
    }
  ]
})
