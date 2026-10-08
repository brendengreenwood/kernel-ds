import * as React from "react"
import { Navigate, NavLink, useParams } from "react-router-dom"
import type { Map as MLMap } from "maplibre-gl"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CommodityLabel } from "@/components/ui/commodity-badge"
import { Badge } from "@/components/ui/badge"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { PageHeader } from "@/components/ui/page-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Flag,
  LayoutList,
  PanelLeft,
  Pencil,
  Plus,
  Trash2,
  X,
} from "@/components/ui/icon"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  COMMODITY_LABEL,
  LOCATIONS,
  SCENARIOS,
  basis,
  byShipStart,
  shipMonth,
  shipWindow,
  updatedLabel,
  type Commodity,
  type Scenario,
} from "@app/merchant/scenario"
import { producerBid, producersNear, type Producer } from "@app/merchant/producers"
import { installAreaLayers, inside, lasso, producersIn, setAreas, setProducers, type Area } from "@app/merchant/areas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group"
import { Label } from "@/components/ui/label"
import { Calendar as DayCalendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { DrawAreaMap } from "@app/components/draw-area-map"
import { useMapData } from "@app/map/data"
import { useTheme } from "@app/lib/theme"

type CommodityFilter = Commodity | "all"

const LOCATION_ITEMS = [{ value: "all", label: "All locations" }, ...LOCATIONS.map((l) => ({ value: l.id, label: l.name }))]

/** Everything the merchant can change on a scenario. Nothing reaches originators until Publish. */
type Draft = { priority: boolean; postedBid: string; maxBid: string; distanceCost: string; areas: Area[] }
type Edit = (patch: Partial<Draft> | ((d: Draft) => Partial<Draft>)) => void

const initialDraft = (s: Scenario): Draft => ({
  priority: false,
  postedBid: s.postedBid.toFixed(2),
  maxBid: s.maxBid.toFixed(2),
  distanceCost: "",
  areas: [],
})

export default function ScenariosPage() {
  const { id } = useParams()
  const [location, setLocation] = React.useState("all")
  const [commodity, setCommodity] = React.useState<CommodityFilter>("all")
  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => new Set())
  // Narrow navigator: one calendar tile per scenario, filters kept as set.
  const [narrow, setNarrow] = React.useState(false)
  // Session state only; nothing is persisted or sent anywhere.
  const [published, setPublished] = React.useState<Record<string, Draft>>({})
  const [drafts, setDrafts] = React.useState<Record<string, Draft>>({})
  const pub = (s: Scenario) => published[s.id] ?? initialDraft(s)
  const draftOf = (s: Scenario) => drafts[s.id] ?? pub(s)
  const unpublished = (s: Scenario) => s.id in drafts && JSON.stringify(drafts[s.id]) !== JSON.stringify(pub(s))
  const editOf =
    (s: Scenario): Edit =>
    (patch) =>
      setDrafts((prev) => {
        const cur = prev[s.id] ?? pub(s)
        return { ...prev, [s.id]: { ...cur, ...(typeof patch === "function" ? patch(cur) : patch) } }
      })
  const publish = (s: Scenario) => {
    setPublished((p) => ({ ...p, [s.id]: draftOf(s) }))
    setDrafts(({ [s.id]: _, ...rest }) => rest)
  }

  const groups = LOCATIONS.filter((l) => location === "all" || l.id === location)
    .map((l) => ({
      location: l,
      scenarios: SCENARIOS.filter(
        (s) => s.locationId === l.id && (commodity === "all" || s.commodity === commodity),
      ).sort(byShipStart),
    }))
    .filter((g) => g.scenarios.length > 0)

  const selected = SCENARIOS.find((s) => s.id === id)
  if (!selected) {
    const first = groups[0]?.scenarios[0] ?? [...SCENARIOS].sort(byShipStart)[0]
    return <Navigate to={`/scenarios/${first.id}`} replace />
  }

  return (
    <div className="flex h-full min-h-0">
      {narrow ? (
        <aside aria-label="Scenario navigator" className="flex w-16 shrink-0 flex-col border-r bg-card">
          <div className="flex justify-center border-b p-2">
            <Button variant="ghost" size="icon" aria-label="Expand navigator" onClick={() => setNarrow(false)}>
              <PanelLeft />
            </Button>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <TooltipProvider>
              {groups.map((g) => (
                <section key={g.location.id} aria-label={g.location.name} className="grid gap-1 border-b p-1.5">
                  {g.scenarios.map((s) => (
                    <ScenarioTile key={s.id} scenario={s} location={g.location.name} priority={pub(s).priority} unpublished={unpublished(s)} />
                  ))}
                </section>
              ))}
            </TooltipProvider>
          </ScrollArea>
        </aside>
      ) : (
      <aside aria-label="Scenario navigator" className="flex w-80 shrink-0 flex-col border-r bg-card">
        <div className="grid gap-3 border-b p-4">
          <PageHeader
            icon={LayoutList}
            title="Scenarios"
            size="section"
            action={
              <Button variant="ghost" size="icon-sm" aria-label="Collapse navigator" onClick={() => setNarrow(true)}>
                <PanelLeft />
              </Button>
            }
          />
          <Select items={LOCATION_ITEMS} value={location} onValueChange={(v) => v && setLocation(v)}>
            <SelectTrigger aria-label="Location">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCATION_ITEMS.map((l) => (
                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ToggleGroup
            aria-label="Commodity"
            variant="segmented"
            size="sm"
            className="w-full"
            value={[commodity]}
            onValueChange={(v) => v[0] && setCommodity(v[0] as CommodityFilter)}
          >
            {(["all", "corn", "soybeans"] as const).map((c) => (
              <ToggleGroupItem key={c} value={c} className="flex-1">
                {c === "all" ? "All" : COMMODITY_LABEL[c]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          {groups.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No scenarios match these filters.</p>
          )}
          {groups.map((g) => (
            <Collapsible
              key={g.location.id}
              open={!collapsed.has(g.location.id)}
              onOpenChange={(open) =>
                setCollapsed((prev) => {
                  const next = new Set(prev)
                  if (open) next.delete(g.location.id)
                  else next.add(g.location.id)
                  return next
                })
              }
              render={<section aria-label={g.location.name} />}>
              <h2 className="sticky top-0 z-10 border-b bg-card">
                <CollapsibleTrigger className="group/loc flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-foreground hover:bg-foreground/5">
                  <ChevronDown className="size-4 -rotate-90 text-muted-foreground transition-transform duration-[var(--duration-base)] ease-[var(--ease-out)] group-data-[panel-open]/loc:rotate-0" />
                  <span className="flex-1">{g.location.name}</span>
                  <Badge variant="secondary">{g.scenarios.length}</Badge>
                </CollapsibleTrigger>
              </h2>
              <CollapsibleContent className="grid gap-1 py-2 pr-4 pl-2">
                {g.scenarios.map((s) => (
                  <ScenarioRow key={s.id} scenario={s} priority={pub(s).priority} unpublished={unpublished(s)} />
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </ScrollArea>
      </aside>
      )}
      <ScenarioView
        scenario={selected}
        draft={draftOf(selected)}
        edit={editOf(selected)}
        unpublished={unpublished(selected)}
        onPublish={() => publish(selected)}
      />
    </div>
  )
}

function ScenarioTile({
  scenario: s,
  location,
  priority,
  unpublished,
}: { scenario: Scenario; location: string; priority: boolean; unpublished: boolean }) {
  const [month, days] = shipWindow(s).split(" ")
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <NavLink
            to={`/scenarios/${s.id}`}
            aria-label={`${location}, ${shipWindow(s)}, ${COMMODITY_LABEL[s.commodity]} ${s.contract}`}
            className="relative grid justify-items-center rounded-[var(--radius-control)] border border-transparent py-1.5 hover:bg-foreground/5 aria-[current=page]:border-border aria-[current=page]:bg-foreground/8"
          />
        }
      >
        <span className="text-overline text-muted-foreground">{month}</span>
        <span className="text-xs font-medium tabular-nums">{days}</span>
        <span className="text-[0.625rem] text-muted-foreground">{s.commodity === "corn" ? "Corn" : "Soy"}</span>
        {priority && <Flag aria-label="Priority" className="absolute top-1 left-1 size-3 text-primary" />}
        {unpublished && <span aria-label="Unpublished" className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />}
      </TooltipTrigger>
      <TooltipContent side="right">
        {location} · {shipWindow(s)} · {COMMODITY_LABEL[s.commodity]} {s.contract}
        {unpublished && " · Unpublished"}
      </TooltipContent>
    </Tooltip>
  )
}

function ScenarioRow({ scenario: s, priority, unpublished }: { scenario: Scenario; priority: boolean; unpublished: boolean }) {
  return (
    <Item
      size="sm"
      render={<NavLink to={`/scenarios/${s.id}`} />}
      className="aria-[current=page]:border-border aria-[current=page]:bg-foreground/8"
    >
      <ItemMedia>
        <Calendar className="size-4 text-muted-foreground" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          {shipWindow(s)}
          {priority && <Flag aria-label="Priority" className="size-4 text-primary" />}
          {unpublished && <Badge variant="outline" className="ml-auto">Unpublished</Badge>}
        </ItemTitle>
        <ItemDescription className="flex items-center gap-1.5">
          <CommodityLabel commodity={s.commodity} />·<Badge variant="outline">{s.contract}</Badge>· {shipMonth(s)}
        </ItemDescription>
        <ItemDescription className="text-xs">Updated {updatedLabel(s.updated)}</ItemDescription>
      </ItemContent>
    </Item>
  )
}

function ScenarioView({
  scenario: s,
  draft,
  edit,
  unpublished,
  onPublish,
}: {
  scenario: Scenario
  draft: Draft
  edit: Edit
  unpublished: boolean
  onPublish: () => void
}) {
  const location = LOCATIONS.find((l) => l.id === s.locationId)!
  return (
    <section aria-label="Selected scenario" className="flex min-w-0 flex-1 flex-col">
      {/* One line; Kernel PageHeader always stacks the description, so this is hand-built. */}
      <header className="flex items-center gap-3 border-b bg-card px-4 py-2">
        <h1 className="truncate text-sm font-semibold">{location.name}</h1>
        <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          {`${COMMODITY_LABEL[s.commodity]} › ${s.contract} ${shipMonth(s)} › TOS ${shipWindow(s)}`}
        </p>
        <p className="shrink-0 text-xs text-muted-foreground">
          {unpublished ? "Unpublished changes" : `Updated ${updatedLabel(s.updated, false)}`}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Switch id="priority" checked={draft.priority} onCheckedChange={(on) => edit({ priority: on })} />
          <Label htmlFor="priority" className="font-normal">Priority</Label>
        </div>
        {/* Archive does nothing yet. */}
        <Button variant="outline" size="sm">Archive</Button>
        <Button size="sm" disabled={!unpublished} onClick={onPublish}>Publish</Button>
      </header>
      <WorkspaceMap locationId={location.id} locationName={location.name} scenario={s} draft={draft} edit={edit} />
    </section>
  )
}

/** Merchant workspace is buy side only; sell-side destinations stay off. */
const NO_DESTINATIONS: ReadonlySet<string> = new Set()

/** Scenario locations are Cargill buying points; the map centers on the scenario's site. */
function WorkspaceMap({
  locationId,
  locationName,
  scenario,
  draft,
  edit,
}: {
  locationId: string
  locationName: string
  scenario: Scenario
  draft: Draft
  edit: Edit
}) {
  const data = useMapData()
  const { theme } = useTheme()
  const site = data.sites.find((x) => x.co === "cargill" && `Cargill ${x.name}` === locationName)
  const visible = React.useMemo(() => new Set(data.sites.map((x) => x.id)), [data.sites])
  const [focusKey, setFocusKey] = React.useState(1)
  React.useEffect(() => setFocusKey((k) => k + 1), [site?.id])

  const producers = React.useMemo(
    () => (site ? producersNear(locationId, site.lon, site.lat) : []),
    [locationId, site],
  )
  const [map, setMap] = React.useState<MLMap | null>(null)
  const [styleVersion, setStyleVersion] = React.useState(0)
  const onMap = React.useCallback((m: MLMap) => {
    installAreaLayers(m)
    setMap(m)
    setStyleVersion((v) => v + 1)
  }, [])
  const [selectedArea, setSelectedArea] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!map) return
    setProducers(map, producers, draft.areas)
    setAreas(map, draft.areas, selectedArea)
  }, [map, styleVersion, producers, draft.areas, selectedArea])

  const [producersOpen, setProducersOpen] = React.useState(false)
  const live = draft.areas.filter((a) => !a.hidden)
  const prioritized = producers.filter((p) => live.some((a) => inside([p.lon, p.lat], a.ring)))

  return (
    <section aria-label="Map" className="relative min-h-0 flex-1 overflow-hidden">
      <DrawAreaMap
        sites={data.sites}
        visible={visible}
        radiusMi={50}
        showDraw={false}
        destKinds={NO_DESTINATIONS}
        theme={theme}
        selectedId={site?.id ?? null}
        pair={null}
        focusKey={focusKey}
        onSelect={() => {}}
        onMap={onMap}
      />
      <div className="pointer-events-none absolute inset-3 flex flex-col justify-between gap-3">
        <div className="flex min-h-0 items-start gap-3">
          <div className="flex flex-col gap-3">
            <PricingPanel key={scenario.id} draft={draft} edit={edit} />
            <AreasPanel
              key={`areas-${scenario.id}`}
              map={map}
              areas={draft.areas}
              producers={producers}
              edit={edit}
              selected={selectedArea}
              onSelect={setSelectedArea}
            />
          </div>
          <Pill label="Manage competitors" extra={<Badge variant="secondary">0</Badge>} />
          <div className="ml-auto flex flex-wrap justify-end gap-2">
            <Pill label="View originators" />
            <Pill label="View producers" pressed={producersOpen} onClick={() => setProducersOpen((o) => !o)} />
          </div>
          {/* What "competitive zone" means is not defined yet. */}
          <section aria-label="Producers" className={cn(FLOAT, "gap-1.5 px-3 py-2.5")}>
            <h2 className="text-overline text-muted-foreground">Producers</h2>
            <dl className="flex gap-5">
              {(
                [
                  ["In competitive zone", "—"],
                  ["In draw area", producers.length],
                  ["In priority areas", prioritized.length],
                ] as const
              ).map(([t, v]) => (
                <div key={t} className="flex flex-col-reverse">
                  <dt className="text-xs text-muted-foreground">{t}</dt>
                  <dd className="text-lg font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
        <div className="flex items-end gap-3">
          <div className={cn(FLOAT, "gap-1.5 px-3 py-2.5 text-xs")}>
            <p className="text-overline text-muted-foreground">Bid zones</p>
            <p className="text-muted-foreground">Not defined yet</p>
          </div>
          <div className={cn(FLOAT, "gap-1.5 px-3 py-2.5 text-xs")}>
            <p className="text-overline text-muted-foreground">Competitor bids</p>
            <p className="text-muted-foreground">Not defined yet</p>
          </div>
        </div>
      </div>
      <ProducersPanel
        open={producersOpen}
        onClose={() => setProducersOpen(false)}
        scenario={scenario}
        producers={producers}
        prioritized={new Set(prioritized.map((p) => p.id))}
      />
    </section>
  )
}

/** Same floating surface as the origination map's panels. */
const FLOAT =
  "pointer-events-auto grid rounded-[var(--radius-floating)] border border-border bg-floating/95 shadow-lg backdrop-blur"

/** Same pill as the origination map's collapsed panels. */
function Pill({
  label,
  extra,
  pressed,
  onClick,
}: {
  label: string
  extra?: React.ReactNode
  pressed?: boolean
  onClick?: () => void
}) {
  return (
    <Button
      variant={pressed ? "default" : "outline"}
      aria-expanded={onClick ? !!pressed : undefined}
      onClick={onClick}
      className={cn(
        "pointer-events-auto rounded-full shadow-lg",
        !pressed && "bg-floating/95 backdrop-blur",
      )}
    >
      {label}
      {extra}
    </Button>
  )
}

/** Every producer in the draw area with a simulated bid. Priority-area producers first. */
function ProducersPanel({
  open,
  onClose,
  scenario,
  producers,
  prioritized,
}: {
  open: boolean
  onClose: () => void
  scenario: Scenario
  producers: Producer[]
  prioritized: Set<string>
}) {
  const rows = [...producers].sort(
    (a, b) => Number(prioritized.has(b.id)) - Number(prioritized.has(a.id)) || a.name.localeCompare(b.name),
  )
  return (
    <aside
      aria-label="Producers list"
      inert={!open}
      className={cn(
        FLOAT,
        "absolute top-[104px] right-3 bottom-36 w-80 grid-rows-[auto_minmax(0,1fr)] transition-[translate,opacity] duration-[var(--duration-base)] ease-[var(--ease-out)]",
        open ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-[calc(100%+12px)] opacity-0",
      )}
    >
      <div className="flex items-center gap-2 border-b py-2 pr-2 pl-4">
        <h2 className="flex-1 text-overline text-muted-foreground">
          Producers in draw area <span className="tabular-nums">{producers.length}</span>
        </h2>
        <Button variant="ghost" size="icon-sm" aria-label="Close producers" onClick={onClose}>
          <X />
        </Button>
      </div>
      <ScrollArea className="min-h-0">
        <ul className="grid p-1">
          {rows.map((p) => (
            <li key={p.id} className="flex items-center gap-2 rounded-[var(--radius-control)] px-3 py-1.5 text-sm hover:bg-foreground/5">
              <span className="min-w-0 flex-1 truncate">{p.name}</span>
              {prioritized.has(p.id) && <Flag aria-label="In a priority area" className="size-4 text-primary" />}
              <span className="tabular-nums">{basis(producerBid(scenario, p))}</span>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </aside>
  )
}

/** Priority areas for this scenario: draw, name, hide, delete. Draft until Publish. */
function AreasPanel({
  map,
  areas,
  producers,
  edit,
  selected,
  onSelect,
}: {
  map: MLMap | null
  areas: Area[]
  producers: Producer[]
  edit: Edit
  selected: string | null
  onSelect: (id: string | null) => void
}) {
  const [drawing, setDrawing] = React.useState(false)
  const [renaming, setRenaming] = React.useState<string | null>(null)
  const cancel = React.useRef<(() => void) | null>(null)
  React.useEffect(() => () => cancel.current?.(), [])

  const startDraw = () => {
    if (!map) return
    if (cancel.current) return cancel.current()
    const l = lasso(map)
    cancel.current = l.cancel
    setDrawing(true)
    l.done.then((ring) => {
      cancel.current = null
      setDrawing(false)
      if (!ring) return
      const id = crypto.randomUUID()
      edit((d) => ({ areas: [...d.areas, { id, name: `Area ${d.areas.length + 1}`, ring, hidden: false }] }))
      onSelect(id)
    })
  }
  const patch = (id: string, p: Partial<Area>) =>
    edit((d) => ({ areas: d.areas.map((a) => (a.id === id ? { ...a, ...p } : a)) }))

  return (
    <section aria-label="Priority areas" className={cn(FLOAT, "w-72 gap-2 p-2")}>
      <div className="flex items-center gap-2 pl-2">
        <h2 className="flex-1 text-overline text-muted-foreground">Priority areas</h2>
        <Button variant={drawing ? "default" : "outline"} size="sm" onClick={startDraw} disabled={!map}>
          {drawing ? "Cancel" : <><Plus />Draw</>}
        </Button>
      </div>
      {drawing && <p className="px-2 text-xs text-muted-foreground">Drag on the map to draw. Esc cancels.</p>}
      {areas.length === 0 && !drawing && (
        <p className="px-2 pb-1 text-xs text-muted-foreground">Draw a shape to prioritize the producers inside it.</p>
      )}
      {areas.length > 0 && (
        <ul className="grid gap-0.5">
          {areas.map((a) => (
            <li key={a.id}>
              <Item
                size="xs"
                className={cn(
                  "cursor-pointer hover:bg-foreground/5",
                  selected === a.id && "border-border bg-foreground/8",
                  a.hidden && "text-muted-foreground",
                )}
                onClick={() => onSelect(selected === a.id ? null : a.id)}
              >
                <ItemContent>
                  {renaming === a.id ? (
                    <Input
                      autoFocus
                      aria-label="Area name"
                      defaultValue={a.name}
                      className="h-7"
                      onClick={(e) => e.stopPropagation()}
                      onBlur={(e) => {
                        patch(a.id, { name: e.currentTarget.value.trim() || a.name })
                        setRenaming(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur()
                        if (e.key === "Escape") setRenaming(null)
                      }}
                    />
                  ) : (
                    <ItemTitle>{a.name}</ItemTitle>
                  )}
                </ItemContent>
                <ItemActions onClick={(e) => e.stopPropagation()}>
                  <Badge variant="secondary" className="tabular-nums">{producersIn(a, producers).length}</Badge>
                  <Button variant="ghost" size="icon-sm" aria-label={`Rename ${a.name}`} onClick={() => setRenaming(a.id)}>
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={a.hidden ? `Show ${a.name}` : `Hide ${a.name}`}
                    aria-pressed={a.hidden}
                    onClick={() => patch(a.id, { hidden: !a.hidden })}
                  >
                    {a.hidden ? <EyeOff /> : <Eye />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${a.name}`}
                    onClick={() => {
                      edit((d) => ({ areas: d.areas.filter((x) => x.id !== a.id) }))
                      if (selected === a.id) onSelect(null)
                    }}
                  >
                    <Trash2 />
                  </Button>
                </ItemActions>
              </Item>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Kernel Date Picker pattern: Calendar in a Popover. */
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/** Step one day back/forward, jump back to today. Changes the date only; no bid history behind it yet. */
function DateField({
  id,
  label,
  date,
  setDate,
}: {
  id: string
  label: string
  date: Date
  setDate: React.Dispatch<React.SetStateAction<Date>>
}) {
  const today = startOfDay(new Date())
  const [open, setOpen] = React.useState(false)
  const step = (days: number) =>
    setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days))
  const isToday = date.getTime() === today.getTime()
  return (
    <div className="grid gap-2">
      <div className="flex h-5 items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {!isToday && (
          <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={() => setDate(today)}>
            Today
          </Button>
        )}
      </div>
      <ButtonGroup className="w-full">
        <Button type="button" variant="outline" size="icon" aria-label="Previous day" onClick={() => step(-1)}>
          <ChevronLeft />
        </Button>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button id={id} variant="outline" className="min-w-0 flex-1 justify-center font-normal tabular-nums">
                {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="center">
            <DayCalendar
              mode="single"
              selected={date}
              defaultMonth={date}
              onSelect={(d) => {
                if (d) setDate(d)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
        <Button type="button" variant="outline" size="icon" aria-label="Next day" onClick={() => step(1)}>
          <ChevronRight />
        </Button>
      </ButtonGroup>
    </div>
  )
}

/** Inputs only; Compute does nothing yet. Values are part of the scenario draft. */
function PricingPanel({ draft, edit }: { draft: Draft; edit: Edit }) {
  const money = (id: string, label: string, key: "postedBid" | "maxBid" | "distanceCost", unit?: string) => (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <ButtonGroup className="w-full">
        <ButtonGroupText>$</ButtonGroupText>
        <Input
          id={id}
          inputMode="decimal"
          value={draft[key]}
          onChange={(e) => edit({ [key]: e.target.value })}
          className="min-w-0 tabular-nums"
        />
        {unit && <ButtonGroupText>{unit}</ButtonGroupText>}
      </ButtonGroup>
    </div>
  )
  const [date, setDate] = React.useState(() => startOfDay(new Date()))
  // Past bid dates are history: shown, not editable.
  const past = date < startOfDay(new Date())
  return (
    <form aria-label="Pricing" data-surface="floating" className={cn(FLOAT, "w-72 gap-3 p-4")} onSubmit={(e) => e.preventDefault()}>
      <h2 className="text-overline text-muted-foreground">Pricing</h2>
      <DateField id="bid-date" label="Posted bid date" date={date} setDate={setDate} />
      <fieldset disabled={past} className="contents">
      <div className="grid grid-cols-2 gap-3">
        {money("posted-bid", "Posted bid", "postedBid")}
        {money("max-bid", "Max bid", "maxBid")}
      </div>
      {money("distance-cost", "Distance cost", "distanceCost", "/mi")}
      <div className="grid gap-2">
        <Label>Distance method</Label>
        <Select defaultValue="real" items={[{ value: "real", label: "Real distances" }]}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="real">Real distances</SelectItem></SelectContent>
        </Select>
      </div>
      <Button type="submit">Compute landscape</Button>
      </fieldset>
    </form>
  )
}
