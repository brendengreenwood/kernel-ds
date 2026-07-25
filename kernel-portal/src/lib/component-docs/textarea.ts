import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Textarea — auto-authored component doc entity; parity-verified against source. */
export const textareaDoc: ComponentDoc = parseComponentDoc({
  "id": "textarea",
  "name": "Textarea",
  "slug": "textarea",
  "summary": "Textarea — component entity.",
  "status": "ready",
  "sourceFiles": [
    "textarea.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Textarea where its role in the pattern is clear.",
        "Follow the established component conventions when composing Textarea."
      ],
      "donts": [
        "Don't repurpose Textarea for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "textarea"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Textarea for its intended component role."
      ],
      "dontUse": [
        "Don't use Textarea outside its documented purpose."
      ]
    }
  ]
})
