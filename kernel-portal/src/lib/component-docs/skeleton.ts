import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Skeleton — component doc entity; parity-verified against source. */
export const skeletonDoc: ComponentDoc = parseComponentDoc({
  id: "skeleton",
  name: "Skeleton",
  slug: "skeleton",
  summary:
    "A placeholder shaped like the content that's still loading, so the layout holds its form and the wait feels shorter. Use it for the first load of a known structure — a table, a card, a detail panel. For a brief action in flight, an inline spinner is enough.",
  status: "ready",
  sourceFiles: ["skeleton.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Shape skeletons like the real content — rows for a table, blocks for a card — so nothing shifts when data arrives.",
        "Use them for the initial load of a predictable layout, where reserving space prevents a jarring reflow.",
        "Match the count and size of placeholders to the expected result so the transition is seamless.",
      ],
      donts: [
        "Don't show skeletons for a fraction of a second — a flash of placeholder is worse than a brief spinner.",
        "Don't use a Skeleton when you can't predict the shape of what's coming; a spinner is more honest.",
        "Don't leave skeletons up indefinitely on failure — swap to an error or empty state.",
      ],
    },
    { kind: "anatomy", slots: ["skeleton"] },
    {
      kind: "useCases",
      use: [
        "First load of a table, list, or card grid with a known layout.",
        "A record detail panel while its fields are being fetched.",
        "Any predictable structure where reserving space avoids layout shift.",
      ],
      dontUse: [
        "A very short wait — use a spinner.",
        "Unpredictable content whose shape you can't mimic.",
        "A persistent error or empty result — show the appropriate state instead.",
      ],
    },
  ],
})
