import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Alert — auto-authored component doc entity; parity-verified against source. */
export const alertDoc: ComponentDoc = parseComponentDoc({
  "id": "alert",
  "name": "Alert",
  "slug": "alert",
  "summary": "Alert — component entity.",
  "status": "ready",
  "sourceFiles": [
    "alert.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Alert where its role in the pattern is clear.",
        "Follow the established component conventions when composing Alert."
      ],
      "donts": [
        "Don't repurpose Alert for a role another component serves better."
      ]
    },
    {
      "kind": "variants",
      "groups": [
        {
          "axis": "variant",
          "keys": [
            "default",
            "destructive",
            "success",
            "warning",
            "info"
          ]
        }
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "alert",
        "alert-title",
        "alert-description"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Alert for its intended component role."
      ],
      "dontUse": [
        "Don't use Alert outside its documented purpose."
      ]
    }
  ]
})
