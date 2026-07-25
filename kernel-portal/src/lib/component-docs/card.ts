import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/**
 * Card — a contained content surface built from composable slots. No CVA; the
 * shape is its 7 named slots. Source truth verified against `card.tsx`
 * (7 slots, 7 exports).
 */
export const cardDoc: ComponentDoc = parseComponentDoc({
  id: "card",
  name: "Card",
  slug: "card",
  summary: "A contained surface for a single grouped set of content.",
  status: "ready",
  sourceFiles: ["card.tsx"],
  metadata: { owner: "ds", kind: "container" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Compose from the named parts — Header, Title, Content, Footer — rather than nesting ad-hoc divs.",
        "Use `CardAction` in the header for a top-right control aligned with the title.",
        "Keep one Card focused on one subject; split unrelated content into separate cards.",
      ],
      donts: [
        "Don't wrap a whole page in a single Card — it's a grouping surface, not a layout.",
        "Don't put a Card inside a Card for visual emphasis — use spacing or a section heading.",
        "Don't skip `CardHeader` when a title is needed; keep the anatomy consistent.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "card",
        "card-header",
        "card-title",
        "card-description",
        "card-action",
        "card-content",
        "card-footer",
      ],
    },
    {
      kind: "api",
      props: [
        { name: "className", type: "string", description: "Merged onto the root `card` slot." },
      ],
    },
  ],
})
