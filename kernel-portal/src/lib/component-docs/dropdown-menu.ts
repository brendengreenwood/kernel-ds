import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Dropdown Menu — component doc entity; parity-verified against source. */
export const dropdownMenuDoc: ComponentDoc = parseComponentDoc({
  id: "dropdown-menu",
  name: "Dropdown Menu",
  slug: "dropdown-menu",
  summary:
    "A list of actions or options that opens from a button — the \"⋯ more\" on a row, an account menu, a set of bulk operations. It's built for commands and choices with full keyboard navigation. When you're picking a form value rather than firing an action, use a Select instead.",
  status: "ready",
  sourceFiles: ["dropdown-menu.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Dropdown Menu to collect actions that would otherwise crowd a row or toolbar — edit, duplicate, export, delete.",
        "Group related items with separators and labels, and order destructive actions last (or set them apart) so they aren't hit by reflex.",
        "Attach `DropdownMenuShortcut` hints where a keyboard path exists, and keep labels as verbs.",
      ],
      donts: [
        "Don't use it as a form control for selecting a value — that's a Select, which reflects the chosen value in its trigger.",
        "Don't nest submenus more than one level deep; deep menus are hard to navigate by keyboard or on touch.",
        "Don't fill it with static, non-actionable text — a menu is for doing things.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "dropdown-menu",
        "dropdown-menu-portal",
        "dropdown-menu-trigger",
        "dropdown-menu-content",
        "dropdown-menu-group",
        "dropdown-menu-label",
        "dropdown-menu-item",
        "dropdown-menu-sub",
        "dropdown-menu-sub-trigger",
        "dropdown-menu-sub-content",
        "dropdown-menu-checkbox-item",
        "dropdown-menu-checkbox-item-indicator",
        "dropdown-menu-radio-group",
        "dropdown-menu-radio-item",
        "dropdown-menu-radio-item-indicator",
        "dropdown-menu-separator",
        "dropdown-menu-shortcut",
      ],
    },
    {
      kind: "useCases",
      use: [
        "A row-level \"more actions\" menu in a data table.",
        "An account or workspace menu triggered from an avatar or button.",
        "A set of bulk operations on a selection, with checkbox or radio items for options.",
      ],
      dontUse: [
        "Selecting a value for a form field — use a Select.",
        "Right-click context actions on content — use a ContextMenu.",
        "Primary navigation between areas — use a Sidebar or NavigationMenu.",
      ],
    },
  ],
})
