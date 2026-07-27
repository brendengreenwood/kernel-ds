import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Tables — element doc entity; parity-verified against source. */
export const tablesDoc: ComponentDoc = parseComponentDoc({
  id: "tables",
  name: "Tables",
  slug: "tables",
  summary:
    "The table element — the markup and styling primitives (container, header, body, rows, cells, caption) that structure tabular data. Use them directly for a static grid; when you need sorting, filtering, and pagination wired up, build on DataTable instead of assembling it by hand.",
  status: "ready",
  sourceFiles: ["table.tsx"],
  metadata: { owner: "ds", kind: "element" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Reach for the table elements when data is genuinely tabular and users compare across rows and columns.",
        "Right-align numeric columns, keep headers short, and add a caption when the table needs a title.",
        "Match row density to context — tighter in an operational canvas, roomier where readability wins.",
      ],
      donts: [
        "Don't use table markup for page layout; use a grid or Cards.",
        "Don't show every field as a column — prioritize what users scan by.",
        "Don't hand-roll sort and pagination on raw table elements — use DataTable.",
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
        "A static grid of records with no interaction.",
        "A small summary or reference table.",
        "The styling layer beneath a richer DataTable.",
      ],
      dontUse: [
        "Interactive grids — use DataTable.",
        "Non-tabular layout — use a grid or Cards.",
        "A single record's fields — use a detail list.",
      ],
    },
  ],
})
