import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Animated number — auto-authored element doc entity; parity-verified against source. */
export const animatedNumberDoc: ComponentDoc = parseComponentDoc({
  "id": "animated-number",
  "name": "Animated number",
  "slug": "animated-number",
  "summary": "Animated number — element entity.",
  "status": "ready",
  "sourceFiles": [
    "animated-number.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "element"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Animated number where its role in the pattern is clear.",
        "Follow the established element conventions when composing Animated number."
      ],
      "donts": [
        "Don't repurpose Animated number for a role another component serves better."
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Animated number for its intended element role."
      ],
      "dontUse": [
        "Don't use Animated number outside its documented purpose."
      ]
    }
  ]
})
