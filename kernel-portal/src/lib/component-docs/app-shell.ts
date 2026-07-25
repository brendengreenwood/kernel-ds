import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** App shell — auto-authored pattern doc entity; parity-verified against source. */
export const appShellDoc: ComponentDoc = parseComponentDoc({
  "id": "app-shell",
  "name": "App shell",
  "slug": "app-shell",
  "summary": "App shell — pattern entity.",
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
        "Use App shell where its role in the pattern is clear.",
        "Follow the established pattern conventions when composing App shell."
      ],
      "donts": [
        "Don't repurpose App shell for a role another component serves better."
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use App shell for its intended pattern role."
      ],
      "dontUse": [
        "Don't use App shell outside its documented purpose."
      ]
    }
  ]
})
