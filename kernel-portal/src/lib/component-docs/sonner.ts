import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Sonner — auto-authored component doc entity; parity-verified against source. */
export const sonnerDoc: ComponentDoc = parseComponentDoc({
  "id": "sonner",
  "name": "Sonner",
  "slug": "sonner",
  "summary": "Sonner — component entity.",
  "status": "ready",
  "sourceFiles": [
    "sonner.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Sonner where its role in the pattern is clear.",
        "Follow the established component conventions when composing Sonner."
      ],
      "donts": [
        "Don't repurpose Sonner for a role another component serves better."
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Sonner for its intended component role."
      ],
      "dontUse": [
        "Don't use Sonner outside its documented purpose."
      ]
    }
  ]
})
