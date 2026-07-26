import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Calendar — component doc entity; parity-verified against source. */
export const calendarDoc: ComponentDoc = parseComponentDoc({
  id: "calendar",
  name: "Calendar",
  slug: "calendar",
  summary:
    "A month grid for picking a date or a date range, showing days in context so weekends, gaps, and spans are visible. Use it inline when the calendar is central to the task; to pick a date inside a form, wrap it in a DatePicker so it opens from a field.",
  status: "ready",
  sourceFiles: ["calendar.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use an inline Calendar when choosing a date is the main event and seeing surrounding days matters — scheduling, range selection.",
        "Disable dates that aren't selectable (past dates, blackout days) so invalid picks are impossible, not just corrected.",
        "Mark today and the selected day clearly, and support keyboard arrow navigation across the grid.",
      ],
      donts: [
        "Don't drop a full Calendar into a compact form when a DatePicker's popover would do — it eats vertical space.",
        "Don't leave disabled dates ambiguous; if a day can't be chosen, it should look and behave unselectable.",
        "Don't use a Calendar for a single free-typed date when a masked Input is faster for the user.",
      ],
    },
    { kind: "anatomy", slots: ["calendar"] },
    {
      kind: "useCases",
      use: [
        "Inline date or range selection where surrounding days give useful context.",
        "A scheduling view where the month grid is the primary surface.",
        "The picker rendered inside a DatePicker's popover.",
      ],
      dontUse: [
        "A compact form date field — use a DatePicker.",
        "Fast entry of a known date — a masked Input may be quicker.",
        "Displaying events on a timeline — use a dedicated calendar/agenda view.",
      ],
    },
  ],
})
