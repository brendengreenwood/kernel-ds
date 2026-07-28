import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Native Select — component doc entity; parity-verified against source. */
export const nativeSelectDoc: ComponentDoc = parseComponentDoc({
  id: "native-select",
  name: "Native Select",
  slug: "native-select",
  summary:
    "A real <select>, styled to match the rest of the controls. It trades the styling freedom of Select for the platform's own picker — the iOS wheel, the Android sheet, the OS dropdown — plus native type-ahead and form submission for free. On a long list on a phone, that trade is usually worth taking.",
  status: "ready",
  sourceFiles: ["native-select.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Reach for it when the options are plain text and the form is likely to be filled on a phone — the native picker is faster than any menu we could build.",
        "Use it inside a plain HTML form post, where a real select submits its value with no JavaScript involved.",
        "Use NativeSelectOption and NativeSelectOptGroup rather than bare option and optgroup, so option text stays legible in dark mode on Windows.",
        "Match the size to its neighbours — the default height is the same control height token Input and Select use, so a mixed row lines up.",
      ],
      donts: [
        "Don't use it when options need icons, badges, descriptions, or a status dot. The browser renders option text and nothing else — use Select.",
        "Don't use it when the list needs search or grouping beyond optgroup — use Combobox.",
        "Don't restyle the open list. The dropdown belongs to the OS; anything you write there is ignored on some platform.",
        "Don't leave the first option as a placeholder without disabling it, or it becomes a silently valid answer.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "native-select-wrapper",
        "native-select",
        "native-select-icon",
        "native-select-option",
        "native-select-optgroup",
      ],
    },
    {
      kind: "api",
      props: [
        {
          name: "size",
          type: '"default" | "sm"',
          default: '"default"',
          description:
            "Control height, from the same tokens as Input and Select. Written to data-size on both the wrapper and the select.",
        },
        {
          name: "disabled",
          type: "boolean",
          description:
            "Standard select disabling. The wrapper reads it and dims the chevron along with the control.",
        },
        {
          name: "className",
          type: "string",
          description:
            "Merged onto the wrapper, so width and margin utilities apply to the whole control including the chevron.",
        },
      ],
    },
    {
      kind: "states",
      items: [
        { name: "default", description: "Resting control with the chevron on the trailing edge." },
        {
          name: "focus-visible",
          description: "Ring and border, matching Input and the Select trigger exactly.",
        },
        {
          name: "disabled",
          description:
            "The wrapper dims to 50% so the chevron fades with the control instead of staying at full contrast.",
        },
        {
          name: "invalid",
          description:
            "Set aria-invalid and the border and ring turn destructive. Pair it with a FieldError.",
        },
      ],
    },
    {
      kind: "useCases",
      use: [
        "A short, plain list on a form that will mostly be filled on a phone — delivery terms, unit of measure.",
        "A form that must work without JavaScript.",
        "A dense filter row where the native control's compactness is an advantage.",
      ],
      dontUse: [
        "Options that need icons, badges, or secondary text — use Select.",
        "Long lists that need search — use Combobox.",
        "Multi-select — use Combobox with chips.",
      ],
    },
  ],
})
