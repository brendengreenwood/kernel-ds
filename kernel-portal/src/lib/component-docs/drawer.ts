import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Drawer — auto-authored component doc entity; parity-verified against source. */
export const drawerDoc: ComponentDoc = parseComponentDoc({
  "id": "drawer",
  "name": "Drawer",
  "slug": "drawer",
  "summary": "Drawer — component entity.",
  "status": "ready",
  "sourceFiles": [
    "drawer.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Drawer where its role in the pattern is clear.",
        "Follow the established component conventions when composing Drawer."
      ],
      "donts": [
        "Don't repurpose Drawer for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "drawer",
        "drawer-trigger",
        "drawer-portal",
        "drawer-close",
        "drawer-overlay",
        "drawer-content",
        "drawer-header",
        "drawer-footer",
        "drawer-title",
        "drawer-description"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Drawer for its intended component role."
      ],
      "dontUse": [
        "Don't use Drawer outside its documented purpose."
      ]
    }
  ]
})
