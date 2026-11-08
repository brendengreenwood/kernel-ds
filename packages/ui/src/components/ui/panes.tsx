import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "@/components/ui/icon"
import { ScrollArea } from "@/components/ui/scroll-area"

/* Floating panes (decision 0083) — the layout role for screens where content
   is a canvas (map, chart, diagram) and controls float over it. A distinct
   role from PanelShell: connected panels share seams, floating panes never do.

   One canvas owns the rhythm: every pane sits var(--pane-inset) from the edge
   and var(--pane-gap) from its neighbours. The canvas measures its own width
   (not the window) to pick "floating" or "sheet", because app chrome such as
   a sidebar takes a share of the window. */

type PaneLayout = "floating" | "sheet"
type PaneEdge = "left" | "right"

type PaneCanvasContextValue = {
  layout: PaneLayout
  reserve: (edge: PaneEdge, px: number) => void
}

const PaneCanvasContext = React.createContext<PaneCanvasContextValue>({
  layout: "floating",
  reserve: () => {},
})

/** "floating" when the canvas is wide enough for panes, "sheet" otherwise. */
function usePaneLayout() {
  return React.useContext(PaneCanvasContext).layout
}

/** Full-bleed host for a canvas and the panes over it. Publishes how much of
    each bottom corner a PaneStack occupies as --pane-reserve-left/right, so
    canvas controls (map zoom, chart legends) can step aside. */
function PaneCanvas({
  threshold = 1120,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & { threshold?: number }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [layout, setLayout] = React.useState<PaneLayout>("floating")
  const [reserved, setReserved] = React.useState<Record<PaneEdge, number>>({ left: 0, right: 0 })

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setLayout(e.contentRect.width >= threshold ? "floating" : "sheet"))
    ro.observe(el)
    return () => ro.disconnect()
  }, [threshold])

  const reserve = React.useCallback((edge: PaneEdge, px: number) => {
    setReserved((r) => (r[edge] === px ? r : { ...r, [edge]: px }))
  }, [])
  const value = React.useMemo(() => ({ layout, reserve }), [layout, reserve])

  return (
    <PaneCanvasContext.Provider value={value}>
      <div
        ref={ref}
        data-slot="pane-canvas"
        data-layout={layout}
        className={cn("relative isolate size-full min-h-0 overflow-hidden", className)}
        style={
          {
            "--pane-reserve-left": `${reserved.left}px`,
            "--pane-reserve-right": `${reserved.right}px`,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    </PaneCanvasContext.Provider>
  )
}

const ENTER: Record<"left" | "right" | "top" | "bottom", string> = {
  left: "slide-in-from-left-8",
  right: "slide-in-from-right-8",
  top: "slide-in-from-top-2",
  bottom: "slide-in-from-bottom-2",
}

/** The floating surface. Owns its frame, title row, close button and an inner
    ScrollArea whose scrollbar sits inside the pane's padding, not on its edge. */
function FloatingPane({
  title,
  onClose,
  side = "bottom",
  className,
  bodyClassName,
  children,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  title?: React.ReactNode
  onClose?: () => void
  /** Edge the pane lives on; drives its enter motion. */
  side?: keyof typeof ENTER
  bodyClassName?: string
}) {
  const titleId = React.useId()
  return (
    <section
      data-slot="floating-pane"
      data-side={side}
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        "pointer-events-auto flex min-h-0 flex-col overflow-hidden rounded-[var(--radius-floating)] border border-border bg-card/95 text-card-foreground shadow-lg backdrop-blur",
        "animate-in fade-in duration-[var(--duration-base)] ease-[var(--ease-out)] motion-reduce:animate-none",
        ENTER[side],
        className
      )}
      {...props}
    >
      {(title || onClose) && (
        <header data-slot="floating-pane-header" className="flex shrink-0 items-center gap-2 pt-3 pr-2 pl-4">
          <h2 id={titleId} className="min-w-0 flex-1 truncate text-sm font-semibold">
            {title}
          </h2>
          {onClose && (
            <Button variant="ghost" size="icon-sm" aria-label="Close" onClick={onClose}>
              <XIcon />
            </Button>
          )}
        </header>
      )}
      <ScrollArea data-slot="floating-pane-body" className="mr-1 min-h-0 flex-1">
        <div className={cn("grid gap-3 py-3 pr-3 pl-4", !(title || onClose) && "pt-4", bodyClassName)}>{children}</div>
      </ScrollArea>
    </section>
  )
}

