import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/**
 * Tabs — switch between related views in the same context. CVA-driven on the
 * list: `variant` (3 keys) + `size` (3 keys). Source truth verified against
 * `tabs.tsx` (6 slots, 6 exports).
 */
export const tabsDoc: ComponentDoc = parseComponentDoc({
  id: "tabs",
  name: "Tabs",
  slug: "tabs",
  summary: "Switch between related views within one surface.",
  status: "ready",
  sourceFiles: ["tabs.tsx"],
  metadata: { owner: "ds", kind: "navigation" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use to partition content in one context that the user switches between — not to navigate pages.",
        "Keep the label set short and mutually exclusive so the active view is unambiguous.",
        "Use `TabCount`/`TabDot` to surface counts or unread state on a trigger.",
      ],
      donts: [
        "Don't use Tabs when the panels should be visible at once — use a layout instead.",
        "Don't hide required workflow steps behind a tab a user may never open.",
        "Don't nest tab bars inside tab panels — flatten the hierarchy.",
      ],
    },
    {
      kind: "variants",
      groups: [
        { axis: "variant", keys: ["pill", "underline", "folder"], defaultKey: "pill" },
        { axis: "size", keys: ["compact", "default", "comfortable"], defaultKey: "default" },
      ],
    },
    {
      kind: "anatomy",
      slots: ["tabs", "tabs-list", "tabs-trigger", "tabs-content", "tab-count", "tab-dot"],
    },
    {
      kind: "api",
      props: [
        { name: "variant", type: "\"pill\" | \"underline\" | \"folder\"", default: "\"pill\"", description: "List presentation style." },
        { name: "size", type: "\"compact\" | \"default\" | \"comfortable\"", default: "\"default\"", description: "List density." },
        { name: "className", type: "string", description: "Merged with the variant classes." },
      ],
    },
    {
      kind: "accessibility",
      role: "tablist",
      keyboardInteractions: [
        { key: "ArrowLeft / ArrowRight", action: "Move focus between triggers." },
        { key: "Home / End", action: "Focus the first / last trigger." },
        { key: "Enter / Space", action: "Activate the focused trigger." },
      ],
    },
  ],
})
