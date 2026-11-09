import { GlyphIcon as Shape } from "@app/map/kit/glyph-icon"
import { useMapData } from "@app/map/data"
import { DEST, DEST_KINDS, type DestKind } from "@app/map/objects/destination"
import { COMPANIES, COMPANY, FACILITIES, FACILITY, type BuyingPoint as Site, type Company, type Facility } from "@app/map/objects/buying-point"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CommodityBadge } from "@/components/ui/commodity-badge"
import {
  FilterDock,
  FloatingPane,
  PaneCanvas,
  PaneCorner,
  PanePill,
  PanePillBar,
  PaneStack,
  usePaneLayout,
  usePaneOrder,
} from "@/components/ui/panes"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { DrawAreaMap } from "@app/components/draw-area-map"
import { COMMODITY_OF, CROP, type Crop } from "@app/data/sites"
import { analyse, fmtMi, rivalsNear, type Pair } from "@app/lib/analysis"
import { useTheme } from "@app/lib/theme"

const TYPES = FACILITIES
const CROPS: Crop[] = ["c", "s", "w", "m", "o"]

type FilterTab = "radius" | "company" | "facility" | "commodity"
type Side = "regions" | "pairs"

function toggle<T>(set: Set<T>, v: T) {
  const next = new Set(set)
  if (next.has(v)) next.delete(v)
  else next.add(v)
  return next
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
      <Shape type={FACILITY[s.type].glyph} className={COMPANY[s.co].text} />
      <span className="truncate">
        {s.name}, {s.state}
      </span>
      {sub && <span className="hidden truncate text-xs text-muted-foreground sm:inline">{FACILITY[s.type].label.toLowerCase()}</span>}
    </span>
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

/* The page is a canvas screen: the map owns the surface and every control
   floats over it on the @kernel/ui pane primitives (decision 0083). The canvas
   measures its own width — below the threshold the same panes become the
   sheet layout, no page-owned breakpoint code. */
export default function DrawAreasPage() {
  return (
    <PaneCanvas threshold={1120}>
      <DrawAreas />
    </PaneCanvas>
  )
}

function DrawAreas() {
  const data = useMapData()
  const { theme } = useTheme()
  const sheet = usePaneLayout() === "sheet"
  const [radius, setRadius] = React.useState(35)
  const [showDraw, setShowDraw] = React.useState(false)
  const [highlight, setHighlight] = React.useState({ rivers: true, rail: true })
  const [destKinds, setDestKinds] = React.useState(() => new Set<DestKind>(DEST_KINDS))
  const [companies, setCompanies] = React.useState(() => new Set<Company>(["cargill"]))
  const [types, setTypes] = React.useState(() => new Set<Facility>(TYPES))
  const [crops, setCrops] = React.useState(() => new Set<Crop>(CROPS))
  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const [pinnedPair, setPinnedPair] = React.useState<[number, number] | null>(null)
  const [hoverPair, setHoverPair] = React.useState<[number, number] | null>(null)
  const [hoverSite, setHoverSite] = React.useState<number | null>(null)
  const [focusKey, setFocusKey] = React.useState(0)
  const [basemap, setBasemap] = React.useState<"tiles" | "fallback">("tiles")

  const visibleSites = React.useMemo(
    () => data.sites.filter((s) => companies.has(s.co) && types.has(s.type) && s.crops.some((c) => crops.has(c))),
    [data.sites, companies, types, crops],
  )
  const visible = React.useMemo(() => new Set(visibleSites.map((s) => s.id)), [visibleSites])
  const a = React.useMemo(() => analyse(visibleSites, radius), [visibleSites, radius])

  const selected = selectedId != null ? data.sites[selectedId] : null
  const rivals = React.useMemo(() => (selected ? rivalsNear(selected, data.sites, radius) : []), [selected, radius, data.sites])
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
    setPinnedPair(s.co === "cargill" ? [s.id, o.id] : [o.id, s.id])
    setFocusKey((k) => k + 1)
  }
  const resetView = () => {
    setSelectedId(null)
    setPinnedPair(null)
    setFocusKey((k) => k + 1)
  }

  // Right-side detail panes: newest-opened takes the top slot (usePaneOrder).
  const panes = usePaneOrder<Side>()

  const crop1 = [...crops][0]
  const applied: Record<FilterTab, [string, boolean]> = {
    radius: [showDraw ? `Draw areas · ${radius} mi` : "Draw areas off", showDraw],
    company: [
      companies.size === 2 ? "All companies" : companies.size === 1 ? COMPANY[[...companies][0]].label : "No company",
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

  return (
    <>
      <section
        aria-label="Map"
        className="absolute inset-0 [&_.maplibregl-ctrl-bottom-left]:left-1/2! [&_.maplibregl-ctrl-bottom-left]:-translate-x-1/2 [&_.maplibregl-ctrl-bottom-right]:right-[var(--pane-reserve-right)]! [&_.maplibregl-ctrl-bottom-right]:transition-[right] [&_.maplibregl-ctrl-bottom-right]:duration-[var(--duration-base)]"
      >
        <h1 className="sr-only">Where Cargill and ADM buy from the same farmers</h1>
        <DrawAreaMap
          sites={data.sites}
          visible={mapVisible}
          radiusMi={radius}
          showDraw={showDraw}
          destKinds={destKinds}
          highlight={highlight}
          onReset={resetView}
          theme={theme}
          selectedId={selected?.id ?? null}
          pair={hoverPair ?? pinnedPair}
          hoverSite={hoverSite}
          focusKey={focusKey}
          onSelect={(id) => select(id)}
          onBasemap={setBasemap}
        />
        {basemap === "fallback" && (
          <p className="absolute right-14 bottom-8 max-w-64 rounded-[var(--radius-control)] border border-border bg-card/95 px-2.5 py-1.5 text-xs text-muted-foreground shadow-sm">
            Basemap tiles didn't load — showing state outlines. Sites and draw areas are unaffected.
          </p>
        )}
      </section>

      <PaneCorner corner="top-left" className="z-10 items-start">
        <FloatingPane side="top" className="w-fit" bodyClassName="gap-1.5 px-3 py-2.5 text-xs">
          <div className="flex gap-3">
            {COMPANIES.map((co) => (
              <span key={co} className="flex items-center gap-1.5 font-medium">
                <span className={cn("size-2.5 rounded-full", COMPANY[co].swatch)} />
                {COMPANY[co].label}
              </span>
            ))}
          </div>
          <div className="hidden grid-cols-2 gap-x-3 gap-y-1 text-muted-foreground sm:grid">
            {TYPES.map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Shape type={FACILITY[t].glyph} className="text-foreground" />
                {FACILITY[t].label}
              </span>
            ))}
          </div>
          {destKinds.size > 0 && (
            <div className="hidden grid-cols-2 gap-x-3 gap-y-1 border-t border-border pt-1.5 text-muted-foreground sm:grid">
              {DEST_KINDS.map((k) => (
                <span key={k} className="flex items-center gap-1.5">
                  <Shape type={DEST[k].glyph} hollow className={DEST[k].text} />
                  {DEST[k].label}
                </span>
              ))}
            </div>
          )}
        </FloatingPane>
        <Popover>
          <PopoverTrigger render={<PanePill />}>About this data</PopoverTrigger>
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
      </PaneCorner>

      {selected && (
        <FloatingPane
          side="left"
          title={`${selected.name}, ${selected.state}`}
          onClose={() => select(null)}
          className={cn(
            "absolute z-10",
            sheet
              ? "inset-x-[var(--pane-inset)] bottom-[calc(var(--pane-inset)+var(--control-h-lg)+var(--pane-gap))] max-h-[55dvh]"
              : "top-[148px] left-[var(--pane-inset)] w-80 max-h-[calc(100%-148px-72px)]",
          )}
        >
          <div className="grid gap-0.5">
            <span className={cn("text-xs font-medium", COMPANY[selected.co].text)}>{COMPANY[selected.co].label}</span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Shape type={FACILITY[selected.type].glyph} />
              {FACILITY[selected.type].label} · {selected.region}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selected.crops.map((c) => (
              <CropTag key={c} crop={c} />
            ))}
          </div>
          <div className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              {selected.type === "export" ? "Export terminals draw by barge and rail" : `Rival sites within ${radius * 2} mi`}
            </span>
            {selected.type !== "export" &&
              (rivals.length ? (
                <ul className="grid">
                  {rivals.map(({ site, mi }) => (
                    <li key={site.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-control)] px-1.5 py-1.5 text-left text-sm hover:bg-foreground/8 active:bg-foreground/12 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                        onMouseEnter={() => {
                          setHoverPair(selected.co === "cargill" ? [selected.id, site.id] : [site.id, selected.id])
                          setHoverSite(site.id)
                        }}
                        onMouseLeave={() => {
                          setHoverPair(null)
                          setHoverSite(null)
                        }}
                        onClick={() => focusRival(selected, site)}
                      >
                        <SiteName s={site} />
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{fmtMi(mi)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No rival site in reach at this radius.</p>
              ))}
          </div>
        </FloatingPane>
      )}

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead>Cargill</TableHead>
                    <TableHead>ADM</TableHead>
                    <TableHead>In reach</TableHead>
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
                      <TableCell className="tabular-nums">{r.cargill}</TableCell>
                      <TableCell className="tabular-nums">{r.adm}</TableCell>
                      <TableCell className="tabular-nums">{r.cargill && bothOn ? `${r.contested}/${r.cargill}` : "–"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-xs leading-4 text-muted-foreground">
                Regions follow the river systems and interior belts the trade uses. "In reach" counts Cargill sites with
                an ADM site within two draw radii. Export terminals are excluded. Select a row to fly to its closest pair.
              </p>
            </FloatingPane>
          ) : (
            <FloatingPane key={k} side="right" title="Closest pairs" onClose={() => panes.close(k)}>
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
                          <span className="row-span-2 text-xs tabular-nums text-muted-foreground">
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
              <p className="text-xs leading-4 text-muted-foreground">
                The 30 closest Cargill–ADM pairs among the sites shown, excluding export terminals. Straight-line
                distance between town centroids.
              </p>
            </FloatingPane>
          ),
        )}
      </PaneStack>

      <FilterDock
        aria-label="Filters"
        items={[
          {
            key: "radius",
            label: applied.radius[0],
            applied: applied.radius[1],
            title: "Draw areas",
            content: (
              <>
                <label className="-mx-2 flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-control)] px-2 text-base hover:bg-foreground/8 active:bg-foreground/12 xl:-mx-1.5 xl:min-h-0 xl:px-1.5 xl:py-1 xl:text-sm">
                  Show draw areas
                  <Switch checked={showDraw} onCheckedChange={setShowDraw} />
                </label>
                <div className={cn("flex items-baseline justify-between", !showDraw && "opacity-50")}>
                  <span id="radius-label" className="text-sm font-medium">
                    Draw radius
                  </span>
                  <output htmlFor="radius" className="text-sm tabular-nums">
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
              </>
            ),
          },
          {
            key: "company",
            label: applied.company[0],
            applied: applied.company[1],
            title: "Company",
            paneClassName: "w-48",
            content: (
              <fieldset className="grid xl:gap-2">
                {COMPANIES.map((co) => (
                  <Check key={co} checked={companies.has(co)} onChange={() => setCompanies((s) => toggle(s, co))}>
                    <span className={cn("size-2.5 rounded-full", COMPANY[co].swatch)} />
                    {COMPANY[co].label}
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {data.sites.filter((s) => s.co === co).length}
                    </span>
                  </Check>
                ))}
              </fieldset>
            ),
          },
          {
            key: "facility",
            label: applied.facility[0],
            applied: applied.facility[1],
            title: "Facility type",
            paneClassName: "w-56",
            content: (
              <fieldset className="grid xl:gap-2">
                {TYPES.map((t) => (
                  <Check key={t} checked={types.has(t)} onChange={() => setTypes((s) => toggle(s, t))}>
                    <Shape type={FACILITY[t].glyph} />
                    {FACILITY[t].plural}
                  </Check>
                ))}
                {DEST_KINDS.map((k) => (
                  <Check key={k} checked={destKinds.has(k)} onChange={() => setDestKinds((p) => toggle(p, k))}>
                    <Shape type={DEST[k].glyph} hollow className={DEST[k].text} />
                    {DEST[k].plural}
                  </Check>
                ))}
                <Check checked={highlight.rivers} onChange={() => setHighlight((h) => ({ ...h, rivers: !h.rivers }))}>
                  <span className="h-1 w-3 rounded-full bg-viz-sky-500" aria-hidden />
                  River highlight
                </Check>
                <Check checked={highlight.rail} onChange={() => setHighlight((h) => ({ ...h, rail: !h.rail }))}>
                  <span className="h-1 w-3 rounded-full bg-viz-rust-500" aria-hidden />
                  Rail highlight
                </Check>
              </fieldset>
            ),
          },
          {
            key: "commodity",
            label: applied.commodity[0],
            applied: applied.commodity[1],
            title: "Commodity",
            paneClassName: "w-52",
            content: (
              <fieldset className="grid xl:gap-2">
                {CROPS.map((c) => (
                  <Check key={c} checked={crops.has(c)} onChange={() => setCrops((s) => toggle(s, c))}>
                    {CROP[c]}
                  </Check>
                ))}
              </fieldset>
            ),
          },
        ]}
      />
    </>
  )
}
