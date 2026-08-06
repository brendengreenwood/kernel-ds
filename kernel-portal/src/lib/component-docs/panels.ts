import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Panels — panel furniture doc entity; parity-verified against source. */
export const panelsDoc: ComponentDoc = parseComponentDoc({
  id: "panels",
  name: "Panels",
  slug: "panels",
  summary:
    "The furniture that activity and detail panels are built from: Tile, TwoLine, Stat, IconChip, TableFrame, and PanelEmpty in one module. They share one plate recipe — a fill one step off the card plus an inset top lip, no cast — so everything placed on a panel reads as ON it rather than drawn into it. Surface plus edge is enough separation; a drop shadow at both levels is how an interface starts to look upholstered.",
  status: "experimental",
  sourceFiles: ["panels.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "useCases",
      use: [
        "A row of roll-up figures heading a panel — small Tiles or Stats that answer the question before the table below has to be read at all.",
        "A figure that heads the thing itself — the large Tile, with room reserved for a sparkline whether or not one is passed, so a row of tiles keeps its bottoms on one line.",
        "A table inside a panel — TableFrame gives it the plate and hairline that make it a placed object, with dense as the default step.",
        "A cell holding a value and the quantity behind it — TwoLine, where the sub carries its own unit because a bare number under no column head is a number of nothing.",
      ],
      dontUse: [
        "A full metrics dashboard — these are panel furniture, sized to live inside a card, not a charting layer.",
        "A standalone empty state with an action — PanelEmpty is one muted line for a frame with no rows; the Empty component owns the icon-title-action treatment.",
        "Status communication — none of these carry tone. A figure that needs to signal good or bad pairs with StatusBadge instead of tinting a Tile.",
      ],
    },
    {
      kind: "guidelines",
      dos: [
        "Keep the label above the figure in Tiles. Above, it's the question the number answers, and labels line up across a row at a constant height; below, it's a footnote.",
        "Reserve the trace room even when a tile has no chart — the large Tile does this itself. A row of cards whose bottoms don't align reads as cards that failed to load.",
        "Use Stat in a header's action slot and Tile in the body: Stat sizes off the header it sits in, so the figure stays the larger of the pair without taking the title's job.",
        "Give TwoLine's sub the unit (\"12,400 bu\", \"per bushel\") — it renders under the value where no column head can explain it.",
      ],
      donts: [
        "Don't add a drop shadow to anything already on a panel. The plate recipe is fill plus lip deliberately — the panel casts, its furniture doesn't.",
        "Don't pass a chart to a small Tile. The small tile is 20px of type in a header row; a line under it is a smudge.",
        "Don't use bg-muted for a chip on a card — in the v2 dark theme --muted resolves to the card's own value and the chip disappears. IconChip's foreground overlay exists for exactly this.",
        "Don't wrap a top-level object table in a dense frame — pass dense={false} to keep the roomier step; dense is for tables inside panels.",
      ],
    },
    {
      kind: "anatomy",
      slots: ["tile", "two-line", "stat", "icon-chip", "table-frame", "panel-empty"],
    },
    {
      kind: "api",
      props: [
        {
          name: "value",
          type: "React.ReactNode",
          description: "Tile and Stat — the figure itself, set in tabular numerals.",
        },
        {
          name: "label",
          type: "string",
          description: "Tile and Stat — the question the figure answers. Above the figure in large Tiles, below in small Tiles and Stats.",
        },
        {
          name: "lg",
          type: "boolean",
          default: "false",
          description:
            "Tile — the header-of-the-thing size: outline only (no plate), card-like padding, a container-query-sized figure, the concentric corner (panel radius minus panel inset), and reserved sparkline room.",
        },
        {
          name: "chart",
          type: "React.ReactNode",
          description:
            "Tile (lg only) — an optional sparkline of how the figure got here. The tile holds the room open either way so row bottoms align.",
        },
        {
          name: "top",
          type: "React.ReactNode",
          description: "TwoLine — the value line. Pair with strong when the row's identity lives in this cell.",
        },
        {
          name: "sub",
          type: "string",
          description: "TwoLine — the quantity behind the value, carrying its own unit.",
        },
        {
          name: "strong",
          type: "boolean",
          description: "TwoLine — sets the top line semibold.",
        },
        {
          name: "icon",
          type: "React.ComponentType<{ className?: string }>",
          description: "IconChip — the glyph component for the 32px chip that leads a panel header.",
        },
        {
          name: "dense",
          type: "boolean",
          default: "true",
          description:
            "TableFrame — the compact step, exposed as a data-dense styling hook. Top-level object tables pass dense={false}.",
        },
      ],
    },
    {
      kind: "examples",
      items: [
        {
          title: "A panel head of figures",
          description: "Small tiles answer the panel's question before its table is read.",
          language: "tsx",
          code: `<div className="grid grid-cols-3 gap-3">
  <Tile value="12" label="Open bids" />
  <Tile value="4" label="Pending loads" />
  <Tile value="2" label="Holds" />
</div>`,
        },
        {
          title: "A framed table with two-line cells",
          description: "TableFrame supplies the plate; PanelEmpty is the frame's no-rows line.",
          language: "tsx",
          code: `<TableFrame>
  <Table>
    <TableBody>
      <TableRow>
        <TableCell>
          <TwoLine strong top="Cedar Bluff Farms" sub="12,400 bu" />
        </TableCell>
        <TableCell className="text-right">-0.42</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</TableFrame>`,
        },
      ],
    },
    {
      kind: "decisions",
      refs: [{ number: 65, title: "The v2 surface direction" }],
    },
  ],
})
