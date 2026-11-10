import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/**
 * Version history — the saves of one object, newest first. No cva; five
 * slots. Source truth verified against `version-history.tsx`.
 */
export const versionHistoryDoc: ComponentDoc = parseComponentDoc({
  id: "version-history",
  name: "Version history",
  slug: "version-history",
  summary:
    "An ordered list of the saves of one object, newest first: a version label, what changed, and when. Every row is the same object — a Pricing scenario saved four times is one scenario with four versions. Reach for Table instead when the rows are different records.",
  status: "experimental",
  sourceFiles: ["version-history.tsx"],
  metadata: { owner: "ds", kind: "display" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Order newest first, so the version in effect is the first thing read.",
        "Mark exactly one item current — the version the object is running on now.",
        "Write the summary as the change itself: \"Max Bid $4.20 → $4.25\" beats \"Updated pricing\".",
        "Keep the label short and stable. v4 stays v4 after v5 is saved.",
      ],
      donts: [
        "Don't list other objects here. A scenario for a different shipment window is a different scenario, not a version.",
        "Don't put a StatusBadge on each row. Status belongs to the object, not to a version of it.",
        "Don't show it to a reader who only gets the latest published version — an Originator has no history to browse.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "version-history",
        "version-history-item",
        "version-history-label",
        "version-history-summary",
        "version-history-meta",
      ],
    },
    {
      kind: "api",
      props: [
        { name: "current", type: "boolean", default: "false", description: "On VersionHistoryItem — marks the version in effect and sets aria-current." },
        { name: "className", type: "string", description: "Merged onto the slot you set it on." },
      ],
    },
    {
      kind: "states",
      items: [
        { name: "default", description: "A past version. Label and date are muted; the summary reads at full strength." },
        { name: "current", description: "The version in effect. The label moves to the foreground tone and medium weight." },
      ],
    },
    {
      kind: "accessibility",
      role: "list",
      ariaAttributes: ["aria-current"],
    },
    {
      kind: "useCases",
      use: [
        "A Pricing scenario's saves — refreshed Posted Bid Dates and bid changes on the same location, commodity, and shipment window.",
        "A contract's amendments, where each one replaces the last.",
      ],
      dontUse: [
        "An activity feed mixing many objects and many people — that is a log, not a history.",
        "A set of scenarios across shipment windows — use Table; each row is its own scenario.",
      ],
    },
    {
      kind: "examples",
      items: [
        {
          title: "A scenario saved three times",
          language: "tsx",
          code: `<VersionHistory>
  <VersionHistoryItem current>
    <VersionHistoryLabel>v3</VersionHistoryLabel>
    <VersionHistorySummary>Max Bid $4.20 → $4.25</VersionHistorySummary>
    <VersionHistoryMeta>Nov 3</VersionHistoryMeta>
  </VersionHistoryItem>
  <VersionHistoryItem>
    <VersionHistoryLabel>v2</VersionHistoryLabel>
    <VersionHistorySummary>Posted Bid Date refreshed → Oct 30</VersionHistorySummary>
    <VersionHistoryMeta>Oct 30</VersionHistoryMeta>
  </VersionHistoryItem>
  <VersionHistoryItem>
    <VersionHistoryLabel>v1</VersionHistoryLabel>
    <VersionHistorySummary>Created · published to Originators</VersionHistorySummary>
    <VersionHistoryMeta>Oct 22</VersionHistoryMeta>
  </VersionHistoryItem>
</VersionHistory>`,
        },
      ],
    },
    {
      kind: "decisions",
      refs: [{ number: 95, title: "Freshness and version history are library pieces" }],
    },
  ],
})
