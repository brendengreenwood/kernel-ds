import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Accordion — component doc entity; parity-verified against source. */
export const accordionDoc: ComponentDoc = parseComponentDoc({
  id: "accordion",
  name: "Accordion",
  slug: "accordion",
  summary:
    "A stack of titled sections that expand and collapse, so a long page shows one part at a time — an FAQ, grouped settings, a segmented record. Use it when sections are peers and users read them one by one. For a single optional block, a Collapsible is simpler.",
  status: "ready",
  sourceFiles: ["accordion.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use an Accordion to break a long, sectioned page into digestible parts users open as needed — FAQ entries, settings groups.",
        "Write section headers that describe their content so users can decide what to open without expanding it.",
        "Choose single-open when sections compete for attention, or multi-open when users may want several at once.",
      ],
      donts: [
        "Don't hide content users need to see together or compare across sections — an Accordion fragments it.",
        "Don't nest Accordions deeply; layered collapsing quickly disorients.",
        "Don't use one for a single show/hide region — a Collapsible is the right size.",
      ],
    },
    {
      kind: "anatomy",
      slots: ["accordion", "accordion-item", "accordion-trigger", "accordion-trigger-icon", "accordion-content"],
    },
    {
      kind: "useCases",
      use: [
        "An FAQ or help section with many discrete questions.",
        "Grouped settings where users focus on one group at a time.",
        "A long record split into collapsible sections.",
      ],
      dontUse: [
        "One optional block — use a Collapsible.",
        "Content that must be read or compared together — keep it visible.",
        "Switching between mutually exclusive views — use Tabs.",
      ],
    },
  ],
})
