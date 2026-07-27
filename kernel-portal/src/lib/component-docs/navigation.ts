import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Navigation — pattern doc entity. */
export const navigationDoc: ComponentDoc = parseComponentDoc({
  id: "navigation",
  name: "Navigation",
  slug: "navigation",
  summary:
    "How users move through the app and know where they are — the Sidebar rail for top-level sections, Breadcrumbs for depth, and Tabs for switching views within a page. Used together consistently, they form a mental map; used ad hoc, users get lost.",
  status: "ready",
  sourceFiles: [],
  metadata: { owner: "ds", kind: "pattern" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use the Sidebar for stable top-level destinations, Breadcrumbs to show and unwind depth, and Tabs for peer views inside a page.",
        "Mark the current location in each level so users always know where they are.",
        "Keep navigation labels consistent with the destinations they lead to.",
      ],
      donts: [
        "Don't mix the metaphors — Tabs switch content, they don't navigate to new routes with their own URLs.",
        "Don't bury primary destinations two menus deep when a rail entry would do.",
        "Don't leave the active state ambiguous across the rail, breadcrumb, and tabs.",
      ],
    },
    {
      kind: "useCases",
      use: [
        "Structuring an app's top-level and in-page movement.",
        "Showing and unwinding hierarchy with Breadcrumbs.",
        "Switching between peer views with Tabs.",
      ],
      dontUse: [
        "Selecting a value — use a Select or ToggleGroup.",
        "Firing an action — use a Button.",
        "A transient overlay choice — use a menu.",
      ],
    },
  ],
})
