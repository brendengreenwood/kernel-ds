import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Alert — component doc entity; parity-verified against source. */
export const alertDoc: ComponentDoc = parseComponentDoc({
  id: "alert",
  name: "Alert",
  slug: "alert",
  summary:
    "A static, inline banner that communicates a persistent message tied to a place on the page — a validation summary, a system notice, a heads-up about the current record. Unlike a toast, it stays until the condition clears. For transient confirmations, use Sonner; for blocking decisions, use a Dialog.",
  status: "ready",
  sourceFiles: ["alert.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Use an Alert for a message that should persist in context — an error at the top of a form, a warning about stale data.",
        "Match the variant to the severity, and lead with a clear title plus a sentence of what to do about it.",
        "Place it where the message applies (above the affected section) so the cause and the notice are close.",
      ],
      donts: [
        "Don't use an Alert for fleeting success feedback — that's a toast (Sonner) that clears itself.",
        "Don't rely on color alone; the title and an icon must convey severity for color-blind users.",
        "Don't stack many alerts at once — consolidate, or the page turns into a wall of banners.",
      ],
    },
    {
      kind: "variants",
      groups: [
        {
          axis: "variant",
          defaultKey: "default",
          keys: [
            { key: "default", description: "A neutral informational notice with no severity color." },
            { key: "destructive", description: "An error or failure the user must address." },
            { key: "success", description: "Confirmation that a persistent condition is good (e.g. validation passed)." },
            { key: "warning", description: "A caution about a risk or a state that needs attention soon." },
            { key: "info", description: "A neutral heads-up or contextual note." },
          ],
        },
      ],
    },
    {
      kind: "useCases",
      use: [
        "A form-level error summary above the fields that failed.",
        "A persistent system or account notice (maintenance window, degraded data).",
        "A contextual warning on a record — \"This contract is past its delivery date.\"",
      ],
      dontUse: [
        "Transient success/confirmation feedback — use Sonner.",
        "A message that must block interaction — use a Dialog or AlertDialog.",
        "Per-field validation — use the form's inline FormMessage.",
      ],
    },
  ],
})
