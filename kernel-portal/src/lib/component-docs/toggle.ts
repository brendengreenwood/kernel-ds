import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Toggle — component doc entity; parity-verified against source. */
export const toggleDoc: ComponentDoc = parseComponentDoc({
  id: "toggle",
  name: "Toggle",
  slug: "toggle",
  summary:
    "A two-state button that stays pressed to show it's on — bold in a text toolbar, a filter that's active. It reads as \"this button is currently engaged.\" For a settings-style on/off that applies immediately, use a Switch; for a one-of-several choice, use a ToggleGroup.",
  status: "ready",
  sourceFiles: ["toggle.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Toggle for a button whose pressed state matters — formatting controls, an active/inactive filter.",
        "Make the on and off states visually distinct, and give icon-only toggles an `aria-label` and a Tooltip.",
        "Keep the label or icon stable across states; only the pressed styling should change.",
      ],
      donts: [
        "Don't use a Toggle for a settings row where a Switch's on/off metaphor is clearer.",
        "Don't build a mutually-exclusive set from loose Toggles — use a ToggleGroup so only one wins.",
        "Don't let the pressed and unpressed states look nearly identical; users must see the current state.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "variant",
          defaultKey: "default",
          keys: [
            { key: "default", description: "Transparent until pressed; blends into a toolbar." },
            { key: "outline", description: "Bordered resting state for when the toggle needs to read as a distinct control." },
          ],
        },
        {
          axis: "size",
          defaultKey: "default",
          keys: [
            { key: "default", description: "Standard height for most toolbars." },
            { key: "sm", description: "Compact toggle for dense toolbars and table rows." },
            { key: "lg", description: "Larger target for prominent or touch-first controls." },
          ],
        },
      ],
    },
    {
      kind: "useCases",
      use: [
        "A text-formatting control (bold, italic) that shows its active state.",
        "A single filter chip that's on or off.",
        "Any button where \"currently engaged\" is the key signal.",
      ],
      dontUse: [
        "An immediate setting — use a Switch.",
        "A one-of-many choice — use a ToggleGroup or RadioGroup.",
        "A plain action that fires once — use a Button.",
      ],
    },
  ],
})
