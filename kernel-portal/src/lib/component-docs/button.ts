import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/**
 * Button — a clickable action trigger. CVA-driven: `variant` (6 keys) and
 * `size` (8 keys). Source truth verified against `button.tsx`.
 *
 * Voice exemplar (decision 0036): guidance answers why the component exists,
 * when to reach for it, when not to, and what to pair it with — in Kernel's
 * operational-platform voice with concrete example copy.
 */
export const buttonDoc: ComponentDoc = parseComponentDoc({
  id: "button",
  name: "Button",
  slug: "button",
  summary:
    "Triggers an action in place — submitting a form, opening an overlay, running an operation. Reach for a supporting `outline` or `ghost` button by default; the filled primary is the exception you spend once per view. When the destination is another page, that's a link, not a button.",
  status: "ready",
  sourceFiles: ["button.tsx"],
  metadata: { owner: "ds", kind: "control" },
  docs: [
    {
      kind: "useCases",
      use: [
        "Committing an operation the user just composed — \"Post contract\", \"Void ticket\", \"Approve invoice\".",
        "Opening an overlay or menu anchored to the trigger — a Dialog, Popover, or DropdownMenu.",
        "Standing as the single primary action in a form footer, toolbar, or record header.",
      ],
      dontUse: [
        "Navigating to another route — use a link so the browser, middle-click, and open-in-new-tab all work.",
        "Toggling a persistent on/off setting — use a Switch or Toggle, which signal their state.",
        "Choosing one of several options — use a Select, RadioGroup, or ToggleGroup.",
      ],
    },
    {
      kind: "guidelines",
      dos: [
        "Give each view one clear primary (`default`) button; render supporting actions as `outline` or `ghost` so the eye lands on the main path.",
        "Write the label as the verb it performs — \"Save draft\", \"Run reconciliation\" — not \"OK\" or \"Submit\".",
        "Reserve `destructive` for irreversible operations, and confirm the consequence in a Dialog before the button fires.",
        "When using an `icon` size with no text, add an `aria-label` naming the action.",
      ],
      donts: [
        "Don't place two `default` (primary) buttons side by side — competing emphasis makes neither read as the main action.",
        "Don't lean on color alone to carry meaning; a `destructive` button still needs a label that names the risk.",
        "Don't use `link` variant for a real navigation target — it looks like a link but behaves like a button for assistive tech.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "variant",
          defaultKey: "default",
          keys: [
            { key: "default", description: "The one high-emphasis action per view — the path you want the user to take. Spend it once." },
            { key: "outline", description: "The workhorse for supporting actions that sit beside the primary; visible but not competing." },
            { key: "secondary", description: "A filled but muted action for toolbars and grouped controls where outline feels too light." },
            { key: "ghost", description: "Minimal chrome for dense or repeated actions — row actions, icon buttons, menu items." },
            { key: "destructive", description: "Irreversible operations only (delete, void, revoke). Confirm the consequence in a Dialog first." },
            { key: "link", description: "Reads as inline text but behaves as a button. Use for in-flow actions, never for real navigation." },
          ],
        },
        {
          axis: "size",
          defaultKey: "default",
          keys: [
            { key: "default", description: "Standard height for forms and record headers." },
            { key: "xs", description: "Tightest text button — inline chips and compact filter bars." },
            { key: "sm", description: "Dense contexts: table rows, toolbars, sidebar controls." },
            { key: "lg", description: "Prominent single actions like a form footer’s submit — avoid inside compact regions." },
            { key: "icon", description: "Square glyph-only button at default height; pair with an aria-label." },
            { key: "icon-xs", description: "Glyph-only at xs height for inline affordances." },
            { key: "icon-sm", description: "Glyph-only at sm height for toolbars and table rows." },
            { key: "icon-lg", description: "Glyph-only at lg height for a standout icon action." },
          ],
        },
      ],
    },
    { kind: "anatomy", slots: ["button"] },
    {
      kind: "api",
      props: [
        { name: "variant", type: "\"default\" | \"outline\" | \"secondary\" | \"ghost\" | \"destructive\" | \"link\"", default: "\"default\"", description: "Visual emphasis — one primary per view, the rest secondary." },
        { name: "size", type: "\"default\" | \"xs\" | \"sm\" | \"lg\" | \"icon\" | \"icon-xs\" | \"icon-sm\" | \"icon-lg\"", default: "\"default\"", description: "Control height and density; `icon-*` sizes render a square glyph-only button." },
        { name: "borderBeam", type: "BorderBeamProp", description: "Optional animated border accent for a highlighted call to action." },
        { name: "className", type: "string", description: "Merged with the variant classes via `cn`." },
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
