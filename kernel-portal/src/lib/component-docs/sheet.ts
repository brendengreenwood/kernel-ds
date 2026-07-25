import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Sheet — auto-authored component doc entity; parity-verified against source. */
export const sheetDoc: ComponentDoc = parseComponentDoc({
  "id": "sheet",
  "name": "Sheet",
  "slug": "sheet",
  "summary": "Sheet — component entity.",
  "status": "ready",
  "sourceFiles": [
    "sheet.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Sheet where its role in the pattern is clear.",
        "Follow the established component conventions when composing Sheet."
      ],
      "donts": [
        "Don't repurpose Sheet for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "sheet",
        "sheet-trigger",
        "sheet-close",
        "sheet-portal",
        "sheet-overlay",
        "sheet-content",
        "sheet-header",
        "sheet-footer",
        "sheet-title",
        "sheet-description"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Sheet for its intended component role."
      ],
      "dontUse": [
        "Don't use Sheet outside its documented purpose."
      ]
    }
  ]
})
