"use client"

import * as React from "react"
import { Plus, Download, Filter, X } from "@/components/ui/icon"

import { Section } from "./section"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge, type Status } from "@/components/ui/status-badge"
import { CommodityBadge, type Commodity } from "@/components/ui/commodity-badge"
import { Progress } from "@/components/ui/progress"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsList, TabsTrigger, TabsContent, TabCount } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ShipmentRow = {
  id: string
  farm: string
  commodity: Commodity
  bushels: string
  window: string
  shipBy: string
  /** urgency on the notification axis: overdue (error) · near (warning) · quiet text */
  due?: { label: string; tone: "overdue" | "near" | "quiet" }
  shipped: number
  loads: number
  status: Status
}

type MonthGroup = { key: string; label: string; totalBu: string; rows: ShipmentRow[] }

const groups: MonthGroup[] = [
  {
    key: "jul",
    label: "July 2026",
    totalBu: "58,600 bu",
    rows: [
      { id: "CTR-4433", farm: "Prairie Sky Colony", commodity: "soybeans", bushels: "6,400", window: "Jun 20 – Jul 18", shipBy: "Jul 18", due: { label: "2d overdue", tone: "overdue" }, shipped: 5, loads: 6, status: "in_transit" },
      { id: "CTR-4471", farm: "Hartmann Farms", commodity: "corn", bushels: "18,400", window: "Jul 1 – Jul 31", shipBy: "Jul 24", due: { label: "4d left", tone: "near" }, shipped: 6, loads: 8, status: "in_transit" },
      { id: "CTR-4462", farm: "Red Coulee Colony", commodity: "wheat", bushels: "26,000", window: "Jul 15 – Aug 15", shipBy: "Jul 28", due: { label: "in 8d", tone: "quiet" }, shipped: 3, loads: 12, status: "in_transit" },
      { id: "CTR-4449", farm: "Oak Hollow Farm", commodity: "corn", bushels: "7,800", window: "Jul 10 – Jul 31", shipBy: "Jul 31", due: { label: "in 11d", tone: "quiet" }, shipped: 2, loads: 4, status: "booked" },
    ],
  },
  {
    key: "aug",
    label: "August 2026",
    totalBu: "52,800 bu",
    rows: [
      { id: "CTR-4483", farm: "Birchwood Acres", commodity: "canola", bushels: "12,600", window: "Aug 1 – Aug 31", shipBy: "Aug 11", due: { label: "in 22d", tone: "quiet" }, shipped: 0, loads: 6, status: "booked" },
      { id: "CTR-4468", farm: "Vermillion Grain", commodity: "soybeans", bushels: "9,200", window: "Aug 5 – Aug 28", shipBy: "Aug 18", shipped: 0, loads: 4, status: "pending" },
      { id: "CTR-4490", farm: "Tall Grass Colony", commodity: "corn", bushels: "31,000", window: "Aug 15 – Sep 15", shipBy: "Aug 27", shipped: 0, loads: 14, status: "booked" },
    ],
  },
  {
    key: "sep",
    label: "September 2026",
    totalBu: "37,500 bu",
    rows: [
      { id: "CTR-4495", farm: "Willow Bend Farm", commodity: "wheat", bushels: "15,500", window: "Sep 1 – Sep 30", shipBy: "Sep 9", shipped: 0, loads: 7, status: "pending" },
      { id: "CTR-4501", farm: "Hartmann Farms", commodity: "corn", bushels: "22,000", window: "Sep 3 – Sep 30", shipBy: "Sep 21", shipped: 0, loads: 10, status: "draft" },
    ],
  },
]

function DueSignal({ due }: { due?: ShipmentRow["due"] }) {
  if (!due) return <span className="text-muted-foreground">—</span>
  if (due.tone === "overdue") return <Badge variant="destructive">{due.label}</Badge>
  if (due.tone === "near") return <Badge variant="warning">{due.label}</Badge>
  return <span className="text-muted-foreground">{due.label}</span>
}

