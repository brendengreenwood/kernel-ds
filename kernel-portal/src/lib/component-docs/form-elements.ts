import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Form Elements — element doc entity; parity-verified against source. */
export const formElementsDoc: ComponentDoc = parseComponentDoc({
  id: "form-elements",
  name: "Form Elements",
  slug: "form-elements",
  summary:
    "The building blocks that wrap a control with its label, description, and validation message — the FormItem/FormLabel/FormDescription/FormMessage set. They give every field a consistent structure so labels, help text, and errors line up the same way across every form.",
  status: "ready",
  sourceFiles: ["form.tsx"],
  metadata: { owner: "ds", kind: "element" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Wrap each control in a FormItem so its label, help text, and error stay grouped and aligned.",
        "Use FormLabel for every field and FormDescription for guidance the user needs before they act.",
        "Put validation feedback in FormMessage so errors appear in a predictable place, tied to the field.",
      ],
      donts: [
        "Don't hand-place labels and error text outside this structure — the spacing and wiring drift.",
        "Don't use FormDescription as a substitute for a label; the label names the field.",
        "Don't show an error with no FormMessage anchor — screen readers won't associate it with the input.",
      ],
    },
    {
      kind: "anatomy",
      slots: ["form-item", "form-label", "form-description", "form-message"],
    },
    {
      kind: "useCases",
      use: [
        "Structuring any field inside a Form so label/help/error are consistent.",
        "Adding inline guidance under a control with FormDescription.",
        "Surfacing per-field validation via FormMessage.",
      ],
      dontUse: [
        "Standalone labels outside a form context — use Label.",
        "Page-level error summaries — use an Alert.",
        "Non-form layout grouping — use a Card or a plain container.",
      ],
    },
  ],
})
