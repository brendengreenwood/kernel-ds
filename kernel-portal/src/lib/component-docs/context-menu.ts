import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Context Menu — component doc entity; parity-verified against source. */
export const contextMenuDoc: ComponentDoc = parseComponentDoc({
  id: "context-menu",
  name: "Context Menu",
  slug: "context-menu",
  summary:
    "A menu of actions summoned by right-click (or long-press) on a specific target, offering commands scoped to what the user clicked. It's a power-user accelerator — the same actions must also be reachable through a visible control, since a right-click menu is invisible until invoked.",
  status: "ready",
  sourceFiles: ["context-menu.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Context Menu to speed up actions on a specific item — a table row, a canvas node, a file — that a user works with repeatedly.",
        "Scope the items to the clicked target and mirror them in a visible affordance (a row's \"⋯\" button) so discoverability doesn't depend on right-click.",
        "Group and separate items the same way you would in a DropdownMenu, keeping destructive actions set apart.",
      ],
      donts: [
        "Don't make a Context Menu the only path to an action — many users never right-click, and touch has no equivalent by default.",
        "Don't overload it with every possible command; keep it to what's relevant to the target.",
        "Don't nest deep submenus that are hard to reach with a held right-click.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "context-menu",
        "context-menu-portal",
        "context-menu-trigger",
        "context-menu-content",
        "context-menu-group",
        "context-menu-label",
        "context-menu-item",
        "context-menu-sub",
        "context-menu-sub-trigger",
        "context-menu-sub-content",
        "context-menu-checkbox-item",
        "context-menu-radio-group",
        "context-menu-radio-item",
        "context-menu-separator",
        "context-menu-shortcut",
      ],
    },
    {
      kind: "useCases",
      use: [
        "Right-click actions on a table row or list item for quick edit/duplicate/delete.",
        "Target-specific commands on a canvas or diagram node.",
        "A power-user accelerator layered over an already-visible action set.",
      ],
      dontUse: [
        "The sole way to reach an action — always provide a visible control too.",
        "A menu opened from a button — that's a DropdownMenu.",
        "Form value selection — use a Select.",
      ],
    },
  ],
})
