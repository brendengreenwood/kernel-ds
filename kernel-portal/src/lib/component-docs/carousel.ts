import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Carousel — auto-authored component doc entity; parity-verified against source. */
export const carouselDoc: ComponentDoc = parseComponentDoc({
  "id": "carousel",
  "name": "Carousel",
  "slug": "carousel",
  "summary": "Carousel — component entity.",
  "status": "ready",
  "sourceFiles": [
    "carousel.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Carousel where its role in the pattern is clear.",
        "Follow the established component conventions when composing Carousel."
      ],
      "donts": [
        "Don't repurpose Carousel for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "carousel",
        "carousel-content",
        "carousel-item",
        "carousel-previous",
        "carousel-next"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Carousel for its intended component role."
      ],
      "dontUse": [
        "Don't use Carousel outside its documented purpose."
      ]
    }
  ]
})
