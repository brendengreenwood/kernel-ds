import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Home, Sprout } from "@/components/ui/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CommodityBadge } from "@/components/ui/commodity-badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/ui/status-badge"
import { MapCanvas } from "@app/components/map-canvas"
import { locations, scenarios, type Scenario } from "@app/data/scenarios"
import { basis } from "@app/lib/format"
import { statusMap } from "@app/lib/status"
import { cn } from "@/lib/utils"

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi)
const round2 = (n: number) => Math.round(n * 100) / 100

/* ── The navigator ─────────────────────────────────────────────────────────
   Chrome, and recessed to say so: it sits on the canvas at the same level as
   the activity rail, with no plate of its own. It decides WHAT the plate
   shows, so it belongs under the plate — the same reason the rail does. */
function Navigator({
  selectedLocation,
  onLocation,
  selectedId,
  onScenario,
}: {
  selectedLocation: string
  onLocation: (name: string) => void
  selectedId: string
  onScenario: (id: string) => void
}) {
  const here = scenarios.filter((s) => s.location === selectedLocation)
  return (
    <div className="hidden w-64 shrink-0 flex-col gap-3 py-4 pr-0 pl-2 md:flex">
      <div className="px-2">
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Houses
        </div>
      </div>

      <div className="flex flex-col gap-0.5 px-1">
        {locations.map((name) => {
          const count = scenarios.filter((s) => s.location === name).length
          const active = name === selectedLocation
          return (
            <button
              key={name}
              type="button"
              onClick={() => onLocation(name)}
              data-active={active || undefined}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors",
                "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                active && "bg-sidebar-accent text-sidebar-foreground"
              )}
            >
              <Home className={cn("size-4", active ? "text-sidebar-primary" : "text-muted-foreground")} />
              <span className="min-w-0 flex-1 truncate font-medium">{name}</span>
              <span className="text-muted-foreground text-[11px] tabular-nums">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-2 px-2">
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Scenarios
        </div>
      </div>

      {/* The list scrolls, the houses above it do not: the houses are a fixed
          set of four and scrolling them would hide the switch you came here to
          use. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-1">
        <div className="flex flex-col gap-0.5">
          {here.map((s) => {
            const active = s.id === selectedId
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onScenario(s.id)}
                className={cn(
                  "flex flex-col gap-0.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                  "hover:bg-sidebar-accent/60",
                  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                  active && "bg-sidebar-accent"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-[13px] font-medium tabular-nums",
                      active ? "text-sidebar-foreground" : "text-sidebar-foreground/80"
                    )}
                  >
                    {s.id}
                  </span>
                  <StatusBadge status={statusMap[s.status].hue} className="ml-auto">
                    {statusMap[s.status].label}
                  </StatusBadge>
                </div>
                <div className="text-muted-foreground truncate text-[11px]">
                  {s.commodity} · {s.shipment}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── The dock ──────────────────────────────────────────────────────────────
   The inspector acts ON the thing the canvas is showing, so it takes the
   highest rung and casts onto the plate. That shadow is the whole point: it is
   what proves the ordering to the eye rather than to the layer list.

   Navigator before the work, dock after it. The asymmetry is the model. */
function Dock({ scenario }: { scenario: Scenario }) {
  const [bid, setBid] = React.useState(scenario.postedBid.toFixed(2))

  // A new scenario is a new subject: the field cannot keep the last one's
  // number, or you would post Birchwood's bid to Winnebago.
  React.useEffect(() => {
    setBid(scenario.postedBid.toFixed(2))
  }, [scenario.id, scenario.postedBid])

  const value = Number(bid)
  const valid = Number.isFinite(value)
  const overMax = valid && value > scenario.adjustedMaxBid
  const moved = valid && round2(value) !== round2(scenario.postedBid)

  /* ↑/↓ steps a cent, Shift a dime — the same contract the accept-bid dialog
     already taught, so the two bid fields in this app behave alike. */
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const dir = e.key === "ArrowUp" ? 1 : e.key === "ArrowDown" ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const from = valid ? value : scenario.postedBid
    const step = e.shiftKey ? 0.1 : 0.01
    setBid(clamp(round2(from + dir * step), scenario.postedBid - 0.5, scenario.maxBid).toFixed(2))
  }

  return (
    <aside
      data-v2-dock
      aria-label={`Inspector for ${scenario.id}`}
      className="absolute top-4 right-4 bottom-4 z-10 flex w-80 flex-col overflow-hidden rounded-[var(--panel-radius)]"
      style={{
        // One rung above the plate, and lit like it: the plate wears `--card`,
        // so the dock wears the plate mix — same hue, more light. Its edge is
        // the peak hairline rather than the page hairline, because a surface
        // that casts is a surface that catches.
        background: "var(--elev-plate)",
        boxShadow:
          "inset 0 0 0 1px var(--v2-edge-peak), inset 0 1px 0 var(--elev-lip), var(--shadow-2xl)",
      }}
    >
      <div className="flex flex-col gap-2 border-b border-[var(--v2-edge-rest)] p-5">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tabular-nums">{scenario.id}</span>
          <StatusBadge status={statusMap[scenario.status].hue} className="ml-auto">
            {statusMap[scenario.status].label}
          </StatusBadge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CommodityBadge commodity={scenario.commodity} />
          <Badge variant="secondary">{scenario.futuresMonth}</Badge>
        </div>
        <div className="text-muted-foreground text-xs">
          {scenario.location} · {scenario.shipment} · updated {scenario.updated}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="dock-bid">Posted bid</Label>
          <Input
            id="dock-bid"
            inputMode="decimal"
            value={bid}
            onChange={(e) => setBid(e.target.value)}
            onKeyDown={onKeyDown}
            aria-invalid={overMax || undefined}
            aria-describedby="dock-bid-help"
            className="text-base tabular-nums"
          />
          <p id="dock-bid-help" className="text-muted-foreground text-xs">
            {overMax ? (
              <span className="text-destructive">Over the adjusted max of {basis(scenario.adjustedMaxBid)}</span>
            ) : (
              <>↑↓ steps a cent, hold Shift for ten.</>
            )}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Fact label="Max bid" value={basis(scenario.maxBid)} />
          <Fact label="Adjusted max" value={basis(scenario.adjustedMaxBid)} />
          <Fact label="Posted" value={basis(scenario.postedBid)} />
          <Fact
            label="Change"
            value={moved ? basis(round2(value - scenario.postedBid)) : "—"}
            muted={!moved}
          />
        </dl>

        <div className="flex flex-col gap-2">
          <div className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            Recent producer activity
          </div>
          {scenario.activity.since.events.slice(0, 4).map((e) => (
            <div key={e.id} className="flex items-center gap-2 text-xs">
              <Sprout className="text-muted-foreground size-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{e.producer}</span>
              <span className={cn("tabular-nums", e.action === "accepted" ? "text-primary" : "text-muted-foreground")}>
                {e.action === "accepted" ? "took" : "passed"} {basis(e.bid)}
              </span>
            </div>
          ))}
          {scenario.activity.since.events.length === 0 ? (
            <div className="text-muted-foreground text-xs">Nothing since the last update.</div>
          ) : null}
        </div>
      </div>

      <div className="flex gap-2 border-t border-[var(--v2-edge-rest)] p-5">
        <Button className="flex-1" disabled={!moved || overMax}>
          Post bid
        </Button>
        <Button variant="outline" onClick={() => setBid(scenario.postedBid.toFixed(2))} disabled={!moved}>
          Reset
        </Button>
      </div>
    </aside>
  )
}

function Fact({ label, value, muted }: { label: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-[11px]">{label}</dt>
      <dd className={cn("text-sm tabular-nums", muted ? "text-muted-foreground" : "font-medium")}>{value}</dd>
    </div>
  )
}

/** The workspace page. Lives inside the workspace shell, which supplies the
    rail, the navigator and the plate — this is what fills the plate. */
export default function WorkspacePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const scenario = scenarios.find((s) => s.id === id) ?? scenarios[0]
  const [location, setLocation] = React.useState(scenario.location)

  const selectLocation = (name: string) => {
    setLocation(name)
    const first = scenarios.find((s) => s.location === name)
    if (first) navigate(`/scenarios/${first.id}/edit`, { replace: true })
  }

  const sites = locations.map((name) => ({
    name,
    count: scenarios.filter((s) => s.location === name).length,
  }))

  return (
    <div className="flex min-h-0 flex-1">
      <Navigator
        selectedLocation={location}
        onLocation={selectLocation}
        selectedId={scenario.id}
        onScenario={(sid) => navigate(`/scenarios/${sid}/edit`)}
      />

      {/* The plate. The map fills it; the dock floats above it. */}
      <div
        data-v2-canvas
        className="bg-card relative m-4 min-w-0 flex-1 overflow-hidden rounded-[var(--panel-radius)]"
        style={{
          boxShadow: "inset 0 0 0 1px var(--elev-edge-page), inset 0 1px 0 var(--elev-lip), var(--shadow-2xl)",
        }}
      >
        {/* The dock is 20rem wide and sits in a 1rem gutter: 21rem of plate the
            camera must not aim at. */}
        <MapCanvas sites={sites} selected={location} onSelect={selectLocation} occludedRight={336} />

        {/* Back to the list. Floats on the plate rather than living in a header
            bar: the plate has no chrome, and one control does not earn one. */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-4 left-4 z-10 shadow-md"
          render={
            <Link to="/scenarios">
              <ArrowLeft />
              Scenarios
            </Link>
          }
        />

        <Dock scenario={scenario} />
      </div>
    </div>
  )
}
