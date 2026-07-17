import { FileText, Route, Search, Table2 } from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import type { WorkspaceMode } from "./types"

/**
 * Activity rail — vertical icon-only mode switcher (decision 0029).
 * Selecting a mode owns everything to its right: the navigator swaps
 * its idiom, the canvas and dock rebind their context.
 */
export interface ActivityRailProps {
  mode: WorkspaceMode
  onModeChange: (mode: WorkspaceMode) => void
}

const railModes: ReadonlyArray<{
  mode: WorkspaceMode
  label: string
  Icon: typeof Table2
}> = [
  { mode: "contract", label: "Contracts", Icon: Table2 },
  { mode: "settlement", label: "Settlements", Icon: FileText },
  { mode: "query", label: "Query", Icon: Search },
  { mode: "traversal", label: "Traversal", Icon: Route },
]

export function ActivityRail({ mode, onModeChange }: ActivityRailProps) {
  return (
    <nav
      data-slot="workspace-activity-rail"
      aria-label="Workspace modes"
      className="flex flex-col items-center gap-1 border-r bg-muted/30 p-1.5"
    >
      {railModes.map(({ mode: m, label, Icon }) => (
        <button
          key={m}
          type="button"
          aria-pressed={mode === m}
          aria-label={label}
          title={label}
          onClick={() => onModeChange(m)}
          className={cn(
            "flex size-8 items-center justify-center rounded",
            mode === m
              ? "bg-sidebar-accent text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </nav>
  )
}
