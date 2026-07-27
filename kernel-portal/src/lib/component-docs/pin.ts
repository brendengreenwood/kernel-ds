import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Pin — mark doc entity; parity-verified against source. */
export const pinDoc: ComponentDoc = parseComponentDoc({
  id: "pin",
  name: "Pin",
  slug: "pin",
  summary:
    "A positioned marker that binds a record to a spot on a map or spatial layout — a facility, a delivery point, a route node. It's a data mark (decision 0027), so its tone carries meaning: use `destructive` for a problem location, `muted` for context, `default` for the focus.",
  status: "ready",
  sourceFiles: ["marks/pin.tsx"],
  metadata: { owner: "ds", kind: "mark" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Pin to anchor a record to a coordinate — a warehouse, an elevator, a shipment's current position.",
        "Let tone encode state: `destructive` for an alerting location, `muted` for background context, `default` for the item in focus.",
        "Cluster or thin pins at low zoom so a dense map stays legible, and make each pin selectable to open its record.",
      ],
      donts: [
        "Don't use a Pin off a spatial surface — for inline status, use a StatusBadge or a dot.",
        "Don't rely on color alone; pair tone with a shape, label, or count for color-blind users.",
        "Don't leave hundreds of overlapping pins uncustered — the map becomes unreadable.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "variant",
          defaultKey: "default",
          keys: [
            { key: "default", description: "The focused or standard marker." },
            { key: "muted", description: "Low-emphasis context pin that recedes behind the focus." },
            { key: "destructive", description: "An alerting or problem location that needs attention." },
          ],
        },
        {
          axis: "size",
          defaultKey: "default",
          keys: [
            { key: "sm", description: "Compact marker for dense maps or many points." },
            { key: "default", description: "Standard marker size." },
          ],
        },
      ],
    },
    {
      kind: "useCases",
      use: [
        "Marking facilities, delivery points, or assets on a map.",
        "Highlighting a record's location while others sit muted for context.",
        "Flagging an alerting location with the destructive tone.",
      ],
      dontUse: [
        "Inline record status — use a StatusBadge.",
        "A commodity indicator — use CommodityBadge.",
        "Non-spatial layouts with no coordinate meaning.",
      ],
    },
  ],
})
