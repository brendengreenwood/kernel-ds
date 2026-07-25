import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Border beam — auto-authored element doc entity; parity-verified against source. */
export const borderBeamDoc: ComponentDoc = parseComponentDoc({
  "id": "border-beam",
  "name": "Border beam",
  "slug": "border-beam",
  "summary": "Border beam — element entity.",
  "status": "ready",
  "sourceFiles": [
    "border-beam.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "element"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Border beam where its role in the pattern is clear.",
        "Follow the established element conventions when composing Border beam."
      ],
      "donts": [
        "Don't repurpose Border beam for a role another component serves better."
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Border beam for its intended element role."
      ],
      "dontUse": [
        "Don't use Border beam outside its documented purpose."
      ]
    }
  ]
})
