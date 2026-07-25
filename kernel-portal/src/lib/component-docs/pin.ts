import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Pin — auto-authored object doc entity; parity-verified against source. */
export const pinDoc: ComponentDoc = parseComponentDoc({
  "id": "pin",
  "name": "Pin",
  "slug": "pin",
  "summary": "Pin — object entity.",
  "status": "ready",
  "sourceFiles": [
    "marks/pin.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "object"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Pin where its role in the pattern is clear.",
        "Follow the established object conventions when composing Pin."
      ],
      "donts": [
        "Don't repurpose Pin for a role another component serves better."
      ]
    },
    {
      "kind": "variants",
      "groups": [
        {
          "axis": "variant",
          "keys": [
            "default",
            "muted",
            "destructive"
          ]
        },
        {
          "axis": "size",
          "keys": [
            "sm",
            "default"
          ]
        }
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "pin"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Pin for its intended object role."
      ],
      "dontUse": [
        "Don't use Pin outside its documented purpose."
      ]
    }
  ]
})
