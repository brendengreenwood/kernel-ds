import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Filtering — pattern doc entity. */
export const filteringDoc: ComponentDoc = parseComponentDoc({
  id: "filtering",
  name: "Filtering",
  slug: "filtering",
  summary:
    "How users narrow a large collection to the records they care about — a search Input, a few Select or ToggleGroup facets, and active-filter chips above the results. Good filtering makes the current query visible and reversible so users always know why they're seeing what they're seeing.",
  status: "ready",
  sourceFiles: [],
  metadata: { owner: "ds", kind: "pattern" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Offer the filters users reach for most as visible controls — search, status, date range — not buried in a menu.",
        "Show active filters as removable chips so the current query is legible and easy to unwind.",
        "Apply filters to the same result set the user is looking at and update it immediately or with a clear apply action.",
      ],
      donts: [
        "Don't hide the active query — a filtered view that looks like the full set confuses users.",
        "Don't offer a filter with no matches and no empty-state explanation.",
        "Don't reset the user's filters silently on navigation or refresh.",
      ],
    },
    {
      kind: "useCases",
      use: [
        "Narrowing a DataTable by status, date, or search term.",
        "Faceted filtering with removable active-filter chips.",
        "A search-first list where typing filters results.",
      ],
      dontUse: [
        "Complex saved queries with many conditions — see advanced filtering.",
        "Choosing a single value to act on — use a Select.",
        "Sorting — that's a column/table concern, not a filter.",
      ],
    },
  ],
})
