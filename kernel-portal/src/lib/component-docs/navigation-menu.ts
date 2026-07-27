import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Navigation Menu — component doc entity; parity-verified against source. */
export const navigationMenuDoc: ComponentDoc = parseComponentDoc({
  id: "navigation-menu",
  name: "Navigation Menu",
  slug: "navigation-menu",
  summary:
    "A horizontal navigation bar whose items can open panels of grouped links — the top-of-page way to move between major areas, with room for a mega-menu of destinations. Its items are links, not commands: use it to go places. For firing actions, use a DropdownMenu.",
  status: "ready",
  sourceFiles: ["navigation-menu.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use it for top-level, cross-area navigation where a few entries expand into grouped sets of destinations.",
        "Keep the top-level items to a handful of clear categories, and organize each panel's links into labelled groups.",
        "Ensure every item is a real link so the browser's open-in-new-tab and middle-click work, and support keyboard traversal across the bar.",
      ],
      donts: [
        "Don't put actions (save, delete, export) in a Navigation Menu — those belong in a toolbar or DropdownMenu.",
        "Don't nest panels within panels; one level of expansion keeps it navigable.",
        "Don't use it as the app's primary rail when a vertical Sidebar suits a dense operational product better.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "navigation-menu",
        "navigation-menu-list",
        "navigation-menu-item",
        "navigation-menu-trigger",
        "navigation-menu-content",
        "navigation-menu-link",
        "navigation-menu-indicator",
      ],
    },
    {
      kind: "useCases",
      use: [
        "A marketing or portal header linking to top-level sections.",
        "A mega-menu grouping many destinations under a few categories.",
        "Horizontal primary navigation where a vertical rail doesn't fit the layout.",
      ],
      dontUse: [
        "Command actions — use a DropdownMenu or toolbar.",
        "Dense app navigation with many nested areas — use a Sidebar.",
        "In-page section switching — use Tabs.",
      ],
    },
  ],
})
