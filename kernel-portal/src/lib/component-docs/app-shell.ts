import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** App Shell — pattern doc entity. */
export const appShellDoc: ComponentDoc = parseComponentDoc({
  id: "app-shell",
  name: "App Shell",
  slug: "app-shell",
  summary:
    "The persistent frame around every screen — a Sidebar for navigation, a header for context and account, and a scrollable main region for content. It's the stable skeleton that stays put as pages change, so users always know where they are and how to get elsewhere.",
  status: "ready",
  sourceFiles: [],
  metadata: { owner: "ds", kind: "pattern" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Keep the Sidebar and header stable across routes so navigation and context never move under the user.",
        "Put the primary navigation in the Sidebar and let it collapse to an icon rail to reclaim space.",
        "Give the main region its own scroll so the chrome stays fixed while content scrolls.",
      ],
      donts: [
        "Don't rebuild the frame per page — one shell wraps every route (decision 0011).",
        "Don't nest scrolling shells; a single main scroll area avoids competing scrollbars.",
        "Don't hide core navigation behind a menu on desktop where a persistent rail fits.",
      ],
    },
    {
      kind: "useCases",
      use: [
        "The top-level layout wrapping all authenticated routes.",
        "A workspace frame with rail navigation and a scrollable canvas.",
        "Any multi-page app needing consistent chrome.",
      ],
      dontUse: [
        "A focused full-screen task — use a dedicated modal or full-page flow.",
        "A marketing or auth page with no app navigation.",
        "A single embedded widget.",
      ],
    },
  ],
})
