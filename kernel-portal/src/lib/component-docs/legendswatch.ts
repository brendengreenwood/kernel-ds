import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Legend Swatch — mark doc entity; parity-verified against source. */
export const legendswatchDoc: ComponentDoc = parseComponentDoc({
  id: "legendswatch",
  name: "Legend Swatch",
  slug: "legendswatch",
  summary:
    "A small shape-and-color chip that ties a legend entry to the series it represents on a chart, plot, or map. It's the key that makes an encoding readable — the swatch's shape and color must match exactly what's drawn, or the legend lies.",
  status: "ready",
  sourceFiles: ["marks/legend-swatch.tsx"],
  metadata: { owner: "ds", kind: "mark" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Match the swatch's color and shape precisely to the series it labels, so the legend and the plot agree.",
        "Use the shape axis (square/circle/line) to mirror how the data is drawn — a line series gets a line swatch.",
        "Pair every swatch with a clear text label; the color is a shortcut, not the identity.",
      ],
      donts: [
        "Don't invent a color or shape that isn't used in the visualization — the swatch must reference real marks.",
        "Don't rely on color alone to distinguish series; shape and label carry it for color-blind users.",
        "Don't use a Legend Swatch as a generic status dot — it belongs to a chart legend.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "shape",
          defaultKey: "square",
          keys: [
            { key: "square", description: "For area, bar, or filled-region series." },
            { key: "circle", description: "For scatter or point series." },
            { key: "line", description: "For line or trend series." },
          ],
        },
        {
          axis: "size",
          defaultKey: "default",
          keys: [
            { key: "sm", description: "Compact swatch for dense legends." },
            { key: "default", description: "Standard swatch size." },
          ],
        },
      ],
    },
    {
      kind: "useCases",
      use: [
        "The key beside a chart or plot mapping color/shape to series.",
        "A map legend tying pin tones to categories.",
        "Any legend where an encoding needs a visible reference.",
      ],
      dontUse: [
        "Inline record status — use a StatusBadge.",
        "A standalone category tag — use a Badge.",
        "A commodity label — use CommodityBadge.",
      ],
    },
  ],
})
