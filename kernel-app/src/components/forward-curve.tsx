import * as React from "react"
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { LineChart as LineChartIcon } from "@/components/ui/icon"
import { Card, CardContent } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Commodity } from "@/components/ui/commodity-badge"
import { PanelHeader } from "@app/components/panels"
import { curveMonths, forwardCurve, locations } from "@app/data/scenarios"
import { basis } from "@app/lib/format"

/* The forward curve is the one chart on this dashboard that earns a full
   panel. Everything else here is a trend — a number with a shape behind it,
   which a 48px trace carries fine. This is a comparison across four series
   and six contract months, and comparison needs axes: you cannot read "we are
   two cents under Prairie Grove in March" off a sparkline.

   Four lines is also the ceiling. A fifth elevator would need a legend the
   eye has to round-trip through, and the whole point of labelling the lines
   at their right end is that it never has to. */

const commodities: Commodity[] = ["corn", "soybeans", "wheat"]

/** One colour per elevator, in book order — river terminal first. */
const seriesColor: Record<string, string> = {
  "River Terminal": "var(--series-1)",
  "Prairie Grove": "var(--series-2)",
  Birchwood: "var(--series-3)",
  Winnebago: "var(--series-4)",
}

type Row = Record<string, string | number | undefined>

export function ForwardCurve() {
  const [commodity, setCommodity] = React.useState<Commodity>("corn")

  const curves = React.useMemo(() => forwardCurve(commodity), [commodity])
  const months = curveMonths[commodity]

  /* Recharts wants one row per x value with a key per series. */
  const rows = React.useMemo<Row[]>(
    () =>
      months.map((month, i) => {
        const row: Row = { month }
        for (const c of curves) row[c.location] = c.points[i].basis
        return row
      }),
    [curves, months],
  )

  /* Your own posted bids, pinned where they land. These are the reason to
     look at the curve at all — the gap between the line and the dot is the
     question the page is asking. */
  const pins = React.useMemo(
    () =>
      curves.flatMap((c) =>
        c.points
          .filter((p) => p.posted !== undefined)
          .map((p) => ({
            location: c.location,
            month: p.month,
            posted: p.posted as number,
            curve: p.basis,
            id: p.scenarioId as string,
          })),
      ),
    [curves],
  )

  return (
    <Card>
      <PanelHeader
        icon={LineChartIcon}
        title="Forward curve"
        description="Basis by contract month, all elevators. Dots are your posted bids."
        action={
          <ToggleGroup
            size="sm"
            variant="outline"
            value={[commodity]}
            onValueChange={(v) => {
              const next = v[0]
              if (next) setCommodity(next as Commodity)
            }}
            data-v2-segmented
          >
            {commodities.map((c) => (
              <ToggleGroupItem key={c} value={c} className="capitalize">
                {c}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        }
      />
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 8, right: 96, bottom: 0, left: 8 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                dy={6}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickFormatter={(v: number) => basis(v)}
              />
              <Tooltip
                cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "4 4" }}
                content={<CurveTooltip />}
              />
              {locations.map((location) => (
                <Line
                  key={location}
                  type="monotone"
                  dataKey={location}
                  stroke={seriesColor[location]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, stroke: "var(--card)", strokeWidth: 2 }}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey={location}
                    content={(props) => (
                      <EndLabel
                        {...(props as EndLabelProps)}
                        last={months.length - 1}
                        text={location}
                        fill={seriesColor[location]}
                      />
                    )}
                  />
                </Line>
              ))}
              {pins.map((p) => (
                <ReferenceDot
                  key={p.id}
                  x={p.month}
                  y={p.posted}
                  r={4}
                  fill="var(--card)"
                  stroke={seriesColor[p.location]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

type EndLabelProps = { x?: number; y?: number; index?: number }

/* The series name sits at the end of its own line rather than in a legend.
   A legend makes the eye leave the plot, match a swatch, and come back; at
   four series the name fits where the line already ends, and the round trip
   disappears. This is why the chart reserves right margin. */
function EndLabel({
  x,
  y,
  index,
  last,
  text,
  fill,
}: EndLabelProps & { last: number; text: string; fill: string }) {
  if (index !== last || x === undefined || y === undefined) return null
  return (
    <text
      x={x + 8}
      y={y}
      fill={fill}
      fontSize={11}
      fontWeight={500}
      dominantBaseline="middle"
    >
      {text}
    </text>
  )
}

type TooltipProps = {
  active?: boolean
  label?: string
  payload?: { dataKey?: string | number; value?: number; color?: string }[]
}

/* Sorted high to low, because the question at a given month is always the
   ranking — who is paying up, and where do we sit in that order. */
function CurveTooltip({ active, label, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const rows = [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

  return (
    <div className="rounded-[var(--radius)] border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="mb-1.5 font-medium">{label}</div>
      <div className="flex flex-col gap-1">
        {rows.map((r) => (
          <div key={String(r.dataKey)} className="flex items-center gap-3">
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ background: r.color }}
            />
            <span className="mr-auto text-muted-foreground">{String(r.dataKey)}</span>
            <span className="tabular-nums font-medium">{basis(r.value ?? 0)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
