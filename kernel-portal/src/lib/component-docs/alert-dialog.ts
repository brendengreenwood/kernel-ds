import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Alert Dialog — auto-authored component doc entity; parity-verified against source. */
export const alertDialogDoc: ComponentDoc = parseComponentDoc({
  "id": "alert-dialog",
  "name": "Alert Dialog",
  "slug": "alert-dialog",
  "summary": "Alert Dialog — component entity.",
  "status": "ready",
  "sourceFiles": [
    "alert-dialog.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Alert Dialog where its role in the pattern is clear.",
        "Follow the established component conventions when composing Alert Dialog."
      ],
      "donts": [
        "Don't repurpose Alert Dialog for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "alert-dialog",
        "alert-dialog-trigger",
        "alert-dialog-portal",
        "alert-dialog-overlay",
        "alert-dialog-content",
        "alert-dialog-header",
        "alert-dialog-footer",
        "alert-dialog-media",
        "alert-dialog-title",
        "alert-dialog-description",
        "alert-dialog-action",
        "alert-dialog-cancel"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Alert Dialog for its intended component role."
      ],
      "dontUse": [
        "Don't use Alert Dialog outside its documented purpose."
      ]
    }
  ]
})
