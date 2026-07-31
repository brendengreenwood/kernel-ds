import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Kbd — component doc entity; parity-verified against source. */
export const kbdDoc: ComponentDoc = parseComponentDoc({
  id: "kbd",
  name: "Kbd",
  slug: "kbd",
  summary:
    "A single key, rendered as one. Kbd is a real <kbd> element with a muted surface, sized to sit inline in a sentence or at the trailing edge of a menu item. KbdGroup joins the keys of a chord. It inverts automatically inside a tooltip, where the surface is already dark.",
  status: "ready",
  sourceFiles: ["kbd.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use one Kbd per key and wrap a chord in KbdGroup, so ⌘ and K are two keys rather than one string.",
        "Write the platform's own glyphs — ⌘, ⇧, ⌥ on macOS; Ctrl and Shift elsewhere.",
        "Put the shortcut at the trailing edge of the menu item or command row it triggers.",
      ],
      donts: [
        "Don't use Kbd for a code token or a value — that's an inline code style, and a reader will try to press it.",
        "Don't make it interactive. It's pointer-events-none by design; the thing that responds to the key is elsewhere.",
        "Don't document a shortcut you haven't bound.",
      ],
    },
    {
      kind: "anatomy",
      slots: ["kbd", "kbd-group"],
    },
    {
      kind: "api",
      props: [
        {
          name: "className",
          type: "string",
          description: "Merged onto the key or the group.",
        },
      ],
    },
    {
      kind: "useCases",
      use: [
        "The shortcut on a dropdown or command menu row.",
        "A shortcut hint inside a tooltip, where the treatment inverts on its own.",
        "Keyboard instructions in prose — press ⌘K to open the command palette.",
      ],
      dontUse: [
        "Code, identifiers, or values — use inline code.",
        "A clickable control that happens to have a shortcut — that's a Button with a Kbd inside it.",
      ],
    },
  ],
})
