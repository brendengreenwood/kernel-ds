import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Calendar — auto-authored component doc entity; parity-verified against source. */
export const calendarDoc: ComponentDoc = parseComponentDoc({
  "id": "calendar",
  "name": "Calendar",
  "slug": "calendar",
  "summary": "Calendar — component entity.",
  "status": "ready",
  "sourceFiles": [
    "calendar.tsx"
  ],
  "metadata": {
    "owner": "ds",
    "kind": "component"
  },
  "docs": [
    {
      "kind": "guidelines",
      "dos": [
        "Use Calendar where its role in the pattern is clear.",
        "Follow the established component conventions when composing Calendar."
      ],
      "donts": [
        "Don't repurpose Calendar for a role another component serves better."
      ]
    },
    {
      "kind": "anatomy",
      "slots": [
        "calendar"
      ]
    },
    {
      "kind": "useCases",
      "use": [
        "Use Calendar for its intended component role."
      ],
      "dontUse": [
        "Don't use Calendar outside its documented purpose."
      ]
    }
  ]
})
