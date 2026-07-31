import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Bubble — component doc entity; parity-verified against source. */
export const bubbleDoc: ComponentDoc = parseComponentDoc({
  id: "bubble",
  name: "Bubble",
  slug: "bubble",
  summary:
    "The filled surface a conversation turn sits on. Bubble carries the color and the corner treatment; the tone you pick is the signal — primary for the operator's own words, muted for the assistant, destructive for a failed turn. Reactions attach to the bubble, not the message row, so they clip to the surface.",
  status: "ready",
  sourceFiles: ["bubble.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Pick the variant by who is speaking and how it went: default for the operator, muted or secondary for the assistant, destructive for a turn that errored.",
        "Use ghost when the turn is long-form prose. It drops the surface and the width cap so a paragraph reads as a document, not as a chat balloon.",
        "Put the text in BubbleContent rather than directly in Bubble — the padding, radius, and focus ring live on the content slot.",
        "Render BubbleContent as a button or anchor when the whole turn is clickable; it already carries hover and focus-visible treatments for both.",
      ],
      donts: [
        "Don't nest a Bubble inside another Bubble. Two surfaces stacked read as a rendering bug.",
        "Don't use tinted and default in the same transcript for the same speaker — pick one voice per side and hold it.",
        "Don't put BubbleReactions outside a Bubble; it positions itself absolutely against the bubble's box.",
        "Don't override the max-width to full unless you're on ghost. The measure cap is what keeps a transcript readable.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "variant",
          defaultKey: "default",
          keys: [
            { key: "default", description: "Primary fill — the operator's own turns." },
            { key: "secondary", description: "A quieter filled surface for the other side of the conversation." },
            { key: "muted", description: "The lowest-contrast fill; the usual choice for assistant replies in a long transcript." },
            { key: "tinted", description: "A primary-derived wash that stays legible on both themes — useful when two non-operator voices need separating." },
            { key: "outline", description: "Border only, background matches the page. Reads as a draft or a quoted turn." },
            { key: "ghost", description: "No surface, no padding, no width cap — for long-form prose that should read as a document." },
            { key: "destructive", description: "A failed or rejected turn. Pair it with the reason in the message footer." },
          ],
        },
        {
          axis: "side",
          defaultKey: "bottom",
          keys: [
            { key: "top", description: "Reactions straddle the top edge of the bubble." },
            { key: "bottom", description: "Reactions straddle the bottom edge — the default, and the one that doesn't collide with the header." },
          ],
        },
        {
          axis: "align",
          defaultKey: "end",
          keys: [
            { key: "start", description: "Reactions pin to the leading edge of the bubble." },
            { key: "end", description: "Reactions pin to the trailing edge." },
          ],
        },
      ],
    },
    {
      kind: "anatomy",
      slots: ["bubble-group", "bubble", "bubble-reactions"],
    },
    {
      kind: "api",
      props: [
        {
          name: "variant",
          type: '"default" | "secondary" | "muted" | "tinted" | "outline" | "ghost" | "destructive"',
          default: '"default"',
          description: "The surface treatment. Sets data-variant, which the content slot reads for its background and text color.",
        },
        {
          name: "align",
          type: '"start" | "end"',
          default: '"start"',
          description: "Which edge the bubble hugs when it isn't already inside an aligned Message.",
        },
        {
          name: "side",
          type: '"top" | "bottom"',
          default: '"bottom"',
          description: "On BubbleReactions — which horizontal edge the reaction pill straddles.",
        },
        {
          name: "render",
          type: "React.ReactElement",
          description: "On BubbleContent — swap the rendered element, e.g. a button or anchor, keeping the bubble styling.",
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
        "Operator and assistant turns in a chat panel that need visually distinct surfaces.",
        "A turn that failed validation and should read as an error without leaving the transcript.",
        "Emoji or status reactions attached to a specific turn.",
      ],
      dontUse: [
        "Row layout, avatars, or timestamps — that's Message.",
        "A standalone callout outside a conversation — use Alert or Card.",
        "Long-form documentation rendered outside a transcript — use plain prose.",
      ],
    },
  ],
})
