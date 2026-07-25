import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Breadcrumb — auto-authored component doc entity; parity-verified against source. */
export const breadcrumbDoc: ComponentDoc = parseComponentDoc({
  "id": "breadcrumb",
  "name": "Breadcrumb",
  "slug": "breadcrumb",
  "summary": "Breadcrumb — component entity.",
  "status": "ready",
  "sourceFiles": [
    "breadcrumb.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Breadcrumb where its role in the pattern is clear.",
        "Follow the established component conventions when composing Breadcrumb."
      ],
      "donts": [
        "Don't repurpose Breadcrumb for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "breadcrumb",
        "breadcrumb-list",
        "breadcrumb-item",
        "breadcrumb-page",
        "breadcrumb-separator",
        "breadcrumb-ellipsis"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Breadcrumb for its intended component role."
      ],
      "dontUse": [
        "Don't use Breadcrumb outside its documented purpose."
      ]
    }
  ]
})
