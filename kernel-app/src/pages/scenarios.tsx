import * as React from "react"
import { Archive, Pencil, Plus } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { CommodityLabel, type Commodity } from "@/components/ui/commodity-badge"
import { StatusBadge, type Status } from "@/components/ui/status-badge"
import { TabCount, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { locations, scenarios, type ScenarioStatus } from "@app/data/scenarios"

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

export default function ScenariosPage() {
  const [location, setLocation] = React.useState("all")
  const [commodity, setCommodity] = React.useState("all")

  // Everything except the location filter, so the tab counts predict what
  // clicking a tab actually yields under the current commodity filter.
  const byCommodity = scenarios.filter((s) => commodity === "all" || s.commodity === commodity)
  const rows = byCommodity.filter((s) => location === "all" || s.location === location)
  const countFor = (loc?: string) =>
    loc ? byCommodity.filter((s) => s.location === loc).length : byCommodity.length

  return (
    <div className="flex w-full flex-col">
      {/* page header */}
      <div className="flex flex-wrap items-center gap-3 px-6 pt-6 md:px-8 md:pt-8">
        <h1 className="text-2xl font-semibold tracking-tight">Scenarios</h1>
        <Button size="sm" className="ml-auto">
          <Plus /> New scenario
        </Button>
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
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table striped>
            <TableHeader>
              <TableRow>
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
              {rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium whitespace-nowrap">{s.futuresMonth}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{s.shipment}</TableCell>
                  <TableCell>
                    <CommodityLabel commodity={s.commodity} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{s.location}</TableCell>
                  <TableCell className="tabular-nums">{usd(s.postedBid)}</TableCell>
                  <TableCell className="tabular-nums">{usd(s.maxBid)}</TableCell>
                  <TableCell className="font-medium tabular-nums">{usd(s.adjustedMaxBid)}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{s.updated}</TableCell>
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
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-sm text-muted-foreground">
                    No scenarios for this location and commodity.
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
