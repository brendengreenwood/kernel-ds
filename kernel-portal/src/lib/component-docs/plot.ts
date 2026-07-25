import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Plot — auto-authored object doc entity; parity-verified against source. */
export const plotDoc: ComponentDoc = parseComponentDoc({
  "id": "plot",
  "name": "Plot",
  "slug": "plot",
  "summary": "Plot — object entity.",
  "status": "ready",
  "sourceFiles": [
    "marks/plot.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "object"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Plot where its role in the pattern is clear.",
        "Follow the established object conventions when composing Plot."
      ],
      "donts": [
        "Don't repurpose Plot for a role another component serves better."
      ]
    },
    {
      "kind": "variants",
      "groups": [
        {
          "axis": "shape",
          "keys": [
            "dot",
            "square",
            "triangle",
            "diamond"
          ]
        },
        {
          "axis": "size",
          "keys": [
            "sm",
            "default",
            "lg"
          ]
        }
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "plot"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Plot for its intended object role."
      ],
      "dontUse": [
        "Don't use Plot outside its documented purpose."
      ]
    }
  ]
})
