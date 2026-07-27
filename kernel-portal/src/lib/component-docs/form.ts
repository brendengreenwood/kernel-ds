import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Form — component doc entity; parity-verified against source. */
export const formDoc: ComponentDoc = parseComponentDoc({
  id: "form",
  name: "Form",
  slug: "form",
  summary:
    "The wiring that binds a field to its label, description, validation, and error message. It's not a visual control — it's the structure that keeps a control accessible and its state consistent, so `FormItem`/`FormLabel`/`FormMessage` stay in sync with the field's value and errors.",
  status: "ready",
  sourceFiles: ["form.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Wrap each field in a `FormItem` so its Label, control, description, and message share the same id wiring and error state automatically.",
        "Validate on submit (and re-validate on change once a field has errored) so users aren't scolded before they've finished typing.",
        "Show errors inline in `FormMessage` next to the offending field, and move focus to the first error on a failed submit.",
      ],
      donts: [
        "Don't hand-roll `htmlFor`/`aria-describedby` when `FormItem` already manages them — you'll drift out of sync.",
        "Don't disable the submit button as the only signal a form is invalid; show what's wrong so the user can fix it.",
        "Don't bury all errors in a single banner at the top when they belong beside individual fields.",
      ],
    },
    { kind: "anatomy", slots: ["form-item", "form-label", "form-description", "form-message"] },
    {
      kind: "useCases",
      use: [
        "Any multi-field form that needs validation and per-field error messages — record create/edit, settings.",
        "Wiring a control's label, help text, and error into one accessible unit.",
        "Coordinating submit-time validation with focus management.",
      ],
      dontUse: [
        "A single unmanaged input with no validation — a plain Input plus Label is enough.",
        "Laying out non-form content — Form is about field state, not general layout.",
      ],
    },
  ],
})
