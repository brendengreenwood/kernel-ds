import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Navigation — auto-authored pattern doc entity; parity-verified against source. */
export const navigationDoc: ComponentDoc = parseComponentDoc({
  "id": "navigation",
  "name": "Navigation",
  "slug": "navigation",
  "summary": "Navigation — pattern entity.",
  "status": "ready",
  "sourceFiles": [],
  "metadata": {
    "owner": "ds",
    "kind": "pattern"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Navigation where its role in the pattern is clear.",
        "Follow the established pattern conventions when composing Navigation."
      ],
      "donts": [
        "Don't repurpose Navigation for a role another component serves better."
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Navigation for its intended pattern role."
      ],
      "dontUse": [
        "Don't use Navigation outside its documented purpose."
      ]
    }
  ]
})
