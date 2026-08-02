import { useId } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import type { Point } from "@app/data/overview"

/** A point that may carry a time, in days before now (negative, ascending). */
export type TimedPoint = Point & { t?: number }

/**
 * Area sparkline — thin stroke + gradient fill fading to transparent, the
 * reference's signature. Color comes from a DS chart token (green by default),
 * never a hardcoded hex.
 *
 * `xKey` plots the series against a numeric field instead of against its own
 * index: events do not arrive on a schedule, and an evenly spaced line says
 * they did. Without it the chart behaves exactly as it did before.
 */
export function Sparkline({
  data,
  height = 72,
  colorVar = "--chart-1",
  xKey,
  curve = "monotone",
  frame = false,
}: {
  data: TimedPoint[]
  height?: number
  colorVar?: string
  /** The only numeric x this app plots is elapsed days. Naming it here rather
      than taking any key keeps the point type honest — a generic key would
      have to be looked up through a cast. */
  xKey?: "t"
  /** `stepAfter` for figures that jump on an event and hold — a running total
      does not drift between the events that moved it. */
  curve?: "monotone" | "linear" | "stepAfter"
  /** Draw the chart's furniture: a dated baseline, day ticks and horizontal
      rules. A bare trace says "it went up"; the frame says how fast and over
      what. Requires `xKey` — there is nothing to date otherwise. */
  frame?: boolean
}) {
  const gid = useId().replace(/:/g, "")
  const stroke = `var(${colorVar})`
  // Ticks land on round times, not on events: the axis is the clock the
  // events happened on. A scenario an afternoon old and one a fortnight old
  // are both plotted here, so the unit follows the span — hours when the whole
  // story is one day, days after that. Every tick stays inside the data's own
  // domain; a tick outside it is drawn off the canvas.
  const span = xKey ? -Math.min(...data.map((p) => p.t ?? 0)) : 0
  const HOUR = 1 / 24
  const steps = span <= 0.5 ? [HOUR, 2 * HOUR, 3 * HOUR, 6 * HOUR] : span <= 3 ? [6 * HOUR, 12 * HOUR, 1] : [1, 2, 7, 14, 30]
  const step = steps.find((s) => span / s <= 4) ?? steps[steps.length - 1]
  const ticks: number[] = [0]
  for (let t = step; t <= span + 1e-9; t += step) ticks.unshift(-t)
  return (
    <ResponsiveContainer width="100%" height={height}>
      {/* A dated axis needs room at both ends or its first and last labels are
          shaved off by the plot's own edge — the two labels that say what the
          span is. The trace keeps its full width when there is no axis. */}
      <AreaChart
        data={data}
        margin={frame ? { top: 6, right: 14, bottom: 0, left: 10 } : { top: 6, right: 0, bottom: 0, left: 0 }}
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        {frame ? (
          /* Horizontal only. Vertical rules would be a second, coarser copy of
             the day ticks already on the axis. */
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="2 3" />
        ) : null}
        {xKey ? (
          <XAxis
            dataKey={xKey}
            type="number"
            domain={["dataMin", "dataMax"]}
            hide={!frame}
            ticks={frame ? ticks : undefined}
            interval={0}
            height={frame ? 18 : undefined}
            axisLine={frame ? { stroke: "var(--border)" } : false}
            tickLine={frame ? { stroke: "var(--border)" } : false}
            tick={frame ? { fill: "var(--muted-foreground)", fontSize: 10 } : false}
            tickMargin={4}
            minTickGap={2}
            tickFormatter={(t: number) =>
              t === 0 ? "now" : span <= 3 ? `${Math.round(-t * 24)}h` : `${Math.round(-t)}d`
            }
          />
        ) : null}
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <Area
          type={curve}
          dataKey="v"
          stroke={stroke}
          strokeWidth={2}
          fill={`url(#${gid})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
