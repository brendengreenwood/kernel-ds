import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/**
 * ScrollArea + Resizable — documented together under the shared `scroll-area`
 * gallery slug (cluster title "Scroll area · Resizable"). Neither uses CVA;
 * both are slot-shaped. Source truth verified against `scroll-area.tsx`
 * (4 slots) and `resizable.tsx` (3 slots) — the shared-slug parity case.
 */
export const scrollAreaDoc: ComponentDoc = parseComponentDoc({
  id: "scroll-area",
  name: "Scroll area",
  slug: "scroll-area",
  summary: "Custom-styled overflow scrolling and adjustable resizable panels.",
  status: "ready",
  sourceFiles: ["scroll-area.tsx", "resizable.tsx"],
  metadata: { owner: "ds", kind: "layout" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use ScrollArea to give overflowing content a consistent, styled scrollbar.",
        "Use ResizablePanelGroup with a `direction` and place a ResizableHandle between each pair of panels.",
        "Give resizable panels a `minSize` so they can't collapse to zero.",
      ],
      donts: [
        "Don't reach for ScrollArea when native overflow is fine — it's for styled, contained regions.",
        "Don't nest ResizablePanelGroups in the same direction; alternate horizontal and vertical.",
        "Don't use a resizable group for a simple two-column layout — use CSS grid.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "scroll-area",
        "scroll-area-viewport",
        "scroll-area-scrollbar",
        "scroll-area-thumb",
        "resizable-panel-group",
        "resizable-panel",
        "resizable-handle",
      ],
    },
    {
      kind: "api",
      props: [
        { name: "className", type: "string", description: "Merged onto the root slot." },
      ],
    },
    {
      kind: "decisions",
      refs: [{ number: 29, title: "Workspace anatomy" }],
    },
  ],
})
