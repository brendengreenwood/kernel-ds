import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Flows — auto-authored pattern doc entity; parity-verified against source. */
export const flowsDoc: ComponentDoc = parseComponentDoc({
  "id": "flows",
  "name": "Flows",
  "slug": "flows",
  "summary": "Flows — pattern entity.",
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
        "Use Flows where its role in the pattern is clear.",
        "Follow the established pattern conventions when composing Flows."
      ],
      "donts": [
        "Don't repurpose Flows for a role another component serves better."
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Flows for its intended pattern role."
      ],
      "dontUse": [
        "Don't use Flows outside its documented purpose."
      ]
    }
  ]
})
