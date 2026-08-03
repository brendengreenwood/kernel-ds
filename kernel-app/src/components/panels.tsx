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

    It is padded like a card rather than like a cell: a figure this size needs
    air around it before the hairline, or the tile reads as a number that was
    cropped to fit. The inset used to be 12 units — the header chip plus its
    gap — so that a label started on the same vertical as the title of a header
    floating above the row. That alignment was doing the work a box does. Now
    that the header and the tiles are in one panel, the panel's own padding is
    the left rule they share, and the tile is free to be padded for its
    contents: 12 units inside a 190px card left 94px of text column, which
    wrapped "Bushels bought" onto two lines and dropped its figure off the row's
    line. The chart keeps a smaller inset than the text: an axis label is
    already inset from its own plot edge, so matching the text's padding would
    double it.

    Its corner is the panel's, less the padding it sits in — the same
    arithmetic the activity table's inner surface runs, because it is the same
    relationship. A card sharing its container's radius makes the two corners
    read as one thick corner; a card this size wearing the control radius reads
    as a button that grew. Outer minus inset is the answer to both.

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
      <div className="@container overflow-hidden rounded-[calc(var(--v2-panel-radius)-var(--v2-panel-inset))] border border-border pt-7">
        <div className="px-5">
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
    its label. Boxed variant is `Tile`.

    It sizes off the header it sits in, not off the page. A figure in a header's
    action slot is an aside to that header's title, and a 24px number beside a
    16px `section` title inverts them — the aside becomes the loudest thing in
    the panel and the title reads as its caption. `text-lg` against `text-base`
    keeps the figure the larger of the two without taking the title's job. */
export function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div>
      <div className="text-lg leading-none font-semibold tabular-nums">{value}</div>
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

    Three sizes, because there are three depths at which something gets named.

    `page` heads a route. `panel` heads a surface that is the subject of its own
    box — an opened row's summary is a page in miniature, and it was being built
    by hand out of a chip, a 14px bold line and a muted line under it. `section`
    heads a block INSIDE such a panel: it is the third name down and has to read
    as subordinate to the one above it, or the panel appears to hold two equal
    titles and the reader has to work out which owns which.

    The steps are 44/30, 36/20, 28/16 — chip and title falling together, so each
    size keeps the same relationship between the mark and the words rather than
    shrinking the type against a fixed chip.

    Heading LEVEL does not follow size. `page` is the h1; both smaller sizes are
    h2, because the panels of an opened row are peer sections of that row and a
    level chosen for its type size is how a document grows a heading hierarchy
    that does not match its structure. */
export function PageHeader({
  icon: Icon,
  title,
  description,
  action,
  size = "page",
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  size?: "page" | "panel" | "section"
}) {
  const Heading = size === "page" ? "h1" : "h2"
  const s = SIZES[size]
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <span data-v2-pagechip data-size={size} className={s.chip}>
            <Icon className={s.glyph} />
          </span>
        ) : null}
        <div className="min-w-0">
          <Heading className={`${s.title} font-semibold tracking-tight`}>{title}</Heading>
          {description ? (
            <p className={`mt-0.5 ${s.description} text-muted-foreground`}>{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="flex min-w-0 items-center gap-2">{action}</div> : null}
    </div>
  )
}

const SIZES = {
  page: {
    chip: "grid size-11 shrink-0 place-items-center",
    glyph: "size-6",
    title: "text-3xl",
    description: "text-sm",
  },
  panel: {
    chip: "grid size-9 shrink-0 place-items-center",
    glyph: "size-5",
    title: "text-xl",
    description: "text-sm",
  },
  section: {
    chip: "grid size-7 shrink-0 place-items-center",
    glyph: "size-4",
    title: "text-base",
    description: "text-xs",
  },
} as const

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
