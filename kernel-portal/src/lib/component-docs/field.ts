import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Field — component doc entity; parity-verified against source. */
export const fieldDoc: ComponentDoc = parseComponentDoc({
  id: "field",
  name: "Field",
  slug: "field",
  summary:
    "The label, control, description, and error of one input, composed as a unit. Field owns the vertical rhythm and the invalid state so every form in the portal spaces and fails the same way. It carries no validation of its own — you pass it the error, it renders it.",
  status: "ready",
  sourceFiles: ["field.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Wrap every control in a Field, even one with no description. The consistent gap is the point, and adding a description later then costs nothing.",
        "Use FieldGroup as the container for a run of fields — it sets the gap between them and is what the responsive orientation measures against.",
        "Set data-invalid on the Field when the control is invalid; the label and the group inherit destructive text from it, so you set it in one place.",
        "Reach for FieldSet plus FieldLegend when the fields are genuinely a set — a radio group, a shipping window's from/to pair — so the grouping is in the accessibility tree, not just the layout.",
        "Pass react-hook-form errors straight to FieldError's errors prop. It de-duplicates them and renders one message or a list without you branching.",
      ],
      donts: [
        "Don't use Field to lay out a whole form's sections — that's FieldGroup plus FieldSeparator, or a Card.",
        "Don't hand-write the error paragraph under a control. FieldError carries role=\"alert\", so a hand-rolled div is silently worse for a screen reader.",
        "Don't set orientation=\"horizontal\" on a field whose description runs long — the description will fight the control for width. Use responsive and let it stack when it's tight.",
        "Don't duplicate the label as a placeholder. A placeholder disappears on focus, which is exactly when a slow reader needs it.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "orientation",
          defaultKey: "vertical",
          keys: [
            {
              key: "vertical",
              description:
                "Label above control. The default, and the right answer for anything a user types.",
            },
            {
              key: "horizontal",
              description:
                "Label beside control. For checkboxes, switches, and dense settings rows where the control is small and fixed-width.",
            },
            {
              key: "responsive",
              description:
                "Stacks below the field group's container breakpoint and goes horizontal above it. Use when the same form renders in both a dock panel and a full page.",
            },
          ],
        },
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "field-set",
        "field-legend",
        "field-group",
        "field",
        "field-content",
        "field-label",
        "field-description",
        "field-separator",
        "field-separator-content",
        "field-error",
      ],
    },
    {
      kind: "api",
      props: [
        {
          name: "orientation",
          type: '"vertical" | "horizontal" | "responsive"',
          default: '"vertical"',
          description:
            "On Field — how label and control stack. Also written to data-orientation, which the description reads to balance its text.",
        },
        {
          name: "variant",
          type: '"legend" | "label"',
          default: '"legend"',
          description:
            "On FieldLegend — legend is the larger fieldset heading; label matches a normal field label for a nested set.",
        },
        {
          name: "errors",
          type: "Array<{ message?: string } | undefined>",
          description:
            "On FieldError — the errors to render. Duplicates collapse; one message renders inline, several render as a list. Renders nothing when empty, so it's safe to leave mounted.",
        },
        {
          name: "children",
          type: "React.ReactNode",
          description:
            "On FieldSeparator — optional label that sits centered on the rule, e.g. \"or\". Sets data-content, which the separator uses to reserve space.",
        },
        {
          name: "className",
          type: "string",
          description: "Merged onto the slot you set it on.",
        },
      ],
    },
    {
      kind: "states",
      items: [
        {
          name: "default",
          description: "Label, control, and description at full contrast.",
        },
        {
          name: "invalid",
          description:
            "Set data-invalid on the Field. Text turns destructive and FieldError renders as an alert. Set aria-invalid on the control itself so its border follows.",
        },
        {
          name: "disabled",
          description:
            "Set data-disabled on the Field. The label and title drop to 50% opacity; disable the control separately so it actually stops taking input.",
        },
        {
          name: "checked",
          description:
            "A FieldLabel wrapping a checked control picks up a primary-tinted border and background — the treatment behind selectable option cards.",
        },
      ],
    },
    {
      kind: "useCases",
      use: [
        "Any labelled control in a form — contract terms, counterparty details, load schedules.",
        "Selectable option cards, by nesting a Field inside a FieldLabel around a radio or checkbox.",
        "Grouped inputs that need a legend in the accessibility tree, like a settlement date range.",
      ],
      dontUse: [
        "Form state, validation, or submission — that's Form, which binds react-hook-form and zod.",
        "A bare label with no control — use Label.",
        "Page-level section headings — use a heading and a Separator.",
      ],
    },
  ],
})
