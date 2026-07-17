import * as React from "react"
import { cn } from "@/lib/utils"
import type { WorkspaceContext, WorkspaceView } from "./types"

/**
 * Panel — an anonymous slot hosting an ordered list of views
 * (decision 0029, doctrine #2). A panel has no idea whether it is
 * "the canvas" or "an inspector"; those are roles the page layout
 * assigns. With more than one view it renders a tab strip
 * (`aria-pressed` buttons, matching the simpler portal patterns);
 * with one view, just that view. `onClose` enables the multi-panel
 * dock demo.
 */
export interface PanelProps {
  views: ReadonlyArray<WorkspaceView>
  ctx: WorkspaceContext
  defaultViewKey?: string
  title?: string
  onClose?: () => void
  className?: string
}

export function Panel({ views, ctx, defaultViewKey, title, onClose, className }: PanelProps) {
  const [activeKey, setActiveKey] = React.useState(defaultViewKey ?? views[0]?.key ?? "")
  const active = views.find((v) => v.key === activeKey) ?? views[0]

  return (
    <section
      data-slot="workspace-panel"
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-md border bg-card",
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-1 border-b bg-muted/30 px-1.5 py-1">
        {title && (
          <span className="px-1 text-[11px] font-medium text-foreground">{title}</span>
        )}
        {views.length > 1 ? (
          <div
            role="group"
            className="flex items-center gap-0.5"
            aria-label={title ? `${title} views` : "Panel views"}
          >
            {views.map((v) => (
              <button
                key={v.key}
                type="button"
                data-slot="workspace-panel-tab"
                aria-pressed={v.key === active?.key}
                onClick={() => setActiveKey(v.key)}
                className={cn(
                  "rounded px-1.5 py-0.5 text-[11px]",
                  v.key === active?.key
                    ? "bg-sidebar-accent font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        ) : (
          views[0] && (
            <span className="px-1 text-[11px] text-muted-foreground">{views[0].label}</span>
          )
        )}
        {onClose && (
          <button
            type="button"
            aria-label={`Close ${title ?? "panel"}`}
            onClick={onClose}
            className="ml-auto rounded px-1.5 py-0.5 text-[12px] leading-none text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        )}
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-2">{active?.render(ctx)}</div>
    </section>
  )
}
