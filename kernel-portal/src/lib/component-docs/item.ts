import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Item — component doc entity; parity-verified against source. */
export const itemDoc: ComponentDoc = parseComponentDoc({
  id: "item",
  name: "Item",
  slug: "item",
  summary:
    "One row of a list: optional media, a title and description, and trailing actions. Item is the row primitive the portal reaches for when a table would be too heavy — search results, picker options, a settings list. It renders as a div by default and as a link or button when you pass render, so a whole row can be the target.",
  status: "ready",
  sourceFiles: ["item.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Wrap a run of items in ItemGroup. It sets the gap and tightens it automatically at the sm and xs sizes.",
        "Put the title and description inside ItemContent so they stack correctly and the media can align to the top when a description is present.",
        "Pass render with an anchor or button when the entire row navigates or acts — the focus ring and hover treatment are already there for both.",
        "Use ItemMedia variant=\"image\" for thumbnails; it fixes the box and clips the image so rows keep a straight left edge regardless of aspect ratio.",
        "Drop to size=\"xs\" inside menus and command palettes, where the row is already inside a padded surface.",
      ],
      donts: [
        "Don't use Item for tabular data. Once you have three or more aligned values per row, columns beat a title and a description — use Table.",
        "Don't nest an interactive Item inside another interactive element; you'll get a button inside a button and a broken tab order.",
        "Don't put more than two actions in ItemActions. Past that, collapse them into a DropdownMenu.",
        "Don't rely on the description for critical status — a StatusBadge in the title line survives the two-line clamp.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "variant",
          defaultKey: "default",
          keys: [
            {
              key: "default",
              description:
                "Transparent border, no fill. The row is defined by its content and the group's gap.",
            },
            {
              key: "outline",
              description:
                "Visible border. Use when rows sit directly on the page background and need their own edge.",
            },
            {
              key: "muted",
              description:
                "A low-contrast fill. Good for a selected row or a secondary list nested inside a card.",
            },
            {
              key: "icon",
              description:
                "On ItemMedia — sizes a bare icon to the row's text and keeps it from stretching.",
            },
            {
              key: "image",
              description:
                "On ItemMedia — a fixed, clipped thumbnail box that shrinks with the row size.",
            },
          ],
        },
        {
          axis: "size",
          defaultKey: "default",
          keys: [
            { key: "default", description: "Standard row padding for page-level lists." },
            {
              key: "sm",
              description:
                "Same padding, tighter group gap — for lists inside a card or a dock panel.",
            },
            {
              key: "xs",
              description:
                "Compact padding and a smaller description; drops its own padding inside a dropdown menu.",
            },
          ],
        },
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "item-group",
        "item-separator",
        "item-media",
        "item-content",
        "item-title",
        "item-description",
        "item-actions",
        "item-header",
        "item-footer",
      ],
    },
    {
      kind: "api",
      props: [
        {
          name: "variant",
          type: '"default" | "outline" | "muted"',
          default: '"default"',
          description:
            "The row's surface. Written to the item's state so media and description can respond to it.",
        },
        {
          name: "size",
          type: '"default" | "sm" | "xs"',
          default: '"default"',
          description:
            "Row density. Read by the group for its gap and by the media and description for their own scale.",
        },
        {
          name: "render",
          type: "React.ReactElement",
          description:
            "Swap the rendered element — an anchor or button makes the whole row the target while keeping the row styling.",
        },
        {
          name: "className",
          type: "string",
          description: "Merged onto the slot you set it on.",
        },
      ],
    },
    {
      kind: "states",
      items: [
        { name: "default", description: "Resting row." },
        {
          name: "hover",
          description:
            "When the row renders as a link, the surface picks up the muted fill. Non-interactive rows stay flat on purpose.",
        },
        {
          name: "focus-visible",
          description:
            "Ring and border on the row itself, so keyboard position is legible even when the actions are the only focusable children.",
        },
      ],
    },
    {
      kind: "useCases",
      use: [
        "Search results and picker options, where each row has a name, a qualifier, and one action.",
        "A settings list — label, explanation, and a switch on the trailing edge.",
        "A summary list inside a card, at size sm, where a table would be too much structure.",
      ],
      dontUse: [
        "Aligned, sortable, or paginated data — use Table.",
        "Conversation turns — use Message and Bubble.",
        "A single piece of content with its own heading and footer — use Card.",
      ],
    },
  ],
})
