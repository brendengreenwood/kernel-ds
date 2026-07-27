import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Textarea — component doc entity; parity-verified against source. */
export const textareaDoc: ComponentDoc = parseComponentDoc({
  id: "textarea",
  name: "Textarea",
  slug: "textarea",
  summary:
    "A multi-line text field for free-form content that runs longer than a single line — a note on a contract, a rejection reason, a comment. When the answer is short and structured (a name, an amount, a date), use an Input instead.",
  status: "ready",
  sourceFiles: ["textarea.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Pair every Textarea with a Label, and size the initial height to the expected answer — a couple of rows for a note, more for a description.",
        "Show a live character count when there's a limit, so the user isn't cut off mid-sentence.",
        "Let it grow (or scroll) gracefully with long content instead of clipping what the user typed.",
      ],
      donts: [
        "Don't use a Textarea for short, single-value answers — an Input signals the expected length better.",
        "Don't rely on the placeholder to explain formatting rules; put those in a description beneath the field.",
      ],
    },
    { kind: "anatomy", slots: ["textarea"] },
    {
      kind: "useCases",
      use: [
        "Capturing a free-form note, comment, or reason on a record.",
        "A description or message body where the user may write several sentences.",
        "Pasting in a block of text — an address, a list, an email snippet.",
      ],
      dontUse: [
        "Short structured values like a name, amount, or date — use an Input.",
        "Rich formatted content with headings or links — use a dedicated rich-text editor.",
      ],
    },
  ],
})
