import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Combobox — component doc entity; parity-verified against source. */
export const comboboxDoc: ComponentDoc = parseComponentDoc({
  id: "combobox",
  name: "Combobox",
  slug: "combobox",
  summary:
    "A Select you can type into — a trigger opens a searchable Command list in a Popover, so users filter a long set of options by typing instead of scrolling. Reach for it once a plain Select gets unwieldy. For a short, fixed list, the simpler Select is enough.",
  status: "ready",
  sourceFiles: ["command.tsx", "popover.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Combobox when the option list is long enough that typing to filter beats scrolling — counterparties, instruments, tags.",
        "Show the current selection in the trigger, filter as the user types, and provide a clear empty state when nothing matches.",
        "Support async loading for large or remote sets, and allow creating a new value when that fits the domain.",
      ],
      donts: [
        "Don't use a Combobox for a handful of options — a Select (or RadioGroup) is simpler and needs no typing.",
        "Don't leave a blank panel on no match; say so and offer a way forward (create, clear, retry).",
        "Don't confuse it with a Command palette — a Combobox picks a field value, the palette runs app-wide actions.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "command",
        "command-input-wrapper",
        "command-input",
        "command-list",
        "command-empty",
        "command-group",
        "command-separator",
        "command-item",
        "command-shortcut",
        "popover",
        "popover-trigger",
        "popover-content",
        "popover-header",
        "popover-title",
        "popover-description",
      ],
    },
    {
      kind: "useCases",
      use: [
        "Selecting one value from a long list by typing — a counterparty, a warehouse, a product.",
        "A tag or entity picker with search and optional create-new.",
        "Any form field where a Select would be too long to scroll.",
      ],
      dontUse: [
        "A short, fixed set of options — use a Select.",
        "Running app-wide actions — use a Command palette.",
        "A few always-visible choices — use RadioGroup.",
      ],
    },
  ],
})
