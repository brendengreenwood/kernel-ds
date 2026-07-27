import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Dialog — component doc entity; parity-verified against source. */
export const dialogDoc: ComponentDoc = parseComponentDoc({
  id: "dialog",
  name: "Dialog",
  slug: "dialog",
  summary:
    "A modal overlay that interrupts the flow to focus the user on one task or decision — a quick edit, a confirmation, a short focused form. It traps focus and dims the page behind it, so use it only when the interruption is warranted. For an irreversible action, use AlertDialog; for content the user keeps referencing, use a Sheet.",
  status: "ready",
  sourceFiles: ["dialog.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Reach for a Dialog when the task is short and demands the user's full attention — confirming a submission, editing a single record, resolving one decision.",
        "Give every Dialog a `DialogTitle` (even visually hidden) so assistive tech announces what opened, and a `DialogDescription` when the purpose needs a sentence.",
        "Put the primary action last in the footer as a `default` button and the escape hatch (\"Cancel\") beside it; let Escape and the overlay click close it.",
        "Return focus to the trigger when the Dialog closes so keyboard users don't lose their place.",
      ],
      donts: [
        "Don't stack a Dialog on top of another Dialog — if one action needs confirming, that's a moment for AlertDialog, not a second modal.",
        "Don't pour a long, scrolling, multi-step flow into a Dialog; that belongs on a page or in a Sheet.",
        "Don't use a Dialog for a passing notification — that's Sonner's job, and it shouldn't block the page.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "dialog",
        "dialog-trigger",
        "dialog-portal",
        "dialog-close",
        "dialog-overlay",
        "dialog-content",
        "dialog-header",
        "dialog-body",
        "dialog-footer",
        "dialog-title",
        "dialog-description",
      ],
    },
    {
      kind: "useCases",
      use: [
        "Confirming a consequential but reversible action before it runs.",
        "A focused quick-edit of one record or field without leaving the current view.",
        "A short form — inviting a user, creating a single entity — that doesn't warrant a full page.",
      ],
      dontUse: [
        "Irreversible actions like delete or void — use AlertDialog so the choice is deliberate.",
        "Reference content the user needs while they work — use a Sheet or Popover.",
        "Transient status messages — use Sonner.",
      ],
    },
  ],
})
