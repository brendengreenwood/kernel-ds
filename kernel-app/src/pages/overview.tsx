import * as React from "react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { SlidersHorizontal, TrendingDown, TrendingUp } from "@/components/ui/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Sparkline } from "@app/components/sparkline"
import {
  availableBalance,
  kpis,
  latestOrders,
  range,
  revenue3mo,
} from "@app/data/overview"

const RANGES = ["All Time", "12m", "3m", "30d", "Today"]

function Delta({ v }: { v: number }) {
  const up = v >= 0
  return (
    <Badge variant={up ? "success" : "destructive"}>
      {up ? <TrendingUp /> : <TrendingDown />}
      {up ? "+" : ""}
      {v}%
    </Badge>
  )
}

function Kpi({
  kpi,
  big = false,
}: {
  kpi: { label: string; value: string; delta: number; data: typeof kpis.revenue.data }
  big?: boolean
}) {
  return (
    <Card data-v2-kpi className="justify-between">
      <CardHeader className="pb-0">
        <CardDescription>{kpi.label}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className={big ? "text-5xl font-semibold tracking-tight tabular-nums" : "text-4xl font-semibold tracking-tight tabular-nums"}>
            {kpi.value}
          </CardTitle>
          <Delta v={kpi.delta} />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-2.5 rounded-full border-2 border-[var(--chart-1)]" aria-hidden /> {range}
        </div>
        <Sparkline data={kpi.data} height={big ? 96 : 72} />
      </CardContent>
    </Card>
  )
}

export default function OverviewPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 p-6 md:p-8">
      {/* header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        {/* The range control is atomic-width: let the cluster shrink and scroll
            in place rather than pushing the page wide on phones. */}
        <div className="ml-auto flex min-w-0 max-w-full items-center gap-2 overflow-x-auto">
          <ToggleGroup defaultValue={["30d"]} variant="outline" size="sm" data-v2-segmented>
            {RANGES.map((r) => (
              <ToggleGroupItem key={r} value={r}>
                {r}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Button variant="outline" size="sm" className="shrink-0">
            <SlidersHorizontal /> Customize
          </Button>
        </div>
      </div>

      {/* KPI grid — real Cards, pushed by the modification layer */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Kpi kpi={kpis.revenue} big />
        <Kpi kpi={kpis.contracts} big />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Kpi kpi={kpis.costs} />
        <Kpi kpi={kpis.costPerBushel} />
        <Kpi kpi={kpis.grossMargin} />
      </div>

      {/* bottom strip */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CardDescription>Last 3 Months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm font-medium">Latest Orders</CardTitle>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              View All
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {latestOrders.map((o) => (
              <div key={o.id} className="flex items-center gap-3 text-sm">
                <span className="font-mono text-xs text-muted-foreground">{o.id}</span>
                <span className="min-w-0 flex-1 truncate">{o.who}</span>
                <StatusBadge status={o.status} />
                <span className="shrink-0 tabular-nums text-muted-foreground">{o.amount}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="justify-between">
          <CardHeader className="pb-0">
            <CardDescription>Available balance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="text-3xl font-semibold tracking-tight tabular-nums">{availableBalance}</div>
            <div className="text-xs text-muted-foreground">Cleared, ready to disburse</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
