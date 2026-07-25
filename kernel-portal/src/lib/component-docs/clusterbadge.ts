import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** ClusterBadge — auto-authored object doc entity; parity-verified against source. */
export const clusterbadgeDoc: ComponentDoc = parseComponentDoc({
  "id": "clusterbadge",
  "name": "ClusterBadge",
  "slug": "clusterbadge",
  "summary": "ClusterBadge — object entity.",
  "status": "ready",
  "sourceFiles": [
    "marks/cluster-badge.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "object"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use ClusterBadge where its role in the pattern is clear.",
        "Follow the established object conventions when composing ClusterBadge."
      ],
      "donts": [
        "Don't repurpose ClusterBadge for a role another component serves better."
      ]
    },
    {
      "kind": "variants",
      "groups": [
        {
          "axis": "variant",
          "keys": [
            "default",
            "muted"
          ]
        },
        {
          "axis": "size",
          "keys": [
            "sm",
            "default"
          ]
        }
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "cluster-badge"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use ClusterBadge for its intended object role."
      ],
      "dontUse": [
        "Don't use ClusterBadge outside its documented purpose."
      ]
    }
  ]
})
