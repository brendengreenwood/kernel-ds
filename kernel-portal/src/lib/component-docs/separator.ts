import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Separator — auto-authored component doc entity; parity-verified against source. */
export const separatorDoc: ComponentDoc = parseComponentDoc({
  "id": "separator",
  "name": "Separator",
  "slug": "separator",
  "summary": "Separator — component entity.",
  "status": "ready",
  "sourceFiles": [
    "separator.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Separator where its role in the pattern is clear.",
        "Follow the established component conventions when composing Separator."
      ],
      "donts": [
        "Don't repurpose Separator for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "separator"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Separator for its intended component role."
      ],
      "dontUse": [
        "Don't use Separator outside its documented purpose."
      ]
    }
  ]
})
