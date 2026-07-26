import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Switch — component doc entity; parity-verified against source. */
export const switchDoc: ComponentDoc = parseComponentDoc({
  id: "switch",
  name: "Switch",
  slug: "switch",
  summary:
    "An instant on/off control for a single setting that takes effect the moment it's flipped — enabling alerts, turning on auto-settlement. Unlike a Checkbox, there's no Save step: the toggle *is* the action. If the change only applies when a form is submitted, use a Checkbox.",
  status: "ready",
  sourceFiles: ["switch.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Switch only when flipping it applies immediately — settings panels, feature toggles, per-row enable/disable.",
        "Label the setting, not the state (\"Auto-settle trades\"), and let the switch position carry on/off.",
        "Give feedback if the change is async — a brief inline confirmation or a revert-on-failure — so the user trusts it took.",
      ],
      donts: [
        "Don't put a Switch in a form that has its own Save button; a Checkbox matches the deferred-commit model.",
        "Don't use a Switch for anything that isn't binary — for a small set of choices use RadioGroup or ToggleGroup.",
        "Don't leave a switch in an ambiguous state after a failed save; snap it back and say why.",
      ],
    },
    { kind: "anatomy", slots: ["switch", "switch-thumb"] },
    {
      kind: "useCases",
      use: [
        "A settings row that enables or disables a feature on the spot.",
        "Per-item toggles in a list — mute a channel, activate a rule.",
        "An immediate preference like dark mode or notification opt-in.",
      ],
      dontUse: [
        "A form field committed on submit — use a Checkbox.",
        "Choosing among several options — use RadioGroup or ToggleGroup.",
      ],
    },
  ],
})
