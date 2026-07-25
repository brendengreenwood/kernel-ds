import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Switch — auto-authored component doc entity; parity-verified against source. */
export const switchDoc: ComponentDoc = parseComponentDoc({
  "id": "switch",
  "name": "Switch",
  "slug": "switch",
  "summary": "Switch — component entity.",
  "status": "ready",
  "sourceFiles": [
    "switch.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Switch where its role in the pattern is clear.",
        "Follow the established component conventions when composing Switch."
      ],
      "donts": [
        "Don't repurpose Switch for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "switch",
        "switch-thumb"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Switch for its intended component role."
      ],
      "dontUse": [
        "Don't use Switch outside its documented purpose."
      ]
    }
  ]
})
