import * as React from "react"
import { Archive, ChevronDown, Gauge, ListChecks, Pencil, Plus, Users } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { CommodityLabel, type Commodity } from "@/components/ui/commodity-badge"
import { StatusBadge, type Status } from "@/components/ui/status-badge"
import { TabCount, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { basis, bushelsShort } from "@app/lib/format"
import { useRevealOnOpen } from "@app/lib/reveal"
import { ActivityFlag, Empty, PageHeader, TableFrame, Tile, TwoLine, useVisibleWidth } from "@app/components/panels"
import { Sparkline } from "@app/components/sparkline"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  locations,
  scenarios,
  sinceCount,
  tally,
  trend,
  type ActivityRange,
  type Scenario,
  type ScenarioStatus,
} from "@app/data/scenarios"

/** Scenario lifecycle → DS StatusBadge hue + label (StatusBadge is the DS's
    persistent-state axis; children override the label for this domain). */
const statusMap: Record<ScenarioStatus, { hue: Status; label: string }> = {
  active: { hue: "settled", label: "Active" },
  draft: { hue: "draft", label: "Draft" },
  paused: { hue: "on_hold", label: "Paused" },
  expired: { hue: "expired", label: "Expired" },
}

const commodityFilters: { value: string; label: string; key?: Commodity }[] = [
  { value: "all", label: "All Commodities" },
  { value: "soybeans", label: "Soybeans", key: "soybeans" },
  { value: "corn", label: "Corn", key: "corn" },
  { value: "wheat", label: "Wheat", key: "wheat" },
]

/** A value that does not exist for this row, as opposed to one that is
    missing. Muted, and hidden from screen readers — "em dash" read aloud in
    every other cell is noise, and the empty cell already says nothing. */
const Dash = () => (
  <span aria-hidden className="text-muted-foreground">
    —
  </span>
)

/** The expanded scenario row: what producers did about this bid. The range tabs
    are per-row — each row is read on its own. (A competitor-movement panel lived
    here too; it is shelved, and its data still generates — see the note in
    data/scenarios.ts.) */
