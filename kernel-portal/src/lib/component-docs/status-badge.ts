import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/**
 * StatusBadge — persistent lifecycle state for a load or contract. CVA-driven
 * single axis: `status` (10 keys). Source truth verified against
 * `status-badge.tsx` (1 slot, 2 exports).
 */
export const statusBadgeDoc: ComponentDoc = parseComponentDoc({
  id: "status-badge",
  name: "StatusBadge",
  slug: "status-badge",
  summary: "A persistent lifecycle state an object sits in.",
  status: "ready",
  sourceFiles: ["status-badge.tsx"],
  metadata: { owner: "ds", kind: "display" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use for a stable state an object rests in — draft, in transit, settled.",
        "Let the badge render its default label; override the text only when the domain needs it.",
        "Keep a column of badges scannable — each status maps to its own hue.",
      ],
      donts: [
        "Don't use StatusBadge for the outcome of a momentary event — use `<Badge>` for that.",
        "Don't invent statuses outside the declared set; extend the model instead.",
        "Don't rely on color alone — the leading dot plus label carry meaning together.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "status",
          keys: [
            "draft",
            "pending",
            "booked",
            "in_transit",
            "delivered",
            "settled",
            "on_hold",
            "rejected",
            "cancelled",
            "expired",
          ],
          defaultKey: "draft",
        },
      ],
    },
    { kind: "anatomy", slots: ["status-badge"] },
    {
      kind: "api",
      props: [
        { name: "status", type: "Status", default: "\"draft\"", description: "Lifecycle state; drives hue and default label." },
        { name: "children", type: "ReactNode", description: "Optional label override." },
        { name: "className", type: "string", description: "Merged with the variant classes." },
      ],
    },
  ],
})
