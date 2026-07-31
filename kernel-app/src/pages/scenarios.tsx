import * as React from "react"
import { Archive, ChevronDown, Pencil, Plus, Users } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { CommodityLabel, type Commodity } from "@/components/ui/commodity-badge"
import { StatusBadge, type Status } from "@/components/ui/status-badge"
import { TabCount, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ActivityFlag, Empty, IconChip, PageHeader, Stat, TableFrame, useVisibleWidth } from "@app/components/panels"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  locations,
  scenarios,
  sinceCount,
  tally,
  type ActivityRange,
  type Scenario,
  type ScenarioStatus,
} from "@app/data/scenarios"

/** Scenario lifecycle → DS StatusBadge hue + label (StatusBadge is the DS's
    persistent-state axis; children override the label for this domain). */
const statusMap: Record<ScenarioStatus, { hue: Status; label: string }> = {
  active: { hue: "settled", label: "Active" },
  draft: { hue: "draft", label: "Draft" },
  paused: { hue: "on_hold", label: "Paused" },
  expired: { hue: "expired", label: "Expired" },
}

const commodityFilters: { value: string; label: string; key?: Commodity }[] = [
  { value: "all", label: "All Commodities" },
  { value: "soybeans", label: "Soybeans", key: "soybeans" },
  { value: "corn", label: "Corn", key: "corn" },
  { value: "wheat", label: "Wheat", key: "wheat" },
]

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 })


/** Producer accepts/rejects ride the DS status axis — a persistent outcome on
    the offer, not a momentary notification. */
const actionStatus: Record<"accepted" | "rejected", { hue: Status; label: string }> = {
  accepted: { hue: "settled", label: "Accepted" },
  rejected: { hue: "rejected", label: "Rejected" },
}

/** The expanded scenario row: what producers did about this bid. The range tabs
    are per-row — each row is read on its own. (A competitor-movement panel lived
    here too; it is shelved, and its data still generates — see the note in
    data/scenarios.ts.) */
