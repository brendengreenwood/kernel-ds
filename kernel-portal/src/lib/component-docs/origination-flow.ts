import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Origination flow — auto-authored pattern doc entity; parity-verified against source. */
export const originationFlowDoc: ComponentDoc = parseComponentDoc({
  "id": "origination-flow",
  "name": "Origination flow",
  "slug": "origination-flow",
  "summary": "Origination flow — pattern entity.",
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
        "Use Origination flow where its role in the pattern is clear.",
        "Follow the established pattern conventions when composing Origination flow."
      ],
      "donts": [
        "Don't repurpose Origination flow for a role another component serves better."
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Origination flow for its intended pattern role."
      ],
      "dontUse": [
        "Don't use Origination flow outside its documented purpose."
      ]
    }
  ]
})
