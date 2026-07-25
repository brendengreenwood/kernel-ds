import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Charts — auto-authored element doc entity; parity-verified against source. */
export const chartsDoc: ComponentDoc = parseComponentDoc({
  "id": "charts",
  "name": "Charts",
  "slug": "charts",
  "summary": "Charts — element entity.",
  "status": "ready",
  "sourceFiles": [
    "chart.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "element"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Charts where its role in the pattern is clear.",
        "Follow the established element conventions when composing Charts."
      ],
      "donts": [
        "Don't repurpose Charts for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "chart"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Charts for its intended element role."
      ],
      "dontUse": [
        "Don't use Charts outside its documented purpose."
      ]
    }
  ]
})
