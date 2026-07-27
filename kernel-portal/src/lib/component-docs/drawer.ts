import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Drawer — component doc entity; parity-verified against source. */
export const drawerDoc: ComponentDoc = parseComponentDoc({
  id: "drawer",
  name: "Drawer",
  slug: "drawer",
  summary:
    "A panel that slides up from the bottom with a drag handle, tuned for touch. It's the mobile-first counterpart to a Sheet: users can flick it open and swipe it away. Reach for it on small screens and touch surfaces; on the desktop shell a Sheet or Dialog usually reads better.",
  status: "ready",
  sourceFiles: ["drawer.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Drawer for overlays on touch devices where a swipe-to-dismiss, bottom-anchored panel feels native.",
        "Keep a visible drag handle and let both the handle and a close control dismiss it, so gesture and tap users are covered.",
        "Size the open height to the content; snap points help when the panel has a compact and an expanded state.",
      ],
      donts: [
        "Don't default to a Drawer on the desktop shell — a Sheet or Dialog matches pointer interaction better.",
        "Don't trap a critical decision in a swipe-dismissable panel; if it must be deliberate, use an AlertDialog.",
        "Don't stack Drawers or combine one with another overlay layer.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "drawer",
        "drawer-trigger",
        "drawer-portal",
        "drawer-close",
        "drawer-overlay",
        "drawer-content",
        "drawer-header",
        "drawer-footer",
        "drawer-title",
        "drawer-description",
      ],
    },
    {
      kind: "useCases",
      use: [
        "A mobile action panel or detail view that slides up from the bottom.",
        "A touch-first filter or picker the user swipes open and closed.",
        "A responsive overlay that becomes a Sheet or Dialog at wider breakpoints.",
      ],
      dontUse: [
        "The primary desktop overlay — prefer a Sheet or Dialog.",
        "An irreversible confirmation — use AlertDialog.",
        "A small anchored menu — use DropdownMenu or Popover.",
      ],
    },
  ],
})
