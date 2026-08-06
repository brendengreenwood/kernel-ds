import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** PageHeader — component doc entity; parity-verified against source. */
export const pageHeaderDoc: ComponentDoc = parseComponentDoc({
  id: "page-header",
  name: "Page Header",
  slug: "page-header",
  summary:
    "One header recipe at three depths of naming. A page, a panel, and a section all open the same way — an optional glyph chip, a title, a supporting line, and an action slot — and the size prop is the only thing that changes. The chip is a tile with a real edge, not a tinted wash, so it reads as part of the surface stack rather than a colored badge.",
  status: "experimental",
  sourceFiles: ["page-header.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "useCases",
      use: [
        "The top of an object page — size page renders the only h1 on the screen, with the 44px chip and the page's primary action on the right.",
        "The head of a dock or activity panel — size panel steps the same anatomy down to a 36px chip and an h2 so the panel names itself without competing with the page.",
        "A titled region inside a panel — size section is the smallest step, a 28px chip and base-size h2 for groupings like a settlement history inside a contract panel.",
      ],
      dontUse: [
        "A card that just needs a title line — CardHeader already owns that; PageHeader inside a Card doubles the chrome.",
        "Navigation. The header names where you are; Breadcrumb says how you got there. Don't wire links into the title.",
        "A fourth, in-between size. Three depths is the contract — if a surface doesn't fit page, panel, or section, the surface's own nesting is what's off.",
      ],
    },
    {
      kind: "guidelines",
      dos: [
        "Match the size to the container's depth, not to the title's length: the page gets page, a panel inside it gets panel, a region inside that gets section.",
        "Keep the action slot for the surface's own action — the one thing you'd do to this page or panel, not a toolbar.",
        "Let the glyph repeat meaning that the title already carries. The chip is recognition furniture; the title is the information.",
        "Pass the icon component itself (icon={Truck}), not an element — the header sizes the glyph per size step so every chip's glyph-to-box ratio matches.",
      ],
      donts: [
        "Don't ship two size=\"page\" headers on one screen — that's two h1s, and the document outline stops meaning anything.",
        "Don't put color on the chip. It's a foreground-overlay tile on purpose: a tinted chip becomes a status signal the header isn't making.",
        "Don't rebuild the layout with a bare flex row when the action wraps — the header already wraps action below title at narrow widths.",
        "Don't use the description line for body copy. It's one supporting sentence; anything longer belongs in the surface itself.",
      ],
    },
    {
      kind: "anatomy",
      slots: ["page-header", "page-header-chip"],
    },
    {
      kind: "api",
      props: [
        {
          name: "size",
          type: '"page" | "panel" | "section"',
          default: '"page"',
          description:
            "The depth of the thing being named. page = 44px chip, 30px h1; panel = 36px chip, 20px h2; section = 28px chip, base h2. Written to data-size on both slots.",
        },
        {
          name: "title",
          type: "string",
          description:
            "The surface's name. Rendered as h1 at size page and h2 at panel and section, so the heading outline follows the nesting.",
        },
        {
          name: "icon",
          type: "React.ComponentType<{ className?: string }>",
          description:
            "Optional glyph component for the chip. Omit it and the chip disappears entirely — no empty box is reserved.",
        },
        {
          name: "description",
          type: "string",
          description: "One supporting line under the title, in muted foreground at the size step's caption size.",
        },
        {
          name: "action",
          type: "React.ReactNode",
          description:
            "The right-hand slot — usually one Button. Wraps below the title block when the row runs out of room.",
        },
      ],
    },
    {
      kind: "examples",
      items: [
        {
          title: "Page-level header",
          description: "The screen's own name: the only h1, the primary action on the right.",
          language: "tsx",
          code: `<PageHeader
  size="page"
  icon={Truck}
  title="Deliveries"
  description="Scheduled loads across all elevators"
  action={<Button size="sm">New delivery</Button>}
/>`,
        },
        {
          title: "Panel and section steps",
          description: "The same anatomy, stepped down to match the container's depth.",
          language: "tsx",
          code: `<PageHeader size="panel" icon={FileText} title="Contract summary" description="CTR-2214 · Cedar Bluff Farms" />
<PageHeader size="section" title="Settlement history" />`,
        },
      ],
    },
    {
      kind: "decisions",
      refs: [{ number: 65, title: "The v2 surface direction" }],
    },
  ],
})
