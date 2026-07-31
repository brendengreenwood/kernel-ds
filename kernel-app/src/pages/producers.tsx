import * as React from "react"
import { Ban, Check, ChevronDown, Handshake, Info, Search } from "@/components/ui/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CommodityLabel, type Commodity } from "@/components/ui/commodity-badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TabCount, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { IconChip, Stat, TableFrame, useVisibleWidth } from "@app/components/panels"
import { locations, producers, type Dated, type Offer } from "@app/data/producers"

const commodityFilters: { value: string; label: string; key?: Commodity }[] = [
  { value: "all", label: "All Commodities" },
  { value: "soybeans", label: "Soybeans", key: "soybeans" },
  { value: "corn", label: "Corn", key: "corn" },
  { value: "wheat", label: "Wheat", key: "wheat" },
]

/* The four recency/bid filters — presentational for now (advanced filtering
   is planned); rendered as real controlled selects. */
const dropdowns = [
  { key: "spot", label: "Last Spot", opts: ["All", "This week", "This month"] },
  { key: "delivery", label: "Last Delivery", opts: ["All", "This week", "This month"] },
  { key: "contact", label: "Last Contact", opts: ["All", "This week", "This month"] },
  { key: "bids", label: "No. of Bids", opts: ["All", "1+", "3+", "5+"] },
]

/** Circular bid-count badge (Kernel green). */
function BidsBadge({ n }: { n: number }) {
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-medium tabular-nums text-primary-foreground">
      {n}
    </span>
  )
}

/** Two-line cell: value + muted secondary. */
function TwoLine({ top, sub, strong }: { top: string; sub: string; strong?: boolean }) {
  return (
    <div className="leading-tight">
      <div className={cn("whitespace-nowrap", strong && "font-semibold")}>{top}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  )
}

const dateCell = (d: Dated) => <TwoLine top={d.date} sub={d.ago} />

/** Basis values always carry their sign, so a bid reads as an offset. */
const basis = (n: number) => (n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2))

/** The expanded producer inset: their open bids, and what we can do about them.
    Same flat-panel language as the scenario detail — header row with bare
    figures, one raised framed table. The panel is pinned to the visible width
    (the outer table scrolls under it), and the Actions column is pinned to the
    panel's right edge — the decision is always on screen while the bid columns
    scroll beneath it. */
