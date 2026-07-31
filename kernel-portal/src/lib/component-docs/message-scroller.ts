import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Message Scroller — component doc entity; parity-verified against source. */
export const messageScrollerDoc: ComponentDoc = parseComponentDoc({
  id: "message-scroller",
  name: "Message Scroller",
  slug: "message-scroller",
  summary:
    "The scroll container a live transcript needs. It pins to the newest message while the operator is at the bottom, stops fighting them the moment they scroll up to read, and surfaces a jump-to-latest button while they're away. Streaming tokens don't yank the viewport, which is the whole point.",
  status: "ready",
  sourceFiles: ["message-scroller.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Give the scroller a bounded height — it fills its parent, so the parent is what decides where the transcript ends.",
        "Wrap each turn in MessageScrollerItem. The item is what the autoscroll anchors to and what lets long transcripts skip offscreen work.",
        "Set scrollAnchor on the turn that's currently streaming so the viewport follows that message rather than the raw bottom edge.",
        "Keep MessageScrollerButton mounted — it manages its own visibility from scroll position, and mounting it conditionally throws away the transition.",
        "Reach for the useMessageScroller hooks when something outside the viewport needs to know the scroll state, like an unread count in a header.",
      ],
      donts: [
        "Don't nest another scroll container inside the viewport. Two scrollers means the autoscroll anchors to the wrong one.",
        "Don't scroll the viewport imperatively on every token — that's what the component is for, and manual calls will fight it.",
        "Don't put the jump button outside the scroller root; it positions itself against that box.",
        "Don't use it for a static, fully-loaded transcript — plain ScrollArea is lighter and has no autoscroll behavior to reason about.",
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "message-scroller",
        "message-scroller-viewport",
        "message-scroller-content",
        "message-scroller-item",
        "message-scroller-button",
      ],
    },
    {
      kind: "api",
      props: [
        {
          name: "scrollAnchor",
          type: "boolean",
          default: "false",
          description: "On MessageScrollerItem — makes this item the target the viewport follows while content streams in.",
        },
        {
          name: "direction",
          type: '"start" | "end"',
          default: '"end"',
          description: "On MessageScrollerButton — which end of the transcript the button jumps to. end is the usual jump-to-latest.",
        },
        {
          name: "variant",
          type: "Button variant",
          default: '"secondary"',
          description: "On MessageScrollerButton — forwarded to the underlying Button.",
        },
        {
          name: "size",
          type: "Button size",
          default: '"icon-sm"',
          description: "On MessageScrollerButton — forwarded to the underlying Button.",
        },
        {
          name: "render",
          type: "React.ReactElement",
          description: "On MessageScrollerButton — replace the rendered control while keeping the show/hide behavior.",
        },
        {
          name: "className",
          type: "string",
          description: "Merged onto the slot you set it on.",
        },
      ],
    },
    {
      kind: "useCases",
      use: [
        "A chat panel where the assistant streams its reply token by token.",
        "An agent run log that appends steps while the operator is reading earlier ones.",
        "Any transcript long enough that the operator will scroll back and then want a way home.",
      ],
      dontUse: [
        "A short, static list of messages — use ScrollArea.",
        "A scrolling region that isn't a transcript, like a settings panel — use ScrollArea.",
        "Pagination through history — load earlier turns behind a Marker instead.",
      ],
    },
  ],
})
