import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Badge — auto-authored component doc entity; parity-verified against source. */
export const badgeDoc: ComponentDoc = parseComponentDoc({
  "id": "badge",
  "name": "Badge",
  "slug": "badge",
  "summary": "Badge — component entity.",
  "status": "ready",
  "sourceFiles": [
    "badge.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Badge where its role in the pattern is clear.",
        "Follow the established component conventions when composing Badge."
      ],
      "donts": [
        "Don't repurpose Badge for a role another component serves better."
      ]
    },
    {
      "kind": "variants",
      "groups": [
        {
          "axis": "variant",
          "keys": [
            "default",
            "secondary",
            "destructive",
            "success",
            "warning",
            "info",
            "outline"
          ]
        }
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Badge for its intended component role."
      ],
      "dontUse": [
        "Don't use Badge outside its documented purpose."
      ]
    }
  ]
})
