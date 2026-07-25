import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Dashboard — auto-authored pattern doc entity; parity-verified against source. */
export const dashboardDoc: ComponentDoc = parseComponentDoc({
  "id": "dashboard",
  "name": "Dashboard",
  "slug": "dashboard",
  "summary": "Dashboard — pattern entity.",
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
        "Use Dashboard where its role in the pattern is clear.",
        "Follow the established pattern conventions when composing Dashboard."
      ],
      "donts": [
        "Don't repurpose Dashboard for a role another component serves better."
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Dashboard for its intended pattern role."
      ],
      "dontUse": [
        "Don't use Dashboard outside its documented purpose."
      ]
    }
  ]
})