function ScheduleTable({ show }: { show: MonthGroup[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-6">Contract</TableHead>
          <TableHead>Commodity</TableHead>
          <TableHead className="text-right">Bushels</TableHead>
          <TableHead>Delivery window</TableHead>
          <TableHead>Ship by</TableHead>
          <TableHead>Loads shipped</TableHead>
          <TableHead className="pr-6">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {show.map((g) => (
          <React.Fragment key={g.key}>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableCell colSpan={7} className="py-1.5 pl-6 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {g.label} · {g.totalBu}
              </TableCell>
            </TableRow>
            {g.rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="pl-6">
                  {/* record link — traversal ink: it navigates; farm as caption */}
                  <span className="cursor-pointer font-medium text-traversal hover:underline">{r.id}</span>
                  <div className="mt-0.5 text-xs text-muted-foreground">{r.farm}</div>
                </TableCell>
                <TableCell><CommodityBadge commodity={r.commodity} /></TableCell>
                <TableCell className="text-right font-mono tabular-nums">{r.bushels}</TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">{r.window}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className="mr-2 font-mono text-xs tabular-nums">{r.shipBy}</span>
                  <DueSignal due={r.due} />
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-2.5">
                    {/* load progress is state — it rides the green --primary */}
                    <Progress value={(r.shipped / r.loads) * 100} className="h-1.5 w-14" />
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">{r.shipped}/{r.loads}</span>
                  </span>
                </TableCell>
                <TableCell className="pr-6"><StatusBadge status={r.status} /></TableCell>
              </TableRow>
            ))}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  )
}

export function ShipmentScheduleSection() {
  return (
    <Section
      id="shipments"
      eyebrow="Domain"
      title="Shipment schedule"
      lead="When does the grain move — a time-of-shipment view over open contracts. Month groups order the quarter, ship-by dates carry urgency on the notification axis, and load progress shows how much of each contract has left the yard. The first full screen composed under the green-world / blue-actions model."
    >
      <div className="overflow-hidden rounded-lg border bg-card">
        {/* header — traversal breadcrumb, one blue lead for the region */}
        <div className="px-6 pt-5">
          <Breadcrumb>
            <BreadcrumbList className="text-xs">
              <BreadcrumbItem><BreadcrumbLink>Operations</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink>Contracts</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Shipments</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="mt-2 flex flex-wrap items-start gap-4 gap-y-2 pb-4">
            <div>
              <h3 className="text-[22px] font-semibold tracking-tight">Shipment schedule</h3>
              <div className="mt-0.5 text-sm text-muted-foreground">
                9 contracts · 58,600 bu shipping in July · 148,900 bu open
              </div>
            </div>
            <div className="ml-auto flex shrink-0 gap-2.5">
              <Button size="sm" variant="outline"><Download /> Export</Button>
              <Button size="sm"><Plus /> Schedule loads</Button>
            </div>
          </div>
        </div>

        {/* month tabs — traversal: green active underline, counts along for the ride */}
        <Tabs defaultValue="all">
          <div className="overflow-x-auto px-6">
            <TabsList variant="underline" className="w-full min-w-max">
              <TabsTrigger value="all">All <TabCount>9</TabCount></TabsTrigger>
              <TabsTrigger value="jul">July <TabCount>4</TabCount></TabsTrigger>
              <TabsTrigger value="aug">August <TabCount>3</TabCount></TabsTrigger>
              <TabsTrigger value="sep">September <TabCount>2</TabCount></TabsTrigger>
            </TabsList>
          </div>

          {/* filter row — quiet brand-tinted chips; routine, not the lead */}
          <div className="flex flex-wrap items-center gap-2 border-b px-6 py-3">
            <span className="inline-flex items-center gap-1.5 rounded-md border bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
              Elevator: River terminal <X className="size-3 opacity-70" />
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
              Q3 2026 <X className="size-3 opacity-70" />
            </span>
            <span className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
              <Filter className="size-3.5" /> Add filter
            </span>
          </div>

          <TabsContent value="all"><ScheduleTable show={groups} /></TabsContent>
          {groups.map((g) => (
            <TabsContent key={g.key} value={g.key}><ScheduleTable show={[g]} /></TabsContent>
          ))}
        </Tabs>

        {/* footer — totals + traversal pagination (current page = brand tint) */}
        <div className="flex flex-wrap items-center gap-3 border-t px-6 py-3">
          <span className="text-xs text-muted-foreground">
            Showing 9 of 27 scheduled contracts
          </span>
          <Pagination className="ml-auto w-auto justify-end">
            <PaginationContent>
              <PaginationItem><PaginationPrevious /></PaginationItem>
              <PaginationItem><PaginationLink size="icon-sm" isActive>1</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink size="icon-sm">2</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink size="icon-sm">3</PaginationLink></PaginationItem>
              <PaginationItem><PaginationEllipsis /></PaginationItem>
              <PaginationItem><PaginationNext /></PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
        Reading the color: the breadcrumb, month tabs, record links, and
        current page are traversal green; load progress is green state; the
        one blue button is the region's lead action (Schedule loads);
        ship-by urgency rides the notification axis (warning approaching,
        error overdue) and commodity/status badges keep their own hues —
        no axis borrowed, none crossed.
      </p>
    </Section>
  )
}
