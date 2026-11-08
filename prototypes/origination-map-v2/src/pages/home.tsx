import * as React from "react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { personaLabel, usePersona } from "@app/lib/persona"
import { ACTION_LABEL, RANGES, TEAM, inRange, scenarioLabel, whenLabel, type TeamAction } from "@app/merchant/activity"
import { snapshot } from "@app/merchant/curve"
import { COMMODITY_LABEL, LOCATIONS, SCENARIOS, basis, byShipStart, shipWindow } from "@app/merchant/scenario"

// Home answers two questions per shipment month: am I beating my competitors, am I buying well against the market.
// All simulated.
const BADGE: Record<TeamAction, "success" | "destructive"> = {
  accepted: "success",
  rejected: "destructive",
}
const bu = (n: number) => n.toLocaleString("en-US")
const signed = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}$${Math.abs(n).toFixed(2)}`

// good = the gap favors the merchant
function Gap({ value, good }: { value: number | null; good: boolean }) {
  if (value === null) return <span className="text-muted-foreground">—</span>
  return (
    <Badge variant={value === 0 ? "outline" : good ? "success" : "destructive"} className="tabular-nums">
      {signed(value)}
    </Badge>
  )
}

export default function HomePage() {
  const { persona } = usePersona()
  const [range, setRange] = React.useState("7d")
  const events = TEAM.filter((e) => inRange(e, range))

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Hi, {personaLabel(persona)}</h1>
          <ToggleGroup variant="segmented" size="sm" className="ml-auto" value={[range]} onValueChange={(v) => v[0] && setRange(v[0])}>
            {RANGES.map((r) => (
              <ToggleGroupItem key={r} value={r}>
                {r}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How you're buying</CardTitle>
            <CardDescription>vs competitors: your posted basis minus the best competitor's. vs market: what you bought at minus the market basis.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment</TableHead>
                  <TableHead className="text-right">Your posted</TableHead>
                  <TableHead className="text-right">Best competitor</TableHead>
                  <TableHead className="text-right">vs competitors</TableHead>
                  <TableHead className="text-right">Bought at</TableHead>
                  <TableHead className="text-right">Market</TableHead>
                  <TableHead className="text-right">vs market</TableHead>
                  <TableHead className="text-right">Bought (bu)</TableHead>
                </TableRow>
              </TableHeader>
              {LOCATIONS.map((loc) => (
                <TableBody key={loc.id}>
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={8} className="font-semibold">
                      {loc.name}
                    </TableCell>
                  </TableRow>
                  {SCENARIOS.filter((s) => s.locationId === loc.id)
                    .sort(byShipStart)
                    .map((s) => {
                      const snap = snapshot(s)
                      const accepted = events.filter((e) => e.action === "accepted" && e.scenario.id === s.id)
                      const bushels = accepted.reduce((t, e) => t + e.bushels, 0)
                      const boughtAt = bushels ? accepted.reduce((t, e) => t + e.bid * e.bushels, 0) / bushels : null
                      const vsComp = Math.round((snap.posted - snap.best) * 100) / 100
                      const vsMarket = boughtAt === null ? null : Math.round((boughtAt - snap.market) * 100) / 100
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="pl-6">
                            <Link to={`/scenarios/${s.id}`} className="hover:underline">
                              {shipWindow(s)}
                            </Link>{" "}
                            <span className="text-muted-foreground">
                              {COMMODITY_LABEL[s.commodity]} {s.contract}
                            </span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{basis(snap.posted)}</TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">{basis(snap.best)}</TableCell>
                          <TableCell className="text-right">
                            <Gap value={vsComp} good={vsComp >= 0} />
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{boughtAt === null ? "—" : basis(boughtAt)}</TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">{basis(snap.market)}</TableCell>
                          <TableCell className="text-right">
                            <Gap value={vsMarket} good={vsMarket !== null && vsMarket <= 0} />
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{bu(bushels)}</TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              ))}
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team activity</CardTitle>
            <CardDescription>Your originators working your scenarios, newest first</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Nothing in this range.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Originator</TableHead>
                    <TableHead>Producer</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Scenario</TableHead>
                    <TableHead className="text-right">Bid</TableHead>
                    <TableHead className="text-right">Bushels</TableHead>
                    <TableHead className="text-right">When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>{e.originator}</TableCell>
                      <TableCell>{e.producer}</TableCell>
                      <TableCell>
                        <Badge variant={BADGE[e.action]}>{ACTION_LABEL[e.action]}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{scenarioLabel(e.scenario)}</TableCell>
                      <TableCell className="text-right tabular-nums">{basis(e.bid)}</TableCell>
                      <TableCell className="text-right tabular-nums">{bu(e.bushels)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{whenLabel(e.at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
