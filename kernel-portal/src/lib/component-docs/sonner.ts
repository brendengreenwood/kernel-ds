import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Sonner — component doc entity; parity-verified against source. */
export const sonnerDoc: ComponentDoc = parseComponentDoc({
  id: "sonner",
  name: "Sonner",
  slug: "sonner",
  summary:
    "A toast system for brief, self-dismissing confirmations that don't block the user — \"Contract saved\", \"Export started\". It reports that something happened without demanding attention. For a message that must persist in context, use an Alert; for one that must be acted on, use a Dialog.",
  status: "ready",
  sourceFiles: ["sonner.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Fire a toast to confirm an action the user just took, so they get feedback without an interruption.",
        "Keep the message to one line, and attach an action (\"Undo\") when the operation is reversible.",
        "Let toasts auto-dismiss on a sensible timeout, and stack them so a burst doesn't overwhelm the corner.",
      ],
      donts: [
        "Don't put critical information or required actions in a toast — it vanishes and may be missed entirely.",
        "Don't use a toast for a persistent condition (a form error, a system outage) — that's an Alert.",
        "Don't flood the screen with a toast per item in a bulk action; summarize into one.",
      ],
    },
    {
      kind: "useCases",
      use: [
        "Confirming a save, send, or background job kicked off.",
        "An undoable action with an inline \"Undo\" affordance.",
        "Low-stakes status updates that don't need to persist.",
      ],
      dontUse: [
        "Errors or notices that must stay visible — use an Alert.",
        "Anything requiring a decision — use a Dialog or AlertDialog.",
        "Per-field form validation — use inline FormMessage.",
      ],
    },
  ],
})
