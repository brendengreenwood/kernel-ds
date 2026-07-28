import * as React from "react"
import { ChevronDown, Info, Search } from "@/components/ui/icon"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { locations, producers, type Dated } from "@app/data/producers"

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
function TwoLine({ top, sub }: { top: string; sub: string }) {
  return (
    <div className="leading-tight">
      <div className="whitespace-nowrap">{top}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  )
}

const dateCell = (d: Dated) => <TwoLine top={d.date} sub={d.ago} />

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

  const rows = producers.filter((p) => {
    const q = query.trim().toLowerCase()
    if (q && !p.name.toLowerCase().includes(q)) return false
    if (location !== "all" && p.location !== location) return false
    if (commodity !== "all" && !p.commodities.includes(commodity as Commodity)) return false
    if (book === "mine" && !p.mine) return false
    return true
  })

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
            <TabsList variant="folder" className="w-full">
              <TabsTrigger value="all">All locations</TabsTrigger>
              {locations.map((l) => (
                <TabsTrigger key={l} value={l}>
                  {l}
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
          <Table striped>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead className="text-right">
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
                <TableHead className="text-right">Bids</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <React.Fragment key={p.id}>
                  <TableRow>
                    <TableCell className="pr-0">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => toggle(p.id)}
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
                    <TableCell className="text-right font-medium tabular-nums">{p.rank}</TableCell>
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
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <BidsBadge n={p.bids} />
                      </div>
                    </TableCell>
                  </TableRow>
                  {expanded.has(p.id) && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell />
                      <TableCell colSpan={9} className="py-3">
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                          <span className="text-muted-foreground">Commodities</span>
                          {p.commodities.map((c) => (
                            <CommodityLabel key={c} commodity={c} />
                          ))}
                        </div>
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
