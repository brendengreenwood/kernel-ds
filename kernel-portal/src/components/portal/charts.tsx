"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  XAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kernel/ui"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@kernel/ui"
import { Section } from "./section"

/* Bar — two series on the single-hue --chart-* ramp */
const loadsData = [
  { day: "Mon", river: 18, prairie: 24 },
  { day: "Tue", river: 26, prairie: 30 },
  { day: "Wed", river: 14, prairie: 19 },
  { day: "Thu", river: 32, prairie: 28 },
  { day: "Fri", river: 22, prairie: 35 },
  { day: "Sat", river: 9, prairie: 12 },
  { day: "Sun", river: 16, prairie: 14 },
]

const loadsConfig = {
  river: { label: "River terminal", color: "var(--chart-1)" },
  prairie: { label: "Prairie Grove", color: "var(--chart-2)" },
} satisfies ChartConfig

/* Area — one series, --chart-* */
const originatedData = [
  { week: "W1", bushels: 41200 },
  { week: "W2", bushels: 46300 },
  { week: "W3", bushels: 39800 },
  { week: "W4", bushels: 56200 },
  { week: "W5", bushels: 60400 },
  { week: "W6", bushels: 71000 },
  { week: "W7", bushels: 79800 },
  { week: "W8", bushels: 92600 },
]

const originatedConfig = {
  bushels: { label: "Bushels originated", color: "var(--chart-4)" },
} satisfies ChartConfig

/* Line — two series, --viz-* (multi-hue stays abstract) */
const basisData = [
  { week: "W1", basis: -0.42, avg3yr: -0.31 },
  { week: "W2", basis: -0.38, avg3yr: -0.3 },
  { week: "W3", basis: -0.4, avg3yr: -0.28 },
  { week: "W4", basis: -0.33, avg3yr: -0.27 },
  { week: "W5", basis: -0.28, avg3yr: -0.27 },
  { week: "W6", basis: -0.31, avg3yr: -0.26 },
  { week: "W7", basis: -0.24, avg3yr: -0.25 },
  { week: "W8", basis: -0.19, avg3yr: -0.24 },
]

const basisConfig = {
  basis: { label: "Corn basis", color: "var(--viz-sky)" },
  avg3yr: { label: "3-yr average", color: "var(--viz-slate)" },
} satisfies ChartConfig

/* Donut — commodity split, --commodity-* (the hue means the grain) */
const mixData = [
  { commodity: "corn", bushels: 186400, fill: "var(--color-corn)" },
  { commodity: "canola", bushels: 74200, fill: "var(--color-canola)" },
  { commodity: "soybeans", bushels: 128900, fill: "var(--color-soybeans)" },
  { commodity: "wheat", bushels: 92500, fill: "var(--color-wheat)" },
]

const mixTotal = mixData.reduce((sum, d) => sum + d.bushels, 0)

const mixConfig = {
  bushels: { label: "Bushels" },
  corn: { label: "Corn", color: "var(--commodity-corn)" },
  canola: { label: "Canola", color: "var(--commodity-canola)" },
  soybeans: { label: "Soybeans", color: "var(--commodity-soy)" },
  wheat: { label: "Wheat", color: "var(--commodity-wheat)" },
} satisfies ChartConfig

/* Radar — two series, --viz-* */
const scorecardData = [
  { criterion: "Capacity", river: 86, prairie: 64 },
  { criterion: "Turn time", river: 71, prairie: 88 },
  { criterion: "Basis", river: 62, prairie: 79 },
  { criterion: "Grading", river: 90, prairie: 74 },
  { criterion: "Rail", river: 94, prairie: 41 },
]

const scorecardConfig = {
  river: { label: "River terminal", color: "var(--viz-teal)" },
  prairie: { label: "Prairie Grove", color: "var(--viz-plum)" },
} satisfies ChartConfig

/* Radial — one value against a track, --chart-* */
const capacityData = [{ site: "network", pct: 68, fill: "var(--color-pct)" }]

const capacityConfig = {
  pct: { label: "Capacity used", color: "var(--chart-1)" },
} satisfies ChartConfig

export function ChartsSection() {
  return (
    <Section
      id="charts"
      eyebrow="Elements"
      title="Charts"
      lead="The full shadcn/recharts set — bar, area, line, donut, radar, radial — each through ChartContainer so tooltips and legends stay consistent. The color choice per chart demonstrates the axis doctrine: --chart-* for single-hue series, --viz-* when multiple hues must stay abstract, --commodity-* when the hue means the grain."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loads delivered</CardTitle>
            <CardDescription>Last 7 days · by elevator</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={loadsConfig} className="h-56 w-full">
              <BarChart data={loadsData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="river" fill="var(--color-river)" radius={4} />
                <Bar dataKey="prairie" fill="var(--color-prairie)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bushels originated</CardTitle>
            <CardDescription>Trailing 8 weeks · all commodities</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={originatedConfig} className="h-56 w-full">
              <AreaChart data={originatedData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="fillBushels" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-bushels)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-bushels)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="bushels"
                  type="natural"
                  fill="url(#fillBushels)"
                  stroke="var(--color-bushels)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Corn basis</CardTitle>
            <CardDescription>Trailing 8 weeks vs 3-yr average · $/bu</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={basisConfig} className="h-56 w-full">
              <LineChart data={basisData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="basis"
                  type="monotone"
                  stroke="var(--color-basis)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="avg3yr"
                  type="monotone"
                  stroke="var(--color-avg3yr)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commodity mix</CardTitle>
            <CardDescription>Bushels under contract · by grain</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={mixConfig}
              className="mx-auto aspect-square h-56"
            >
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={mixData}
                  dataKey="bushels"
                  nameKey="commodity"
                  innerRadius={58}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground font-mono text-xl font-semibold"
                            >
                              {Math.round(mixTotal / 1000)}k
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              className="fill-muted-foreground text-xs"
                            >
                              bushels
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="commodity" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Elevator scorecard</CardTitle>
            <CardDescription>Operational criteria · indexed 0–100</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={scorecardConfig} className="h-56 w-full">
              <RadarChart data={scorecardData} outerRadius="70%">
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 11 }} />
                <PolarGrid />
                <Radar
                  dataKey="river"
                  fill="var(--color-river)"
                  fillOpacity={0.35}
                  stroke="var(--color-river)"
                />
                <Radar
                  dataKey="prairie"
                  fill="var(--color-prairie)"
                  fillOpacity={0.25}
                  stroke="var(--color-prairie)"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage capacity</CardTitle>
            <CardDescription>Network-wide · harvest week 3</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={capacityConfig}
              className="mx-auto aspect-square h-56"
            >
              <RadialBarChart
                data={capacityData}
                startAngle={90}
                endAngle={-270}
                innerRadius={72}
                outerRadius={100}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="pct" background cornerRadius={10} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground font-mono text-xl font-semibold"
                            >
                              68%
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              className="fill-muted-foreground text-xs"
                            >
                              of 1.2M bu
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
