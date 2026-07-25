import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/**
 * Button — a clickable action trigger. CVA-driven: `variant` (6 keys) and
 * `size` (8 keys). Source truth verified against `button.tsx`.
 *
 * Voice exemplar (decision 0036): guidance answers why the component exists,
 * when to reach for it, when not to, and what to pair it with — in Kernel's
 * operational-platform voice with concrete example copy. The `states` block
 * follows Primer's bar: each state carries reasoned prose, including the
 * nuanced disabled-vs-inactive distinction, not a bare label.
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
    {
      kind: "states",
      items: [
        {
          name: "Default",
          description:
            "The resting state. The variant's fill and border carry the emphasis — a filled `default`, a bordered `outline`, or bare `ghost` chrome. This is the state you design the surrounding layout around.",
        },
        {
          name: "Hover",
          description:
            "A subtle background shift signals the target is interactive before the click lands. It's a confirmation cue, not new information — never hide an action's meaning behind hover, since touch and keyboard users never see it.",
        },
        {
          name: "Focus-visible",
          description:
            "A 3px ring appears when the button is reached by keyboard. Never suppress it: it's the only signal a keyboard or switch user has for where they are, and removing it breaks the page for them while leaving mouse users unaffected — so the regression goes unnoticed.",
        },
        {
          name: "Active / pressed",
          description:
            "The button nudges down one pixel on press to confirm the click registered. Overlay triggers (`aria-expanded`) hold the hover fill instead of nudging, so an open menu reads as anchored to its button.",
        },
        {
          name: "Disabled",
          description:
            "Reduced to 50% opacity with pointer events off — the action exists but can't fire right now. Reach for this only when the reason is visible nearby (a validation message, a missing field). A disabled button with no stated reason is a dead end the user can't debug.",
        },
        {
          name: "Inactive (accessible alternative)",
          description:
            "When an action must stay on the page but truly can't be removed, prefer an inactive treatment over `disabled`: unlike a disabled button, an inactive one still takes focus and can respond — so it can surface *why* it's unavailable in a Tooltip on hover or focus, rather than silently refusing keyboard users.",
        },
        {
          name: "Invalid",
          description:
            "`aria-invalid` paints the destructive border and ring, tying a submit button to the form error it triggered. Pair it with an inline message — the color marks the problem, the text names it.",
        },
        {
          name: "Loading",
          description:
            "While an operation is in flight, swap the label for a spinner and keep the button's width fixed so the layout doesn't jump. Announce completion for assistive tech rather than relying on the visual alone.",
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
    {
      kind: "examples",
      items: [
        {
          title: "Variants",
          description: "The six emphasis levels. Spend `default` once per view; reach for `outline` for supporting actions.",
          language: "tsx",
          code: `<div className="flex flex-wrap gap-4">
  <Button>Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="destructive">Destructive</Button>
  <Button variant="link">Link</Button>
</div>`,
        },
        {
          title: "Sizes",
          description: "Match height to context — `sm` in dense tables and toolbars, `lg` for a standout footer action.",
          language: "tsx",
          code: `<div className="flex items-center gap-4">
  <Button size="sm">Small</Button>
  <Button>Default</Button>
  <Button size="lg">Large</Button>
</div>`,
        },
        {
          title: "Icon button",
          description: "Glyph-only actions must name themselves for assistive tech via `aria-label`.",
          language: "tsx",
          code: `<Button size="icon" variant="outline" aria-label="Add item">
  <Plus />
</Button>`,
        },
        {
          title: "Button with icon",
          description: "Pair a leading or trailing glyph with a text label to reinforce the action.",
          language: "tsx",
          code: `<Button>
  Continue <ArrowRight />
</Button>`,
        },
      ],
    },
  ],
})

