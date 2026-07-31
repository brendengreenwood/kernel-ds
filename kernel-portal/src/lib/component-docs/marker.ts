import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Marker — component doc entity; parity-verified against source. */
export const markerDoc: ComponentDoc = parseComponentDoc({
  id: "marker",
  name: "Marker",
  slug: "marker",
  summary:
    "The quiet line between turns — \"Today\", \"3 unread\", \"Switched to gpt-5\", \"Context trimmed\". Marker is muted by default and offers a rule that runs out to both sides, so a transcript can be segmented without any of the segments shouting.",
  status: "ready",
  sourceFiles: ["marker.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use the separator variant for date and session breaks — the rule on both sides reads as a divider with a label, which is exactly what it is.",
        "Keep the copy to a fragment. A marker is a label, not a sentence.",
        "Put the glyph in MarkerIcon; it's already aria-hidden, so the icon won't be announced twice alongside the text.",
        "Use render to promote a marker to a button when it's actionable — \"Load 20 earlier messages\" is a marker, not a Message.",
      ],
      donts: [
        "Don't use Marker to deliver an error or a warning. It's deliberately low-contrast; a failure needs Alert.",
        "Don't put interactive controls inside the default variant — either make the whole marker the control via render, or use a different component.",
        "Don't chain markers back to back. Two dividers in a row means the segmentation is wrong.",
        "Don't use the border variant inside a bordered container — the two rules will double up.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "variant",
          defaultKey: "default",
          keys: [
            { key: "default", description: "Plain muted line. Use it for inline notes that don't need to cut the transcript." },
            { key: "separator", description: "A centered label with a rule running to both edges — the date and session divider." },
            { key: "border", description: "A label with a single rule beneath it, for a heading that opens a section rather than splitting one." },
          ],
        },
      ],
    },
    {
      kind: "anatomy",
      slots: ["marker-icon", "marker-content"],
    },
    {
      kind: "api",
      props: [
        {
          name: "variant",
          type: '"default" | "separator" | "border"',
          default: '"default"',
          description: "How the marker relates to the content around it — inline, splitting, or opening.",
        },
        {
          name: "render",
          type: "React.ReactElement",
          description: "Swap the rendered element while keeping marker styling. Use it to make the whole marker a button or link.",
        },
        {
          name: "className",
          type: "string",
          description: "Merged onto the root element.",
        },
      ],
    },
    {
      kind: "useCases",
      use: [
        "A date or session divider between runs of messages.",
        "An unread boundary in a long transcript.",
        "A note that the agent's context was trimmed or its model changed mid-conversation.",
      ],
      dontUse: [
        "An error or warning the operator must act on — use Alert.",
        "A plain rule with no label — use Separator.",
        "A conversation turn with an author — use Message.",
      ],
    },
  ],
})
