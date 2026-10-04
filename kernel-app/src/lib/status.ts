import type { Status } from "@/components/ui/status-badge"
import type { ScenarioStatus } from "@app/data/scenarios"

/** Scenario lifecycle → DS StatusBadge hue + label. StatusBadge is the DS's
    persistent-state axis; children override the label for this domain.

    Shared rather than page-local: the scenarios table and the workspace both
    show the same badge for the same scenario, and two copies of this map is
    two places for "Paused" to become "On hold" in only one of them. */
export const statusMap: Record<ScenarioStatus, { hue: Status; label: string }> = {
  active: { hue: "settled", label: "Active" },
  draft: { hue: "draft", label: "Draft" },
  paused: { hue: "on_hold", label: "Paused" },
  expired: { hue: "expired", label: "Expired" },
}
