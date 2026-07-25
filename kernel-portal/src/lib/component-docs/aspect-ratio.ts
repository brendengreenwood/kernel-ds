import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Aspect Ratio — auto-authored component doc entity; parity-verified against source. */
export const aspectRatioDoc: ComponentDoc = parseComponentDoc({
  "id": "aspect-ratio",
  "name": "Aspect Ratio",
  "slug": "aspect-ratio",
  "summary": "Aspect Ratio — component entity.",
  "status": "ready",
  "sourceFiles": [
    "aspect-ratio.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Aspect Ratio where its role in the pattern is clear.",
        "Follow the established component conventions when composing Aspect Ratio."
      ],
      "donts": [
        "Don't repurpose Aspect Ratio for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "aspect-ratio"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Aspect Ratio for its intended component role."
      ],
      "dontUse": [
        "Don't use Aspect Ratio outside its documented purpose."
      ]
    }
  ]
})
