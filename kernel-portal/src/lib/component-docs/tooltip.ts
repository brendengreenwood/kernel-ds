import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Tooltip — component doc entity; parity-verified against source. */
export const tooltipDoc: ComponentDoc = parseComponentDoc({
  id: "tooltip",
  name: "Tooltip",
  slug: "tooltip",
  summary:
    "A brief text hint that appears on hover or focus to name or clarify a control — most often the label for an icon-only button. It's read-only and supplementary: the interface must still make sense with the tooltip closed, because touch users may never trigger it.",
  status: "ready",
  sourceFiles: ["tooltip.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Tooltip to name icon-only buttons and to add a short clarifying phrase to a terse control.",
        "Keep it to a few words of plain text, and make sure it shows on keyboard focus, not just mouse hover.",
        "Treat it as an enhancement — still set an `aria-label` on the control so the name survives when the tooltip doesn't fire.",
      ],
      donts: [
        "Don't put essential information only in a Tooltip; touch users and many assistive setups won't see it.",
        "Don't place interactive content — links, buttons, inputs — inside a Tooltip; use a Popover for anything clickable.",
        "Don't wrap disabled controls without care; a `disabled` element emits no hover events, so make the trigger focusable.",
      ],
    },
    { kind: "anatomy", slots: ["tooltip-provider", "tooltip", "tooltip-trigger", "tooltip-content"] },
    {
      kind: "useCases",
      use: [
        "Labeling icon-only toolbar and table-row buttons.",
        "A short clarification on a truncated value or an unfamiliar term.",
        "Explaining why a control is unavailable (paired with an accessible, focusable trigger).",
      ],
      dontUse: [
        "Content the user must read to succeed — put it inline or in a description.",
        "Anything interactive — use a Popover.",
        "Long explanations — use a HoverCard or inline help.",
      ],
    },
  ],
})
