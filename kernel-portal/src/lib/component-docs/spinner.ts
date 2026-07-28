import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Spinner — component doc entity; parity-verified against source. */
export const spinnerDoc: ComponentDoc = parseComponentDoc({
  id: "spinner",
  name: "Spinner",
  slug: "spinner",
  summary:
    "The indeterminate loading indicator — one spinning glyph that says work is happening without claiming to know how much is left. It ships with role=\"status\" and an accessible label already attached, so dropping it in a button or an attachment tile doesn't cost you a screen-reader announcement.",
  status: "ready",
  sourceFiles: ["spinner.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Reach for Spinner when the duration is unknown or short. When you can report a real percentage, Progress is the honest choice.",
        "Size it with a size-* class rather than a wrapper — it's an SVG, so size-3 in dense rows and size-6 in an empty state both work directly.",
        "Override aria-label when the surrounding context doesn't already say what's loading; the default is a generic \"Loading\".",
        "Let it inherit currentColor so it reads correctly inside a primary button, a muted tile, and a destructive state without extra classes.",
      ],
      donts: [
        "Don't stack a spinner next to a skeleton for the same region — pick the one that matches how much layout you already know.",
        "Don't spin indefinitely with no timeout. A request that never resolves needs an error state, not a permanent animation.",
        "Don't wrap it in an extra element just to add a label; set aria-label on the Spinner itself.",
        "Don't use it as a decorative flourish. It's a status indicator, and assistive technology treats it as one.",
      ],
    },
    {
      kind: "anatomy",
      slots: ["spinner"],
    },
    {
      kind: "api",
      props: [
        {
          name: "className",
          type: "string",
          description: "Merged onto the SVG. Use size-* to scale it and text-* to recolor it.",
        },
        {
          name: "role",
          type: "string",
          default: '"status"',
          description: "Set for you so assistive technology announces the spinner as a live status, not as decoration.",
        },
      ],
    },
    {
      kind: "accessibility",
      role: "status",
      ariaAttributes: ["aria-label"],
    },
    {
      kind: "useCases",
      use: [
        "A button that's submitting and can't yet report progress.",
        "An attachment tile that's uploading or being processed.",
        "A panel waiting on its first response from the agent.",
      ],
      dontUse: [
        "Work with a known percentage — use Progress.",
        "A first paint where the layout is already known — use Skeleton.",
        "A background job the operator isn't waiting on — surface it in a status column instead.",
      ],
    },
  ],
})