function ScenarioDetail({ scenario }: { scenario: Scenario }) {
  const [range, setRange] = React.useState<ActivityRange>("since")
  const activity = scenario.activity[range]
  const counts = tally(activity)
  const ref = React.useRef<HTMLDivElement>(null)
  const width = useVisibleWidth(ref)

  return (
    <div
      ref={ref}
      className="sticky left-0 animate-in fade-in slide-in-from-top-2 p-5 duration-[var(--duration-base)] ease-[var(--ease-out)]"
      style={width ? { width } : undefined}
    >
      {/* Flat panel — no card-in-well nesting. The well is the surface; the
          header row carries the roll-up figures as bare numbers, and the framed
          table is the one raised element. */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex items-center gap-3">
          <IconChip icon={Users} />
          <div className="min-w-0">
            <div className="text-sm font-medium">Producer activity</div>
            <div className="text-sm text-muted-foreground">Accepts and rejects against this bid</div>
          </div>
        </div>
        <div className="flex items-center gap-6 pr-1">
          <Stat value={counts.accepted} label="Accepted" />
          <div aria-hidden className="h-8 w-px bg-border" />
          <Stat value={counts.rejected} label="Rejected" />
        </div>
      </div>

      <Tabs value={range} onValueChange={(v) => setRange(v as ActivityRange)} className="mt-4">
        <div className="max-w-full overflow-x-auto">
          <TabsList variant="underline" size="compact" className="w-full">
            <TabsTrigger value="since">Since Last Update</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <div className="mt-4">
        {activity.events.length === 0 ? (
          <Empty>No producer activity in this window.</Empty>
        ) : (
          <TableFrame>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producer</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Bid</TableHead>
                  <TableHead>Bushels</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activity.events.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="max-w-44 truncate">{e.producer}</TableCell>
                    <TableCell>
                      <StatusBadge status={actionStatus[e.action].hue}>
                        {actionStatus[e.action].label}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="tabular-nums">{usd(e.bid)}</TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">{e.bushels.toLocaleString("en-US")}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{e.when}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableFrame>
        )}
      </div>
    </div>
  )
}

export default function ScenariosPage() {
  const [location, setLocation] = React.useState("all")
  const [commodity, setCommodity] = React.useState("all")

  // Everything except the location filter, so the tab counts predict what
  // clicking a tab actually yields under the current commodity filter.
  const byCommodity = scenarios.filter((s) => commodity === "all" || s.commodity === commodity)
  const rows = byCommodity.filter((s) => location === "all" || s.location === location)
  const countFor = (loc?: string) =>
    loc ? byCommodity.filter((s) => s.location === loc).length : byCommodity.length

  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div className="flex w-full flex-col">
      <div className="px-6 pt-6 md:px-8 md:pt-8">
        <PageHeader
          title="Scenarios"
          action={
            <Button size="sm">
              <Plus /> New scenario
            </Button>
          }
        />
      </div>

      {/* location tabs (underline) */}
      <div className="mt-4 px-6 md:px-8">
        <Tabs value={location} onValueChange={(v) => setLocation(v as string)}>
          <div className="max-w-full overflow-x-auto">
            {/* w-full so the folder tabs' baseline border spans the container */}
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

      {/* commodity pills */}
      <div className="px-6 pt-4 md:px-8">
        <Tabs value={commodity} onValueChange={(v) => setCommodity(v as string)}>
          <div className="max-w-full overflow-x-auto">
            <TabsList variant="pill" size="compact">
              {commodityFilters.map((c) => (
                <TabsTrigger key={c.value} value={c.value}>
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* object table */}
      <div className="px-6 py-6 md:px-8">
        <TableFrame dense={false}>
          {/* Striped by data index rather than the DS `striped` prop: expanded
              detail rows are extra <tr>s, which would flip nth-child parity. */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Futures month</TableHead>
                <TableHead>Time of shipment</TableHead>
                <TableHead>Commodity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Posted bid</TableHead>
                <TableHead>Max bid</TableHead>
                <TableHead>Adjusted Max Bid</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s, i) => (
                <React.Fragment key={s.id}>
                {/* The whole row toggles; the chevron stays a real button so the
                    control is keyboard-reachable and labelled. */}
                <TableRow
                  onClick={() => toggle(s.id)}
                  className={cn(
                    "cursor-pointer",
                    i % 2 === 1 && "bg-foreground/5",
                    expanded.has(s.id) && "border-b-transparent bg-foreground/5"
                  )}
                >
                  <TableCell className="pr-0">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggle(s.id)
                      }}
                      aria-label={expanded.has(s.id) ? "Collapse" : "Expand"}
                      aria-expanded={expanded.has(s.id)}
                    >
                      <ChevronDown
                        className={cn(
                          "transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                          expanded.has(s.id) && "rotate-180"
                        )}
                      />
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{s.futuresMonth}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{s.shipment}</TableCell>
                  <TableCell>
                    <CommodityLabel commodity={s.commodity} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{s.location}</TableCell>
                  <TableCell className="tabular-nums">{usd(s.postedBid)}</TableCell>
                  <TableCell className="tabular-nums">{usd(s.maxBid)}</TableCell>
                  <TableCell className="font-medium tabular-nums">{usd(s.adjustedMaxBid)}</TableCell>
                  {/* The flag lives beside "Last Updated" because that is
                      exactly what it is measured against. */}
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{s.updated}</span>
                      {sinceCount(s) > 0 && <ActivityFlag n={sinceCount(s)} />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={statusMap[s.status].hue}>{statusMap[s.status].label}</StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="default" size="icon-sm" aria-label={`Edit ${s.id}`}>
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Archive ${s.id}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Archive />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expanded.has(s.id) && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={11} data-v2-detail className="bg-foreground/5">
                      <ScenarioDetail scenario={s} />
                    </TableCell>
                  </TableRow>
                )}
                </React.Fragment>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="py-10 text-center text-sm text-muted-foreground">
                    No scenarios for this location and commodity.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableFrame>
      </div>
    </div>
  )
}
