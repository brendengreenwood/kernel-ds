import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Pane canvas — the floating-pane screen pattern (decision 0083). */
export const paneCanvasDoc: ComponentDoc = parseComponentDoc({
  id: "pane-canvas",
  name: "Pane canvas",
  slug: "pane-canvas",
  summary:
    "A screen where the content is a canvas and every control floats over it: a legend and notes in the top-left corner, detail panes stacked on the right, filters docked along the bottom, canvas controls stepping aside when a pane covers their corner. Phones and narrow canvases get the whole canvas plus a bottom bar.",
  status: "experimental",
  sourceFiles: ["panes.tsx"],
  metadata: { owner: "ds", kind: "pattern" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Give each region one job: corner for context, right stack for detail, bottom dock for filters.",
        "Open detail panes closed-by-default as pills; the canvas is the point of the screen.",
        "Keep a selected item's relationships visible even when filters would hide them — filters narrow the view, not the question.",
      ],
      donts: [
        "Don't nest panes inside one large invisible panel; each pane floats on its own.",
        "Don't move canvas controls under a pane; read the reserved edge and shift them.",
      ],
    },
    {
      kind: "useCases",
      use: [
        "Maps of sites, routes or territories.",
        "Large charts or diagrams that should keep the full width.",
      ],
      dontUse: ["Record pages and worksheets — use the app shell with connected panels."],
    },
    {
      kind: "decisions",
      refs: [{ number: 83, title: "Floating pane roles" }],
    },
  ],
})
