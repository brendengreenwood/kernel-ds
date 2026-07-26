import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Border Beam — element doc entity; parity-verified against source. */
export const borderBeamDoc: ComponentDoc = parseComponentDoc({
  id: "border-beam",
  name: "Border Beam",
  slug: "border-beam",
  summary:
    "An animated gradient that travels around an element's border to draw attention or signal activity — a card that's processing, a new item worth a glance. It's a deliberate accent; used sparingly it guides the eye, used everywhere it turns the UI into a light show.",
  status: "ready",
  sourceFiles: ["border-beam.tsx"],
  metadata: { owner: "ds", kind: "element" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Border Beam to spotlight one element that's active or newly important — a card mid-process, a highlighted CTA.",
        "Reserve it for a single focal point at a time so the motion actually directs attention.",
        "Keep the beam subtle enough to accent the border, not overpower the content inside.",
      ],
      donts: [
        "Don't apply it to many elements at once — competing beams cancel out and just distract.",
        "Don't use it as a permanent decoration; constant motion is fatiguing and loses meaning.",
        "Don't rely on it to convey required information — it's an accent, not a status.",
      ],
    },
    {
      kind: "useCases",
      use: [
        "Highlighting a card while a background job runs on it.",
        "Drawing the eye to a newly added or recommended item.",
        "Accenting a single primary surface during onboarding.",
      ],
      dontUse: [
        "Conveying status — use a StatusBadge or Alert.",
        "Decorating many elements at once.",
        "Persistent, always-on emphasis.",
      ],
    },
  ],
})
