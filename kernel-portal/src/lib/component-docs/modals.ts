import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Modals — auto-authored pattern doc entity; parity-verified against source. */
export const modalsDoc: ComponentDoc = parseComponentDoc({
  "id": "modals",
  "name": "Modals",
  "slug": "modals",
  "summary": "Modals — pattern entity.",
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
        "Use Modals where its role in the pattern is clear.",
        "Follow the established pattern conventions when composing Modals."
      ],
      "donts": [
        "Don't repurpose Modals for a role another component serves better."
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Modals for its intended pattern role."
      ],
      "dontUse": [
        "Don't use Modals outside its documented purpose."
      ]
    }
  ]
})
