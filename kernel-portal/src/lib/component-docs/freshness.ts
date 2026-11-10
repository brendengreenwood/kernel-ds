import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/**
 * Freshness — whether market data is still inside its stale limit. CVA-driven
 * single axis: `state` (fresh, stale). Source truth verified against
 * `freshness.tsx` (1 slot, 2 exports).
 */
export const freshnessDoc: ComponentDoc = parseComponentDoc({
  id: "freshness",
  name: "Freshness",
  slug: "freshness",
  summary:
    "A quiet inline marker that says whether a piece of market data is still inside its stale limit. It sits beside the value it qualifies — a Posted Bid Date, a competitor bid — and shows only the verdict; the caller counts the business days. Reach for StatusBadge instead when the thing you are describing is the object's lifecycle state.",
  status: "experimental",
  sourceFiles: ["freshness.tsx"],
  metadata: { owner: "ds", kind: "display" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Place it directly after the date or price it qualifies, so the eye reads the value and its condition in one pass.",
        "Pass the measurement as children when it helps the Merchant act — \"Stale · 4 business days\" tells them how far past the limit the bid is.",
        "Render the stale state only where staleness can happen. A window six or more months out never goes stale, so show nothing there.",
      ],
      donts: [
        "Don't use it for lifecycle. A published scenario stays published while its Posted Bid Date goes stale — the two are separate facts and need separate marks.",
        "Don't compute the verdict inside a render with calendar days. The limit is business days on the grain trading calendar; decide the state where that calendar lives and pass it in.",
        "Don't wrap it in a pill or give it a fill. A column of StatusBadges next to a column of filled freshness marks stops being scannable.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "state",
          defaultKey: "fresh",
          keys: [
            {
              key: "fresh",
              description:
                "Inside the stale limit. Muted text, so a column of fresh rows stays calm.",
            },
            {
              key: "stale",
              description:
                "Past the stale limit. Warning tone plus the word, so the row stands out without relying on color.",
            },
          ],
        },
      ],
    },
    { kind: "anatomy", slots: ["freshness"] },
    {
      kind: "api",
      props: [
        { name: "state", type: '"fresh" | "stale"', default: '"fresh"', description: "The verdict; drives tone and the default label." },
        { name: "children", type: "ReactNode", description: "Optional label override, usually the verdict plus the measurement." },
        { name: "className", type: "string", description: "Merged with the variant classes." },
      ],
    },
    {
      kind: "accessibility",
      ariaAttributes: ["aria-hidden"],
    },
    {
      kind: "useCases",
      use: [
        "The Posted Bid Date cell in a table of shipment windows, where two of six rows are past their limit.",
        "A scenario header, next to the date the market data was last refreshed.",
        "A competitor bid pulled from a feed that may be a day behind.",
      ],
      dontUse: [
        "Draft, published, archived, expired — use StatusBadge.",
        "The result of a refresh the Merchant just ran — use a toast or an Alert.",
        "A window that has ended — that scenario is expired, which is a status.",
      ],
    },
    {
      kind: "examples",
      items: [
        {
          title: "Beside a Posted Bid Date",
          description: "The date keeps tabular figures; the mark follows it.",
          language: "tsx",
          code: `<TableCell className="tabular-nums">
  <span className="inline-flex items-center gap-2">
    Nov 3
    <Freshness state="stale" />
  </span>
</TableCell>`,
        },
        {
          title: "With the measurement",
          language: "tsx",
          code: `<Freshness state="stale">Stale · 4 business days</Freshness>`,
        },
      ],
    },
    {
      kind: "decisions",
      refs: [{ number: 95, title: "Freshness and version history are library pieces" }],
    },
  ],
})
