import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Label — component doc entity; parity-verified against source. */
export const labelDoc: ComponentDoc = parseComponentDoc({
  id: "label",
  name: "Label",
  slug: "label",
  summary:
    "Names a form control and ties itself to it, so clicking the text focuses the field and screen readers announce the two together. Every input, checkbox, and select needs one — a placeholder or a nearby heading is not a substitute.",
  status: "ready",
  sourceFiles: ["label.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Associate every control with a Label via `htmlFor`/`id` (or by nesting the control inside it) so the click target and the accessible name are wired together.",
        "Write labels as short noun phrases in sentence case — \"Delivery date\", \"Counterparty\" — not full sentences or questions.",
        "Mark required fields consistently (an asterisk or a \"(required)\" suffix) and explain the convention once near the form.",
      ],
      donts: [
        "Don't drop the Label and lean on a placeholder — placeholder text vanishes on input and is invisible to many assistive tools.",
        "Don't pack help text or validation rules into the Label; put those in a description or message beneath the field.",
      ],
    },
    { kind: "anatomy", slots: ["label"] },
    {
      kind: "useCases",
      use: [
        "Naming any text input, textarea, select, checkbox, radio, or switch in a form.",
        "Providing the accessible name for a control that has no visible text of its own.",
      ],
      dontUse: [
        "As a standalone caption or section heading — use a heading element.",
        "To carry help text or error copy — use a form description or message.",
      ],
    },
  ],
})
