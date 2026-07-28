import * as React from "react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { SlidersHorizontal, TrendingDown, TrendingUp } from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { Sparkline } from "@app/components/sparkline"
import {
  availableBalance,
  kpis,
  latestOrders,
  range,
  revenue3mo,
} from "@app/data/overview"

const RANGES = ["All Time", "12m", "3m", "30d", "Today"] as const

const statusDot: Record<string, string> = {
  settled: "bg-[var(--chart-1)]",
  in_transit: "bg-warning-500",
  on_hold: "bg-viz-clay-500",
  rejected: "bg-destructive",
}

function Delta({ v }: { v: number }) {
  const up = v >= 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
        up ? "bg-primary/12 text-primary" : "bg-destructive/15 text-destructive"
      )}
    >
      {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {up ? "+" : ""}
      {v}%
    </span>
  )
}

function RangeDot() {
  return <span className="size-2.5 rounded-full border-2 border-[var(--chart-1)]" aria-hidden />
}

function Kpi({
  kpi,
  big = false,
}: {
  kpi: { label: string; value: string; delta: number; data: typeof kpis.revenue.data }
  big?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4 p-6">
      <div className="text-sm text-muted-foreground">{kpi.label}</div>
      <div className="flex flex-wrap items-center gap-3">
        <div className={cn("font-semibold tracking-tight tabular-nums", big ? "text-5xl" : "text-4xl")}>
          {kpi.value}
        </div>
        <Delta v={kpi.delta} />
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <RangeDot /> {range}
      </div>
      <Sparkline data={kpi.data} height={big ? 96 : 72} />
    </div>
  )
}

function SegmentedRange() {
  const [active, setActive] = React.useState<(typeof RANGES)[number]>("30d")
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5">
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => setActive(r)}
          className={cn(
            "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
            "duration-[var(--duration-fast)] ease-[var(--ease-out)]",
            active === r ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {r}
        </button>
      ))}
    </div>
  )
}

export default function OverviewPage() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-6 md:p-8">
      {/* header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <div className="ml-auto flex items-center gap-2">
          <SegmentedRange />
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground">
            <SlidersHorizontal className="size-4" /> Customize
          </button>
        </div>
      </div>

      {/* KPI bento — one bordered container, hairline dividers */}
      <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card">
        <div className="grid grid-cols-1 divide-y divide-border border-b border-border md:grid-cols-2 md:divide-x md:divide-y-0">
          <Kpi kpi={kpis.revenue} big />
          <Kpi kpi={kpis.contracts} big />
        </div>
        <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          <Kpi kpi={kpis.costs} />
          <Kpi kpi={kpis.costPerBushel} />
          <Kpi kpi={kpis.grossMargin} />
        </div>
      </div>

      {/* bottom strip */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-[var(--radius)] border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Revenue</div>
            <div className="text-xs text-muted-foreground">Last 3 Months</div>
          </div>
          <div className="mt-4 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue3mo} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="rev3mo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} interval={2} />
                <YAxis hide domain={["dataMin - 40", "dataMax + 20"]} />
                <Area type="monotone" dataKey="v" stroke="var(--chart-1)" strokeWidth={2} fill="url(#rev3mo)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[var(--radius)] border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Latest Orders</div>
            <button className="text-xs font-medium text-primary hover:underline">View All</button>
          </div>
          <div className="mt-4 flex flex-col gap-3.5">
            {latestOrders.map((o) => (
              <div key={o.id} className="flex items-center gap-3 text-sm">
                <span className={cn("size-2 shrink-0 rounded-full", statusDot[o.status])} />
                <span className="font-mono text-xs text-muted-foreground">{o.id}</span>
                <span className="min-w-0 flex-1 truncate">{o.who}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{o.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[var(--radius)] border border-border bg-card p-6">
          <div className="text-sm text-muted-foreground">Available balance</div>
          <div className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{availableBalance}</div>
          <div className="mt-1 text-xs text-muted-foreground">Cleared, ready to disburse</div>
        </div>
      </div>
    </div>
  )
}
