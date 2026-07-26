import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Badge — component doc entity; parity-verified against source. */
export const badgeDoc: ComponentDoc = parseComponentDoc({
  id: "badge",
  name: "Badge",
  slug: "badge",
  summary:
    "A small inline label for a category, count, or tag attached to something else — a type, a tag, an unread count. It's a static descriptor. When the label reflects a record's lifecycle state from the object model, use StatusBadge, which maps status to a consistent tone.",
  status: "ready",
  sourceFiles: ["badge.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Badge to tag a category, type, or count beside the thing it describes.",
        "Keep the text to a word or two; a Badge is a label, not a sentence.",
        "Choose the variant by meaning — reserve `destructive`/`warning`/`success` for genuine severity, not decoration.",
      ],
      donts: [
        "Don't use a plain Badge for object-model status; that's StatusBadge's job and it keeps tones consistent.",
        "Don't lean on color alone — the label text must carry the meaning for color-blind users.",
        "Don't scatter many bright badges in one view; the emphasis stops meaning anything.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "variant",
          defaultKey: "default",
          keys: [
            { key: "default", description: "Neutral emphasis for a standard tag or category label." },
            { key: "secondary", description: "Lower-emphasis label that recedes next to primary content." },
            { key: "destructive", description: "Signals an error or critical condition — use only for genuine severity." },
            { key: "success", description: "A positive or completed condition (paid, approved, in good standing)." },
            { key: "warning", description: "A caution that needs attention but isn't yet an error." },
            { key: "info", description: "Neutral-informational emphasis for an FYI or metadata tag." },
            { key: "outline", description: "Minimal bordered label for the lightest touch, often for technical identifiers." },
          ],
        },
      ],
    },
    {
      kind: "useCases",
      use: [
        "Tagging a record's type or category — \"Spot\", \"Forward\", \"Internal\".",
        "A small count indicator — unread items, attached documents.",
        "A technical identifier chip (outline + mono) beside a field.",
      ],
      dontUse: [
        "Object-model lifecycle status — use StatusBadge.",
        "A commodity label — use CommodityBadge for the consistent commodity hues.",
        "An interactive control — a Badge is not a button or a toggle.",
      ],
    },
  ],
})
