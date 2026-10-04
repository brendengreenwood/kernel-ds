import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CommodityBadge } from "@/components/ui/commodity-badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { X } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

import { DrawAreaMap } from "@app/components/draw-area-map"
import {
  COMMODITY_OF,
  COMPANY,
  CROP,
  FACILITY,
  SITES,
  type Company,
  type Crop,
  type FacilityType,
  type Site,
} from "@app/data/sites"
import { analyse, fmtMi, rivalsNear, type Pair } from "@app/lib/analysis"
import { useTheme } from "@app/lib/theme"

const COMPANIES: Company[] = ["C", "A"]
const TYPES: FacilityType[] = ["r", "i", "p", "x"]
const CROPS: Crop[] = ["c", "s", "w", "m", "o"]
const CO_SWATCH: Record<Company, string> = { C: "bg-om-cargill", A: "bg-om-adm" }
const CO_TEXT: Record<Company, string> = { C: "text-om-cargill", A: "text-om-adm" }

const PANEL =
  "grid gap-3 rounded-[var(--radius-floating)] border border-border bg-card/95 p-4 shadow-lg backdrop-blur"
const PANEL_TITLE = "text-sm font-semibold"

type SheetTab = "overview" | "filters" | "regions" | "pairs"
type FilterTab = "radius" | "company" | "facility" | "commodity"
const FILTER_TABS: [FilterTab, string][] = [
  ["radius", "Radius"],
  ["company", "Company"],
  ["facility", "Facility"],
  ["commodity", "Commodity"],
]
const SHEET_TABS: [SheetTab, string][] = [
  ["overview", "Overview"],
  ["filters", "Filters"],
  ["regions", "Regions"],
  ["pairs", "Pairs"],
]

function toggle<T>(set: Set<T>, v: T) {
  const next = new Set(set)
  if (next.has(v)) next.delete(v)
  else next.add(v)
  return next
}

/** The facility-type glyph, matching the map's SDF shapes. */
function Shape({ type, className }: { type: FacilityType; className?: string }) {
  const d = {
    i: <circle cx="6" cy="6" r="4" />,
    r: <path d="M6 1.4 10.6 9.6H1.4Z" />,
    p: <rect x="2" y="2" width="8" height="8" />,
    x: <path d="M6 1 11 6 6 11 1 6Z" />,
  }[type]
  return (
    <svg viewBox="0 0 12 12" aria-hidden className={cn("size-3 shrink-0 fill-current", className)}>
      {d}
    </svg>
  )
}

function CropTag({ crop }: { crop: Crop }) {
  const commodity = COMMODITY_OF[crop]
  return commodity ? (
    <CommodityBadge commodity={commodity}>{CROP[crop]}</CommodityBadge>
  ) : (
    <Badge variant="outline">{CROP[crop]}</Badge>
  )
}

function SiteName({ s, sub = true }: { s: Site; sub?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <Shape type={s.type} className={CO_TEXT[s.co]} />
      <span className="truncate">
        {s.name}, {s.state}
      </span>
      {sub && <span className="hidden truncate text-xs text-muted-foreground sm:inline">{FACILITY[s.type].label.toLowerCase()}</span>}
    </span>
  )
}

function FilterGroup({ legend, className, children }: { legend: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn(PANEL, className)}>
      <fieldset className="grid xl:gap-2">
        <legend className={cn(PANEL_TITLE, "mb-2")}>{legend}</legend>
        {children}
      </fieldset>
    </div>
  )
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className="-mx-2 flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-control)] px-2 text-base hover:bg-foreground/8 active:bg-foreground/12 xl:-mx-1.5 xl:min-h-0 xl:gap-2.5 xl:px-1.5 xl:py-1 xl:text-sm">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <span className="flex min-w-0 items-center gap-1.5">{children}</span>
    </label>
  )
}

