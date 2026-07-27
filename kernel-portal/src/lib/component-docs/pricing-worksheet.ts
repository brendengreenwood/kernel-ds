import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Pricing Worksheet — pattern doc entity. */
export const pricingWorksheetDoc: ComponentDoc = parseComponentDoc({
  id: "pricing-worksheet",
  name: "Pricing Worksheet",
  slug: "pricing-worksheet",
  summary:
    "A calculating surface for building up a price — futures plus basis, adjustments, fees — with each line contributing to a live total. It composes labeled inputs and a running result so a trader can see how every component moves the final number before committing it.",
  status: "ready",
  sourceFiles: [],
  metadata: { owner: "ds", kind: "pattern" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Lay out each price component as a labeled line (futures, basis, adjustments, fees) that visibly rolls into the total.",
        "Recalculate and show the running total immediately as inputs change, using AnimatedNumber to draw the eye to the result.",
        "Format every figure as currency with consistent precision so the math is legible.",
      ],
      donts: [
        "Don't hide how the total is derived — a single opaque number the user can't trace erodes trust.",
        "Don't let rounding drift between the lines and the total; reconcile them.",
        "Don't commit a computed price without a clear confirm step showing the final figure.",
      ],
    },
    {
      kind: "useCases",
      use: [
        "Building a contract price from futures, basis, and adjustments.",
        "A what-if surface for testing how inputs move the total.",
        "The pricing step inside an origination flow.",
      ],
      dontUse: [
        "Displaying a single fixed price — just show the value.",
        "Browsing historical prices — use a Table or Chart.",
        "General numeric entry unrelated to a running total.",
      ],
    },
  ],
})
