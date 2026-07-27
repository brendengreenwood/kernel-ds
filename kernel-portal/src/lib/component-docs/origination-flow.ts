import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Origination Flow — pattern doc entity. */
export const originationFlowDoc: ComponentDoc = parseComponentDoc({
  id: "origination-flow",
  name: "Origination Flow",
  slug: "origination-flow",
  summary:
    "The guided path for originating a new contract — capturing counterparty, commodity, quantity, and terms, pricing it, then confirming and posting. It's a domain flow that turns a multi-part trading task into ordered, validated steps so nothing books with missing or inconsistent terms.",
  status: "ready",
  sourceFiles: [],
  metadata: { owner: "ds", kind: "pattern" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Sequence the steps the way the deal comes together — counterparty and commodity first, then quantity and terms, then pricing and confirmation.",
        "Use CommodityBadge and the tone system so commodity and status read consistently throughout the flow.",
        "Validate each step (valid counterparty, in-range quantity, complete terms) before allowing the contract to post.",
      ],
      donts: [
        "Don't let a contract post with incomplete or inconsistent terms — gate the final step on validation.",
        "Don't lose entered deal terms when the user steps back to revise an earlier stage.",
        "Don't bury the running price/summary; keep the deal's shape visible as it's built.",
      ],
    },
    {
      kind: "useCases",
      use: [
        "Originating a new spot or forward contract step by step.",
        "Capturing and validating deal terms before booking.",
        "Guiding a trader through pricing and confirmation.",
      ],
      dontUse: [
        "Editing an existing contract's single field — use an inline edit or Dialog.",
        "Browsing existing contracts — use a DataTable workspace.",
        "A non-sequential settings task.",
      ],
    },
  ],
})