function ScenarioDetail({ scenario }: { scenario: Scenario }) {
  const [range, setRange] = React.useState<ActivityRange>("since")
  const activity = scenario.activity[range]
  // The roll-up is the scenario's whole life, not the recent tail: it is what
  // this bid has bought, and a number that changed when a tab moved would be a
  // second range control wearing a different face. The tabs filter the table.
  const summary = tally(scenario.activity.all)
  const lines = trend(scenario.activity.all)
  const ref = React.useRef<HTMLDivElement>(null)
  const width = useVisibleWidth(ref)

  return (
    <div
      ref={ref}
      className="sticky left-0 animate-in fade-in slide-in-from-top-2 p-5 duration-[var(--duration-base)] ease-[var(--ease-out)]"
      style={width ? { width } : undefined}
    >
      {/* What the row is opened to find out, before any of the detail: what
          this bid has bought, what it paid, and how the offers split. Volume
          leads — the counts say how many producers acted, the bushels say how
          much of the book moved.

          Four outlined tiles rather than a line of bare figures: figures with
          rules between them read as a status bar under the row, not as the
          row's subject.

          One row of four across the full width. The four are read together —
          bushels at that basis, split those ways — so a second line would break
          the sentence in half. Half a width fit them, but a charted tile needs
          about 150px before its dates stop colliding, and a dateless chart is
          the trace we already had.

          The tiles get a header of their own for the same reason the activity
          table has one: four numbers with no name over them are a status bar,
          and this is the scenario's own summary. It carries the edit control at
          the end of its title row — the action belongs to the scenario the
          header names, not to the row of figures under it.

          Two of the four carry the figure over time. A roll-up says where the
          scenario ended up; the line says whether it got there steadily or in
          one morning, which is the difference between a bid that is working and
          one that worked once. Bushels and basis moved through values to get
          here and have that story. The two counts do not: accepted has been 0,
          then 1, then 2, and a three-step staircase drawn at chart size reads
          as a spike — it renders an event as a trend and puts the most
          alarming shape on the page under the smallest number on it.

          The traces carry no axis of their own. Four tiles each redrawing the
          same 9h · 6h · 3h · now scale for the same eight events is the scale
          stated four times, and it cannot be stated once positionally instead:
          the plots sit in separate tiles with separate left and right edges, so
          a rule under the row would put its "now" at the row's edge and not at
          the end of any trace on it. The span is named once underneath in
          words, which is all a decorative trace needs — decorative in the
          accessibility sense, since every point it draws is in the table
          below. */}
      <div
        data-v2-panel
        className="mb-4 rounded-[var(--v2-panel-radius)] border border-border p-3"
      >
        <PageHeader
          size="panel"
          icon={Gauge}
          title="Scenario summary"
          description="Everything this bid has bought, over its whole life"
          action={
            /* The row's own edit control is an icon in a 38px cell at the end
               of a long table. Opened, there is room for the real thing. */
            <Button size="lg" aria-label={`Edit ${scenario.id}`}>
              <Pencil />
              Edit scenario
            </Button>
          }
        />
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Tile
            lg
            value={bushelsShort(summary.bushels)}
            label="Bushels bought"
            chart={<Sparkline data={lines.bushels} height={48} xKey="t" curve="stepAfter" />}
          />
          <Tile
            lg
            value={summary.avgBasis === null ? "—" : basis(summary.avgBasis)}
            label="Avg basis"
            chart={<Sparkline data={lines.avgBasis} height={48} xKey="t" />}
          />
          <Tile lg value={summary.accepted} label="Accepted" />
          <Tile lg value={summary.rejected} label="Rejected" />
        </div>
        {/* The scale, stated once. It reads as a caption to the row rather
            than as a rule under it, because it is true of both traces and of
            neither tile in particular. */}
        <div className="mt-2.5 px-5 text-xs text-muted-foreground">
          Trend lines cover {spanLabel(lines.bushels)}
        </div>
      </div>

      {/* The panel proper: its own header, a control, and the table it filters,
          with one padding value on every side and between them. Even padding is
          what lets the inner surface be concentric — an inset that differs by
          side has no single radius that can follow it. */}
      <Tabs value={range} onValueChange={(v) => setRange(v as ActivityRange)}>
        <div data-v2-panel className="flex flex-col gap-3 rounded-[var(--v2-panel-radius)] border border-border p-3">
          {/* Inside the panel now, and a size down from the summary's header.
              Two panels stacked in the well would otherwise carry two titles of
              equal weight, and the reader would have to work out which names
              which. */}
          <PageHeader
            size="section"
            icon={Users}
            title="Producer activity"
            description="Every accept and reject against this bid"
          />

          {/* The Overview's range control, exactly: same marker, same rules. A
              range filter is a range filter wherever it sits, and this one was
              the loudest thing in the panel — a filled primary chip announcing
              a default nobody chose. No divider under it: the inner surface's
              own edge already says where the table starts. */}
          <div className="max-w-full overflow-x-auto">
            <TabsList variant="pill" size="compact" data-v2-segmented>
              <TabsTrigger value="since">Since Last Update</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
          </div>

          {activity.events.length === 0 ? (
            <div data-v2-panel-inner className="px-4 py-2">
              <Empty>No producer activity in this window.</Empty>
            </div>
          ) : (
            /* The table gets its own surface inside the panel, cornered to the
               panel's own curve less the padding it sits in. */
            <div data-v2-panel-inner className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producer</TableHead>
                    <TableHead>Accepted</TableHead>
                    <TableHead>Rejected</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activity.events.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="max-w-44 truncate">{e.producer}</TableCell>
                      {/* Exactly one of these two carries the event, and which
                          one it is IS the action — a badge saying so was a third
                          statement of the same fact. Each side takes its own
                          bushels underneath: booked on the left, walked on the
                          right. The dash holds the empty side, because a blank
                          cell reads as data that failed to load. */}
                      <TableCell className="tabular-nums">
                        {e.action === "accepted" ? (
                          <TwoLine top={basis(e.bid)} sub={`${e.bushels.toLocaleString("en-US")} bu`} />
                        ) : (
                          <Dash />
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {e.action === "rejected" ? (
                          <TwoLine top={e.reason} sub={`${e.bushels.toLocaleString("en-US")} bu walked`} />
                        ) : (
                          <Dash />
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{e.when}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}

export default function ScenariosPage() {
  const [location, setLocation] = React.useState("all")
  const [commodity, setCommodity] = React.useState("all")

  // Everything except the location filter, so the tab counts predict what
  // clicking a tab actually yields under the current commodity filter.
  const byCommodity = scenarios.filter((s) => commodity === "all" || s.commodity === commodity)
  const rows = byCommodity.filter((s) => location === "all" || s.location === location)
  const countFor = (loc?: string) =>
    loc ? byCommodity.filter((s) => s.location === loc).length : byCommodity.length

  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())
  // Only an open is worth following: see lib/reveal.
  const [opened, setOpened] = React.useState<string | null>(null)
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      setOpened(next.has(id) ? id : null)
      return next
    })
  useRevealOnOpen(opened, "data-scenario-row")

  return (
    <div className="flex w-full flex-col">
      <div className="px-6 pt-6 md:px-8 md:pt-8">
        <PageHeader
          icon={ListChecks}
          title="Scenarios"
          action={
            <Button size="sm">
              <Plus /> New scenario
            </Button>
          }
        />
      </div>

      {/* location tabs — the strip's baseline runs the full plate (data-v2-bleed
          moves the page inset onto the list), so the page padding is not here.
          The strip is a different kind of thing from the title, so it does not
          sit at line spacing under it. */}
      <div className="mt-8">
        <Tabs value={location} onValueChange={(v) => setLocation(v as string)}>
          <div className="max-w-full overflow-x-auto">
            <TabsList variant="folder" size="comfortable" data-v2-bleed className="w-full">
              <TabsTrigger value="all">
                All locations <TabCount>{countFor()}</TabCount>
              </TabsTrigger>
              {locations.map((l) => (
                <TabsTrigger key={l} value={l}>
                  {l} <TabCount>{countFor(l)}</TabCount>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Everything under the folder line is that tab's PANEL, and it says so
          with a surface: the strip's baseline is the top edge of a container
          that runs to the plate's edges and to the bottom of the page. Without
          it the line was a rule with content after it; with it the line is the
          seam where the folder's contents begin. */}
      <div data-v2-tabpanel className="flex flex-1 flex-col">
      {/* commodity pills */}
      <div className="px-6 pt-4 md:px-8">
        <Tabs value={commodity} onValueChange={(v) => setCommodity(v as string)}>
          <div className="max-w-full overflow-x-auto">
            <TabsList variant="pill" size="compact">
              {commodityFilters.map((c) => (
                <TabsTrigger key={c.value} value={c.value}>
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* object table */}
      <div className="px-6 py-6 md:px-8">
        <TableFrame dense={false}>
          {/* Striped by data index rather than by nth-child: expanded detail rows
              are extra <tr>s, which would flip the parity. `data-v2-rowstripe`
              opts this table out of the app-wide stripe rule. */}
          <Table data-v2-rowstripe>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Futures month</TableHead>
                <TableHead>Time of shipment</TableHead>
                <TableHead>Commodity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Posted bid</TableHead>
                <TableHead>Max bid</TableHead>
                <TableHead>Adjusted Max Bid</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s, i) => (
                <React.Fragment key={s.id}>
                {/* The whole row toggles; the first cell is the control. */}
                <TableRow
                  data-scenario-row={s.id}
                  onClick={() => toggle(s.id)}
                  data-state={expanded.has(s.id) ? "selected" : undefined}
                  className={cn(
                    "cursor-pointer",
                    i % 2 === 1 && "bg-foreground/5",
                    expanded.has(s.id) && "border-b-transparent"
                  )}
                >
                  {/* The cell IS the control: a button filling it edge to edge, with no
                      chrome of its own. An outlined icon button in the first column was a
                      second thing to aim at inside a row that already toggles, and it drew
                      a box around a chevron that never needed one. Still a real button —
                      tabbable, labelled, and carrying aria-expanded — so the row's click
                      handler stays the shortcut and this stays the control. */}
                  <TableCell data-v2-rowtoggle className="p-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggle(s.id)
                      }}
                      aria-label={expanded.has(s.id) ? "Collapse" : "Expand"}
                      aria-expanded={expanded.has(s.id)}
                    >
                      <ChevronDown
                        className={cn(
                          "transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                          expanded.has(s.id) && "rotate-180"
                        )}
                      />
                    </button>
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{s.futuresMonth}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{s.shipment}</TableCell>
                  <TableCell>
                    <CommodityLabel commodity={s.commodity} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{s.location}</TableCell>
                  <TableCell className="tabular-nums">{basis(s.postedBid)}</TableCell>
                  <TableCell className="tabular-nums">{basis(s.maxBid)}</TableCell>
                  <TableCell className="font-medium tabular-nums">{basis(s.adjustedMaxBid)}</TableCell>
                  {/* The flag lives beside "Last Updated" because that is
                      exactly what it is measured against. */}
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{s.updated}</span>
                      {sinceCount(s) > 0 && <ActivityFlag n={sinceCount(s)} />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={statusMap[s.status].hue}>{statusMap[s.status].label}</StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="default" size="icon-sm" aria-label={`Edit ${s.id}`}>
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Archive ${s.id}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Archive />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expanded.has(s.id) && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={11} data-v2-detail className="bg-foreground/5">
                      <ScenarioDetail scenario={s} />
                    </TableCell>
                  </TableRow>
                )}
                </React.Fragment>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="py-10 text-center text-sm text-muted-foreground">
                    No scenarios for this location and commodity.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableFrame>
      </div>
      </div>
    </div>
  )
}/** The window a set of trend points covers, in words. The axis printed this
    as ticks; with the ticks gone the row still has to say how long "over its
    whole life" has been, and a scenario opened an afternoon after it was
    posted is a different read from one opened a fortnight later. */
function spanLabel(points: { t: number }[]) {
  const days = -Math.min(...points.map((p) => p.t))
  if (days < 1 / 24) return "the last hour"
  if (days < 1) return `the last ${Math.round(days * 24)} h`
  if (days < 14) return `the last ${Math.round(days)} d`
  return `the last ${Math.round(days / 7)} w`
}


