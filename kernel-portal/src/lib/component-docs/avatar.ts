import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Avatar — auto-authored component doc entity; parity-verified against source. */
export const avatarDoc: ComponentDoc = parseComponentDoc({
  "id": "avatar",
  "name": "Avatar",
  "slug": "avatar",
  "summary": "Avatar — component entity.",
  "status": "ready",
  "sourceFiles": [
    "avatar.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Avatar where its role in the pattern is clear.",
        "Follow the established component conventions when composing Avatar."
      ],
      "donts": [
        "Don't repurpose Avatar for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "avatar",
        "avatar-image",
        "avatar-fallback",
        "avatar-badge",
        "avatar-group",
        "avatar-group-count"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Avatar for its intended component role."
      ],
      "dontUse": [
        "Don't use Avatar outside its documented purpose."
      ]
    }
  ]
})
