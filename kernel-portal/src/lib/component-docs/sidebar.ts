import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Sidebar — auto-authored component doc entity; parity-verified against source. */
export const sidebarDoc: ComponentDoc = parseComponentDoc({
  "id": "sidebar",
  "name": "Sidebar",
  "slug": "sidebar",
  "summary": "Sidebar — component entity.",
  "status": "ready",
  "sourceFiles": [
    "sidebar.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Sidebar where its role in the pattern is clear.",
        "Follow the established component conventions when composing Sidebar."
      ],
      "donts": [
        "Don't repurpose Sidebar for a role another component serves better."
      ]
    },
    {
      "kind": "variants",
      "groups": [
        {
          "axis": "variant",
          "keys": [
            "default",
            "outline"
          ]
        },
        {
          "axis": "size",
          "keys": [
            "default",
            "sm",
            "lg"
          ]
        }
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "sidebar-wrapper",
        "sidebar",
        "sidebar-gap",
        "sidebar-container",
        "sidebar-inner",
        "sidebar-trigger",
        "sidebar-rail",
        "sidebar-inset",
        "sidebar-input",
        "sidebar-header",
        "sidebar-footer",
        "sidebar-separator",
        "sidebar-content",
        "sidebar-group",
        "sidebar-group-content",
        "sidebar-menu",
        "sidebar-menu-item",
        "sidebar-menu-badge",
        "sidebar-menu-skeleton",
        "sidebar-menu-sub",
        "sidebar-menu-sub-item"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Sidebar for its intended component role."
      ],
      "dontUse": [
        "Don't use Sidebar outside its documented purpose."
      ]
    }
  ]
})
