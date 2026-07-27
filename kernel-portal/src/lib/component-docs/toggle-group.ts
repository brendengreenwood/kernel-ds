import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Toggle Group — component doc entity; parity-verified against source. */
export const toggleGroupDoc: ComponentDoc = parseComponentDoc({
  id: "toggle-group",
  name: "Toggle Group",
  slug: "toggle-group",
  summary:
    "A set of connected toggles that behave as one control — single-select for a segmented choice (list/grid view), or multi-select for a bundle of options (which text styles are on). Use it when the options are few and worth showing at once. For more options or a form value, a Select fits better.",
  status: "ready",
  sourceFiles: ["toggle-group.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use single-select mode for a mutually exclusive segmented choice — view mode, time range, alignment.",
        "Use multi-select mode for a small bundle of independent options where seeing them all helps.",
        "Keep the options few (two to five) and label each clearly; pair icon-only items with tooltips.",
      ],
      donts: [
        "Don't use a Toggle Group for a long list of choices — that's a Select or a menu.",
        "Don't mix it up with tabs; a Toggle Group sets a value, tabs switch content panels.",
        "Don't leave a required single-select group with nothing selected and no default.",
      ],
    },
    { kind: "anatomy", slots: ["toggle-group", "toggle-group-item"] },
    {
      kind: "useCases",
      use: [
        "A segmented control switching between list and grid view.",
        "A time-range or granularity picker (Day / Week / Month).",
        "A multi-select cluster of formatting or filter options.",
      ],
      dontUse: [
        "Many options or a form field value — use a Select.",
        "Switching content panels — use Tabs.",
        "A single on/off setting — use a Switch or a lone Toggle.",
      ],
    },
  ],
})
