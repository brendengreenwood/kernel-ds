import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Pagination — component doc entity; parity-verified against source. */
export const paginationDoc: ComponentDoc = parseComponentDoc({
  id: "pagination",
  name: "Pagination",
  slug: "pagination",
  summary:
    "Controls for moving through a large result set one page at a time — previous/next plus numbered pages. Use it when users benefit from stable, addressable pages and a sense of total size; for a feed where users just keep scrolling, infinite scroll fits better.",
  status: "ready",
  sourceFiles: ["pagination.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use Pagination for tabular or search results where users jump around and expect a page they can bookmark or share.",
        "Show the current page, offer previous/next, and collapse long runs with an ellipsis while keeping the first and last reachable.",
        "Sync the active page to the URL so refresh and back/forward land where the user expects.",
      ],
      donts: [
        "Don't paginate a short list that fits on one screen — the controls are pure overhead.",
        "Don't hide how many pages or results exist; users need the sense of scale to navigate.",
        "Don't mix Pagination with infinite scroll on the same list — pick one model.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "pagination",
        "pagination-content",
        "pagination-item",
        "pagination-link",
        "pagination-ellipsis",
      ],
    },
    {
      kind: "useCases",
      use: [
        "Navigating a large data table or search results in stable, shareable pages.",
        "Any list where users jump to a specific page or want to know the total.",
        "Server-paginated results where each page is a distinct request.",
      ],
      dontUse: [
        "A short list that fits without paging.",
        "A continuous feed better served by infinite scroll.",
        "Stepping through a linear wizard — use a stepper.",
      ],
    },
  ],
})
