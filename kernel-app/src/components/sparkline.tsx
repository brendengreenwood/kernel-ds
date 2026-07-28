import { useId } from "react"
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts"
import type { Point } from "@app/data/overview"

/**
 * Area sparkline — thin stroke + gradient fill fading to transparent, the
 * reference's signature. Color comes from a DS chart token (green by default),
 * never a hardcoded hex.
 */
export function Sparkline({
  data,
  height = 72,
  colorVar = "--chart-1",
}: {
  data: Point[]
  height?: number
  colorVar?: string
}) {
  const gid = useId().replace(/:/g, "")
  const stroke = `var(${colorVar})`
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <Area
          type="monotone"
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
