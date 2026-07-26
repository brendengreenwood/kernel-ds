import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Alert Dialog — component doc entity; parity-verified against source. */
export const alertDialogDoc: ComponentDoc = parseComponentDoc({
  id: "alert-dialog",
  name: "Alert Dialog",
  slug: "alert-dialog",
  summary:
    "A modal that stops the user to confirm a consequential, usually irreversible action — deleting a shipment, voiding a contract, revoking access. Unlike a plain Dialog, it can't be dismissed by clicking away: the user must make an explicit choice. That friction is the point.",
  status: "ready",
  sourceFiles: ["alert-dialog.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use it whenever an action can't be easily undone, and name the exact consequence in the body — \"This permanently deletes 3 shipments and their documents.\"",
        "Label the action button with the verb, not \"OK\" — \"Delete\", \"Void\", \"Revoke\" — and style destructive ones with the `destructive` variant.",
        "Keep \"Cancel\" as the safe default focus target so an accidental Enter doesn't fire the dangerous path.",
      ],
      donts: [
        "Don't use an Alert Dialog for routine, reversible confirmations — the constant interruption trains users to click through it.",
        "Don't allow overlay-click or Escape to trigger the destructive action; only the explicit button should.",
        "Don't hide what will happen behind a vague message — \"Are you sure?\" tells the user nothing.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "alert-dialog",
        "alert-dialog-trigger",
        "alert-dialog-portal",
        "alert-dialog-overlay",
        "alert-dialog-content",
        "alert-dialog-header",
        "alert-dialog-footer",
        "alert-dialog-media",
        "alert-dialog-title",
        "alert-dialog-description",
        "alert-dialog-action",
        "alert-dialog-cancel",
      ],
    },
    {
      kind: "useCases",
      use: [
        "Confirming a destructive action — delete, void, terminate, revoke.",
        "A last checkpoint before something that can't be walked back (a bulk operation, a permanent state change).",
        "Acknowledging a serious warning the user must read before proceeding.",
      ],
      dontUse: [
        "Everyday reversible confirmations — a Dialog or an undo toast fits better.",
        "Collecting input or editing — use a Dialog.",
        "Passive information — use an Alert banner or Sonner.",
      ],
    },
  ],
})
