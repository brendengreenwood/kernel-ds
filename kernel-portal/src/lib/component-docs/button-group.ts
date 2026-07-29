import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Button Group — component doc entity; parity-verified against source. */
export const buttonGroupDoc: ComponentDoc = parseComponentDoc({
  id: "button-group",
  name: "Button Group",
  slug: "button-group",
  summary:
    "Buttons and inputs joined into one control, sharing a border and rounding only at the ends. Use it when the members are one decision — a split action, a segmented filter, an input with an attached button. The joined border is a claim that these belong together, so don't make it for a row of unrelated actions.",
  status: "ready",
  sourceFiles: ["button-group.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Group members that share one subject: an action and its dropdown, a unit toggle, an input and the button that submits it.",
        "Keep one variant across the group. Mixing outline and ghost inside a joined border reads as a rendering fault, not as emphasis.",
        "Use ButtonGroupText for a non-interactive affix — a unit, a currency, a prefix — so it inherits the muted surface instead of pretending to be a button.",
        "Nest a ButtonGroup inside a ButtonGroup when you want two joined clusters separated by a gap; the outer group adds the gap for you.",
        "Add a ButtonGroupSeparator between members that share a fill, where the border alone isn't enough to show the seam.",
      ],
      donts: [
        "Don't join unrelated actions. Save and Delete side by side in one border is a misclick waiting to happen.",
        "Don't put more than about five members in a horizontal group — past that it stops scanning as a control and starts reading as a toolbar.",
        "Don't override the corner rounding of individual members; the group owns which corners round, and fighting it leaves a visible notch.",
        "Don't use a button group for navigation between views — that's Tabs.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "orientation",
          defaultKey: "horizontal",
          keys: [
            {
              key: "horizontal",
              description:
                "Members join left to right; only the outer left and right corners round. The default.",
            },
            {
              key: "vertical",
              description:
                "Members stack and join top to bottom. For narrow rails and dock panels where a horizontal group would wrap.",
            },
          ],
        },
      ],
    },
    {
      kind: "anatomy",
      slots: ["button-group", "button-group-separator"],
    },
    {
      kind: "api",
      props: [
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description:
            "Direction the members join. Also written to data-orientation, which the separator reads to flip its own axis.",
        },
        {
          name: "render",
          type: "React.ReactElement",
          description:
            "On ButtonGroupText — swap the rendered element, e.g. a label, keeping the affix styling.",
        },
        {
          name: "className",
          type: "string",
          description: "Merged onto the slot you set it on.",
        },
      ],
    },
    {
      kind: "useCases",
      use: [
        "A split action — the primary button plus a dropdown trigger for its variations.",
        "A segmented control for a unit or a scale: bushels / tonnes, day / week / month.",
        "An input with an attached affix or submit button, like a search field with a Go button.",
      ],
      dontUse: [
        "Switching between views or panels — use Tabs.",
        "A set of independent page actions — space them normally, no shared border.",
        "Mutually exclusive selection that must report as such to assistive tech — use ToggleGroup or RadioGroup.",
      ],
    },
  ],
})
