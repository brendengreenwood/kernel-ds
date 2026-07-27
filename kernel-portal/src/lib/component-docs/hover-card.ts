import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Hover Card — component doc entity; parity-verified against source. */
export const hoverCardDoc: ComponentDoc = parseComponentDoc({
  id: "hover-card",
  name: "Hover Card",
  slug: "hover-card",
  summary:
    "A rich preview that opens on hover to show more about the thing under the cursor — a counterparty's summary, a record's key facts — without a click or a navigation. It's for glanceable context on pointer devices; because it needs hover, keep the same detail reachable another way for touch and keyboard users.",
  status: "ready",
  sourceFiles: ["hover-card.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a HoverCard to preview an entity behind a link or name — a quick profile, a record snapshot — so users can peek before committing to a click.",
        "Keep the preview read-only and skimmable; a small heading plus a few facts beats a dense panel.",
        "Add a short open delay so it doesn't flicker as the pointer crosses the trigger.",
      ],
      donts: [
        "Don't hide anything essential in a HoverCard — it never appears on touch and is awkward for keyboard users.",
        "Don't put buttons or inputs inside it; if the user needs to act, use a Popover.",
        "Don't use it for a one-line hint — that's a Tooltip.",
      ],
    },
    { kind: "anatomy", slots: ["hover-card", "hover-card-trigger", "hover-card-portal", "hover-card-content"] },
    {
      kind: "useCases",
      use: [
        "Previewing a counterparty, user, or record from its name or avatar.",
        "A glanceable summary of a linked entity before the user navigates to it.",
        "Surfacing a few supporting facts on hover without cluttering the row.",
      ],
      dontUse: [
        "A single-word hint — use a Tooltip.",
        "Anything interactive — use a Popover.",
        "Content that must be available on touch or keyboard as the only path — provide a real link too.",
      ],
    },
  ],
})
