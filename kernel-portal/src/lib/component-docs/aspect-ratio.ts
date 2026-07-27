import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Aspect Ratio — component doc entity; parity-verified against source. */
export const aspectRatioDoc: ComponentDoc = parseComponentDoc({
  id: "aspect-ratio",
  name: "Aspect Ratio",
  slug: "aspect-ratio",
  summary:
    "Locks a container to a fixed width-to-height ratio so its contents scale without the layout jumping as they load. Wrap media whose intrinsic size you don't control — a remote image, an embed, a chart — and the box reserves its space up front.",
  status: "ready",
  sourceFiles: ["aspect-ratio.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Wrap anything that loads asynchronously — a document thumbnail, a map tile, a video embed — so the slot holds its shape and the page doesn't reflow when the content arrives.",
        "Pick a ratio that matches the source (`16 / 9` for video, `1 / 1` for avatars and logos, `4 / 3` for scanned documents) rather than forcing content into a mismatched frame.",
        "Let the child fill the box (`h-full w-full object-cover`) so it crops cleanly instead of stretching.",
      ],
      donts: [
        "Don't use it for text or a component whose height should grow with its content — the fixed ratio will clip or pad it awkwardly.",
        "Don't nest an Aspect Ratio inside a parent with no defined width; it needs a width to compute a height from.",
      ],
    },
    { kind: "anatomy", slots: ["aspect-ratio"] },
    {
      kind: "useCases",
      use: [
        "Reserving space for a remote image so cards in a grid stay the same height while thumbnails load.",
        "Framing a video or map embed at a consistent ratio across breakpoints.",
        "Keeping avatar and logo slots perfectly square regardless of the uploaded file.",
      ],
      dontUse: [
        "Sizing a text block or a form — let content determine height.",
        "Constraining a container that must flex to its children, like a Card body.",
      ],
    },
  ],
})
