import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Command — component doc entity; parity-verified against source. */
export const commandDoc: ComponentDoc = parseComponentDoc({
  id: "command",
  name: "Command",
  slug: "command",
  summary:
    "A searchable command palette — type to filter across actions and destinations, then run one with the keyboard. It's the power-user accelerator that collapses deep navigation into a few keystrokes (often summoned with ⌘K). It complements the visible UI rather than replacing it.",
  status: "ready",
  sourceFiles: ["command.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Command palette to give keyboard-first users fast access to actions and destinations scattered across the app.",
        "Group results by kind (Actions, Records, Navigation), keep labels searchable, and show shortcut hints on items that have them.",
        "Bind a discoverable trigger (⌘K / Ctrl-K), make it fully keyboard-navigable, and show a helpful empty state when nothing matches.",
      ],
      donts: [
        "Don't make the palette the only way to reach an important action — it's an accelerator, not the primary UI.",
        "Don't return an unranked flood of results; filter and group so the top hit is usually right.",
        "Don't leave a blank panel on no match — say so and suggest what to try.",
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
      ],
    },
    {
      kind: "useCases",
      use: [
        "A ⌘K palette for jumping to any record, view, or action.",
        "Fast keyboard access to commands that would otherwise be several clicks deep.",
        "A searchable picker inside a Popover for choosing from a long list (the basis of Combobox).",
      ],
      dontUse: [
        "The sole entry point to core features — keep visible affordances too.",
        "A simple single-select field — use a Select.",
        "A menu of a few actions on a button — use a DropdownMenu.",
      ],
    },
  ],
})
