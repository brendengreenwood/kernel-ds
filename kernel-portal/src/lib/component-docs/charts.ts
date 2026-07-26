import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Charts — element doc entity; parity-verified against source. */
export const chartsDoc: ComponentDoc = parseComponentDoc({
  id: "charts",
  name: "Charts",
  slug: "charts",
  summary:
    "The charting element — the themed surface for rendering data visualizations that inherit the design system's colors, tooltips, and legends. Use it to turn a trend or comparison into a shape that reads faster than a column of numbers; keep the underlying figures reachable when precision matters.",
  status: "ready",
  sourceFiles: ["chart.tsx"],
  metadata: { owner: "ds", kind: "element" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Choose the chart type for the question — line for trend, bar for comparison, area for cumulative totals.",
        "Use the chart color tokens for series so visualizations stay consistent and theme-aware, and label axes and units.",
        "Provide the numbers behind the picture (tooltips or an adjacent table) for users who need exact values.",
      ],
      donts: [
        "Don't mislead with truncated axes or gratuitous 3D — start value axes at a sensible baseline.",
        "Don't overload one chart with series until it's unreadable; split or let users toggle.",
        "Don't encode meaning in color alone — add labels or patterns so it survives grayscale.",
      ],
    },
    { kind: "anatomy", slots: ["chart"] },
    {
      kind: "useCases",
      use: [
        "A trend line of a metric over time on a dashboard.",
        "A bar comparison across categories — volume by commodity.",
        "A compact area or sparkline inside a card.",
      ],
      dontUse: [
        "Precise value lookup — pair with or use a Table.",
        "A single number — use a stat/KPI display.",
        "Tabular detail that isn't about a trend or comparison.",
      ],
    },
  ],
})
