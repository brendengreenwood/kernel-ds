import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Data Table — component doc entity; parity-verified against source. */
export const dataTableDoc: ComponentDoc = parseComponentDoc({
  id: "data-table",
  name: "Data Table",
  slug: "data-table",
  summary:
    "The Table primitive wired to TanStack Table for real data work — column definitions, sorting, filtering, row selection, and pagination. It's the canvas workhorse for browsing and acting on collections of records. For a static grid with no interaction, the plain Table is lighter.",
  status: "ready",
  sourceFiles: ["table.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Define columns declaratively (accessor, header, cell renderer) so formatting, alignment, and sort behavior live in one place.",
        "Keep the default column set to the fields users scan by; let them reveal or reorder the rest rather than showing everything at once.",
        "Render typed cells with the design system's encodings — StatusBadge for status, right-aligned currency, CommodityBadge for commodities — so the grid reads at a glance.",
        "Page or virtualize large result sets, and give sortable headers a visible affordance and keyboard support.",
      ],
      donts: [
        "Don't cram twelve columns into the viewport until they're all squeezed — prioritize, then let users expand.",
        "Don't put unformatted raw values in cells; a bare status string or an unaligned number defeats the grid.",
        "Don't reimplement selection or pagination outside the table's model — keep state in one source of truth.",
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
        "The canvas grid for a collection — contracts, shipments, invoices — with sort, filter, and row actions.",
        "A selectable list feeding a bulk operation.",
        "Server-paginated results with typed, formatted cells.",
      ],
      dontUse: [
        "A small static grid with no interaction — use Table.",
        "A single record's detail — use a detail panel in the dock.",
        "Free-form or non-tabular content — use Cards or a grid.",
      ],
    },
  ],
})
