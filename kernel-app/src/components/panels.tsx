import * as React from "react"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/* Shared panel furniture — the app-wide conventions for activity/detail cards.
   Lifted out of pages/scenarios.tsx once the Overview needed the same pieces:
   one source for the framed-table + tile + flag treatment everywhere. */

/** A roll-up figure. A row of these heads a panel, so the row answers the
    question before the table has to be read at all. */
export function Tile({ value, label }: { value: React.ReactNode; label: string }) {
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