/** Newest-first open state for panes that share a column: opening a pane puts
    it on top and pushes the others down; closing removes it. */
function usePaneOrder<K extends string>(initial: K[] = []) {
  const [order, setOrder] = React.useState<K[]>(initial)
  const toggle = React.useCallback(
    (k: K) => setOrder((o) => (o.includes(k) ? o.filter((x) => x !== k) : [k, ...o])),
    []
  )
  const close = React.useCallback((k: K) => setOrder((o) => o.filter((x) => x !== k)), [])
  return { order, toggle, close, isOpen: (k: K) => order.includes(k) }
}

/** An edge column of panes. Panes share its height; when the bottom pane
    reaches the corner, the column reserves that corner on the canvas. */
function PaneStack({
  side = "right",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { side?: PaneEdge }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { layout, reserve } = React.useContext(PaneCanvasContext)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const last = el.lastElementChild
      const low = !!last && el.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom < 96
      // distance from the canvas edge to the column's far side, plus one gap
      const canvas = el.offsetParent?.getBoundingClientRect()
      const box = el.getBoundingClientRect()
      const gap = parseFloat(getComputedStyle(el).rowGap) || 0
      const span = canvas ? (side === "right" ? canvas.right - box.left : box.right - canvas.left) + gap : 0
      reserve(side, low && layout === "floating" ? Math.round(span) : 0)
    }
    const ro = new ResizeObserver(measure)
    const watch = () => {
      ro.disconnect()
      ro.observe(el)
      for (const child of Array.from(el.children)) ro.observe(child)
      measure()
    }
    const mo = new MutationObserver(watch)
    mo.observe(el, { childList: true })
    watch()
    return () => {
      mo.disconnect()
      ro.disconnect()
      reserve(side, 0)
    }
  }, [side, layout, reserve])

  return (
    <div
      ref={ref}
      data-slot="pane-stack"
      data-side={side}
      className={cn(
        "pointer-events-none absolute z-10 flex flex-col gap-[var(--pane-gap)] *:data-[slot=floating-pane]:min-h-0 *:data-[slot=floating-pane]:flex-1",
        layout === "floating"
          ? cn(
              "top-[var(--pane-inset)] bottom-[var(--pane-inset)] w-96 max-w-[calc(100%-2*var(--pane-inset))]",
              side === "right" ? "right-[var(--pane-inset)]" : "left-[var(--pane-inset)]"
            )
          : "inset-x-[var(--pane-inset)] top-[var(--pane-inset)] bottom-[calc(var(--pane-inset)+var(--control-h-lg)+var(--pane-gap))]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/** A row of pane triggers. Sits inside a PaneStack (above its panes) or in a
    canvas corner. */
function PanePillBar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="toolbar"
      data-slot="pane-pill-bar"
      className={cn("pointer-events-none flex shrink-0 gap-[var(--pane-gap)]", className)}
      {...props}
    />
  )
}

/** Floating pill that opens a pane. `applied` marks a non-default setting
    (outline + dot) so the closed pill still says what it is doing. */
function PanePill({
  active = false,
  applied = false,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { active?: boolean; applied?: boolean }) {
  const layout = usePaneLayout()
  return (
    <Button
      data-slot="pane-pill"
      data-applied={applied || undefined}
      variant={active ? "default" : "outline"}
      aria-expanded={active}
      className={cn(
        "pointer-events-auto shrink-0 rounded-full shadow-lg",
        !active && "bg-card/95 backdrop-blur",
        applied && !active && "border-primary",
        layout === "sheet" && "h-(--control-h-lg) px-4",
        className
      )}
      {...props}
    >
      {children}
      {applied && !active && <span aria-hidden className="size-1.5 rounded-full bg-primary" />}
    </Button>
  )
}

type FilterDockItem<K extends string> = {
  key: K
  /** What the pill says — should state the current setting, e.g. "3 of 4 facilities". */
  label: React.ReactNode
  applied?: boolean
  title?: React.ReactNode
  content: React.ReactNode
  /** Pane width in floating layout. */
  paneClassName?: string
}

/** A bottom row of filter pills, each opening its pane above it. One open at a
    time; Escape or a pointer outside closes it. The open pane takes pointer
    events itself, so clicks never fall through to the canvas. */
function FilterDock<K extends string>({
  items,
  className,
  "aria-label": ariaLabel = "Filters",
}: {
  items: FilterDockItem<K>[]
  className?: string
  "aria-label"?: string
}) {
  const layout = usePaneLayout()
  const ref = React.useRef<HTMLDivElement>(null)
  const [open, setOpen] = React.useState<K | null>(null)

  React.useEffect(() => {
    if (open == null) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null)
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onDown)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onDown)
    }
  }, [open])

  const sheet = layout === "sheet"
  const current = items.find((i) => i.key === open)
  const pane = (item: FilterDockItem<K>) => (
    <FloatingPane
      side="bottom"
      title={item.title}
      className={cn(
        "absolute bottom-full mb-[var(--pane-gap)] max-h-[min(28rem,70dvh)]",
        sheet ? "inset-x-0" : cn("left-0 w-60", item.paneClassName)
      )}
    >
      {item.content}
    </FloatingPane>
  )

  return (
    <div
      ref={ref}
      data-slot="filter-dock"
      data-layout={layout}
      className={cn(
        "pointer-events-none absolute bottom-[var(--pane-inset)] z-20",
        sheet ? "inset-x-[var(--pane-inset)]" : "left-[var(--pane-inset)] ml-[var(--pane-reserve-left)]",
        className
      )}
    >
      <PanePillBar aria-label={ariaLabel} className={cn(sheet && "overflow-x-auto")}>
        {items.map((item) => (
          <div key={item.key} className="relative">
            <PanePill
              active={open === item.key}
              applied={item.applied}
              onClick={() => setOpen((o) => (o === item.key ? null : item.key))}
            >
              {item.label}
            </PanePill>
            {!sheet && open === item.key && pane(item)}
          </div>
        ))}
      </PanePillBar>
      {sheet && current && pane(current)}
    </div>
  )
}

/** A canvas corner that holds free-standing panes or pills (legends, notes).
    In sheet layout top corners drop below the pill row so they never collide. */
function PaneCorner({
  corner,
  className,
  ...props
}: React.ComponentProps<"div"> & { corner: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
  const sheet = usePaneLayout() === "sheet"
  return (
    <div
      data-slot="pane-corner"
      data-corner={corner}
      className={cn(
        "pointer-events-none absolute z-10 flex items-start gap-[var(--pane-gap)]",
        corner.startsWith("top")
          ? sheet
            ? "top-[calc(var(--pane-inset)+var(--control-h)+var(--pane-gap))]"
            : "top-[var(--pane-inset)]"
          : "bottom-[var(--pane-inset)]",
        corner.endsWith("left") ? "left-[var(--pane-inset)]" : "right-[var(--pane-inset)] flex-row-reverse",
        className
      )}
      {...props}
    />
  )
}

export {
  FilterDock,
  FloatingPane,
  PaneCanvas,
  PaneCorner,
  PanePill,
  PanePillBar,
  PaneStack,
  usePaneLayout,
  usePaneOrder,
}
export type { FilterDockItem, PaneLayout }
