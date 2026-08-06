import { cn } from "@/lib/utils"

/* Shared panel furniture — the conventions for activity/detail cards: one
   source for the framed-table + tile treatment.

   A frame nested inside a card is a plate on a plate: it takes the lip and a
   fill one step off the card, but no cast. A drop shadow at both levels is how
   an interface starts to look upholstered — surface + edge is enough
   separation. The frame's own border supplies the hairline. */
const PLATE = "bg-[var(--elev-plate)] shadow-[inset_0_1px_0_var(--elev-lip)]"

/** Two-line cell: a value and the quantity behind it. The sub carries its own
    unit — with no column head above it, a bare number is a number of nothing. */
function TwoLine({ top, sub, strong }: { top: React.ReactNode; sub?: string; strong?: boolean }) {
  return (
    <div data-slot="two-line" className="leading-tight">
      <div className={cn("whitespace-nowrap", strong && "font-semibold")}>{top}</div>
      {sub ? <div className="text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  )
}

/** A roll-up figure. A row of these heads a panel, so the row answers the
    question before the table has to be read at all.

    Two sizes, like PageHeader: the default heads a panel inside a page, `lg`
    heads the thing itself.

    The large size is unfilled — outline only, no plate. At this figure size the
    number is the object and a fill behind it would be a box around a headline;
    the hairline is there to group the row, not to raise it. It is padded like a
    card rather than like a cell: a figure this size needs air around it before
    the hairline, or the tile reads as a number that was cropped to fit.

    Its corner is the panel's, less the padding it sits in — the concentric
    arithmetic (register 3.26), because it is the same relationship. A card
    sharing its container's radius makes the two corners read as one thick
    corner; a card this size wearing the control radius reads as a button that
    grew. Outer minus inset is the answer to both.

    Its figure is sized off the tile, not off the page: `cqw` makes the number
    as large as its own cell can hold, floored so it never falls under the
    panel's body text.

    Not every figure earns a trace, so the tile reserves the trace's room
    either way. A row of cards whose bottoms do not line up reads as cards
    that failed to load rather than as figures that differ. */
function Tile({
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
      <div
        data-slot="tile"
        data-size="lg"
        className="@container overflow-hidden rounded-[calc(var(--panel-radius)-var(--panel-inset))] border border-border pt-7"
      >
        <div className="px-5">
          {/* Label over figure. A caption under a number is a footnote to it;
              above, it is the question the number answers — and the questions
              line up across the row at a constant height, which a row of
              figures set in different digit counts never does. */}
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
              the same room open so the row's bottoms land on one line. */}
          <div className="h-12">{chart}</div>
        </div>
      </div>
    )
  }
  return (
    /* Same plate recipe as TableFrame: a tile and the table below it are the
       same kind of object, so they take the same fill and lip. */
    <div data-slot="tile" className={cn("rounded-lg border border-border px-3 py-2", PLATE)}>
      <div className="text-xl leading-tight font-semibold tabular-nums">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

/** The glyph chip that leads a panel header. */
function IconChip({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    /* foreground overlay, not bg-muted: in the v2 dark theme --muted resolves
       to the same value as --card, so a muted chip on a card is invisible. */
    <span
      data-slot="icon-chip"
      className="grid size-8 shrink-0 place-items-center rounded-lg bg-foreground/5 text-muted-foreground"
    >
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
function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div data-slot="stat">
      <div className="text-lg leading-none font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

/** Outlined frame — tables sit in one of these. It carries the plate recipe
    (the fill one step off the card plus the top lip), so a framed table reads
    as placed ON the panel rather than drawn into it. `dense` is the default
    and is exposed as a `data-dense` styling hook; top-level object tables pass
    `dense={false}` to keep the roomier step. */
function TableFrame({
  children,
  dense = true,
}: {
  children: React.ReactNode
  dense?: boolean
}) {
  return (
    <div
      data-slot="table-frame"
      data-dense={dense ? "" : undefined}
      className={cn("overflow-x-auto rounded-lg border border-border", PLATE)}
    >
      {children}
    </div>
  )
}

/** The framed table's empty state: one muted line in the body's own type, not
    a card-sized Empty — inside a frame the table is the context, and a block
    treatment would out-weigh the rows it stands in for. */
function PanelEmpty({ children }: { children: React.ReactNode }) {
  return (
    <p data-slot="panel-empty" className="py-2 text-sm text-muted-foreground">
      {children}
    </p>
  )
}

export { IconChip, PanelEmpty, Stat, TableFrame, Tile, TwoLine }
