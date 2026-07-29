import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Message — component doc entity; parity-verified against source. */
export const messageDoc: ComponentDoc = parseComponentDoc({
  id: "message",
  name: "Message",
  slug: "message",
  summary:
    "The row layout for a single turn in a conversation — avatar, header, content, footer, all aligned to one side. Message owns placement and spacing; it doesn't own the look of the text itself. Put a Bubble inside it when the turn needs a filled surface, or drop raw content in for a flat transcript.",
  status: "ready",
  sourceFiles: ["message.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Set align=\"end\" on the operator's own turns and leave the default start alignment for everyone else — the mirrored row is what makes a transcript scannable.",
        "Wrap a run of turns in MessageGroup so consecutive messages share one vertical rhythm instead of each defining its own margin.",
        "Put the author and timestamp in MessageHeader and the actions — copy, retry, cite — in MessageFooter. Both slots already align themselves with the message.",
        "Keep MessageAvatar to a single glyph or initials. It self-aligns to the bottom of the row and lifts when a footer is present.",
      ],
      donts: [
        "Don't style the message row to look like a bubble. That's Bubble's job, and mixing the two produces two nested surfaces.",
        "Don't hand-flip the row with flex-row-reverse — set align and let the data attribute drive every descendant that cares.",
        "Don't put a scroll container inside a Message. Scrolling belongs to Message Scroller, one level up.",
        "Don't use Message for a system notice or a date divider — that's Marker.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "message-group",
        "message",
        "message-avatar",
        "message-content",
        "message-header",
        "message-footer",
      ],
    },
    {
      kind: "api",
      props: [
        {
          name: "align",
          type: '"start" | "end"',
          default: '"start"',
          description:
            "Which side of the transcript the turn sits on. Sets data-align, which reverses the row and pushes header, footer, and bubble content to the matching edge.",
        },
        {
          name: "className",
          type: "string",
          description: "Merged onto the root; use it for per-turn width caps, not for surface styling.",
        },
      ],
    },
    {
      kind: "useCases",
      use: [
        "A chat transcript where the operator and the assistant alternate turns.",
        "An agent activity log where each step needs an author, a body, and a set of actions.",
        "A comment thread on a record, with avatars and timestamps.",
      ],
      dontUse: [
        "A single standalone notice — use Alert.",
        "A status line between turns, like \"Today\" or \"Agent switched models\" — use Marker.",
        "A list of records with a leading icon and trailing actions — use Item.",
      ],
    },
  ],
})
