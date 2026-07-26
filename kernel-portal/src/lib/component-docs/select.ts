import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Select — component doc entity; parity-verified against source. */
export const selectDoc: ComponentDoc = parseComponentDoc({
  id: "select",
  name: "Select",
  slug: "select",
  summary:
    "A compact dropdown for choosing one value from a list that's too long or too incidental to show inline. It trades the at-a-glance visibility of a RadioGroup for space. When users need to type to find an option among many, reach for a Combobox instead.",
  status: "ready",
  sourceFiles: ["select.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Select when there are more than a handful of mutually exclusive options and the choices don't need to be visible until asked for.",
        "Group related items under `SelectLabel` and order them predictably (alphabetical, or by frequency) so the target is easy to find.",
        "Give the trigger a Label and a meaningful placeholder that names the choice (\"Select a counterparty\"), not just \"Choose…\".",
      ],
      donts: [
        "Don't use a Select for two or three options that all fit on screen — a RadioGroup shows them without a click.",
        "Don't stuff dozens of ungrouped items into one flat list; add search with a Combobox once scanning gets hard.",
        "Don't hide required context behind the closed trigger — if the choice drives the rest of the form, make its effect obvious.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "select-group",
        "select-value",
        "select-trigger",
        "select-content",
        "select-label",
        "select-item",
        "select-separator",
        "select-scroll-up-button",
        "select-scroll-down-button",
      ],
    },
    {
      kind: "useCases",
      use: [
        "Picking one value from a medium-length list — a country, a currency, a warehouse.",
        "A form field where the options are known but not worth the vertical space of radios.",
        "Grouped choices where `SelectLabel` sections keep a longer list scannable.",
      ],
      dontUse: [
        "A few always-visible options — use RadioGroup.",
        "A large list users must search — use Combobox.",
        "Multi-select — use a Combobox or a set of Checkboxes.",
      ],
    },
  ],
})
