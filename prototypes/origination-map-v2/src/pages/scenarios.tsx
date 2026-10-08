import * as React from "react"
import { Navigate, NavLink, useParams } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CommodityLabel } from "@/components/ui/commodity-badge"
import { Badge } from "@/components/ui/badge"
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { PageHeader } from "@/components/ui/page-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, LayoutList } from "@/components/ui/icon"
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

export default function ScenariosPage() {
  const { id } = useParams()
  const [location, setLocation] = React.useState("all")
  const [commodity, setCommodity] = React.useState<CommodityFilter>("all")
  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => new Set())

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
      <aside aria-label="Scenario navigator" className="flex w-80 shrink-0 flex-col border-r bg-card">
        <div className="grid gap-3 border-b p-4">
          <PageHeader icon={LayoutList} title="Scenarios" size="section" />
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
            variant="outline"
            size="sm"
            data-segmented
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
                  <ScenarioRow key={s.id} scenario={s} />
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </ScrollArea>
      </aside>
      <ScenarioView scenario={selected} />
    </div>
  )
}

function ScenarioRow({ scenario: s }: { scenario: Scenario }) {
  return (
    <Item
      size="sm"
      render={<NavLink to={`/scenarios/${s.id}`} />}
      className="[a]:hover:bg-foreground/5 aria-[current=page]:border-border aria-[current=page]:bg-foreground/8"
    >
      <ItemMedia>
        <Calendar className="size-4 text-muted-foreground" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{shipWindow(s)}</ItemTitle>
        <ItemDescription className="flex items-center gap-1.5">
          <CommodityLabel commodity={s.commodity} />·<Badge variant="outline">{s.contract}</Badge>· {shipMonth(s)}
        </ItemDescription>
        <ItemDescription className="text-xs">Updated {updatedLabel(s.updated)}</ItemDescription>
      </ItemContent>
    </Item>
  )
}

function ScenarioView({ scenario: s }: { scenario: Scenario }) {
  const location = LOCATIONS.find((l) => l.id === s.locationId)!
  const figures = [
    { label: "Time of shipment", value: shipWindow(s) },
    { label: "Posted bid", value: basis(s.postedBid) },
    { label: "Scenario max bid", value: basis(s.maxBid) },
    { label: "Updated", value: updatedLabel(s.updated, false) },
  ]
  return (
    <section aria-label="Selected scenario" className="flex min-w-0 flex-1 flex-col">
      <div className="border-b bg-card px-6 py-3">
        <PageHeader
          size="panel"
          title={location.name}
          description={`${COMMODITY_LABEL[s.commodity]} › ${s.contract} ${shipMonth(s)} › TOS ${shipWindow(s)}`}
          action={
            <dl className="flex flex-wrap gap-2">
              {figures.map((f) => (
                <Item key={f.label} variant="outline" size="xs" className="w-auto flex-col-reverse items-start gap-0">
                  <dt className="text-xs text-muted-foreground">{f.label}</dt>
                  <dd className="font-semibold tabular-nums">{f.value}</dd>
                </Item>
              ))}
            </dl>
          }
        />
      </div>
      <WorkspaceMap locationName={location.name} scenario={s} />
    </section>
  )
}

/** Merchant workspace is buy side only; sell-side destinations stay off. */
const NO_DESTINATIONS: ReadonlySet<string> = new Set()

/** Scenario locations are Cargill buying points; the map centers on the scenario's site. */
function WorkspaceMap({ locationName, scenario }: { locationName: string; scenario: Scenario }) {
  const data = useMapData()
  const { theme } = useTheme()
  const site = data.sites.find((x) => x.co === "cargill" && `Cargill ${x.name}` === locationName)
  const visible = React.useMemo(() => new Set(data.sites.map((x) => x.id)), [data.sites])
  const [focusKey, setFocusKey] = React.useState(1)
  React.useEffect(() => setFocusKey((k) => k + 1), [site?.id])

  return (
    <section aria-label="Map" className="relative min-h-0 flex-1">
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
      />
      <div className="pointer-events-none absolute inset-3 flex flex-col justify-between gap-3">
        <div className="flex items-start gap-3">
          <PricingPanel key={scenario.id} scenario={scenario} />
          <div className="flex flex-wrap gap-2">
            {pill("Manage competitors", <Badge variant="secondary">0</Badge>)}
            {pill("View producers")}
            {pill("View originators")}
          </div>
        </div>
        <div className="flex items-end gap-3">
          <div className={cn(FLOAT, "gap-1.5 px-3 py-2.5 text-xs")}>
            <p className="font-semibold uppercase text-muted-foreground">Bid zones</p>
            <p className="text-muted-foreground">Not defined yet</p>
          </div>
          <div className={cn(FLOAT, "gap-1.5 px-3 py-2.5 text-xs")}>
            <p className="font-semibold uppercase text-muted-foreground">Competitor bids</p>
            <p className="text-muted-foreground">Not defined yet</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Same floating surface as the origination map's panels. */
const FLOAT =
  "pointer-events-auto grid rounded-[var(--radius-floating)] border border-border bg-card/95 dark:bg-(--om-float) shadow-lg backdrop-blur"

/** Same pill as the origination map's collapsed panels. Panels behind them are not designed yet. */
function pill(label: string, extra?: React.ReactNode) {
  return (
    <Button
      variant="outline"
      className="pointer-events-auto rounded-full bg-card/95 dark:bg-(--om-float) shadow-lg backdrop-blur"
    >
      {label}
      {extra}
    </Button>
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

/** Inputs only; Compute does nothing yet. */
function PricingPanel({ scenario: s }: { scenario: Scenario }) {
  const money = (id: string, label: string, value: number | string, unit?: string) => (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <ButtonGroup className="w-full">
        <ButtonGroupText>$</ButtonGroupText>
        <Input id={id} inputMode="decimal" defaultValue={value} className="min-w-0 tabular-nums" />
        {unit && <ButtonGroupText>{unit}</ButtonGroupText>}
      </ButtonGroup>
    </div>
  )
  const [date, setDate] = React.useState(() => startOfDay(new Date()))
  // Past bid dates are history: shown, not editable.
  const past = date < startOfDay(new Date())
  return (
    <form aria-label="Pricing" className={cn(FLOAT, "w-72 gap-3 p-4")} onSubmit={(e) => e.preventDefault()}>
      <h2 className="text-xs font-semibold uppercase text-muted-foreground">Pricing</h2>
      <DateField id="bid-date" label="Posted bid date" date={date} setDate={setDate} />
      <fieldset disabled={past} className="contents">
      <div className="grid grid-cols-2 gap-3">
        {money("posted-bid", "Posted bid", s.postedBid.toFixed(2))}
        {money("max-bid", "Max bid", s.maxBid.toFixed(2))}
      </div>
      {money("distance-cost", "Distance cost", "", "/mi")}
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
