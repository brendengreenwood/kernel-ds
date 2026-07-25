import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Menubar — auto-authored component doc entity; parity-verified against source. */
export const menubarDoc: ComponentDoc = parseComponentDoc({
  "id": "menubar",
  "name": "Menubar",
  "slug": "menubar",
  "summary": "Menubar — component entity.",
  "status": "ready",
  "sourceFiles": [
    "menubar.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Menubar where its role in the pattern is clear.",
        "Follow the established component conventions when composing Menubar."
      ],
      "donts": [
        "Don't repurpose Menubar for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "menubar",
        "menubar-menu",
        "menubar-group",
        "menubar-portal",
        "menubar-trigger",
        "menubar-content",
        "menubar-item",
        "menubar-checkbox-item",
        "menubar-radio-group",
        "menubar-radio-item",
        "menubar-label",
        "menubar-separator",
        "menubar-shortcut",
        "menubar-sub",
        "menubar-sub-trigger",
        "menubar-sub-content"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Menubar for its intended component role."
      ],
      "dontUse": [
        "Don't use Menubar outside its documented purpose."
      ]
    }
  ]
})
