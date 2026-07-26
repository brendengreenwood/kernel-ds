import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Plot — mark doc entity; parity-verified against source. */
export const plotDoc: ComponentDoc = parseComponentDoc({
  id: "plot",
  name: "Plot",
  slug: "plot",
  summary:
    "A single data point rendered as a shape on a chart or scatter surface — the atom a scatter plot is built from. It's a data mark (decision 0027): its shape and size encode a dimension, so a triangle vs. a dot, or a large vs. small point, must mean something consistent.",
  status: "ready",
  sourceFiles: ["marks/plot.tsx"],
  metadata: { owner: "ds", kind: "mark" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use the shape axis to encode a categorical dimension consistently — the same category always gets the same shape.",
        "Use size to encode magnitude when a third dimension matters (a bubble-style plot), and keep the scale honest.",
        "Give each shape a matching Legend Swatch so readers can decode what dot vs. triangle means.",
      ],
      donts: [
        "Don't mix shapes arbitrarily; if shape doesn't encode anything, use one shape for all points.",
        "Don't scale point size in a way that distorts magnitude — area should track the value.",
        "Don't rely on shape or color alone without a legend to decode it.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "shape",
          defaultKey: "dot",
          keys: [
            { key: "dot", description: "The default point marker." },
            { key: "square", description: "A second categorical encoding." },
            { key: "triangle", description: "A third categorical encoding." },
            { key: "diamond", description: "A fourth categorical encoding." },
          ],
        },
        {
          axis: "size",
          defaultKey: "default",
          keys: [
            { key: "sm", description: "Small point for dense plots or low magnitude." },
            { key: "default", description: "Standard point size." },
            { key: "lg", description: "Large point for emphasis or high magnitude." },
          ],
        },
      ],
    },
    {
      kind: "useCases",
      use: [
        "Points in a scatter plot where shape encodes a category.",
        "A bubble plot where size encodes a magnitude.",
        "Any per-datum mark on a plotting surface.",
      ],
      dontUse: [
        "Trend lines or bars — use the Chart component's series types.",
        "Spatial map markers — use a Pin.",
        "Inline status or tags — use StatusBadge or Badge.",
      ],
    },
  ],
})
