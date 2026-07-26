import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Checkbox — component doc entity; parity-verified against source. */
export const checkboxDoc: ComponentDoc = parseComponentDoc({
  id: "checkbox",
  name: "Checkbox",
  slug: "checkbox",
  summary:
    "A single toggle for an independent yes/no choice — accept the terms, include weekends, flag as urgent. Use several together when the options aren't mutually exclusive; for one-of-many, use RadioGroup, and for an instant on/off setting, use Switch.",
  status: "ready",
  sourceFiles: ["checkbox.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Give every Checkbox a clickable Label so the whole row is a target, not just the 16px box.",
        "Use the indeterminate state for a parent that governs a partially-checked group of children — \"select all\" when only some rows are ticked.",
        "Word the label as the positive outcome (\"Send me settlement alerts\") so a checked box reads as a clear yes.",
      ],
      donts: [
        "Don't use a Checkbox for a setting that should take effect immediately on click — that's a Switch.",
        "Don't offer mutually exclusive choices as checkboxes; use a RadioGroup so only one can win.",
        "Don't phrase the label as a negative (\"Don't notify me\") — a checked negative is a double-negative trap.",
      ],
    },
    { kind: "anatomy", slots: ["checkbox", "checkbox-indicator"] },
    {
      kind: "useCases",
      use: [
        "A terms-acceptance gate before submitting a contract.",
        "Selecting rows in a table for a bulk action, with an indeterminate header checkbox.",
        "A set of independent options — notification channels, included document types.",
      ],
      dontUse: [
        "One-of-several selection — use RadioGroup.",
        "An immediate setting toggle — use Switch.",
      ],
    },
  ],
})
