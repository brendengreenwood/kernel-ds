import { FileText, Route, Search, Table2 } from "@kernel/ui/icon"
import { cn } from "@kernel/ui/utils"
import type { WorkspaceMode } from "./types"

/**
 * Activity rail — vertical icon-only mode switcher (decision 0029).
 * Selecting a mode owns everything to its right: the navigator swaps
 * its idiom, the canvas and dock rebind their context.
 *
 * Modes arrive as data (decision 0032): a preset declares an icon KEY,
 * and this component owns the key → component registry. Icons cannot
 * ride in JSON — the icon vocabulary lives in the UI layer by design,
 * same reasoning as lib-never-imports-components. Unknown keys render
 * a fallback glyph (the label's first letter), never crash the rail.
 */
export interface ActivityRailProps {
  mode: WorkspaceMode
  modes: ReadonlyArray<{ key: string; label: string; icon: string }>
  onModeChange: (mode: WorkspaceMode) => void
}

const railIconRegistry: Record<string, typeof Table2> = {
  table: Table2,
  file: FileText,
  search: Search,
  route: Route,
}

export function ActivityRail({ mode, modes, onModeChange }: ActivityRailProps) {
  return (
    <nav
      data-slot="workspace-activity-rail"
      aria-label="Workspace modes"
      className="flex flex-col items-center gap-1 border-r bg-muted/30 p-1.5"
    >
      {modes.map(({ key, label, icon }) => {
        const Icon = railIconRegistry[icon]
        return (
          <button
            key={key}
            type="button"
            aria-pressed={mode === key}
            aria-label={label}
            title={label}
            onClick={() => onModeChange(key)}
            className={cn(
              "flex size-8 items-center justify-center rounded",
              mode === key
                ? "bg-sidebar-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {Icon ? (
              <Icon className="size-4" />
            ) : (
              <span
                data-slot="rail-icon-fallback"
                aria-hidden="true"
                className="font-mono text-[11px] font-semibold leading-none"
              >
                {label.charAt(0)}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
