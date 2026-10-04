import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CommodityBadge } from "@/components/ui/commodity-badge"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Compass, X } from "@/components/ui/icon"
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

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="min-w-0">
      <div className="text-2xl font-semibold tabular-nums leading-8">{value}</div>
      <div className="text-xs leading-4 text-muted-foreground">{label}</div>
    </div>
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

function FilterGroup({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-xs font-medium text-muted-foreground">{legend}</legend>
      {children}
    </fieldset>
  )
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <span className="flex min-w-0 items-center gap-1.5">{children}</span>
    </label>
  )
}

export default function DrawAreasPage() {
  const { theme } = useTheme()
  const [radius, setRadius] = React.useState(35)
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

  const selected = selectedId != null && visible.has(selectedId) ? SITES[selectedId] : null
  const rivals = selected ? rivalsNear(selected, visibleSites, radius) : []
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
  const resetView = () => {
    setSelectedId(null)
    setPinnedPair(null)
    setFocusKey((k) => k + 1)
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:overflow-hidden">
      {/* ---- map (first on phones) ---- */}
      <section
        aria-label="Map"
        className="relative h-[60dvh] min-h-80 shrink-0 border-b border-border lg:order-2 lg:h-full lg:border-b-0"
      >
        <DrawAreaMap
          sites={SITES}
          visible={visible}
          radiusMi={radius}
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
        <div className="pointer-events-none absolute top-3 left-3 flex flex-col gap-2">
          <div className="pointer-events-auto grid gap-1.5 rounded-[var(--radius-floating)] border border-border bg-card/95 px-3 py-2.5 text-xs shadow-sm backdrop-blur">
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
          <Button variant="outline" size="sm" className="pointer-events-auto w-fit bg-card shadow-sm" onClick={resetView}>
            <Compass className="size-4" />
            Reset view
          </Button>
        </div>
      </section>

      {/* ---- side panel ---- */}
      <aside
        aria-label="Draw-area analysis"
        className="flex min-h-0 flex-col gap-5 bg-card p-4 *:shrink-0 lg:order-1 lg:overflow-y-auto lg:border-r lg:border-border"
      >
        <header className="grid gap-1.5">
          <h1 className="text-lg font-semibold leading-6 text-balance">Where Cargill and ADM buy from the same farmers</h1>
          <p className="text-sm leading-5 text-muted-foreground">
            Every US buying point each company posts a public bid for, with a draw-area circle around each. Where
            green and blue overlap, a farmer has both bids within trucking distance.
          </p>
        </header>

        <section aria-label="Summary" className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border py-3">
          <Stat value={visibleSites.length} label="buying points mapped" />
          <Stat value={a.sameTown} label="Cargill sites sharing a town with ADM" />
          <Stat
            value={bothOn && a.cargill ? `${a.contestedCargill} of ${a.cargill}` : "–"}
            label="Cargill sites with ADM in reach"
          />
          <Stat value={bothOn && a.adm ? `${a.contestedAdm} of ${a.adm}` : "–"} label="ADM sites with Cargill in reach" />
        </section>

        {selected && (
          <section aria-label="Selected site" className="grid gap-3 rounded-[var(--radius-surface)] border border-border p-3">
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
                          className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-control)] px-1.5 py-1.5 text-left text-sm hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
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
          </section>
        )}

        <Tabs defaultValue="layers">
          <TabsList className="w-full">
            <TabsTrigger value="layers">Layers</TabsTrigger>
            <TabsTrigger value="regions">Regions</TabsTrigger>
            <TabsTrigger value="pairs">Pairs</TabsTrigger>
          </TabsList>

          <TabsContent value="layers" className="grid gap-5 pt-4">
            <div className="grid gap-3">
              <div className="flex items-baseline justify-between">
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
                value={[radius]}
                onValueChange={(v) => setRadius(Array.isArray(v) ? v[0] : v)}
              />
              <p className="text-xs leading-4 text-muted-foreground">
                An assumption, not data. Real draws follow highways and rail and shrink toward a nearer competitor.
              </p>
            </div>
            <FilterGroup legend="Company">
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
            <FilterGroup legend="Facility type">
              {TYPES.map((t) => (
                <Check key={t} checked={types.has(t)} onChange={() => setTypes((s) => toggle(s, t))}>
                  <Shape type={t} />
                  {FACILITY[t].plural}
                </Check>
              ))}
            </FilterGroup>
            <FilterGroup legend="Posts a bid for">
              {CROPS.map((c) => (
                <Check key={c} checked={crops.has(c)} onChange={() => setCrops((s) => toggle(s, c))}>
                  {CROP[c]}
                </Check>
              ))}
            </FilterGroup>
          </TabsContent>

          <TabsContent value="regions" className="grid gap-2 pt-4">
            <div className="overflow-x-auto">
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
                      className={cn(r.closest && "cursor-pointer")}
                      onMouseEnter={() => r.closest && setHoverPair([r.closest.c.id, r.closest.a.id])}
                      onMouseLeave={() => setHoverPair(null)}
                      onClick={() => r.closest && focusPair(r.closest)}
                    >
                      <TableCell>
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
            </div>
            <p className="text-xs leading-4 text-muted-foreground">
              Regions follow the river systems and interior belts the trade uses. "In reach" counts Cargill sites with
              an ADM site within two draw radii. Export terminals are excluded. Select a row to fly to its closest pair.
            </p>
          </TabsContent>

          <TabsContent value="pairs" className="grid gap-2 pt-4">
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
                          "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 rounded-[var(--radius-control)] px-2 py-2 text-left text-sm hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
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
            <p className="text-xs leading-4 text-muted-foreground">
              The 30 closest Cargill–ADM pairs among the sites shown, excluding export terminals. Straight-line
              distance between town centroids.
            </p>
          </TabsContent>
        </Tabs>

        <details className="group mt-auto border-t border-border pt-3 text-xs leading-4 text-muted-foreground">
          <summary className="cursor-pointer text-sm font-medium text-foreground">About this data</summary>
          <ul className="mt-2 grid list-disc gap-1.5 pl-4">
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
        </details>
      </aside>
    </div>
  )
}
