import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Date Picker — component doc entity; parity-verified against source. */
export const datePickerDoc: ComponentDoc = parseComponentDoc({
  id: "date-picker",
  name: "Date Picker",
  slug: "date-picker",
  summary:
    "A form field that opens a Calendar in a popover to choose a date or range without leaving the layout. It's the everyday way to enter a date in a form — combining a compact trigger with the grid's context. When the calendar should always be visible, use Calendar inline instead.",
  status: "ready",
  sourceFiles: ["calendar.tsx", "popover.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Date Picker for date fields in forms, where a trigger that reflects the chosen date keeps the layout compact.",
        "Show the selected date in the trigger in a clear, unambiguous format, and state the expected format or timezone when it matters.",
        "Disable out-of-range dates in the popover Calendar so invalid selections can't happen.",
      ],
      donts: [
        "Don't use a Date Picker when the calendar should stay open and central — use Calendar inline.",
        "Don't leave the trigger showing a raw or ambiguous date string (is 03/04 March 4th or April 3rd?).",
        "Don't ignore timezone for datetimes — be explicit so a deadline doesn't shift a day.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "calendar",
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
        "A date or date-range field inside a form — delivery date, contract term, reporting window.",
        "Any compact date entry where the calendar only needs to appear on demand.",
        "Range selection (start/end) from a single popover.",
      ],
      dontUse: [
        "A view where the calendar should always be visible — use Calendar.",
        "Fast entry of a well-known date — consider a masked Input.",
      ],
    },
  ],
})
