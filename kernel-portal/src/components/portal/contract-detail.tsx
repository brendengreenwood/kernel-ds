import * as React from "react"
import {
  FileText,
  FileSignature,
  MoreVertical,
} from "lucide-react"

import { Section, Subhead } from "@/components/portal/section"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StatusBadge, type Status } from "@/components/ui/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const terms: [string, React.ReactNode, boolean][] = [
  ["Commodity", "Corn · #2 Yellow", false],
  ["Quantity", "40,000 bu", true],
  ["Futures", "ZCZ6 (Dec ’26) · $4.38", true],
  ["Basis", "−0.22", true],
  ["Cash price", "$4.16 / bu", true],
  ["Delivery window", "Oct 1 – Nov 15, 2026", false],
  ["Location", "Elevator #2 · Fairmont", false],
  ["Payment terms", "Net 10 after settlement", false],
]

const fills: {
  id: string
  date: string
  bu: string
  status: Status
}[] = [
  { id: "#4471", date: "Jun 7, 2026", bu: "8,420", status: "in_transit" },
  { id: "#4433", date: "Jun 2, 2026", bu: "8,760", status: "delivered" },
  { id: "#4402", date: "May 28, 2026", bu: "9,120", status: "settled" },
]

const activity: { date: string; title: string; detail?: string }[] = [
  { date: "Jun 7, 2026", title: "Load #4471 applied", detail: "8,420 bu · scale ticket 88-2041" },
  { date: "May 12, 2026", title: "Amendment #1", detail: "Quantity increased 30,000 → 40,000 bu" },
  { date: "Apr 18, 2026", title: "Priced", detail: "Basis locked at −0.22 vs ZCZ6" },
  { date: "Apr 14, 2026", title: "Contract created", detail: "Booked by M. Reyes" },
]

function ContractHeader() {
  return (
    <div className="flex items-start gap-3.5 border-b px-6 py-5">
      <div className="grid size-11 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground">
        <FileText className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h4 className="text-lg font-semibold tracking-tight">Contract #C-2214</h4>
          <StatusBadge status="booked" />
        </div>
        <div className="text-sm text-muted-foreground">
          Hartmann Farms · Corn · Dec ’26 cash
        </div>
      </div>
      <div className="ml-auto flex gap-2">
        <Button size="sm" variant="outline"><FileSignature /> Amend</Button>
        <Button size="sm" variant="outline" className="size-8 p-0" aria-label="More">
          <MoreVertical />
        </Button>
      </div>
    </div>
  )
}

function DeliveryProgress() {
  return (
    <div className="border-b px-6 py-5">
      <div className="flex items-baseline justify-between gap-4">
        <div className="text-xs font-medium text-muted-foreground">Delivery progress</div>
        <div className="font-mono text-xs text-muted-foreground">
          26,300 of 40,000 bu · 66%
        </div>
      </div>
      <Progress value={66} className="mt-2.5" />
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {(
          [
            ["Contracted", "40,000 bu"],
            ["Delivered", "26,300 bu"],
            ["Remaining", "13,700 bu"],
            ["Avg moisture", "15.4%"],
          ] as const
        ).map(([k, v]) => (
          <div key={k}>
            <div className="text-xs font-medium text-muted-foreground">{k}</div>
            <div className="mt-0.5 font-mono text-sm">{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FillsTable() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="border-b px-5 py-3.5 text-sm font-semibold">Fills</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Load</TableHead>
            <TableHead>Delivered</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Applied bu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fills.map((f) => (
            <TableRow key={f.id}>
              <TableCell className="font-mono">{f.id}</TableCell>
              <TableCell>{f.date}</TableCell>
              <TableCell><StatusBadge status={f.status} /></TableCell>
              <TableCell className="text-right font-mono">{f.bu}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total applied</TableCell>
            <TableCell className="text-right font-mono">26,300</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

function ActivityTimeline() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-5 py-3.5 text-sm font-semibold">Activity</div>
      <ol className="px-5 py-4">
        {activity.map((a, i) => (
          <li key={a.title} className="relative flex gap-3.5 pb-5 last:pb-1">
            {i < activity.length - 1 ? (
              <span
                aria-hidden
                className="absolute top-3.5 left-[5px] h-full w-px bg-border"
              />
            ) : null}
            <span className="mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-primary bg-card" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2.5">
                <span className="text-sm font-medium">{a.title}</span>
                <span className="font-mono text-xs text-muted-foreground">{a.date}</span>
              </div>
              {a.detail ? (
                <div className="mt-0.5 text-sm text-muted-foreground">{a.detail}</div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function ContractDetailSection() {
  return (
    <Section
      id="contract"
      eyebrow="Domain patterns"
      title="Contract detail"
      lead="The anchor record of the merchant domain — a cash grain contract. Identity and lifecycle state in the header, the commercial terms as a scannable grid, delivery progress against the committed quantity, the loads applied as fills, and an activity trail for amendments and pricing events."
    >
      <Subhead>Header · terms · delivery progress</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        The status badge carries lifecycle (booked → settled); price facts are
        monospace so basis and cash line up in scans. Progress reads
        against the contracted quantity, with remaining bushels called out.
      </p>
      <div className="overflow-hidden rounded-lg border bg-card">
        <ContractHeader />
        <DeliveryProgress />
        <dl className="grid grid-cols-2 gap-x-6 px-6 pb-5 pt-2 sm:grid-cols-4">
          {terms.map(([k, v, mono]) => (
            <div key={k} className="border-b py-3.5">
              <dt className="text-xs font-medium text-muted-foreground">{k}</dt>
              <dd className={`mt-1 text-sm ${mono ? "font-mono" : ""}`}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Subhead>Fills · activity</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Fills are the loads applied against the contract — each row keeps its
        own lifecycle badge, and the footer reconciles to the delivered total.
        The activity trail records pricing events and amendments, newest first.
      </p>
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <FillsTable />
        <ActivityTimeline />
      </div>
    </Section>
  )
}
