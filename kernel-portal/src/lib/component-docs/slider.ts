import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Slider — auto-authored component doc entity; parity-verified against source. */
export const sliderDoc: ComponentDoc = parseComponentDoc({
  "id": "slider",
  "name": "Slider",
  "slug": "slider",
  "summary": "Slider — component entity.",
  "status": "ready",
  "sourceFiles": [
    "slider.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Slider where its role in the pattern is clear.",
        "Follow the established component conventions when composing Slider."
      ],
      "donts": [
        "Don't repurpose Slider for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "slider",
        "slider-track",
        "slider-range",
        "slider-thumb"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Slider for its intended component role."
      ],
      "dontUse": [
        "Don't use Slider outside its documented purpose."
      ]
    }
  ]
})
