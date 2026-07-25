import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Chart — auto-authored component doc entity; parity-verified against source. */
export const chartDoc: ComponentDoc = parseComponentDoc({
  "id": "chart",
  "name": "Chart",
  "slug": "chart",
  "summary": "Chart — component entity.",
  "status": "ready",
  "sourceFiles": [
    "chart.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Chart where its role in the pattern is clear.",
        "Follow the established component conventions when composing Chart."
      ],
      "donts": [
        "Don't repurpose Chart for a role another component serves better."
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
        "Use Chart for its intended component role."
      ],
      "dontUse": [
        "Don't use Chart outside its documented purpose."
      ]
    }
  ]
})
