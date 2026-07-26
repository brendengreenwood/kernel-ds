import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Collapsible — component doc entity; parity-verified against source. */
export const collapsibleDoc: ComponentDoc = parseComponentDoc({
  id: "collapsible",
  name: "Collapsible",
  slug: "collapsible",
  summary:
    "A single trigger that shows or hides one region of content. Use it to tuck away secondary detail — advanced filters, an optional note, a rarely-read audit trail — so the primary view stays uncluttered until the user asks for more. For several independent sections, use Accordion instead.",
  status: "ready",
  sourceFiles: ["collapsible.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Reach for Collapsible when one block of detail is optional and most users can ignore it — \"Advanced options\" under a form, extra metadata on a record.",
        "Make the trigger describe what's hidden (\"Show 4 more line items\"), and rotate a chevron so the open/closed state reads at a glance.",
        "Default to collapsed when the content is genuinely secondary; default to open only when most users will want it.",
      ],
      donts: [
        "Don't hide anything required to complete the task — a validation error or a mandatory field must never live behind a closed Collapsible.",
        "Don't chain several Collapsibles where one section's state should close the others; that's Accordion's job.",
      ],
    },
    { kind: "anatomy", slots: ["collapsible", "collapsible-trigger", "collapsible-content"] },
    {
      kind: "useCases",
      use: [
        "An \"Advanced filters\" region beneath a search bar that stays out of the way until needed.",
        "Optional detail on a record — internal notes, revision history — folded under the primary fields.",
        "A long list truncated to a few rows with a \"Show all\" trigger.",
      ],
      dontUse: [
        "A set of mutually exclusive sections where opening one should collapse the rest — use Accordion.",
        "Concealing required inputs or error messages the user must act on.",
      ],
    },
  ],
})
