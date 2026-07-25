import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Toggle — auto-authored component doc entity; parity-verified against source. */
export const toggleDoc: ComponentDoc = parseComponentDoc({
  "id": "toggle",
  "name": "Toggle",
  "slug": "toggle",
  "summary": "Toggle — component entity.",
  "status": "ready",
  "sourceFiles": [
    "toggle.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Toggle where its role in the pattern is clear.",
        "Follow the established component conventions when composing Toggle."
      ],
      "donts": [
        "Don't repurpose Toggle for a role another component serves better."
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
        "toggle"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Toggle for its intended component role."
      ],
      "dontUse": [
        "Don't use Toggle outside its documented purpose."
      ]
    }
  ]
})
