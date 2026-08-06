import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Sidebar — component doc entity; parity-verified against source. */
export const sidebarDoc: ComponentDoc = parseComponentDoc({
  id: "sidebar",
  name: "Sidebar",
  slug: "sidebar",
  summary:
    "The app shell's primary navigation rail — a persistent, collapsible column that holds the top-level destinations and groups a workspace is built from. It's the spine of the operational UI: always present, always oriented to where the user is. Compose it from its sub-parts (`SidebarGroup`, `SidebarMenu`, `SidebarMenuButton`) rather than reaching for raw markup.",
  status: "ready",
  sourceFiles: ["sidebar.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Group destinations under labelled `SidebarGroup`s so a long rail stays scannable — \"Trading\", \"Settlements\", \"Admin\" beat one flat list of twenty links.",
        "Mark the active route on its `SidebarMenuButton` (`isActive`) so users always know where they are.",
        "Wrap the app in `SidebarProvider` and give collapse a keyboard path via `SidebarTrigger`; on the collapsed icon rail, pair each button with a Tooltip so the glyph still names its destination.",
        "Keep the rail to navigation and workspace switching — put record actions and content in the canvas or dock, not the sidebar.",
      ],
      donts: [
        "Don't stuff forms, filters, or record detail into the sidebar; it's for getting somewhere, not for doing work.",
        "Don't nest menus more than one level with `SidebarMenuSub` — deep trees are hard to scan and worse on the collapsed rail.",
        "Don't hide the only path to a critical destination behind the collapsed state with no tooltip or label.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "variant",
          defaultKey: "default",
          keys: [
            { key: "default", description: "The standard rail flush against the viewport edge — the everyday app-shell navigation." },
            { key: "outline", description: "A bordered rail that reads as a distinct panel; use when the sidebar floats over content rather than anchoring the shell." },
          ],
        },
        {
          axis: "size",
          defaultKey: "default",
          keys: [
            { key: "default", description: "Standard rail width, room for a label plus an optional count badge." },
            { key: "sm", description: "Tighter width for dense navigation or secondary rails." },
            { key: "lg", description: "Wider rail when labels run long or items carry supporting metadata." },
          ],
        },
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "sidebar-wrapper",
        "sidebar",
        "sidebar-gap",
        "sidebar-container",
        "sidebar-inner",
        "sidebar-trigger",
        "sidebar-rail",
        "sidebar-inset",
        "sidebar-input",
        "sidebar-header",
        "sidebar-footer",
        "sidebar-separator",
        "sidebar-content",
        "sidebar-group",
        "sidebar-group-content",
        "sidebar-menu",
        "sidebar-menu-item",
        "sidebar-menu-badge",
        "sidebar-menu-skeleton",
        "sidebar-menu-sub",
        "sidebar-menu-sub-item",
      ],
    },
    {
      kind: "useCases",
      use: [
        "The main app-shell rail listing top-level workspaces and their grouped destinations.",
        "A collapsible icon rail that reclaims horizontal space on smaller screens while keeping navigation one click away.",
        "Grouping a broad product's areas — trading, settlements, reporting, admin — under labelled sections.",
      ],
      dontUse: [
        "Holding a filter panel or record form — those belong in the canvas or dock.",
        "A short, flat set of tabs within a single view — use Tabs.",
        "In-page contextual actions — use a Toolbar or DropdownMenu near the content.",
      ],
    },
    {
      kind: "states",
      items: [
        {
          name: "expanded",
          description: "The full 16rem rail: labelled destinations, the search slot rendered as a field.",
        },
        {
          name: "collapsed (icon rail)",
          description:
            "A 3.5rem (56px) rail. Menu buttons keep their height and simply become square — size-10 with p-2.5 leaves a 19.2px content box, exactly the size-5 glyph — so icons no longer change size mid-animation. The old 3rem rail left only 32.6px of clearance, which is why it had to shrink its buttons; 3.5rem clears the group's own padding (38.4 + 2×7.68 = 53.8px).",
        },
        {
          name: "offcanvas",
          description: "The rail leaves entirely and returns over the content from the trigger — the mobile default.",
        },
      ],
    },
  ],
})
