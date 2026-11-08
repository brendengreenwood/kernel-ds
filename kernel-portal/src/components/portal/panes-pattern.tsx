import * as React from "react"
import {
  Checkbox,
  FilterDock,
  FloatingPane,
  PaneCanvas,
  PaneCorner,
  PanePill,
  PanePillBar,
  PaneStack,
  usePaneOrder,
} from "@kernel/ui"
import { Section, Subhead } from "./section"

const FACILITIES = ["River terminal", "Interior elevator", "Processing plant", "Export terminal"]
const REGIONS = ["Illinois interior", "Mid-Mississippi", "Plains", "Ohio valley", "Upper Midwest", "Gulf"]
const PAIRS = [
  ["New Madrid, MO", "Marston, MO", 7],
  ["Havana, IL", "Beardstown, IL", 12],
  ["Lima, OH", "Milford, IN", 35],
] as const

type Detail = "regions" | "pairs"

/** Stand-in canvas: a dotted field, so the demo needs no map library. */
function Field() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 bg-muted [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px]"
    />
  )
}

function CanvasControl() {
  return (
    <div
      aria-hidden
      className="absolute right-[calc(var(--pane-inset)+var(--pane-reserve-right))] bottom-[var(--pane-inset)] grid size-[var(--control-h)] place-items-center rounded-[var(--radius-control)] border border-border bg-card font-mono text-xs transition-[right] duration-[var(--duration-base)] ease-[var(--ease-out)]"
    >
      +
    </div>
  )
}

export function PanesSection() {
  const [types, setTypes] = React.useState(() => new Set(FACILITIES))
  const panes = usePaneOrder<Detail>()

  const toggleType = (t: string) =>
    setTypes((s) => {
      const n = new Set(s)
      if (n.has(t)) n.delete(t)
      else n.add(t)
      return n
    })

  const facilityLabel =
    types.size === FACILITIES.length ? "All facilities" : `${types.size} of ${FACILITIES.length} facilities`

  return (
    <Section
      id="panes"
      eyebrow="Patterns"
      title="Floating panes"
      lead="For screens where the content is a canvas — a map, a large chart — controls float over it instead of shrinking it. The canvas owns an 8px inset and measures its own width; below its threshold the same panes become a bottom bar with full-width panes above it. This demo is the live component from @kernel/ui, not a picture of it."
    >
      <Subhead id="panes-demo">Live canvas</Subhead>
      <div className="h-[560px] overflow-hidden rounded-[var(--radius-surface)] border border-border">
        <PaneCanvas threshold={720}>
          <Field />
          <CanvasControl />
          <PaneCorner corner="top-left">
            <FloatingPane side="left" className="w-52" bodyClassName="gap-2">
              <p className="text-sm font-semibold">Legend</p>
              <p className="text-xs text-muted-foreground">Corner panes hold context the canvas needs to be read.</p>
            </FloatingPane>
          </PaneCorner>
          <PaneStack side="right">
            <PanePillBar aria-label="Detail panes" className="justify-end">
              <PanePill active={panes.isOpen("pairs")} onClick={() => panes.toggle("pairs")}>
                Closest pairs
              </PanePill>
              <PanePill active={panes.isOpen("regions")} onClick={() => panes.toggle("regions")}>
                Regions
              </PanePill>
            </PanePillBar>
            {panes.order.map((k) =>
              k === "regions" ? (
                <FloatingPane key={k} side="right" title="Regions" onClose={() => panes.close(k)}>
                  <ul className="grid">
                    {REGIONS.map((r) => (
                      <li key={r} className="rounded-[var(--radius-control)] px-2 py-1.5 text-sm hover:bg-state-hover active:bg-state-press">
                        {r}
                      </li>
                    ))}
                  </ul>
                </FloatingPane>
              ) : (
                <FloatingPane key={k} side="right" title="Closest pairs" onClose={() => panes.close(k)}>
                  <ul className="grid">
                    {PAIRS.map(([a, b, mi]) => (
                      <li key={a} className="flex justify-between gap-2 rounded-[var(--radius-control)] px-2 py-1.5 text-sm hover:bg-state-hover active:bg-state-press">
                        <span>
                          {a} · {b}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">{mi} mi</span>
                      </li>
                    ))}
                  </ul>
                </FloatingPane>
              )
            )}
          </PaneStack>
          <FilterDock
            items={[
              {
                key: "facility",
                label: facilityLabel,
                applied: types.size !== FACILITIES.length,
                title: "Facility type",
                content: (
                  <div className="grid">
                    {FACILITIES.map((t) => (
                      <label
                        key={t}
                        className="flex min-h-9 items-center gap-2 rounded-[var(--radius-control)] px-2 text-sm hover:bg-state-hover"
                      >
                        <Checkbox checked={types.has(t)} onCheckedChange={() => toggleType(t)} />
                        {t}
                      </label>
                    ))}
                  </div>
                ),
              },
            ]}
          />
        </PaneCanvas>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Open both detail panes: the newest goes on top and the corner control steps left when the column reaches the bottom.
        Uncheck a facility and close the pane — the pill keeps saying what it filters, with an outline and dot.
      </p>
    </Section>
  )
}
