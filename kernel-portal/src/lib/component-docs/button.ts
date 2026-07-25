import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/**
 * Button — a clickable action trigger. CVA-driven: `variant` (6 keys) and
 * `size` (8 keys). Source truth verified against `button.tsx`.
 */
export const buttonDoc: ComponentDoc = parseComponentDoc({
  id: "button",
  name: "Button",
  slug: "button",
  summary: "A clickable trigger for a single action.",
  status: "ready",
  sourceFiles: ["button.tsx"],
  metadata: { owner: "ds", kind: "control" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use for actions that change state or submit — save, delete, open.",
        "Lead with one primary (`default`) button per view; use `outline`/`ghost` for secondary actions.",
        "Use `size=\"icon\"` variants when the glyph alone is unambiguous and add an aria-label.",
      ],
      donts: [
        "Don't use a Button for navigation between pages — use a link.",
        "Don't stack multiple `default` (primary) buttons in the same group.",
        "Don't rely on `destructive` color alone — pair it with a clear label.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "variant",
          keys: ["default", "outline", "secondary", "ghost", "destructive", "link"],
          defaultKey: "default",
        },
        {
          axis: "size",
          keys: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
          defaultKey: "default",
        },
      ],
    },
    { kind: "anatomy", slots: ["button"] },
    {
      kind: "api",
      props: [
        { name: "variant", type: "\"default\" | \"outline\" | \"secondary\" | \"ghost\" | \"destructive\" | \"link\"", default: "\"default\"", description: "Visual emphasis." },
        { name: "size", type: "\"default\" | \"xs\" | \"sm\" | \"lg\" | \"icon\" | \"icon-xs\" | \"icon-sm\" | \"icon-lg\"", default: "\"default\"", description: "Control height / density." },
        { name: "borderBeam", type: "BorderBeamProp", description: "Optional animated border accent." },
        { name: "className", type: "string", description: "Merged with the variant classes." },
      ],
    },
    {
      kind: "accessibility",
      role: "button",
      keyboardInteractions: [
        { key: "Enter", action: "Activates the button." },
        { key: "Space", action: "Activates the button." },
      ],
    },
  ],
})
