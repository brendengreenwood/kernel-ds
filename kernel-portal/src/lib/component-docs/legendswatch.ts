import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** LegendSwatch — auto-authored object doc entity; parity-verified against source. */
export const legendswatchDoc: ComponentDoc = parseComponentDoc({
  "id": "legendswatch",
  "name": "LegendSwatch",
  "slug": "legendswatch",
  "summary": "LegendSwatch — object entity.",
  "status": "ready",
  "sourceFiles": [
    "marks/legend-swatch.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "object"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use LegendSwatch where its role in the pattern is clear.",
        "Follow the established object conventions when composing LegendSwatch."
      ],
      "donts": [
        "Don't repurpose LegendSwatch for a role another component serves better."
      ]
    },
    {
      "kind": "variants",
      "groups": [
        {
          "axis": "shape",
          "keys": [
            "square",
            "circle",
            "line"
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
        "legend-swatch"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use LegendSwatch for its intended object role."
      ],
      "dontUse": [
        "Don't use LegendSwatch outside its documented purpose."
      ]
    }
  ]
})
