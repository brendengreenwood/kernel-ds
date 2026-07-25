import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Context Menu — auto-authored component doc entity; parity-verified against source. */
export const contextMenuDoc: ComponentDoc = parseComponentDoc({
  "id": "context-menu",
  "name": "Context Menu",
  "slug": "context-menu",
  "summary": "Context Menu — component entity.",
  "status": "ready",
  "sourceFiles": [
    "context-menu.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Context Menu where its role in the pattern is clear.",
        "Follow the established component conventions when composing Context Menu."
      ],
      "donts": [
        "Don't repurpose Context Menu for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "context-menu",
        "context-menu-portal",
        "context-menu-trigger",
        "context-menu-content",
        "context-menu-group",
        "context-menu-label",
        "context-menu-item",
        "context-menu-sub",
        "context-menu-sub-trigger",
        "context-menu-sub-content",
        "context-menu-checkbox-item",
        "context-menu-radio-group",
        "context-menu-radio-item",
        "context-menu-separator",
        "context-menu-shortcut"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Context Menu for its intended component role."
      ],
      "dontUse": [
        "Don't use Context Menu outside its documented purpose."
      ]
    }
  ]
})
