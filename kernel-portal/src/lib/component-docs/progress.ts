import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Progress — component doc entity; parity-verified against source. */
export const progressDoc: ComponentDoc = parseComponentDoc({
  id: "progress",
  name: "Progress",
  slug: "progress",
  summary:
    "A horizontal bar showing how far along a task or value is toward completion — an upload, a multi-step import, a quota used. Use the determinate bar when you know the percentage; when you don't, an indeterminate spinner or shimmer is the honest choice.",
  status: "ready",
  sourceFiles: ["progress.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use a determinate Progress bar when you can report a real percentage, and update it as the work advances.",
        "Pair the bar with a label or value (\"3 of 8 files\", \"62%\") so the number is legible, not just implied by width.",
        "Use it for quota and usage displays too — storage used, limit consumed — where the fill communicates proportion at a glance.",
      ],
      donts: [
        "Don't fake steady progress when you don't know it; a stalled or lying bar erodes trust. Use an indeterminate indicator.",
        "Don't rely on the fill alone for meaning — include the value for accessibility and clarity.",
        "Don't use a Progress bar for a quick action where a spinner would do.",
      ],
    },
    {
      kind: "anatomy",
      slots: ["progress", "progress-track", "progress-indicator", "progress-label", "progress-value"],
    },
    {
      kind: "useCases",
      use: [
        "A file upload or long import with a known percentage.",
        "A multi-step task showing how many steps remain.",
        "A quota or usage meter — storage, API calls, budget consumed.",
      ],
      dontUse: [
        "Work of unknown duration — use an indeterminate spinner.",
        "A brief action — use a spinner or loading button state.",
        "Discrete step navigation — use a stepper.",
      ],
    },
  ],
})