function OfferInset({ producer, offers }: { producer: string; offers: Offer[] }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const width = useVisibleWidth(ref)
  // The strongest card in the hand: the offer with the biggest edge over the
  // top competitor. Derived from the same rows the table renders.
  const bestEdge = offers.length
    ? Math.max(...offers.map((o) => round2(o.producerMaxBid - o.topCompBid)))
    : null
  return (
    <div
      ref={ref}
      className="sticky left-0 animate-in fade-in slide-in-from-top-2 p-5 duration-[var(--duration-base)] ease-[var(--ease-out)]"
      style={width ? { width } : undefined}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex items-center gap-3">
          <IconChip icon={Handshake} />
          <div className="min-w-0">
            <div className="text-sm font-medium">Open bids</div>
            <div className="text-sm text-muted-foreground">
              What {producer} has on the table, and your edge over the top competitor
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 pr-1">
          <Stat value={offers.length} label="Open bids" />
          <div aria-hidden className="h-8 w-px bg-border" />
          <Stat value={bestEdge == null ? "—" : basis(bestEdge)} label="Best edge" />
        </div>
      </div>
      <TableFrame>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract</TableHead>
              <TableHead className="whitespace-normal leading-tight">Time of Ship.</TableHead>
              <TableHead>Commodity</TableHead>
              <TableHead className="whitespace-normal leading-tight">Delivery Location</TableHead>
              {/* min-widths keep the long labels to two lines instead of stacking word-per-line */}
              <TableHead className="whitespace-normal leading-tight">Posted Bid</TableHead>
              <TableHead className="min-w-24 whitespace-normal leading-tight">Producer Max Bid</TableHead>
              <TableHead className="min-w-24 whitespace-normal leading-tight">Scenario Max Bid</TableHead>
              <TableHead>Top Comp.</TableHead>
              <TableHead className="min-w-24 whitespace-normal leading-tight">Top Comp. Bid</TableHead>
              <TableHead className="min-w-28 whitespace-normal leading-tight">Value over top comp</TableHead>
              <TableHead>Created</TableHead>
              <TableHead data-v2-pin className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <TwoLine top={o.month} sub={o.symbol} strong />
                </TableCell>
                <TableCell>{o.shipment}</TableCell>
                <TableCell>
                  <CommodityLabel commodity={o.commodity} />
                </TableCell>
                <TableCell>{o.location}</TableCell>
                <TableCell className="tabular-nums">{basis(o.postedBid)}</TableCell>
                <TableCell className="tabular-nums">{basis(o.producerMaxBid)}</TableCell>
                <TableCell className="tabular-nums">{basis(o.scenarioMaxBid)}</TableCell>
                <TableCell>{o.topComp}</TableCell>
                <TableCell className="tabular-nums">{basis(o.topCompBid)}</TableCell>
                {/* What the producer gains by taking our max bid over the best rival. */}
                <TableCell className="font-medium tabular-nums">
                  {basis(round2(o.producerMaxBid - o.topCompBid))}
                </TableCell>
                <TableCell className="text-muted-foreground">{o.created}</TableCell>
                <TableCell data-v2-pin>
                  <div className="flex items-center justify-end gap-1.5">
                    <Button size="sm" aria-label={`Accept ${o.month} bid`}>
                      <Check /> Accept
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Reject ${o.month} bid`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Ban /> Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableFrame>
    </div>
  )
}

/** Float math on cent values leaves dust (0.1 + 0.2); snap back to cents. */
const round2 = (n: number) => Math.round(n * 100) / 100

export default function ProducersPage() {
  const [location, setLocation] = React.useState("all")
  const [commodity, setCommodity] = React.useState("all")
  const [book, setBook] = React.useState("all") // "mine" | "all"
  const [query, setQuery] = React.useState("")
  const [filters, setFilters] = React.useState<Record<string, string>>({
    spot: "All",
    delivery: "All",
    contact: "All",
    bids: "All",
  })
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  // Every filter except location, so the tab counts predict what clicking a
  // tab actually yields under the current search / commodity / book filters.
  const preLocation = producers.filter((p) => {
    const q = query.trim().toLowerCase()
    if (q && !p.name.toLowerCase().includes(q)) return false
    if (commodity !== "all" && !p.commodities.includes(commodity as Commodity)) return false
    if (book === "mine" && !p.mine) return false
    return true
  })
  const rows = preLocation.filter((p) => location === "all" || p.location === location)
  const countFor = (loc?: string) =>
    loc ? preLocation.filter((p) => p.location === loc).length : preLocation.length

  return (
    <div className="flex w-full flex-col">
      {/* header + big search */}
      <div className="flex flex-col gap-4 px-6 pt-6 md:px-8 md:pt-8">
        <h1 className="text-2xl font-semibold tracking-tight">Producers</h1>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search producers…"
            aria-label="Search producers"
            className="h-12 rounded-xl pl-12 text-base"
          />
        </div>
      </div>

      {/* location folder tabs */}
      <div className="mt-4 px-6 md:px-8">
        <Tabs value={location} onValueChange={(v) => setLocation(v as string)}>
          <div className="max-w-full overflow-x-auto">
            <TabsList variant="folder" size="comfortable" className="w-full">
              <TabsTrigger value="all">
                All locations <TabCount>{countFor()}</TabCount>
              </TabsTrigger>
              {locations.map((l) => (
                <TabsTrigger key={l} value={l}>
                  {l} <TabCount>{countFor(l)}</TabCount>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* commodity pills (left) + My/All Producers pills (right) */}
      <div className="flex flex-wrap items-center gap-3 px-6 pt-4 md:px-8">
        <Tabs value={commodity} onValueChange={(v) => setCommodity(v as string)}>
          <TabsList variant="pill" size="compact">
            {commodityFilters.map((c) => (
              <TabsTrigger key={c.value} value={c.value}>
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Tabs value={book} onValueChange={(v) => setBook(v as string)} className="ml-auto">
          <TabsList variant="pill" size="compact">
            <TabsTrigger value="mine">My Producers</TabsTrigger>
            <TabsTrigger value="all">All Producers</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* filter dropdowns */}
      <div className="flex flex-wrap gap-2.5 px-6 pt-4 md:px-8">
        {dropdowns.map((d) => {
          const items = Object.fromEntries(d.opts.map((o) => [o, `${d.label}: ${o}`]))
          return (
            <Select
              key={d.key}
              value={filters[d.key]}
              onValueChange={(v) => setFilters((f) => ({ ...f, [d.key]: v as string }))}
              items={items}
            >
              <SelectTrigger size="sm" className="w-auto min-w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {d.opts.map((o) => (
                  <SelectItem key={o} value={o}>
                    {d.label}: {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        })}
      </div>

      {/* ranked table */}
      <div className="px-6 py-6 md:px-8">
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          {/* Striped by data index rather than the DS `striped` prop: expanded
              detail rows are extra <tr>s, which would flip nth-child parity. */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>
                  <span className="inline-flex items-center gap-1.5">
                    Rank
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="text-muted-foreground">
                            <Info className="size-3.5" />
                          </span>
                        }
                      />
                      <TooltipContent>Ranked by proximity, recent activity, and bid volume.</TooltipContent>
                    </Tooltip>
                  </span>
                </TableHead>
                <TableHead>Producer</TableHead>
                <TableHead>Account Type</TableHead>
                <TableHead>Delivery Location</TableHead>
                <TableHead>Last Spot</TableHead>
                <TableHead>Last Delivery</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead>Contact Type</TableHead>
                <TableHead>Bids</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p, i) => (
                <React.Fragment key={p.id}>
                  {/* The whole row toggles; the chevron stays a real button so
                      the control is still keyboard-reachable and labelled. */}
                  <TableRow
                    onClick={() => toggle(p.id)}
                    className={cn(
                      "cursor-pointer",
                      i % 2 === 1 && "bg-foreground/5",
                      expanded.has(p.id) && "border-b-transparent bg-foreground/5"
                    )}
                  >
                    <TableCell className="pr-0">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggle(p.id)
                        }}
                        aria-label={expanded.has(p.id) ? "Collapse" : "Expand"}
                        aria-expanded={expanded.has(p.id)}
                      >
                        <ChevronDown
                          className={cn(
                            "transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                            expanded.has(p.id) && "rotate-180"
                          )}
                        />
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium tabular-nums">{p.rank}</TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.accountType}</Badge>
                    </TableCell>
                    <TableCell>
                      <TwoLine top={p.location} sub={`${p.distanceMi} mi`} />
                    </TableCell>
                    <TableCell>{dateCell(p.lastSpot)}</TableCell>
                    <TableCell>{dateCell(p.lastDelivery)}</TableCell>
                    <TableCell>{dateCell(p.lastContact)}</TableCell>
                    <TableCell className="whitespace-nowrap">{p.contactType}</TableCell>
                    <TableCell>
                      <div className="flex">
                        <BidsBadge n={p.bids} />
                      </div>
                    </TableCell>
                  </TableRow>
                  {expanded.has(p.id) && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={10} data-v2-detail className="bg-foreground/5">
                        <OfferInset producer={p.name} offers={p.offers} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-sm text-muted-foreground">
                    No producers match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
