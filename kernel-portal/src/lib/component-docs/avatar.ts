import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Avatar — component doc entity; parity-verified against source. */
export const avatarDoc: ComponentDoc = parseComponentDoc({
  id: "avatar",
  name: "Avatar",
  slug: "avatar",
  summary:
    "A small image standing in for a person or entity — a user, a counterparty, an organization. It shows a photo when one exists and falls back to initials or a glyph when it doesn't, so the slot always renders something recognizable rather than a broken image.",
  status: "ready",
  sourceFiles: ["avatar.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Always provide a fallback (initials or an icon) so a missing or slow image never leaves an empty or broken slot.",
        "Keep avatars square-cropped and consistently sized within a context, and give the image a meaningful alt name.",
        "Use an avatar group with an overflow count (\"+5\") when representing several people compactly.",
      ],
      donts: [
        "Don't rely on the avatar alone to identify someone in a dense list — pair it with a name.",
        "Don't stretch non-square images; crop to a square so faces aren't distorted.",
        "Don't use an Avatar as a status dot or a generic icon holder — it's for representing an entity.",
      ],
    },
    {
      kind: "anatomy",
      slots: ["avatar", "avatar-image", "avatar-fallback", "avatar-badge", "avatar-group", "avatar-group-count"],
    },
    {
      kind: "useCases",
      use: [
        "Showing the owner or assignee on a record or row.",
        "Representing a counterparty or organization next to its name.",
        "An avatar group summarizing the people on a shared item.",
      ],
      dontUse: [
        "A status indicator — use a StatusBadge or a dot.",
        "A generic decorative icon — use Icon.",
        "Identifying someone without any accompanying label in a busy view.",
      ],
    },
  ],
})
