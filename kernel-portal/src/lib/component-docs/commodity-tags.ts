import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Commodity Tags — element doc entity; parity-verified against source. */
export const commodityTagsDoc: ComponentDoc = parseComponentDoc({
  id: "commodity-tags",
  name: "Commodity Tags",
  slug: "commodity-tags",
  summary:
    "A labeled chip that identifies a commodity by name and its dedicated hue from the 16-commodity palette, so corn always reads corn and canola always reads canola across every view. It's the domain-specific way to show a commodity — a plain Badge wouldn't keep the color meaning consistent.",
  status: "ready",
  sourceFiles: ["commodity-badge.tsx"],
  metadata: { owner: "ds", kind: "element" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Commodity Tag whenever a record's commodity is shown, so the hue is consistent everywhere it appears.",
        "Let the `commodity` prop drive the color from the palette rather than hardcoding a fill.",
        "Keep the commodity name visible alongside the hue — the color reinforces, the label identifies.",
      ],
      donts: [
        "Don't assign commodity colors by hand; use the palette so corn is the same corn on every screen.",
        "Don't rely on hue alone — the label must carry the commodity for color-blind users.",
        "Don't use a Commodity Tag for non-commodity categories — that's a plain Badge.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "commodity",
          keys: [
            { key: "corn", description: "The corn hue from the commodity palette." },
            { key: "canola", description: "The canola hue from the commodity palette." },
            { key: "soybeans", description: "The soybeans hue from the commodity palette." },
            { key: "wheat", description: "The wheat hue from the commodity palette." },
          ],
        },
      ],
    },
    {
      kind: "anatomy",
      slots: ["commodity-badge", "commodity-label"],
    },
    {
      kind: "useCases",
      use: [
        "Tagging a contract, shipment, or position with its commodity.",
        "Color-coding rows in a table by commodity.",
        "A legend mapping commodity hues to names.",
      ],
      dontUse: [
        "Non-commodity categories — use a Badge.",
        "Lifecycle status — use a StatusBadge.",
        "A spatial marker — use a Pin.",
      ],
    },
  ],
})
