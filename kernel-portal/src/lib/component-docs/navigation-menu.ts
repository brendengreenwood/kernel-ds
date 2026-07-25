import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Navigation Menu — auto-authored component doc entity; parity-verified against source. */
export const navigationMenuDoc: ComponentDoc = parseComponentDoc({
  "id": "navigation-menu",
  "name": "Navigation Menu",
  "slug": "navigation-menu",
  "summary": "Navigation Menu — component entity.",
  "status": "ready",
  "sourceFiles": [
    "navigation-menu.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Navigation Menu where its role in the pattern is clear.",
        "Follow the established component conventions when composing Navigation Menu."
      ],
      "donts": [
        "Don't repurpose Navigation Menu for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "navigation-menu",
        "navigation-menu-list",
        "navigation-menu-item",
        "navigation-menu-trigger",
        "navigation-menu-content",
        "navigation-menu-link",
        "navigation-menu-indicator"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Navigation Menu for its intended component role."
      ],
      "dontUse": [
        "Don't use Navigation Menu outside its documented purpose."
      ]
    }
  ]
})
