import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Combobox — auto-authored component doc entity; parity-verified against source. */
export const comboboxDoc: ComponentDoc = parseComponentDoc({
  "id": "combobox",
  "name": "Combobox",
  "slug": "combobox",
  "summary": "Combobox — component entity.",
  "status": "ready",
  "sourceFiles": [
    "command.tsx",
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
        "Use Combobox where its role in the pattern is clear.",
        "Follow the established component conventions when composing Combobox."
      ],
      "donts": [
        "Don't repurpose Combobox for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "command",
        "command-input-wrapper",
        "command-input",
        "command-list",
        "command-empty",
        "command-group",
        "command-separator",
        "command-item",
        "command-shortcut",
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
        "Use Combobox for its intended component role."
      ],
      "dontUse": [
        "Don't use Combobox outside its documented purpose."
      ]
    }
  ]
})
