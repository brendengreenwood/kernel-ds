import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Combobox — component doc entity; parity-verified against source. */
export const comboboxDoc: ComponentDoc = parseComponentDoc({
  id: "combobox",
  name: "Combobox",
  slug: "combobox",
  summary:
    "A Select you can type into. The input filters a list as the user types, so a long set of options — counterparties, warehouses, instruments — becomes reachable in a few keystrokes instead of a long scroll. It handles one value or many: pass multiple and selections render as removable chips inside the input. For a short, fixed list, the simpler Select is still enough.",
  status: "ready",
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Reach for a Combobox once the option list is long enough that typing to filter beats scrolling — roughly a dozen entries and up.",
        "Always render ComboboxEmpty. A filter that matches nothing is the most common state a user hits, and a blank panel reads as a broken control.",
        "Group long lists with ComboboxGroup and ComboboxLabel — region, commodity, counterparty type — so filtering narrows within a structure the user can already see.",
        "Use the chips form for multi-select. A chip carries its own remove button, so the user can drop one value without reopening the list and hunting for it.",
      ],
      donts: [
        "Don't use a Combobox for a handful of options — a Select, or a RadioGroup if they should all stay visible, is simpler and needs no typing.",
        "Don't confuse it with a Command palette. A Combobox fills in a form field; the palette runs app-wide actions and lives behind a global shortcut.",
        "Don't put the selected value only in the panel. The trigger or the chips must show what's currently chosen once the panel closes.",
        "Don't hide the clear affordance on a filter that's already applied — leaving no way back to 'all' strands the user.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "combobox-trigger",
        "combobox-value",
        "combobox-clear",
        "combobox-content",
        "combobox-list",
        "combobox-item",
        "combobox-group",
        "combobox-label",
        "combobox-collection",
        "combobox-empty",
        "combobox-separator",
        "combobox-chips",
        "combobox-chip",
        "combobox-chip-remove",
        "combobox-chip-input",
      ],
    },
    {
      kind: "api",
      props: [
        {
          name: "showClear",
          type: "boolean",
          default: "false",
          description:
            "Adds a clear button to ComboboxInput. Turn it on wherever the field is a filter, so there's a way back to the unfiltered set.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Disables ComboboxInput and its trigger and clear buttons together, so the whole control greys out as a unit.",
        },
        {
          name: "items",
          type: "readonly T[]",
          description:
            "The option set, passed to Combobox (the Base UI root). The primitive filters it for you — don't filter children by hand.",
        },
      ],
    },
    {
      kind: "accessibility",
      role: "combobox",
      keyboardInteractions: [
        {
          key: "ArrowDown / ArrowUp",
          action: "Moves the highlight through the filtered list, opening the panel if it's closed.",
        },
        { key: "Enter", action: "Selects the highlighted option." },
        { key: "Escape", action: "Closes the panel and returns focus to the input." },
        {
          key: "Backspace",
          action: "In the chips form, removes the last chip when the input is empty.",
        },
      ],
    },
    {
      kind: "useCases",
      use: [
        "Picking one value from a long list by typing — a counterparty, a warehouse, a delivery location.",
        "Multi-select filters where the chosen values must stay visible while the user keeps adding — commodities on a position screen.",
        "A form field where a Select would be too long to scroll comfortably.",
      ],
      dontUse: [
        "A short, fixed set of options — use a Select.",
        "Running app-wide actions — use a Command palette.",
        "A few choices that should all stay visible — use a RadioGroup.",
      ],
    },
  ],
})
