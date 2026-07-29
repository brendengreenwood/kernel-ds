import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Empty — component doc entity; parity-verified against source. */
export const emptyDoc: ComponentDoc = parseComponentDoc({
  id: "empty",
  name: "Empty",
  slug: "empty",
  summary:
    "The state a container shows when it has nothing to show. Empty centers an optional icon, a title, a sentence of explanation, and the action that fixes it. The action is the part that matters — an empty state without a next step is just a shrug.",
  status: "ready",
  sourceFiles: ["empty.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Say what would be here and how to make it appear. \"No open contracts — create one to get started\" beats \"No data\".",
        "Put the primary action in EmptyContent so it sits below the description and inside the measure cap.",
        "Distinguish the two empties: nothing exists yet versus nothing matched this filter. The second one should offer to clear the filter, not to create a record.",
        "Use EmptyMedia variant=\"icon\" for the boxed treatment; it keeps the glyph the same size across every empty state in the portal.",
      ],
      donts: [
        "Don't use Empty for a failure. A request that errored is an Alert, and it needs a retry, not an invitation to create something.",
        "Don't show an empty state while data is still loading — render a Skeleton until you actually know the collection is empty.",
        "Don't stack multiple actions here. One next step; anything else belongs in the page's own toolbar.",
        "Don't write a paragraph. The container has a measure cap because two lines is the budget.",
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
                "A bare glyph with no surface — the lighter treatment, for empties inside an already-bordered card.",
            },
            {
              key: "icon",
              description:
                "The glyph in a muted rounded box. The usual choice for a page- or panel-level empty state.",
            },
          ],
        },
      ],
    },
    {
      kind: "anatomy",
      slots: [
        "empty",
        "empty-header",
        "empty-icon",
        "empty-title",
        "empty-description",
        "empty-content",
      ],
    },
    {
      kind: "api",
      props: [
        {
          name: "variant",
          type: '"default" | "icon"',
          default: '"default"',
          description:
            "On EmptyMedia — whether the glyph gets its own muted surface. Written to data-variant.",
        },
        {
          name: "className",
          type: "string",
          description:
            "Merged onto the slot you set it on. Set it on Empty to change the border treatment, which is dashed by default.",
        },
      ],
    },
    {
      kind: "useCases",
      use: [
        "A collection with no records yet, paired with the action that creates the first one.",
        "A filtered table that matched nothing, paired with a clear-filters action.",
        "A dock panel with nothing selected, explaining what to select to fill it.",
      ],
      dontUse: [
        "A failed request — use Alert with a retry.",
        "A pending request — use Skeleton or Spinner.",
        "A permissions wall — that needs its own explanation and a path to request access, not an empty state.",
      ],
    },
  ],
})
