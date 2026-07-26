import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Slider — component doc entity; parity-verified against source. */
export const sliderDoc: ComponentDoc = parseComponentDoc({
  id: "slider",
  name: "Slider",
  slug: "slider",
  summary:
    "A draggable control for picking a value within a range where the exact number matters less than the relative position — a tolerance band, a price range, a confidence threshold. When the user needs to enter a precise figure, an Input is faster and less fiddly.",
  status: "ready",
  sourceFiles: ["slider.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Slider when approximate, tactile adjustment beats precise entry — filtering by a range, dialing a threshold.",
        "Show the current value as the user drags (a tooltip or a live number) so the choice isn't guesswork.",
        "Set a sensible `step`, `min`, and `max`, and use two thumbs for a range filter (low and high bounds).",
      ],
      donts: [
        "Don't use a Slider when the exact value is important and hard to hit by drag — pair it with a number Input or use the Input alone.",
        "Don't hide the selected value; a thumb with no readout leaves the user unsure what they picked.",
        "Don't use tiny steps across a wide range where landing on a specific value is nearly impossible.",
      ],
    },
    { kind: "anatomy", slots: ["slider", "slider-track", "slider-range", "slider-thumb"] },
    {
      kind: "useCases",
      use: [
        "A price or quantity range filter with two thumbs.",
        "Adjusting a threshold where feel matters more than the exact number — a match confidence, a tolerance.",
        "A zoom or scale control with immediate visual feedback.",
      ],
      dontUse: [
        "Entering a precise figure — use a number Input.",
        "A choice among a few discrete options — use RadioGroup or ToggleGroup.",
      ],
    },
  ],
})
