"use client"

import { Section } from "./section"
import { typeStyles } from "@/lib/type-styles"
import { cn } from "@/lib/utils"

/**
 * Layout foundation (decision 0033): Kernel has no fixed column grid.
 * Layout is fluid — Tailwind's default breakpoints plus a small set of
 * grid rules that keep pages honest beside the sidebar and at 390px.
 */

const active = "border-primary bg-primary/15 text-foreground"
const idle = "border-border bg-transparent text-muted-foreground"

// Each chip is highlighted only inside its own range, via static
// responsive classes — the row is a live "you are here" indicator.
const breakpoints = [
  {
    name: "base",
    min: "0",
    note: "Single column; chrome offers nav via sheet + hamburger",
    cls: cn(active, "sm:border-border sm:bg-transparent sm:text-muted-foreground"),
  },
  {
    name: "sm",
    min: "640px",
    note: "Cards pair up (grid-cols-1 → sm:grid-cols-2)",
    cls: cn(idle, "sm:border-primary sm:bg-primary/15 sm:text-foreground md:border-border md:bg-transparent md:text-muted-foreground"),
  },
  {
    name: "md",
    min: "768px",
    note: "App chrome splits; stacked shells regain their panes",
    cls: cn(idle, "md:border-primary md:bg-primary/15 md:text-foreground lg:border-border lg:bg-transparent lg:text-muted-foreground"),
  },
  {
    name: "lg",
    min: "1024px",
    note: "Sidebar docks; multi-pane workspaces",
    cls: cn(idle, "lg:border-primary lg:bg-primary/15 lg:text-foreground xl:border-border xl:bg-transparent xl:text-muted-foreground"),
  },
  {
    name: "xl",
    min: "1280px",
    note: "Wide dashboards; context + chat columns return",
    cls: cn(idle, "xl:border-primary xl:bg-primary/15 xl:text-foreground 2xl:border-border 2xl:bg-transparent 2xl:text-muted-foreground"),
  },
  {
    name: "2xl",
    min: "1536px",
    note: "Maximum density; rarely targeted directly",
    cls: cn(idle, "2xl:border-primary 2xl:bg-primary/15 2xl:text-foreground"),
  },
]

const gridRules = [
  {
    rule: "Declare the mobile column explicitly",
    code: "grid grid-cols-1 gap-4 sm:grid-cols-2",
    why: "An implicit auto column sizes to content and blows out the page at 390px.",
  },
  {
    rule: "Raw 1fr in arbitrary tracks is minmax(0,1fr)",
    code: "grid-cols-[172px_minmax(0,1fr)]",
    why: "1fr's auto minimum lets a long child (a table, a code line) stretch the track past the viewport.",
  },
  {
    rule: "Grids beside the sidebar use auto-fit",
    code: "grid-cols-[repeat(auto-fit,minmax(220px,1fr))]",
    why: "Column count derives from the space that's actually left, so docking the rail reflows instead of overflowing.",
  },
  {
    rule: "Atomic-width rows scroll in place",
    code: "overflow-x-auto",
    why: "Segmented controls, tab strips, and data tables keep their natural width and scroll — an overflow:hidden frame would amputate them.",
  },
]

const elevators = [
  ["River terminal", "184,200 bu"],
  ["Prairie Grove", "96,450 bu"],
  ["Cedar Falls", "121,800 bu"],
  ["Maple Junction", "58,300 bu"],
  ["West Bend", "142,650 bu"],
  ["Oak Ridge", "77,900 bu"],
] as const

export function LayoutSection() {
  return (
    <Section
      id="layout"
      eyebrow="Foundations"
      title="Layout"
      lead="Kernel has no fixed column grid, by design (decision 0033). Layout is fluid: Tailwind's default breakpoints, grids that derive their column count from available space, and a small set of rules that keep every page honest beside the sidebar and at 390px."
    >
      <h4 className={cn("mb-4", typeStyles.overline)}>Breakpoints</h4>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        The stock Tailwind ladder — Kernel adds no custom breakpoints. The
        highlighted chip tracks your current viewport: resize the window and
        the highlight moves.
      </p>
      <div className="rounded-lg border bg-card p-8">
        {breakpoints.map((bp) => (
          <div
            key={bp.name}
            className="grid grid-cols-1 items-center gap-2 border-b py-3 last:border-b-0 sm:grid-cols-[132px_minmax(0,1fr)] sm:gap-4"
          >
            <span
              className={cn(
                "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-semibold transition-colors duration-[var(--duration-base)] ease-[var(--ease-out)]",
                bp.cls
              )}
            >
              {bp.name}
              <span className="font-normal opacity-70">≥{bp.min}</span>
            </span>
            <span className="text-sm text-muted-foreground">{bp.note}</span>
          </div>
        ))}
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>Grid rules</h4>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Four rules, all in service of one outcome: no horizontal overflow at
        any width. The mobile audit (390px scan) enforces them after every
        layout change.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {gridRules.map((r) => (
          <div key={r.rule} className="rounded-md border bg-card p-4">
            <div className="text-sm font-semibold">{r.rule}</div>
            <div className="my-2 overflow-x-auto rounded-sm bg-muted px-2.5 py-1.5 font-mono text-xs">
              {r.code}
            </div>
            <div className="text-xs text-muted-foreground">{r.why}</div>
          </div>
        ))}
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>
        Auto-fit in action
      </h4>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        This grid declares no column count —{" "}
        <code className="font-mono">repeat(auto-fit, minmax(200px, 1fr))</code>{" "}
        derives it from the space that&apos;s left after the sidebar. Collapse
        or expand the rail and the cards reflow.
      </p>
      <div className="rounded-lg border bg-card p-8">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          {elevators.map(([name, bushels]) => (
            <div key={name} className="rounded-md border p-4">
              <div className="text-sm font-semibold">{name}</div>
              <div className={cn("mt-1 text-muted-foreground", typeStyles.numeric)}>
                {bushels}
              </div>
            </div>
          ))}
        </div>
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>Content measure</h4>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Pages are fluid, but prose is not: leads and explanatory paragraphs cap
        at <code className="font-mono">max-w-2xl</code> (~65–75 characters per
        line at body sizes), and body specimens run 52–54ch. Data surfaces —
        tables, grids, charts — take the full width; reading text never does.
      </p>
      <div className="rounded-lg border bg-card p-8">
        <p className={cn("max-w-2xl border-l-2 border-primary pl-4", typeStyles.body)}>
          Merchants compare local basis across elevators, lock a cash price
          against the board, and settle the load from one screen. A paragraph
          held to this measure stays comfortable to read; the same text at
          full page width would force the eye on a long return journey to the
          start of every line.
        </p>
        <div className="mt-3 font-mono text-xs text-muted-foreground">
          max-w-2xl · ~65–75ch
        </div>
      </div>
    </Section>
  )
}
