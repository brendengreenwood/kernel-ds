import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Dialog — auto-authored component doc entity; parity-verified against source. */
export const dialogDoc: ComponentDoc = parseComponentDoc({
  "id": "dialog",
  "name": "Dialog",
  "slug": "dialog",
  "summary": "Dialog — component entity.",
  "status": "ready",
  "sourceFiles": [
    "dialog.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Dialog where its role in the pattern is clear.",
        "Follow the established component conventions when composing Dialog."
      ],
      "donts": [
        "Don't repurpose Dialog for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "dialog",
        "dialog-trigger",
        "dialog-portal",
        "dialog-close",
        "dialog-overlay",
        "dialog-content",
        "dialog-header",
        "dialog-body",
        "dialog-footer",
        "dialog-title",
        "dialog-description"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Dialog for its intended component role."
      ],
      "dontUse": [
        "Don't use Dialog outside its documented purpose."
      ]
    }
  ]
})
