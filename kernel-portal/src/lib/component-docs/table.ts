import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Table — component doc entity; parity-verified against source. */
export const tableDoc: ComponentDoc = parseComponentDoc({
  id: "table",
  name: "Table",
  slug: "table",
  summary:
    "A structured grid for tabular data — rows of records, columns of fields — where users compare values down a column and scan across a row. It's the primitive styling and markup; when you need sorting, filtering, selection, and pagination wired up, reach for DataTable, which builds on it.",
  status: "ready",
  sourceFiles: ["table.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Table when the data is genuinely tabular and users need to compare values across rows and columns.",
        "Right-align numeric and currency columns so digits line up, and keep headers short and consistent.",
        "Match density to context — tighter rows in an operational canvas, roomier ones where readability wins.",
      ],
      donts: [
        "Don't force non-tabular content into a Table for layout; use a grid or Cards.",
        "Don't pile every field into columns — show the ones users scan by, and move the rest to a detail view.",
        "Don't build sorting and pagination by hand on a raw Table when DataTable already provides them.",
      ],
    },
    {
      kind: "api",
      props: [
        { name: "striped", type: "boolean", description: "Zebra-stripe alternating body rows (subtle foreground overlay) for easier row tracking in dense tables." },
        { name: "className", type: "string", description: "Merged onto the root `table` slot." },
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "table-container",
        "table",
        "table-header",
        "table-body",
        "table-footer",
        "table-row",
        "table-head",
        "table-cell",
        "table-caption",
      ],
    },
    {
      kind: "useCases",
      use: [
        "A static or simply-rendered list of records where columns are compared at a glance.",
        "The markup and styling layer beneath a richer DataTable.",
        "A compact summary grid — totals, a small reference table — that needs no interaction.",
      ],
      dontUse: [
        "Interactive grids needing sort/filter/select/paginate — use DataTable.",
        "Non-tabular layout — use a grid or Cards.",
        "A single record's fields — use a description/detail list.",
      ],
    },
  ],
})
