"use client"

import * as React from "react"
import {
  Sprout,
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  LayoutDashboard,
  Truck,
  FileText,
  Home,
  Banknote,
  Check,
  X,
  Filter,
} from "@/components/ui/icon"

import { cn } from "@/lib/utils"
import { Section, Subhead } from "./section"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { StatusBadge } from "@/components/ui/status-badge"
import { CommodityBadge } from "@/components/ui/commodity-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/* Traversal ink (decision 0032): where-am-I / where-can-I-go reads green.
   Light pairs with the 700 step, dark with 300 — same shape as link blue. */
const traversalText = "text-brand-700 dark:text-brand-300"
const traversalUnderline = "border-brand-600 dark:border-brand-400"

const rail = [
  { label: "Operations", items: [
    { icon: LayoutDashboard, name: "Dashboard" },
    { icon: Truck, name: "Loads" },
    { icon: FileText, name: "Contracts", on: true },
  ]},
  { label: "Records", items: [
    { icon: Home, name: "Farms" },
    { icon: Banknote, name: "Settlements" },
  ]},
]

const rows = [
  { id: "CTR-4471", farm: "Hartmann Farms", commodity: "corn", bushels: "18,400", basis: "−0.35 H", status: "booked", selected: true },
  { id: "CTR-4468", farm: "Birchwood Acres", commodity: "soybeans", bushels: "9,200", basis: "−0.62 F", status: "delivered" },
  { id: "CTR-4462", farm: "Red Coulee Colony", commodity: "wheat", bushels: "26,000", basis: "+0.18 K", status: "in_transit" },
  { id: "CTR-4455", farm: "Vermillion Grain", commodity: "canola", bushels: "12,600", basis: "−1.10 X", status: "settled" },
  { id: "CTR-4449", farm: "Oak Hollow Farm", commodity: "corn", bushels: "7,800", basis: "−0.41 H", status: "pending" },
] as const

function LegendChip({ tone, label, desc }: { tone: "green" | "blue"; label: string; desc: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 font-mono text-xs text-muted-foreground">
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5",
          tone === "green"
            ? "bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-200"
            : "bg-action-100 text-action-800 dark:bg-action-900/50 dark:text-action-200"
        )}
      >
        {label}
      </span>
      {desc}
    </span>
  )
}