export default function DrawAreasPage() {
  const { theme } = useTheme()
  const [radius, setRadius] = React.useState(35)
  const [showDraw, setShowDraw] = React.useState(false)
  const [companies, setCompanies] = React.useState(() => new Set<Company>(COMPANIES))
  const [types, setTypes] = React.useState(() => new Set<FacilityType>(TYPES))
  const [crops, setCrops] = React.useState(() => new Set<Crop>(CROPS))
  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const [pinnedPair, setPinnedPair] = React.useState<[number, number] | null>(null)
  const [hoverPair, setHoverPair] = React.useState<[number, number] | null>(null)
  const [focusKey, setFocusKey] = React.useState(0)
  const [basemap, setBasemap] = React.useState<"tiles" | "fallback">("tiles")

  const visibleSites = React.useMemo(
    () => SITES.filter((s) => companies.has(s.co) && types.has(s.type) && s.crops.some((c) => crops.has(c))),
    [companies, types, crops],
  )
  const visible = React.useMemo(() => new Set(visibleSites.map((s) => s.id)), [visibleSites])
  const a = React.useMemo(() => analyse(visibleSites, radius), [visibleSites, radius])

  const selected = selectedId != null ? SITES[selectedId] : null
  const rivals = React.useMemo(() => (selected ? rivalsNear(selected, SITES, radius) : []), [selected, radius])
  // Filters narrow the map, but a selected site or pair keeps its relationships visible.
  const mapVisible = React.useMemo(() => {
    const v = new Set(visible)
    if (selected) {
      v.add(selected.id)
      rivals.forEach((r) => v.add(r.site.id))
    }
    ;(hoverPair ?? pinnedPair)?.forEach((i) => v.add(i))
    return v
  }, [visible, selected, rivals, hoverPair, pinnedPair])
  const bothOn = companies.size === 2

  const select = (id: number | null, focus = false) => {
    setSelectedId(id)
    setPinnedPair(null)
    if (focus) setFocusKey((k) => k + 1)
  }
  const focusPair = (p: Pair) => {
    setSelectedId(null)
    setPinnedPair([p.c.id, p.a.id])
    setFocusKey((k) => k + 1)
  }
  const focusRival = (s: Site, o: Site) => {
    setPinnedPair(s.co === "C" ? [s.id, o.id] : [o.id, s.id])
    setFocusKey((k) => k + 1)
  }
  const [tab, setTab] = React.useState<SheetTab | null>(null)
  const [filterTab, setFilterTab] = React.useState<FilterTab>("radius")
  React.useEffect(() => {
    if (selected) setTab("overview")
  }, [selected])
  const resetView = () => {
    setSelectedId(null)
    setPinnedPair(null)
    setFocusKey((k) => k + 1)
  }

  // Desktop: every panel floats on the map at its own anchor. Phones: the map fills the
  // screen and the panels move into a tabbed sheet below it, one tab at a time.
  // Layout follows the map's own width, not the window: the app sidebar takes a share.
  const rootRef = React.useRef<HTMLDivElement>(null)
  const desktop = useMinWidth(rootRef, 1120)
  // Phones show one filter panel at a time, picked from the Filters sub-bar.
  const [dock, setDock] = React.useState<FilterTab | null>(null)
  const sub = (k: FilterTab) => ((desktop ? dock : filterTab) !== k ? "hidden" : "")
  const fpos = (w: string) => (desktop ? cn("pointer-events-auto absolute bottom-full left-0 z-10 mb-2", w) : "")
  const pos = (cls: string) => (desktop ? cn("absolute z-10", cls) : "")
  // Overflowing bodies scroll inside their own panel, with Kernel's scrollbar, on desktop only.
  const body = (maxH: string) => (desktop ? maxH : "")
  // Right-side panels collapse to floating pills on desktop and slide back in from the right.
  // Newest-opened panel takes the top slot under the pills and pushes the other down.
  type Side = "regions" | "pairs"
  const [order, setOrder] = React.useState<Side[]>([])
  const open = { regions: order.includes("regions"), pairs: order.includes("pairs") }
  const flip = (k: Side) => setOrder((o) => (o.includes(k) ? o.filter((x) => x !== k) : [k, ...o]))
  const enter = desktop
    ? "pointer-events-auto flex min-h-0 flex-col animate-in fade-in slide-in-from-right-8 duration-200 motion-reduce:animate-none"
    : ""
  // When the right column reaches the bottom corner, the map controls step left of it.
  const colRef = React.useRef<HTMLDivElement>(null)
  const [colLow, setColLow] = React.useState(false)
  React.useEffect(() => {
    const el = colRef.current
    if (!el) return setColLow(false)
    const ro = new ResizeObserver(() => {
      const parent = el.parentElement!.getBoundingClientRect()
      setColLow((el.lastElementChild ?? el).getBoundingClientRect().bottom > parent.bottom - 96)
    })
    for (const k of el.children) ro.observe(k)
    return () => ro.disconnect()
  }, [desktop, order.length])
  const head = (k: Side, title: string) => (
    <div className="flex items-center justify-between gap-2">
      <h2 className={PANEL_TITLE}>{title}</h2>
      {desktop && (
        <Button variant="ghost" size="icon-sm" className="-my-1.5 -mr-2" aria-label={`Close ${title.toLowerCase()}`} onClick={() => flip(k)}>
          <X />
        </Button>
      )}
    </div>
  )
  const pill = (k: Side, title: string) => (
    <Button
      variant={open[k] ? "default" : "outline"}
      className={cn("pointer-events-auto rounded-full shadow-lg", !open[k] && "bg-card/95 backdrop-blur")}
      aria-expanded={open[k]}
      onClick={() => flip(k)}
    >
      {title}
    </Button>
  )

  const crop1 = [...crops][0]
  const applied: Record<FilterTab, [string, boolean]> = {
    radius: [showDraw ? `Draw areas · ${radius} mi` : "Draw areas off", showDraw],
    company: [
      companies.size === 2 ? "All companies" : companies.size === 1 ? COMPANY[[...companies][0]] : "No company",
      companies.size !== 2,
    ],
    facility: [types.size === TYPES.length ? "All facilities" : `${types.size} of ${TYPES.length} facilities`, types.size !== TYPES.length],
    commodity: [
      crops.size === CROPS.length
        ? "All commodities"
        : crops.size === 1 && crop1
          ? CROP[crop1]
          : `${crops.size} of ${CROPS.length} commodities`,
      crops.size !== CROPS.length,
    ],
  }
  const dockRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!dock) return
    const off = (e: PointerEvent) => {
      if (!dockRef.current?.contains(e.target as Node)) setDock(null)
    }
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setDock(null)
    document.addEventListener("pointerdown", off)
    document.addEventListener("keydown", esc)
    return () => {
      document.removeEventListener("pointerdown", off)
      document.removeEventListener("keydown", esc)
    }
  }, [dock])
  const fp: Record<FilterTab, React.ReactNode> = {
    radius: (
      <section aria-label="Draw radius" className={cn(PANEL, fpos("w-[240px]"), sub("radius"))}>
            <div className="grid gap-3">
              <label className="-mx-2 flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-control)] px-2 text-base hover:bg-foreground/8 active:bg-foreground/12 xl:-mx-1.5 xl:min-h-0 xl:px-1.5 xl:py-1 xl:text-sm">
                Show draw areas
                <Switch checked={showDraw} onCheckedChange={setShowDraw} />
              </label>
              <div className={cn("flex items-baseline justify-between", !showDraw && "opacity-50")}>
                <span id="radius-label" className="text-sm font-medium">
                  Draw radius
                </span>
                <output htmlFor="radius" className="font-mono text-sm tabular-nums">
                  {radius} mi
                </output>
              </div>
              <Slider
                id="radius"
                aria-labelledby="radius-label"
                min={15}
                max={75}
                step={5}
                disabled={!showDraw}
                value={[radius]}
                onValueChange={(v) => setRadius(Array.isArray(v) ? v[0] : v)}
              />
              <p className="text-xs leading-4 text-muted-foreground">
                An assumption, not data. Real draws follow highways and rail and shrink toward a nearer competitor.
              </p>
            </div>
        </section>
    ),
    company: (
      <FilterGroup legend="Company" className={cn(fpos("w-[180px]"), sub("company"))}>
              {COMPANIES.map((co) => (
                <Check key={co} checked={companies.has(co)} onChange={() => setCompanies((s) => toggle(s, co))}>
                  <span className={cn("size-2.5 rounded-full", CO_SWATCH[co])} />
                  {COMPANY[co]}
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {SITES.filter((s) => s.co === co).length}
                  </span>
                </Check>
              ))}
            </FilterGroup>
    ),
    facility: (
      <FilterGroup legend="Facility type" className={cn(fpos("w-[210px]"), sub("facility"))}>
              {TYPES.map((t) => (
                <Check key={t} checked={types.has(t)} onChange={() => setTypes((s) => toggle(s, t))}>
                  <Shape type={t} />
                  {FACILITY[t].plural}
                </Check>
              ))}
            </FilterGroup>
    ),
    commodity: (
      <FilterGroup legend="Commodity" className={cn(fpos("w-[200px]"), sub("commodity"))}>
              {CROPS.map((c) => (
                <Check key={c} checked={crops.has(c)} onChange={() => setCrops((s) => toggle(s, c))}>
                  {CROP[c]}
                </Check>
              ))}
            </FilterGroup>
    ),
  }

  const panels: Record<SheetTab, React.ReactNode> = {
    overview: (
      <>
        <section
          aria-label="Summary"
          className={cn("grid grid-cols-2 gap-2", desktop && "pointer-events-none absolute top-3 left-[272px] z-10 flex items-start")}
        >
          <h1 className="sr-only">Where Cargill and ADM buy from the same farmers</h1>
            <Popover>
              <PopoverTrigger
                render={
                  <Button variant="outline" className="pointer-events-auto col-span-2 w-fit rounded-full bg-card/95 shadow-lg backdrop-blur" />
                }
              >
                About this data
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 text-xs leading-4 text-muted-foreground">
                <ul className="grid list-disc gap-1.5 pl-4">
            <li>
              Sites come from each company's public bid listings (Cargill Ag locations, Farmbucks) and NOPA / Corn
              Refiners member lists, placed at the town's ZIP centroid, not the street address.
            </li>
            <li>ADM's list is only sites that post public bids; ADM runs more US locations than that.</li>
            <li>
              Facility type was assigned by whether the town sits on a navigable river, so a few will be wrong. Crop tags
              come from posted bids.
            </li>
            <li>Cargill's Kalama, Portland and Tacoma TEMCO terminals are not shown; Houston is.</li>
            <li>Draw areas are circles. A river terminal's real draw is a corridor along the river and its feeder roads.</li>
          </ul>
              </PopoverContent>
            </Popover>
        </section>
        {selected && (
          <section
            aria-label="Selected site"
            className={cn(PANEL, "grid-rows-[auto_minmax(0,1fr)]", pos("top-[112px] left-3 w-[320px] max-h-[calc(100%-112px-76px)]"), desktop && "animate-in fade-in slide-in-from-left-8 duration-200 motion-reduce:animate-none")}
          >
            <div className="flex items-start gap-2">
              <div className="grid min-w-0 flex-1 gap-0.5">
                <span className={cn("text-xs font-medium", CO_TEXT[selected.co])}>{COMPANY[selected.co]}</span>
                <h2 className="text-base font-semibold leading-6">
                  {selected.name}, {selected.state}
                </h2>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Shape type={selected.type} />
                  {FACILITY[selected.type].label} · {selected.region}
                </span>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="Clear selection" onClick={() => select(null)}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selected.crops.map((c) => (
                <CropTag key={c} crop={c} />
              ))}
            </div>
            <ScrollArea className={cn("-mr-3 pr-3 [&_[data-slot=scroll-area-viewport]]:max-h-[inherit]", body("max-h-[calc(100dvh-56px-160px-250px)]"))}>
            <div className="grid gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                {selected.type === "x" ? "Export terminals draw by barge and rail" : `Rival sites within ${radius * 2} mi`}
              </span>
              {selected.type !== "x" &&
                (rivals.length ? (
                  <ul className="grid">
                    {rivals.map(({ site, mi }) => (
                      <li key={site.id}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-control)] px-1.5 py-1.5 text-left text-sm hover:bg-foreground/8 active:bg-foreground/12 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                          onMouseEnter={() => setHoverPair(selected.co === "C" ? [selected.id, site.id] : [site.id, selected.id])}
                          onMouseLeave={() => setHoverPair(null)}
                          onClick={() => focusRival(selected, site)}
                        >
                          <SiteName s={site} />
                          <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{fmtMi(mi)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No rival site in reach at this radius.</p>
                ))}
            </div>
            </ScrollArea>
          </section>
        )}
      </>
    ),
    filters: (
      <>
        {fp.radius}
        {fp.company}
        {fp.facility}
        {fp.commodity}
      </>
    ),
    regions: (
      <section aria-label="Regions" className={cn(PANEL, enter)}>
        {head("regions", "Regions")}
        <ScrollArea className={cn("-mr-3 pr-3 [&_[data-slot=scroll-area-viewport]]:max-h-[inherit]", desktop && "min-h-0 flex-1")}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead className="text-right">Cargill</TableHead>
                    <TableHead className="text-right">ADM</TableHead>
                    <TableHead className="text-right">In reach</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {a.regions.map((r) => (
                    <TableRow
                      key={r.region}
                      className={cn("hover:bg-transparent", r.closest && "cursor-pointer hover:bg-foreground/8 active:bg-foreground/12")}
                      onMouseEnter={() => r.closest && setHoverPair([r.closest.c.id, r.closest.a.id])}
                      onMouseLeave={() => setHoverPair(null)}
                      onClick={() => r.closest && focusPair(r.closest)}
                    >
                      <TableCell className="whitespace-normal">
                        <div className="grid">
                          <span>{r.region}</span>
                          {r.closest && (
                            <span className="text-xs text-muted-foreground">
                              {r.closest.c.name} / {r.closest.a.name} · {fmtMi(r.closest.mi)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{r.cargill}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{r.adm}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {r.cargill && bothOn ? `${r.contested}/${r.cargill}` : "–"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            <p className="mt-3 text-xs leading-4 text-muted-foreground">
              Regions follow the river systems and interior belts the trade uses. "In reach" counts Cargill sites with
              an ADM site within two draw radii. Export terminals are excluded. Select a row to fly to its closest pair.
            </p>
        </ScrollArea>
      </section>
    ),
    pairs: (
      <section aria-label="Closest pairs" className={cn(PANEL, enter)}>
        {head("pairs", "Closest pairs")}
        <ScrollArea className={cn("-mr-3 pr-3 [&_[data-slot=scroll-area-viewport]]:max-h-[inherit]", desktop && "min-h-0 flex-1")}>
            {a.pairs.length ? (
              <ol className="grid">
                {a.pairs.slice(0, 30).map((p) => {
                  const on = pinnedPair?.[0] === p.c.id && pinnedPair?.[1] === p.a.id
                  return (
                    <li key={`${p.c.id}-${p.a.id}`}>
                      <button
                        type="button"
                        aria-pressed={on}
                        className={cn(
                          "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 rounded-[var(--radius-control)] px-2 py-2 text-left text-sm hover:bg-foreground/8 active:bg-foreground/12 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                          on && "bg-muted shadow-[inset_2px_0_0_var(--foreground)]",
                        )}
                        onMouseEnter={() => setHoverPair([p.c.id, p.a.id])}
                        onMouseLeave={() => setHoverPair(null)}
                        onClick={() => focusPair(p)}
                      >
                        <SiteName s={p.c} sub={false} />
                        <span className="row-span-2 font-mono text-xs tabular-nums text-muted-foreground">
                          {p.mi < 1 ? "0 mi" : `${Math.round(p.mi)} mi`}
                        </span>
                        <SiteName s={p.a} sub={false} />
                        <span className="col-span-2 text-xs text-muted-foreground">
                          {p.shared.length ? `Both bid ${p.shared.map((c) => CROP[c].toLowerCase()).join(", ")}` : "Different crops"}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">Turn on both companies to see pairs.</p>
            )}
            <p className="mt-3 text-xs leading-4 text-muted-foreground">
              The 30 closest Cargill–ADM pairs among the sites shown, excluding export terminals. Straight-line
              distance between town centroids.
            </p>
        </ScrollArea>
      </section>
    ),
  }

  return (
    <div ref={rootRef} className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <section aria-label="Map" className={cn("relative min-h-0 flex-1 [&_.maplibregl-ctrl-bottom-left]:left-1/2! [&_.maplibregl-ctrl-bottom-left]:-translate-x-1/2 [&_.maplibregl-ctrl-bottom-right]:transition-[right] [&_.maplibregl-ctrl-bottom-right]:duration-[var(--duration-base)]", desktop && colLow && "[&_.maplibregl-ctrl-bottom-right]:right-[392px]!")}>
        <DrawAreaMap
          sites={SITES}
          visible={mapVisible}
          radiusMi={radius}
          showDraw={showDraw}
            onReset={resetView}
          theme={theme}
          selectedId={selected?.id ?? null}
          pair={hoverPair ?? pinnedPair}
          focusKey={focusKey}
          onSelect={(id) => select(id)}
          onBasemap={setBasemap}
        />
        {basemap === "fallback" && (
          <p className="absolute right-14 bottom-8 max-w-64 rounded-[var(--radius-control)] border border-border bg-card/95 px-2.5 py-1.5 text-xs text-muted-foreground shadow-sm">
            Basemap tiles didn't load — showing state outlines. Sites and draw areas are unaffected.
          </p>
        )}
        <div className={cn("pointer-events-none absolute top-3 left-14 flex flex-col gap-2 md:left-3", desktop && "top-3")}>
          <div className="pointer-events-auto grid content-center gap-1.5 rounded-[var(--radius-floating)] border border-border bg-card/95 px-3 py-2.5 text-xs shadow-lg backdrop-blur xl:h-[5.5rem]">
            <div className="flex gap-3">
              {COMPANIES.map((co) => (
                <span key={co} className="flex items-center gap-1.5 font-medium">
                  <span className={cn("size-2.5 rounded-full", CO_SWATCH[co])} />
                  {COMPANY[co]}
                </span>
              ))}
            </div>
            <div className="hidden grid-cols-2 gap-x-3 gap-y-1 text-muted-foreground sm:grid">
              {TYPES.map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Shape type={t} className="text-foreground" />
                  {FACILITY[t].label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {desktop ? (
        <>
          {panels.overview}
          <div ref={dockRef} role="toolbar" aria-label="Filters" className="pointer-events-none absolute bottom-3 left-3 z-20 flex gap-2">
            {FILTER_TABS.map(([k]) => {
              const [label, on] = applied[k]
              return (
                <div key={k} className="relative">
                  {dock === k && fp[k]}
                  <Button
                    variant={dock === k ? "default" : "outline"}
                    className={cn(
                      "pointer-events-auto rounded-full shadow-lg",
                      dock !== k && "bg-card/95 backdrop-blur",
                      dock !== k && on && "border-primary",
                    )}
                    aria-expanded={dock === k}
                    onClick={() => setDock(dock === k ? null : k)}
                  >
                    {on && dock !== k && <span aria-hidden className="size-1.5 rounded-full bg-primary" />}
                    {label}
                  </Button>
                </div>
              )
            })}
          </div>
          {order.length > 0 && (
            <div ref={colRef} className="pointer-events-none absolute top-16 right-3 bottom-3 z-10 flex w-[380px] flex-col justify-start gap-3">
              {order.map((k) => (
                <React.Fragment key={k}>{panels[k]}</React.Fragment>
              ))}
            </div>
          )}
          <div className="pointer-events-none absolute top-3 right-3 z-20 flex gap-2">
            {pill("pairs", "Closest pairs")}
            {pill("regions", "Regions")}
          </div>
        </>
      ) : (
        <div className="pointer-events-none absolute inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-10 flex flex-col gap-2">
          {tab && (
            <ScrollArea className="pointer-events-auto min-h-0 pr-3 [&_[data-slot=scroll-area-viewport]]:max-h-[55dvh]">
              <div role="tabpanel" className="grid gap-2">
                {panels[tab]}
              </div>
            </ScrollArea>
          )}
          {tab === "filters" && (
            <div
              role="tablist"
              aria-label="Filter type"
              className="pointer-events-auto flex gap-1 overflow-x-auto rounded-[var(--radius-floating)] border border-border bg-card/95 p-1 shadow-lg backdrop-blur"
            >
              {FILTER_TABS.map(([t, label]) => (
                <Button
                  key={t}
                  role="tab"
                  aria-selected={filterTab === t}
                  variant={filterTab === t ? "default" : "ghost"}
                  className="flex-1"
                  onClick={() => setFilterTab(t)}
                >
                  {label}
                </Button>
              ))}
            </div>
          )}
          <nav
            role="tablist"
            aria-label="Panels"
            className="pointer-events-auto flex gap-1 rounded-[var(--radius-floating)] border border-border bg-card/95 p-1 shadow-lg backdrop-blur"
          >
            {SHEET_TABS.map(([t, label]) => (
              <Button
                key={t}
                role="tab"
                aria-selected={tab === t}
                variant={tab === t ? "default" : "ghost"}
                size="lg"
                className="flex-1"
                onClick={() => setTab(tab === t ? null : t)}
              >
                {label}
              </Button>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}

function useMinWidth(ref: React.RefObject<HTMLElement | null>, min: number) {
  const [ok, setOk] = React.useState(false)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setOk(e.contentRect.width >= min))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, min])
  return ok
}
