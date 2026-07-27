import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Separator — component doc entity; parity-verified against source. */
export const separatorDoc: ComponentDoc = parseComponentDoc({
  id: "separator",
  name: "Separator",
  slug: "separator",
  summary:
    "A thin rule that divides content into groups. Use it to signal a break in meaning the layout alone doesn't make clear — between a record's header and its body, or between action groups in a toolbar. When spacing already separates things cleanly, you don't need one.",
  status: "ready",
  sourceFiles: ["separator.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Reach for a Separator when two groups sit close together and the boundary between them carries meaning — a `horizontal` rule under a card header, a `vertical` one between toolbar button clusters.",
        "Set `orientation` to match the flow: `vertical` needs a parent with a defined height (a flex row), or it collapses to nothing.",
        "Prefer whitespace first; add a Separator only when the gap alone leaves the grouping ambiguous.",
      ],
      donts: [
        "Don't stack a Separator between every item in a list — the repetition adds noise and the rules stop meaning anything. Group with spacing instead.",
        "Don't use a Separator as decoration or a full-width divider for visual rhythm; that's the layout's job, not a semantic rule's.",
      ],
    },
    { kind: "anatomy", slots: ["separator"] },
    {
      kind: "useCases",
      use: [
        "Splitting a record header from its detail body inside a Card or dock panel.",
        "Dividing action clusters in a toolbar — a `vertical` rule between \"edit\" and \"share\" groups.",
        "Breaking a DropdownMenu or ContextMenu into logical sections.",
      ],
      dontUse: [
        "Fencing every row of a list — use `divide-y` spacing so the rules don't overwhelm the content.",
        "Drawing a purely decorative line — reach for layout spacing or a border on the container.",
      ],
    },
  ],
})
