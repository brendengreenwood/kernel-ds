import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Cluster Badge — mark doc entity; parity-verified against source. */
export const clusterbadgeDoc: ComponentDoc = parseComponentDoc({
  id: "clusterbadge",
  name: "Cluster Badge",
  slug: "clusterbadge",
  summary:
    "A count marker that stands in for a group of collapsed points on a map or plot — \"12\" where twelve pins would otherwise overlap. It's a data mark (decision 0027): it keeps a dense spatial view readable by summarizing, and expands back to individual marks as the user zooms in.",
  status: "ready",
  sourceFiles: ["marks/cluster-badge.tsx"],
  metadata: { owner: "ds", kind: "mark" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a Cluster Badge to collapse overlapping points into a single count when the map is too dense to read.",
        "Show the underlying count on the badge, and make it interactive — clicking or zooming should reveal the members.",
        "Scale or tone the badge to hint at magnitude so a big cluster reads as bigger than a small one.",
      ],
      donts: [
        "Don't use a Cluster Badge for a single point — that's a Pin.",
        "Don't let the count go stale as the view filters; it must reflect what's actually grouped.",
        "Don't rely on color alone to signal size — the number carries the meaning.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "variant",
          defaultKey: "default",
          keys: [
            { key: "default", description: "Standard emphasis cluster marker." },
            { key: "muted", description: "Low-emphasis cluster for background context." },
          ],
        },
        {
          axis: "size",
          defaultKey: "default",
          keys: [
            { key: "sm", description: "Compact cluster badge for dense views." },
            { key: "default", description: "Standard cluster badge size." },
          ],
        },
      ],
    },
    {
      kind: "useCases",
      use: [
        "Summarizing overlapping map pins into a count at low zoom.",
        "Grouping nearby points on a plot until the user drills in.",
        "Indicating how many records sit behind a collapsed marker.",
      ],
      dontUse: [
        "A single located record — use a Pin.",
        "Inline non-spatial counts — use a Badge.",
        "Record status — use a StatusBadge.",
      ],
    },
  ],
})
