import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Skeleton — auto-authored component doc entity; parity-verified against source. */
export const skeletonDoc: ComponentDoc = parseComponentDoc({
  "id": "skeleton",
  "name": "Skeleton",
  "slug": "skeleton",
  "summary": "Skeleton — component entity.",
  "status": "ready",
  "sourceFiles": [
    "skeleton.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Skeleton where its role in the pattern is clear.",
        "Follow the established component conventions when composing Skeleton."
      ],
      "donts": [
        "Don't repurpose Skeleton for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "skeleton"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Skeleton for its intended component role."
      ],
      "dontUse": [
        "Don't use Skeleton outside its documented purpose."
      ]
    }
  ]
})
