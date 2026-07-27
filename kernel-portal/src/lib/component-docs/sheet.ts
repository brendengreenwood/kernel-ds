import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Sheet — component doc entity; parity-verified against source. */
export const sheetDoc: ComponentDoc = parseComponentDoc({
  id: "sheet",
  name: "Sheet",
  slug: "sheet",
  summary:
    "A panel that slides in from a screen edge to hold supplementary content or a longer form while the main view stays visible behind it. Use it when the user needs room to work but shouldn't lose their place — a detail inspector, a multi-field editor. For a short, blocking decision, a Dialog is tighter.",
  status: "ready",
  sourceFiles: ["sheet.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Reach for a Sheet when the content is too tall or too involved for a centered Dialog — a record inspector, a filter builder, a settings panel.",
        "Anchor it to the edge that matches the mental model: `right` for detail/inspectors, `left` for navigation, `bottom` for mobile actions.",
        "Give it a title and a clear close affordance, and keep the primary action visible without scrolling when you can.",
      ],
      donts: [
        "Don't use a Sheet for a one-line confirmation — that over-weights a small decision; use a Dialog or AlertDialog.",
        "Don't nest a Sheet inside a Dialog or another Sheet; layered overlays disorient users.",
        "Don't let a Sheet cover the very content it's meant to annotate if the user needs to see both.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "sheet",
        "sheet-trigger",
        "sheet-close",
        "sheet-portal",
        "sheet-overlay",
        "sheet-content",
        "sheet-header",
        "sheet-footer",
        "sheet-title",
        "sheet-description",
      ],
    },
    {
      kind: "useCases",
      use: [
        "A right-edge detail inspector for the row currently selected in a table.",
        "A longer edit form that would overflow a Dialog.",
        "A filter or configuration panel the user tweaks while watching results behind it.",
      ],
      dontUse: [
        "A short blocking confirmation — use a Dialog or AlertDialog.",
        "A quick anchored hint or menu — use a Popover or DropdownMenu.",
        "Primary navigation that should always be present — use a Sidebar.",
      ],
    },
  ],
})
