import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Carousel — component doc entity; parity-verified against source. */
export const carouselDoc: ComponentDoc = parseComponentDoc({
  id: "carousel",
  name: "Carousel",
  slug: "carousel",
  summary:
    "A horizontally scrollable strip that shows a few items at a time with previous/next controls — document previews, related records, images. Use it when horizontal browsing suits the content and space is limited; when users need to compare everything at once, a grid serves them better.",
  status: "ready",
  sourceFiles: ["carousel.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Carousel for a browsable set of peer items where seeing a few and paging through the rest is fine.",
        "Provide visible, keyboard-reachable previous/next controls and let the strip be swiped or scrolled.",
        "Hint that more lies off-screen (a peeking next item or position dots) so the overflow is discoverable.",
      ],
      donts: [
        "Don't hide important content in later slides users may never reach — carousels get low engagement past the first view.",
        "Don't auto-advance content users are trying to read or act on; motion they didn't ask for is disorienting.",
        "Don't use a Carousel when all items should be compared together — use a grid.",
      ],
    },
    {
      kind: "anatomy",
      slots: ["carousel", "carousel-content", "carousel-item", "carousel-previous", "carousel-next"],
    },
    {
      kind: "useCases",
      use: [
        "Paging through document or image previews attached to a record.",
        "A browsable strip of related records or suggestions.",
        "A space-limited gallery where horizontal paging fits the content.",
      ],
      dontUse: [
        "Content that must all be seen or compared at once — use a grid.",
        "Critical actions or information that can't afford to be off-screen.",
        "Sequential steps in a process — use a stepper.",
      ],
    },
  ],
})
