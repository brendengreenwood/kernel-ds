import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Animated Number — element doc entity; parity-verified against source. */
export const animatedNumberDoc: ComponentDoc = parseComponentDoc({
  id: "animated-number",
  name: "Animated Number",
  slug: "animated-number",
  summary:
    "A number that smoothly counts from its old value to its new one when the data changes, drawing the eye to a figure that just moved — a live total, an updated KPI. Use it where the change is meaningful; on a static value or a fast-updating stream, the animation is just noise.",
  status: "ready",
  sourceFiles: ["animated-number.tsx"],
  metadata: { owner: "ds", kind: "element" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use it for a headline figure whose change you want the user to notice — a dashboard KPI, a running total.",
        "Keep the transition short and eased so it reads as a smooth update, not a slot machine.",
        "Preserve the number's format (currency, separators, precision) at every frame so it stays readable mid-animation.",
      ],
      donts: [
        "Don't animate values that update many times a second — the counter never settles and becomes noise.",
        "Don't use it for static numbers that never change; there's nothing to animate.",
        "Don't let the animation delay the user's read of a critical figure — keep it brief.",
      ],
    },
    {
      kind: "useCases",
      use: [
        "A dashboard KPI that updates as data refreshes.",
        "A running total that recalculates after an edit.",
        "A headline metric where a visible change reinforces that it moved.",
      ],
      dontUse: [
        "A static value that never changes.",
        "A rapidly streaming figure — show it plainly.",
        "Dense table cells where per-cell animation would distract.",
      ],
    },
  ],
})
