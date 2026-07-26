import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Modals — pattern doc entity. */
export const modalsDoc: ComponentDoc = parseComponentDoc({
  id: "modals",
  name: "Modals",
  slug: "modals",
  summary:
    "The family of layered surfaces that interrupt the flow to focus the user — Dialog for a focused task, AlertDialog for a decision that must be made, Sheet and Drawer for edge panels. Choosing the right one is about how much the interruption should block and how much room the content needs.",
  status: "ready",
  sourceFiles: [],
  metadata: { owner: "ds", kind: "pattern" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Dialog for a focused task, an AlertDialog for an unavoidable decision, and a Sheet or Drawer for larger side content.",
        "Keep modal content to a single task, and always provide a clear way out (Cancel, close, or Escape).",
        "Return focus to the trigger when the layer closes so keyboard users aren't stranded.",
      ],
      donts: [
        "Don't stack modals on modals — resolve one interruption before opening another.",
        "Don't use a blocking modal for information a toast or Alert could carry.",
        "Don't put long, scrollable, or multi-step content in a centered Dialog — use a Sheet, Drawer, or page.",
      ],
    },
    {
      kind: "useCases",
      use: [
        "A focused create/edit task in a Dialog.",
        "A destructive confirmation in an AlertDialog.",
        "Supplementary detail or a side form in a Sheet or Drawer.",
      ],
      dontUse: [
        "Transient confirmations — use Sonner.",
        "Persistent contextual notices — use an Alert.",
        "Primary content that belongs on a page.",
      ],
    },
  ],
})
