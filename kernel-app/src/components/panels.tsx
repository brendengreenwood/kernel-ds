import * as React from "react"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/* Shared panel furniture — the app-wide conventions for activity/detail cards.
   Lifted out of pages/scenarios.tsx once the Overview needed the same pieces:
   one source for the framed-table + tile + flag treatment everywhere. */

/** Two-line cell: a value and the quantity behind it. The sub carries its own
    unit — with no column head above it, a bare number is a number of nothing. */
export function TwoLine({ top, sub, strong }: { top: React.ReactNode; sub?: string; strong?: boolean }) {
  return (
    <div className="leading-tight">
      <div className={cn("whitespace-nowrap", strong && "font-semibold")}>{top}</div>
      {sub ? <div className="text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  )
}

/** A roll-up figure. A row of these heads a panel, so the row answers the
    question before the table has to be read at all.

    Two sizes, like PageHeader: the default heads a panel inside a page, `lg`
    heads the thing itself. An opened scenario row is read before anything
    around it, and a 20px figure in a 16px column of chrome does not lead.

    The large size is unfilled — outline only, no plate. At this figure size the
    number is the object and a fill behind it would be a box around a headline;
    the hairline is there to group the four, not to raise them.

    It is also padded like a card rather than like a cell: a figure this size
    needs air around it before the hairline, or the tile reads as a number that
    was cropped to fit. The inset is 12 spacing units, which is the header
    chip plus its gap — so a card's label starts on the same vertical as the
    title of the header above the row, and the four cards read as a block
    hanging off that line rather than as a band starting somewhere else. The
    chart keeps a smaller inset than the text: an axis label is already inset
    from its own plot edge, so matching the text's padding would double it.

    It takes the panel's own corner rather than the control radius: these are
    the largest objects in the opened row, and a card the size of a panel that
    is rounded like a button reads as a button that grew.

    Its figure is sized off the tile, not off the page: a row of four is read
    across half a width in one place and a whole width in another, and a fixed
    36px that fits the wide one overflows the narrow one. `cqw` makes the
    number as large as its own cell can hold, floored so it never falls under
    the panel's body text.

    Not every figure earns a trace, so the tile reserves the trace's room
    either way. A row of cards whose bottoms do not line up reads as four
    cards that failed to load rather than as two figures that move and two
    that count. */
export function Tile({
  value,
  label,
  lg = false,
  chart,
}: {
  value: React.ReactNode
  label: string
  lg?: boolean
  /** A sparkline of how the figure got here. Large tiles only — the small tile
      is 20px of type in a header row and a line under it is a smudge.

      Optional on purpose: a trace is worth its space only where the figure
      moved through values on its way here. A count that has been 0, then 1,
      draws a step, and a step drawn at chart size reads as a spike — an
      event rendered as a trend. */
  chart?: React.ReactNode
}) {
  if (lg) {
    return (
      <div className="@container overflow-hidden rounded-[var(--v2-panel-radius)] border border-border pt-7">
        <div className="px-12">
          {/* Label over figure. A caption under a number is a footnote to it;
              above, it is the question the number answers — and the four
              questions line up across the row at a constant height, which a
              row of figures set in different digit counts never does. */}
          <div className="text-sm leading-tight font-medium whitespace-normal text-muted-foreground">
            {label}
          </div>
          <div className="mt-2.5 text-[clamp(1.5rem,20cqw,2.25rem)] leading-none font-semibold tracking-tight tabular-nums">
            {value}
          </div>
        </div>
        {/* A framed chart is inset: an axis needs a margin to be an axis, and
            a baseline running into the tile's own border is two lines meeting
            at nothing. */}
        <div className="mt-5 px-8 pb-5" aria-hidden>
          {/* The height is the tile's, not the chart's: an untraced tile holds
              the same room open so the four bottoms land on one line. */}
          <div className="h-12">{chart}</div>
        </div>
      </div>
    )
  }
  return (
    /* Same plate marker as TableFrame: a tile and the table below it are the
       same kind of object, so they take the same fill and lip. */
    <div data-v2-frame className="rounded-lg border border-border px-3 py-2">
      <div className="text-xl leading-tight font-semibold tabular-nums">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

/** The glyph chip that leads a panel header. */
export function IconChip({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    /* foreground overlay, not bg-muted: in this theme --muted resolves to the
       same value as --card, so a muted chip on a card is invisible. */
    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-foreground/5 text-muted-foreground">
      <Icon className="size-4" />
    </span>
  )
}

/** A bare roll-up figure for a header cluster — no box, just the number over
    its label. Boxed variant is `Tile`. */
export function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div>
      <div className="text-2xl leading-none font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

/** Card header: a glyph chip, then title over description, with an optional
    action floated to the end. */
export function PanelHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <CardHeader>
      <div className="flex items-center gap-3">
        <IconChip icon={Icon} />
        <div className="min-w-0">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {action ? <div className="ml-auto shrink-0">{action}</div> : null}
      </div>
    </CardHeader>
  )
}

/** Row-level activity flag: how much has landed since this thing was last
    touched. Opaque lime rungs, not a translucent tint — an alpha fill takes its
    contrast from whatever happens to be behind it (measured 3.93:1 in light,
    under AA); these hold their ratio anywhere. Quiet rows render nothing. */
export function ActivityFlag({ n }: { n: number }) {
  return (
    <span
      data-v2-flag
      className="inline-flex items-center rounded-full bg-lime-100 px-2 py-0.5 text-xs font-medium text-lime-900 dark:bg-lime-900 dark:text-lime-200"
    >
      {n} new
    </span>
  )
}

/** Outlined frame — every table in the app sits in one of these. `data-v2-frame`
    is the app's plate marker: it carries the fill one step off the card plus the
    top lip, so a framed table reads as placed ON the panel rather than drawn
    into it. `dense` is the default; the two top-level object tables pass
    `dense={false}` to keep the roomier step. */
export function TableFrame({
  children,
  dense = true,
}: {
  children: React.ReactNode
  dense?: boolean
}) {
  return (
    <div
      data-v2-frame
      data-v2-dense={dense ? "" : undefined}
      className="overflow-x-auto rounded-lg border border-border"
    >
      {children}
    </div>
  )
}

/** Page title row — one definition so every page's header carries the same
    type and rhythm. Pages keep their own outer padding.

    The glyph repeats the rail's icon for the route: arriving on a page, the mark
    you clicked is the mark at the top of what you got.

    Two sizes. The default heads a route. `condensed` heads a panel that is the
    subject of its own surface — an expanded row's activity panel is a page in
    miniature, and it was being built by hand out of a chip, a 14px bold line and
    a muted line under it. Same object, one step down: 36px chip, 20px title,
    and the description the full size does not carry (a route's subject is the
    route; a panel has to say what it is showing).

    Condensed titles are h2: they sit inside a page that already has its h1. */
export function PageHeader({
  icon: Icon,
  title,
  description,
  action,
  condensed = false,
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  condensed?: boolean
}) {
  const Heading = condensed ? "h2" : "h1"
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <span
            data-v2-pagechip
            data-condensed={condensed ? "" : undefined}
            className={condensed ? CHIP_SM : CHIP_LG}
          >
            <Icon className={condensed ? "size-5" : "size-6"} />
          </span>
        ) : null}
        <div className="min-w-0">
          <Heading
            className={
              condensed
                ? "text-xl font-semibold tracking-tight"
                : "text-3xl font-semibold tracking-tight"
            }
          >
            {title}
          </Heading>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="flex min-w-0 items-center gap-2">{action}</div> : null}
    </div>
  )
}

const CHIP_LG = "grid size-11 shrink-0 place-items-center"
const CHIP_SM = "grid size-9 shrink-0 place-items-center"

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-2 text-sm text-muted-foreground">{children}</p>
}

/** A detail row spans every column, so its content is as wide as the TABLE —
    often wider than the screen. Size the panel to the scroll container's
    visible width (minus the cell's own edge inset) and pin it `sticky left-0`,
    so it stays in front of the reader while the table scrolls underneath. */
export function useVisibleWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = React.useState<number>()
  React.useEffect(() => {
    const el = ref.current
    const scroller = el?.closest<HTMLElement>("div.overflow-x-auto")
    if (!el || !scroller) return
    const measure = () => {
      // The cell keeps the table's horizontal edge inset, so the visible width
      // available to the panel is the scroller minus that padding — sizing to
      // the scroller alone overhangs it by exactly one inset.
      const cell = el.parentElement
      const cs = cell ? getComputedStyle(cell) : null
      const pad = cs ? parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) : 0
      setWidth(Math.max(0, scroller.clientWidth - pad))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(scroller)
    return () => ro.disconnect()
  }, [ref])
  return width
}
