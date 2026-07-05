import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  RechartsLegend as Legend,
  RechartsTooltip as Tooltip,
  XAxis,
  type ChartConfig,
} from "kernel-portal"

const deliveriesData = [
  { day: "Mon", corn: 18400, soybeans: 9200 },
  { day: "Tue", corn: 22100, soybeans: 11800 },
  { day: "Wed", corn: 14900, soybeans: 8100 },
  { day: "Thu", corn: 25600, soybeans: 12400 },
  { day: "Fri", corn: 20300, soybeans: 15100 },
  { day: "Sat", corn: 8700, soybeans: 4200 },
]

const deliveriesConfig = {
  corn: { label: "Corn", color: "var(--chart-1)" },
  soybeans: { label: "Soybeans", color: "var(--chart-2)" },
} satisfies ChartConfig

export function BushelsBarChart() {
  return (
    <div style={{ width: 440 }}>
      <ChartContainer config={deliveriesConfig} style={{ height: 240, width: "100%" }}>
        <BarChart data={deliveriesData} width={440} height={240}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend content={<ChartLegendContent />} />
          <Bar dataKey="corn" fill="var(--color-corn)" radius={4} isAnimationActive={false} />
          <Bar dataKey="soybeans" fill="var(--color-soybeans)" radius={4} isAnimationActive={false} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}

const basisData = [
  { week: "W1", basis: 34 },
  { week: "W2", basis: 31 },
  { week: "W3", basis: 33 },
  { week: "W4", basis: 28 },
  { week: "W5", basis: 25 },
  { week: "W6", basis: 26 },
  { week: "W7", basis: 22 },
  { week: "W8", basis: 18 },
]

const basisConfig = {
  basis: { label: "Corn basis (¢ under futures)", color: "var(--chart-4)" },
} satisfies ChartConfig

export function BasisAreaChart() {
  return (
    <div style={{ width: 440 }}>
      <ChartContainer config={basisConfig} style={{ height: 240, width: "100%" }}>
        <AreaChart data={basisData} width={440} height={240}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
          <Tooltip content={<ChartTooltipContent />} />
          <defs>
            <linearGradient id="fillBasis" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-basis)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-basis)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            dataKey="basis"
            type="natural"
            fill="url(#fillBasis)"
            stroke="var(--color-basis)"
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
