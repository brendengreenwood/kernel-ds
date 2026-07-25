import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Date Picker — auto-authored component doc entity; parity-verified against source. */
export const datePickerDoc: ComponentDoc = parseComponentDoc({
  "id": "date-picker",
  "name": "Date Picker",
  "slug": "date-picker",
  "summary": "Date Picker — component entity.",
  "status": "ready",
  "sourceFiles": [
    "calendar.tsx",
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
        "Use Date Picker where its role in the pattern is clear.",
        "Follow the established component conventions when composing Date Picker."
      ],
      "donts": [
        "Don't repurpose Date Picker for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "calendar",
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
        "Use Date Picker for its intended component role."
      ],
      "dontUse": [
        "Don't use Date Picker outside its documented purpose."
      ]
    }
  ]
})
