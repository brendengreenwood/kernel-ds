import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Popover — component doc entity; parity-verified against source. */
export const popoverDoc: ComponentDoc = parseComponentDoc({
  id: "popover",
  name: "Popover",
  slug: "popover",
  summary:
    "A small floating panel anchored to a trigger, holding light interactive content — a compact form, a set of options, a bit of contextual detail. It's non-modal: the page stays live behind it and a click outside closes it. For read-only hint text, use a Tooltip; for a list of actions, use a DropdownMenu.",
  status: "ready",
  sourceFiles: ["popover.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Popover for a little interaction anchored to its trigger — a date shortcut, a quick filter, a two-field mini-form.",
        "Keep it small and self-contained; if it needs scrolling or several sections, it wants a Sheet or Dialog.",
        "Position it so it doesn't cover the trigger or the thing it describes, and let click-outside and Escape dismiss it.",
      ],
      donts: [
        "Don't put static hint text in a Popover the user must click to open — use a Tooltip that shows on hover/focus.",
        "Don't use a Popover for a menu of commands; a DropdownMenu has the right keyboard model.",
        "Don't cram a long form into it — the cramped space and easy dismissal cost users their work.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "popover",
        "popover-trigger",
        "popover-content",
        "popover-header",
        "popover-title",
        "popover-description",
      ],
    },
    {
      kind: "useCases",
      use: [
        "A compact anchored control — a quick filter, a color or date shortcut, a small settings cluster.",
        "Contextual detail or a mini-form summoned from a button or field.",
        "Progressive disclosure of secondary options next to their trigger.",
      ],
      dontUse: [
        "Read-only hover hints — use a Tooltip.",
        "A list of commands or actions — use a DropdownMenu.",
        "A large or multi-step form — use a Sheet or Dialog.",
      ],
    },
  ],
})
