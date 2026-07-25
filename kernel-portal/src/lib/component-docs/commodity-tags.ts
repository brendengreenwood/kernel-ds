import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Commodity tags — auto-authored element doc entity; parity-verified against source. */
export const commodityTagsDoc: ComponentDoc = parseComponentDoc({
  "id": "commodity-tags",
  "name": "Commodity tags",
  "slug": "commodity-tags",
  "summary": "Commodity tags — element entity.",
  "status": "ready",
  "sourceFiles": [
    "commodity-badge.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "element"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Commodity tags where its role in the pattern is clear.",
        "Follow the established element conventions when composing Commodity tags."
      ],
      "donts": [
        "Don't repurpose Commodity tags for a role another component serves better."
      ]
    },
    {
      "kind": "variants",
      "groups": [
        {
          "axis": "commodity",
          "keys": [
            "corn",
            "canola",
            "soybeans",
            "wheat"
          ]
        }
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "commodity-badge",
        "commodity-label"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Commodity tags for its intended element role."
      ],
      "dontUse": [
        "Don't use Commodity tags outside its documented purpose."
      ]
    }
  ]
})
