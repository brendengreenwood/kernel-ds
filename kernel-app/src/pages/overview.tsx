import * as React from "react"
import { Link } from "react-router-dom"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Banknote, LineChart, SlidersHorizontal, TrendingDown, TrendingUp, Truck, Users } from "@/components/ui/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CommodityLabel } from "@/components/ui/commodity-badge"
import { StatusBadge, type Status } from "@/components/ui/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Sparkline } from "@app/components/sparkline"
import { Empty, PanelHeader, TableFrame, Tile } from "@app/components/panels"
import {
  balance,
  kpis,
  latestOrders,
  range,
  revenue3mo,
} from "@app/data/overview"
import { bookActivity } from "@app/data/scenarios"

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 })

/** Same status-axis mapping the Scenarios detail uses. */
const actionStatus: Record<"accepted" | "rejected", { hue: Status; label: string }> = {
  accepted: { hue: "settled", label: "Accepted" },
  rejected: { hue: "rejected", label: "Rejected" },
}

/** What has happened across the whole book since last update — the first thing
    the merchant should see. Derived from the same slices the Scenarios row
    flags count, so this feed and those flags can never disagree. */
function BookActivity() {
  const accepted = bookActivity.filter((e) => e.action === "accepted").length
  const rejected = bookActivity.length - accepted
  return (
    <Card>
      <PanelHeader
        icon={Users}
        title="Producer activity"
        description="Across your book since last update"
        action={
          <Button variant="outline" size="sm" render={<Link to="/scenarios" />}>
            View scenarios
          </Button>
        }
      />
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2 sm:max-w-md">
          <Tile value={bookActivity.length} label="New" />
          <Tile value={accepted} label="Accepted" />
          <Tile value={rejected} label="Rejected" />
        </div>
        {bookActivity.length === 0 ? (
          <Empty>Nothing new across the book.</Empty>
        ) : (
          <TableFrame>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producer</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Bid</TableHead>
                  <TableHead>Bushels</TableHead>
                  <TableHead>Commodity</TableHead>
                  <TableHead>Scenario</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookActivity.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="max-w-44 truncate">{e.producer}</TableCell>
                    <TableCell>
                      <StatusBadge status={actionStatus[e.action].hue}>
                        {actionStatus[e.action].label}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="tabular-nums">{usd(e.bid)}</TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">{e.bushels.toLocaleString("en-US")}</TableCell>
                    <TableCell>
                      <CommodityLabel commodity={e.commodity} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {e.futuresMonth} · {e.location}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{e.when}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableFrame>
        )}
      </CardContent>
    </Card>
  )
}

const RANGES = ["All Time", "12m", "3m", "30d", "Today"]

/* The revenue panel's roll-up is read off the series it plots, not typed in
   beside it — the header can't drift from the curve. Series values are $k. */
const revLatest = revenue3mo[revenue3mo.length - 1].v
const revDelta =
  Math.round(((revLatest - revenue3mo[revenue3mo.length - 2].v) / revenue3mo[revenue3mo.length - 2].v) * 1000) / 10

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

      {/* what's happening across the book */}
      <BookActivity />

      {/* bottom strip */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)_minmax(0,0.85fr)]">
        <Card>
          {/* Narrow panels carry their roll-up in the CONTENT, not the header:
              a header-right figure cluster (the wide-panel convention) has no
              room to sit beside a title here and just crowds it. */}
          <PanelHeader icon={LineChart} title="Revenue" description="Last 3 months" />
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl leading-none font-semibold tracking-tight tabular-nums">
                ${revLatest}k
              </span>
              <Delta v={revDelta} />
            </div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                {/* Side margins so the first/last tick labels aren't sheared
                    off by the plot edge; only those two are drawn, which is all
                    a three-month trend needs to be readable. */}
                <AreaChart data={revenue3mo} margin={{ top: 6, right: 16, bottom: 0, left: 16 }}>
                  <defs>
                    <linearGradient id="rev3mo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} interval="preserveStartEnd" ticks={[revenue3mo[0].d, revenue3mo[revenue3mo.length - 1].d]} />
                  <YAxis hide domain={["dataMin - 40", "dataMax + 20"]} />
                  <Area type="monotone" dataKey="v" stroke="var(--chart-1)" strokeWidth={2} fill="url(#rev3mo)" dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <PanelHeader
            icon={Truck}
            title="Latest orders"
            description="Newest loads across your elevators"
            action={
              <Button variant="outline" size="sm">
                View all
              </Button>
            }
          />
          <CardContent>
            <TableFrame>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Producer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{o.id}</TableCell>
                      <TableCell className="max-w-44 truncate">{o.who}</TableCell>
                      <TableCell>
                        <StatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">{o.amount}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{o.when}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableFrame>
          </CardContent>
        </Card>

        <Card>
          <PanelHeader
            icon={Banknote}
            title="Available balance"
            description="Ready to disburse"
          />
          {/* This card holds far less than the two beside it, so the slack the
              grid hands it is pushed into ONE gap: the figure stays with its
              header, the holds seat at the base, level with the neighbouring
              table's last row. Trailing dead space reads as unfinished; a
              deliberate gap reads as composition. */}
          <CardContent className="flex flex-1 flex-col justify-between gap-4">
            <div className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
              {balance.available}
            </div>
            {/* The holds sit in the same outlined frame the tables use — this is
                a two-row table in everything but markup. */}
            <dl className="divide-y divide-border rounded-lg border border-border">
              {[
                { label: "In settlement", value: balance.inSettlement },
                { label: "On contracts", value: balance.held },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-3 px-3 py-2">
                  <dt className="min-w-0 truncate text-sm text-muted-foreground">{r.label}</dt>
                  <dd className="shrink-0 text-sm tabular-nums">{r.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
