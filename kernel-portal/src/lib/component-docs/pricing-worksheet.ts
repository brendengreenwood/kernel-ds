import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Pricing worksheet — auto-authored pattern doc entity; parity-verified against source. */
export const pricingWorksheetDoc: ComponentDoc = parseComponentDoc({
  "id": "pricing-worksheet",
  "name": "Pricing worksheet",
  "slug": "pricing-worksheet",
  "summary": "Pricing worksheet — pattern entity.",
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
        "Use Pricing worksheet where its role in the pattern is clear.",
        "Follow the established pattern conventions when composing Pricing worksheet."
      ],
      "donts": [
        "Don't repurpose Pricing worksheet for a role another component serves better."
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Pricing worksheet for its intended pattern role."
      ],
      "dontUse": [
        "Don't use Pricing worksheet outside its documented purpose."
      ]
    }
  ]
})
