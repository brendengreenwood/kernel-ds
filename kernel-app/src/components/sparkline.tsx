import { useId, useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { Point } from "@app/data/overview"

/** A point that may carry a time, in days before now (negative, ascending). */
export type TimedPoint = Point & { t?: number }

/** How long before now a point sits, in words.

    The unit follows the distance, not the chart's span, because this names
    one moment rather than the range: rounding a twelve-minute-old event to
    the span's hour unit prints `0h ago`, which is both wrong and a duration
    where a moment belongs. The words are the ones the activity table below
    already uses, since the whole point of the readout is to send a reader
    to a row. */
const ago = (t: number) => {
  const mins = Math.round(-t * 1440)
  if (mins < 1) return "now"
  if (mins < 60) return `${mins} min ago`
  if (mins < 1440) return `${Math.round(mins / 60)} h ago`
  return `${Math.round(mins / 1440)} d ago`
}

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
  endpoints = false,
  hover = false,
  format = (n: number) => String(n),
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
  /** Label the trace's ends instead of drawing axes: the y range down the
      left, the x span under it. A tile-sized plot has no room for a tick
      column — 28px of a 126px width spent on 10px numbers, sitting under a
      figure already set at 24px — and the two y values a reader wants off a
      sparkline are the one it started from and the one it reached.
      Requires `xKey`. */
  endpoints?: boolean
  /** Read the trace out on hover: the value under the pointer and how long
      ago it happened, snapped to the nearest event rather than to the pixel.
      The end labels say where the line begins and ends; this is how a reader
      asks about the middle. Requires `xKey` — a point with no time can say
      what it was but not when. */
  hover?: boolean
  /** How to write the y values. Each series carries its own unit: a running
      total reads `114k`, a basis reads `-0.17`. */
  format?: (n: number) => string
}) {
  const gid = useId().replace(/:/g, "")
  const stroke = `var(${colorVar})`
  // Which point the pointer is nearest, or null at rest. Recharts owns the
  // hit-testing — it snaps to the nearest event, which is the only x a
  // reader can mean — but the readout is drawn by this component, in the
  // label lane, rather than by a tooltip floating over the trace.
  const [active, setActive] = useState<number | null>(null)
  const point = active === null ? undefined : data[active]
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
  // Same unit rule the ticks use, so a tile's caption and a framed chart's
  // axis can never name the same span differently.
  const spanTick = span <= 3 ? `${Math.round(span * 24)}h` : `${Math.round(span)}d`
  // The y range is the trace's own low and high, not the axis domain: the
  // domain is `dataMin`/`dataMax`, so they are the same two numbers, and
  // reading them off the data keeps the labels true if the domain ever
  // changes. A flat series prints one label — a low and a high that are the
  // same number twice is a repetition, not a range.
  const values = data.map((p) => p.v)
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const flat = hi === lo

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      {/* A dated axis needs room at both ends or its first and last labels are
          shaved off by the plot's own edge — the two labels that say what the
          span is. The trace keeps its full width when there is no axis. */}
      <AreaChart
        data={data}
        margin={frame ? { top: 6, right: 14, bottom: 0, left: 10 } : { top: 6, right: 0, bottom: 0, left: 0 }}
        onMouseMove={(state: { activeTooltipIndex?: number | string | null }) => {
          if (!hover) return
          // Recharts types the active index as a string for categorical
          // axes and a number for numeric ones. This chart is numeric, but
          // the type covers both, so the index is normalised rather than
          // asserted away.
          const i = state?.activeTooltipIndex
          setActive(i === undefined || i === null ? null : Number(i))
        }}
        onMouseLeave={() => setActive(null)}
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
        {hover && xKey ? (
          /* Present for its hit-testing and its cursor, not for its box: the
             content renders nothing. A tile is 190px wide and 176px tall, and
             a floating panel inside it either covers the trace it is
             describing or is clipped by the tile's own rounded corner.

             The cursor is a rule through the whole plot rather than a
             highlight on the trace, because it marks a moment, and the moment
             is the full height of the chart. */
          <Tooltip
            content={() => null}
            cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "2 3" }}
            isAnimationActive={false}
          />
        ) : null}
        <Area
          type={curve}
          dataKey="v"
          stroke={stroke}
          strokeWidth={2}
          fill={`url(#${gid})`}
          dot={false}
          activeDot={
            hover
              ? /* Ringed in the surface it sits on, so the dot reads as a bead
                   on the line rather than as a ninth data point. */
                { r: 3, fill: stroke, stroke: "var(--card)", strokeWidth: 2 }
              : false
          }
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )

  if (!endpoints) return chart

  /* The y labels flank the plot rather than overlaying it. Laid over the
     trace they would sit on the fill at exactly the points the trace is
     highest and lowest — the two places there is no room. Flanking costs
     the trace about 30px of a 126px width, which eight points can spare.

     They are set against the plot's top and bottom edges because the
     y domain is dataMin-to-dataMax: the high IS the top of the plot and
     the low IS the bottom, so a label at either edge is on its value.

     The x span reads left to right under the whole thing: where the trace
     starts, and `now` where it ends. `now` is the word the axis used when
     it had ticks, and it stays the word — a time label of `0h` is a
     duration, not a moment.

     On hover that same lane becomes the readout. It keeps its two ends —
     value on the left, when on the right — so the row a reader is already
     using for x context answers in place instead of a second surface
     appearing somewhere else in the tile. The lane is one line tall either
     way, so nothing moves when the pointer arrives. */
  return (
    <div className="flex items-stretch gap-1.5">
      <div
        className="flex shrink-0 flex-col justify-between py-px text-right text-[10px] leading-none text-muted-foreground tabular-nums"
        style={{ height }}
      >
        <span>{format(hi)}</span>
        {flat ? null : <span>{format(lo)}</span>}
      </div>
      {/* The x labels live in the plot's own column, not under the whole
          assembly: they date the trace, and a span label starting at the
          left edge of the y gutter starts before the line it measures. */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {chart}
        <div className="flex justify-between text-[10px] leading-none text-muted-foreground tabular-nums">
          {point ? (
            <>
              <span className="font-medium text-foreground">{format(point.v)}</span>
              <span>{point.t === undefined ? null : ago(point.t)}</span>
            </>
          ) : (
            <>
              <span>{spanTick}</span>
              <span>now</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
