import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Breadcrumb — component doc entity; parity-verified against source. */
export const breadcrumbDoc: ComponentDoc = parseComponentDoc({
  id: "breadcrumb",
  name: "Breadcrumb",
  slug: "breadcrumb",
  summary:
    "A trail showing where the current page sits in the hierarchy, with each ancestor a link back up. It answers \"where am I and how do I get back\" for nested records and deep navigation. Use it when there's a real hierarchy to climb; a flat, two-level app doesn't need one.",
  status: "ready",
  sourceFiles: ["breadcrumb.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Show the full path from a top-level area down to the current page, and mark the last crumb as the current page (not a link).",
        "Keep labels short and matched to the destinations they lead to, so the trail reads as a sentence of places.",
        "Collapse a long path with an ellipsis crumb that reveals the hidden middle, keeping the first and current crumbs visible.",
      ],
      donts: [
        "Don't use a Breadcrumb where there's no hierarchy — it implies depth that isn't there.",
        "Don't make the current page a link back to itself; it's the end of the trail.",
        "Don't let the trail wrap to several lines — truncate or collapse instead.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "breadcrumb",
        "breadcrumb-list",
        "breadcrumb-item",
        "breadcrumb-page",
        "breadcrumb-separator",
        "breadcrumb-ellipsis",
      ],
    },
    {
      kind: "useCases",
      use: [
        "Locating a nested record — Workspace › Collection › Record — with links back up each level.",
        "Deep settings or documentation trees where users need an escape path.",
        "Any multi-level hierarchy where \"how do I get back\" is a real question.",
      ],
      dontUse: [
        "A flat app with one or two levels — the trail adds noise.",
        "Steps in a linear flow — use a stepper or progress indicator.",
        "Primary navigation between top-level areas — use a Sidebar.",
      ],
    },
  ],
})
