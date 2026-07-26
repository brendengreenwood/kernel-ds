import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Menubar — component doc entity; parity-verified against source. */
export const menubarDoc: ComponentDoc = parseComponentDoc({
  id: "menubar",
  name: "Menubar",
  slug: "menubar",
  summary:
    "A horizontal bar of always-visible menus — File, Edit, View — modeling the classic desktop-application command surface. Use it for tool-like screens with many grouped commands; most operational views are better served by a toolbar of buttons and a DropdownMenu for overflow.",
  status: "ready",
  sourceFiles: ["menubar.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Menubar for application-style screens with a large, stable set of commands worth organizing into top-level menus.",
        "Name the top-level menus by category (Edit, View, Insert) and keep each menu's items short, grouped, and consistently ordered.",
        "Expose keyboard shortcuts on items and support arrow-key navigation across the whole bar.",
      ],
      donts: [
        "Don't add a Menubar to a simple CRUD or dashboard view — a toolbar plus a DropdownMenu is lighter and clearer.",
        "Don't duplicate primary navigation here; the Menubar is for commands, not for moving between areas.",
        "Don't bury the few actions users need most inside nested menus.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "menubar",
        "menubar-menu",
        "menubar-group",
        "menubar-portal",
        "menubar-trigger",
        "menubar-content",
        "menubar-item",
        "menubar-checkbox-item",
        "menubar-radio-group",
        "menubar-radio-item",
        "menubar-label",
        "menubar-separator",
        "menubar-shortcut",
        "menubar-sub",
        "menubar-sub-trigger",
        "menubar-sub-content",
      ],
    },
    {
      kind: "useCases",
      use: [
        "A tool-like editor or builder with many grouped commands (File / Edit / View).",
        "A desktop-style application surface where users expect a persistent command bar.",
        "Consolidating a broad command set that would overflow a toolbar.",
      ],
      dontUse: [
        "A standard dashboard or record view — use a toolbar and DropdownMenu.",
        "Moving between app areas — use a Sidebar or NavigationMenu.",
        "A single button's overflow actions — use a DropdownMenu.",
      ],
    },
  ],
})