/** One labeled mini-example inside the signifier inventory cards. */
function InventoryRow({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 items-center gap-2 border-b py-3 last:border-b-0 sm:grid-cols-[148px_minmax(0,1fr)] sm:gap-4">
      <div className="font-mono text-xs text-muted-foreground">{name}</div>
      <div className="flex min-w-0 flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

export function ColorRolesSection() {
  return (
    <Section
      id="color-roles"
      eyebrow="Foundations"
      title="Color in use — traversal vs action"
      lead="Two brand roles, one rule (decision 0032): green answers “where am I, where can I go” — the traversal chrome you move through. Blue answers “what can I do” — every action, signifier, and affordance. Scan any screen: green is the map, blue is the levers."
    >
      <Subhead>A merchant screen, annotated</Subhead>
      <div className="overflow-hidden rounded-lg border bg-card">
        {/* top bar — green identity + traversal chrome, blue global action */}
        <div className="flex items-center gap-3 border-b bg-sidebar px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid size-6 place-items-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
              <Sprout className="size-[15px]" />
            </span>
            Kernel
          </div>
          <div className="flex h-8 min-w-0 max-w-80 flex-1 items-center gap-2 rounded-md border bg-background px-3 text-xs text-muted-foreground">
            <Search className="size-3.5 shrink-0" /> <span className="truncate">Search loads, farms, contracts…</span>
          </div>
          <div className="flex-1" />
          <Button size="sm"><Plus /> New contract</Button>
          <Avatar className="size-7"><AvatarFallback className="text-[11px]">EM</AvatarFallback></Avatar>
        </div>
        {/* body */}
        <div className="grid min-h-80 grid-cols-1 md:grid-cols-[184px_minmax(0,1fr)]">
          {/* side rail — traversal: the active item wears the green */}
          <div className="flex flex-row flex-wrap items-center gap-0.5 border-b bg-sidebar px-2.5 py-2 md:flex-col md:items-stretch md:border-r md:border-b-0 md:p-2.5">
            {rail.map((g) => (
              <React.Fragment key={g.label}>
                <div className="hidden px-2 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:block">{g.label}</div>
                {g.items.map((it) => (
                  <div
                    key={it.name}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium",
                      "on" in it && it.on
                        ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <it.icon className="size-[15px]" /> {it.name}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
          <div className="flex min-w-0 flex-col">
            {/* page header — green breadcrumb trail, blue actions */}
            <div className="px-6 py-5">
              <div className="flex items-center gap-1.5 text-xs">
                <span className={cn("cursor-pointer font-medium hover:underline", traversalText)}>Operations</span>
                <ChevronRight className="size-3 text-muted-foreground opacity-50" />
                <span className="font-medium text-foreground">Contracts</span>
              </div>
              <div className="mt-2 flex flex-wrap items-start gap-4 gap-y-2">
                <div>
                  <h3 className="text-[22px] font-semibold tracking-tight">Open contracts</h3>
                  <div className="mt-0.5 text-sm text-muted-foreground">34 active · 6 expiring this week</div>
                </div>
                <div className="ml-auto flex shrink-0 gap-2.5">
                  <Button size="sm" variant="outline">Export</Button>
                  <Button size="sm"><Plus /> New contract</Button>
                </div>
              </div>
              {/* sub-view tabs — traversal: the active tab underlines green */}
              <div className="-mb-5 mt-4 flex gap-1 overflow-x-auto">
                {["All", "Active", "Expiring", "Settled"].map((t, i) => (
                  <span
                    key={t}
                    className={cn(
                      "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium",
                      i === 1
                        ? cn("font-semibold text-foreground", traversalUnderline)
                        : "border-transparent text-muted-foreground"
                    )}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="border-t" />
            {/* filter row — blue: applied filters are things you did and can undo */}
            <div className="flex flex-wrap items-center gap-2 px-6 py-3">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-action-300 bg-action-50 px-2 py-1 text-xs font-medium text-action-800 dark:border-action-700 dark:bg-action-900/30 dark:text-action-200">
                Delivery: Jun–Aug 2026 <X className="size-3 opacity-70" />
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-action-300 bg-action-50 px-2 py-1 text-xs font-medium text-action-800 dark:border-action-700 dark:bg-action-900/30 dark:text-action-200">
                Elevator: River terminal <X className="size-3 opacity-70" />
              </span>
              <span className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                <Filter className="size-3.5" /> Add filter
              </span>
            </div>
            {/* table — blue record links + blue selection; status/commodity keep their own axes */}
            <div className="min-w-0 flex-1 border-t">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 pl-4"><Checkbox aria-label="Select all" /></TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead>Farm</TableHead>
                    <TableHead>Commodity</TableHead>
                    <TableHead>
                      {/* applied sort is an interaction state → blue signifier */}
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">
                        Bushels <ChevronDown className="size-3.5" />
                      </span>
                    </TableHead>
                    <TableHead>Basis</TableHead>
                    <TableHead className="pr-4">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow
                      key={r.id}
                      className={cn("selected" in r && r.selected && "bg-action-50/60 hover:bg-action-50/80 dark:bg-action-900/15 dark:hover:bg-action-900/25")}
                    >
                      <TableCell className="pl-4"><Checkbox defaultChecked={"selected" in r && !!r.selected} aria-label={`Select ${r.id}`} /></TableCell>
                      <TableCell>
                        <span className="cursor-pointer font-medium text-primary hover:underline">{r.id}</span>
                      </TableCell>
                      <TableCell>{r.farm}</TableCell>
                      <TableCell><CommodityBadge commodity={r.commodity} /></TableCell>
                      <TableCell className="font-mono tabular-nums">{r.bushels}</TableCell>
                      <TableCell className="font-mono tabular-nums">{r.basis}</TableCell>
                      <TableCell className="pr-4"><StatusBadge status={r.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* footer — bulk actions on the selection are blue; the page you're on is green */}
            <div className="flex flex-wrap items-center gap-3 border-t px-6 py-3">
              <span className="text-xs text-muted-foreground">1 of 5 selected</span>
              <span className="cursor-pointer text-xs font-medium text-primary hover:underline">Price selected</span>
              <span className="cursor-pointer text-xs font-medium text-primary hover:underline">Assign loads</span>
              <div className="ml-auto flex items-center gap-1 text-xs">
                <ChevronLeft className="size-3.5 text-muted-foreground" />
                <span className="grid size-6 place-items-center rounded-sm bg-brand-100 font-semibold text-brand-800 dark:bg-brand-900/50 dark:text-brand-200">1</span>
                <span className="grid size-6 place-items-center rounded-sm text-muted-foreground">2</span>
                <span className="grid size-6 place-items-center rounded-sm text-muted-foreground">3</span>
                <ChevronRight className="size-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3.5 flex flex-wrap gap-2.5">
        <LegendChip tone="green" label="traversal" desc="rail active item · breadcrumb · active tab · current page" />
        <LegendChip tone="blue" label="action" desc="buttons · record links · selection · applied filters & sort" />
      </div>

      <Subhead>Signifier inventory</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        The split, element by element. If it moves you somewhere or marks where
        you already are, it's green. If it does something — or signals that
        something can be done, is selected, or is applied — it's blue.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* traversal card */}
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-semibold">Traversal — green</div>
          <div className="mb-2 mt-0.5 text-xs text-muted-foreground">Where am I · where can I go</div>
          <InventoryRow name="rail item, active">
            <span className="flex items-center gap-2.5 rounded-md bg-sidebar-accent px-2 py-1.5 text-[13px] font-semibold text-sidebar-accent-foreground">
              <FileText className="size-[15px]" /> Contracts
            </span>
          </InventoryRow>
          <InventoryRow name="breadcrumb">
            <span className="flex items-center gap-1.5 text-xs">
              <span className={cn("font-medium hover:underline", traversalText)}>Operations</span>
              <ChevronRight className="size-3 text-muted-foreground opacity-50" />
              <span className={cn("font-medium hover:underline", traversalText)}>Contracts</span>
              <ChevronRight className="size-3 text-muted-foreground opacity-50" />
              <span className="whitespace-nowrap font-medium text-foreground">CTR-4471</span>
            </span>
          </InventoryRow>
          <InventoryRow name="tab, active">
            <span className="flex gap-1 text-sm">
              <span className={cn("border-b-2 px-3 py-1.5 font-semibold", traversalUnderline)}>Fills</span>
              <span className="border-b-2 border-transparent px-3 py-1.5 font-medium text-muted-foreground">Terms</span>
              <span className="border-b-2 border-transparent px-3 py-1.5 font-medium text-muted-foreground">Activity</span>
            </span>
          </InventoryRow>
          <InventoryRow name="wizard step, current">
            <span className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="grid size-5 place-items-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-200"><Check className="size-3" /></span>
              <span className="text-muted-foreground">Terms</span>
              <span className="h-px w-4 bg-border" />
              <span className="grid size-5 place-items-center rounded-full bg-brand-600 text-[10px] font-semibold text-white dark:bg-brand-400 dark:text-brand-950">2</span>
              <span className={traversalText}>Delivery</span>
              <span className="h-px w-4 bg-border" />
              <span className="grid size-5 place-items-center rounded-full border text-[10px] font-semibold text-muted-foreground">3</span>
              <span className="text-muted-foreground">Review</span>
            </span>
          </InventoryRow>
          <InventoryRow name="page, current">
            <span className="flex items-center gap-1 text-xs">
              <span className="grid size-6 place-items-center rounded-sm bg-brand-100 font-semibold text-brand-800 dark:bg-brand-900/50 dark:text-brand-200">4</span>
              <span className="grid size-6 place-items-center rounded-sm text-muted-foreground">5</span>
              <span className="grid size-6 place-items-center rounded-sm text-muted-foreground">6</span>
            </span>
          </InventoryRow>
        </div>
        {/* action card */}
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-semibold">Action — blue</div>
          <div className="mb-2 mt-0.5 text-xs text-muted-foreground">What can I do · what have I done</div>
          <InventoryRow name="primary action">
            <Button size="sm">Settle load</Button>
            <Button size="sm" variant="outline">Export</Button>
          </InventoryRow>
          <InventoryRow name="link">
            <span className="text-sm">
              Basis firmed at the{" "}
              <span className="cursor-pointer font-medium text-primary hover:underline">river terminal</span>{" "}
              this week.
            </span>
          </InventoryRow>
          <InventoryRow name="focus ring">
            {/* static rendering of the focus-visible treatment every control shares */}
            <span className="flex h-(--control-h-sm) items-center rounded-md border border-ring bg-background px-3 text-sm ring-[3px] ring-ring/50">
              18,400
            </span>
          </InventoryRow>
          <InventoryRow name="selection">
            <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked aria-label="Selected" /> Selected</label>
            <label className="flex items-center gap-2 text-sm">{/* keep the pill undistorted; meet 44px via the decision-0007 invisible
                ::after extension (the component's own reaches only ±8px) */}
            <Switch className="after:-inset-y-[13px]" defaultChecked aria-label="Auto-price" /> Auto-price</label>
          </InventoryRow>
          <InventoryRow name="applied filter / sort">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-action-300 bg-action-50 px-2 py-1 text-xs font-medium text-action-800 dark:border-action-700 dark:bg-action-900/30 dark:text-action-200">
              Corn only <X className="size-3 opacity-70" />
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              Bushels <ChevronDown className="size-3.5" />
            </span>
          </InventoryRow>
        </div>
      </div>

      <Subhead>The other axes don't move</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        The two brand roles never absorb the semantic axes (decisions 0003,
        0013): lifecycle state stays on <code className="font-mono">--status-*</code>,
        event outcomes on the notification scales, grain identity on{" "}
        <code className="font-mono">--commodity-*</code>. Blue never colors
        state; green never colors outcome — so a settled contract, a success
        toast, and a soybean tag stay legible next to any button.
      </p>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-6">
        <StatusBadge status="settled" />
        <StatusBadge status="in_transit" />
        <Badge variant="success">Priced</Badge>
        <Badge variant="warning">Expiring</Badge>
        <CommodityBadge commodity="soybeans" />
        <CommodityBadge commodity="wheat" />
        <span className="mx-1 text-muted-foreground">beside</span>
        <Button size="sm">Settle</Button>
      </div>
    </Section>
  )
}
