import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Dropdown Menu — auto-authored component doc entity; parity-verified against source. */
export const dropdownMenuDoc: ComponentDoc = parseComponentDoc({
  "id": "dropdown-menu",
  "name": "Dropdown Menu",
  "slug": "dropdown-menu",
  "summary": "Dropdown Menu — component entity.",
  "status": "ready",
  "sourceFiles": [
    "dropdown-menu.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Dropdown Menu where its role in the pattern is clear.",
        "Follow the established component conventions when composing Dropdown Menu."
      ],
      "donts": [
        "Don't repurpose Dropdown Menu for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "dropdown-menu",
        "dropdown-menu-portal",
        "dropdown-menu-trigger",
        "dropdown-menu-content",
        "dropdown-menu-group",
        "dropdown-menu-label",
        "dropdown-menu-item",
        "dropdown-menu-sub",
        "dropdown-menu-sub-trigger",
        "dropdown-menu-sub-content",
        "dropdown-menu-checkbox-item",
        "dropdown-menu-checkbox-item-indicator",
        "dropdown-menu-radio-group",
        "dropdown-menu-radio-item",
        "dropdown-menu-radio-item-indicator",
        "dropdown-menu-separator",
        "dropdown-menu-shortcut"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Dropdown Menu for its intended component role."
      ],
      "dontUse": [
        "Don't use Dropdown Menu outside its documented purpose."
      ]
    }
  ]
})
