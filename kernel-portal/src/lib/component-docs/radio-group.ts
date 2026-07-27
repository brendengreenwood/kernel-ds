import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Radio Group — component doc entity; parity-verified against source. */
export const radioGroupDoc: ComponentDoc = parseComponentDoc({
  id: "radio-group",
  name: "Radio Group",
  slug: "radio-group",
  summary:
    "A set of options where exactly one can be chosen and all of them are worth showing at once — a settlement method, a delivery term, a priority level. When the list is long or space is tight, a Select does the same job in less room.",
  status: "ready",
  sourceFiles: ["radio-group.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Reach for a Radio Group when there are two to five mutually exclusive options and seeing them all helps the user decide.",
        "Pre-select the safest or most common option so the field is never left empty by accident.",
        "Give each item a Label and keep the options in a stable, logical order (by frequency, size, or sequence).",
      ],
      donts: [
        "Don't use radios when more than one option can apply — that's a set of Checkboxes.",
        "Don't spill a long list of radios down the page; past a handful, switch to a Select.",
        "Don't leave the group with no default and no clear \"none\" option if a choice is required.",
      ],
    },
    { kind: "anatomy", slots: ["radio-group", "radio-group-item", "radio-group-indicator"] },
    {
      kind: "useCases",
      use: [
        "Choosing one settlement or delivery term from a short, fixed set.",
        "A priority or status pick where showing every option aids the decision.",
        "Any single-select where the choices are few and mutually exclusive.",
      ],
      dontUse: [
        "Multi-select — use Checkboxes.",
        "A long or space-constrained list — use a Select.",
      ],
    },
  ],
})
