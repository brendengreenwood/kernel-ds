import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Dashboard — pattern doc entity. */
export const dashboardDoc: ComponentDoc = parseComponentDoc({
  id: "dashboard",
  name: "Dashboard",
  slug: "dashboard",
  summary:
    "An overview surface that composes KPI stats, charts, and summary tables so a user grasps the state of an operation at a glance and drills into what needs attention. It's a landing view, not a workspace — it answers \"how are things?\" and hands off to the detail views that answer \"what do I do?\".",
  status: "ready",
  sourceFiles: [],
  metadata: { owner: "ds", kind: "pattern" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Lead with the few figures that matter most — headline stats and a Chart or two — above the fold.",
        "Group related metrics into Cards so the eye can scan by area (positions, risk, activity).",
        "Make every summary a doorway: clicking a stat or chart segment should drill into the underlying records.",
      ],
      donts: [
        "Don't cram every available metric onto one screen — a dashboard that shows everything highlights nothing.",
        "Don't put primary data-entry or editing here; send users to the relevant workspace.",
        "Don't rely on color-coded KPIs alone — label the numbers and their direction.",
      ],
    },
    {
      kind: "useCases",
      use: [
        "A landing view summarizing the health of an operation.",
        "An at-a-glance KPI board with drill-through to detail.",
        "A daily-status surface for an ops team.",
      ],
      dontUse: [
        "Detailed record browsing or editing — use a workspace with a DataTable.",
        "A single record's detail — use a detail panel.",
        "A guided multi-step task — use a flow.",
      ],
    },
  ],
})
