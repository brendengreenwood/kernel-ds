import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Chart — component doc entity; parity-verified against source. */
export const chartDoc: ComponentDoc = parseComponentDoc({
  id: "chart",
  name: "Chart",
  slug: "chart",
  summary:
    "A themed wrapper for rendering data visualizations — lines, bars, areas — that inherit the design system's colors, tooltips, and legend styling. Use it to show trends and comparisons where a shape reads faster than a table of numbers. When users need exact values, keep a table alongside it.",
  status: "ready",
  sourceFiles: ["chart.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Pick the chart type for the question — lines for trend over time, bars for comparison across categories, area for cumulative totals.",
        "Use the system's chart tokens for series colors so visualizations stay consistent and theme-aware, and label axes and units.",
        "Provide the underlying numbers too (a table or tooltips) for users who need precision, not just the shape.",
      ],
      donts: [
        "Don't distort the story — truncated axes and 3D effects mislead; start value axes at a sensible baseline.",
        "Don't cram many series into one chart until it's unreadable; split or let users toggle series.",
        "Don't encode meaning in color alone — add labels or patterns so the chart survives color-blindness and grayscale.",
      ],
    },
    { kind: "anatomy", slots: ["chart"] },
    {
      kind: "useCases",
      use: [
        "A trend line of a metric over time on a dashboard.",
        "A bar comparison across categories — volume by commodity, count by status.",
        "A compact sparkline or area summarizing movement inside a card.",
      ],
      dontUse: [
        "Precise value lookup — pair with or use a Table.",
        "A single number — use a stat/KPI display.",
        "Tabular detail that isn't really about a trend or comparison.",
      ],
    },
  ],
})
