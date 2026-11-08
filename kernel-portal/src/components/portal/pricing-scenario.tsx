import { LineChart, MoreVertical } from "@kernel/ui/icon"

import { Section, Subhead } from "@/components/portal/section"
import { Button } from "@kernel/ui"
import { StatusBadge } from "@kernel/ui"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kernel/ui"

/**
 * One scenario per shipment window: location + commodity stay fixed,
 * each row is its own Pricing Scenario because Time of Shipment is identity.
 */
const windows: {
  window: string
  futures: string
  posted: string
  max: string
  bidDate: string
  stale?: boolean
  band: string
  status: "published" | "draft" | "expired"
}[] = [
  { window: "Oct 2026", futures: "CZ6", posted: "$4.08", max: "$4.18", bidDate: "Oct 30", band: "—", status: "expired" },
  { window: "Nov 2026", futures: "CZ6", posted: "$4.10", max: "$4.22", bidDate: "Nov 6", band: "Nearby · 2 bd", status: "published" },
  { window: "Dec 2026", futures: "CZ6", posted: "$4.12", max: "$4.25", bidDate: "Nov 3", stale: true, band: "Nearby · 2 bd", status: "published" },
  { window: "Jan 2027", futures: "CH7", posted: "$4.21", max: "$4.34", bidDate: "Oct 27", band: "Deferred · 10 bd", status: "published" },
  { window: "Mar 2027", futures: "CH7", posted: "$4.29", max: "$4.40", bidDate: "Oct 20", stale: true, band: "Deferred · 10 bd", status: "published" },
  { window: "Jul 2027", futures: "CN7", posted: "—", max: "—", bidDate: "—", band: "6+ mo · never", status: "draft" },
]

const versions: { v: string; date: string; change: string }[] = [
  { v: "v4", date: "Nov 6", change: "Posted Bid Date refreshed → Nov 6" },
  { v: "v3", date: "Nov 3", change: "Max Bid $4.20 → $4.25" },
  { v: "v2", date: "Oct 30", change: "Posted Bid Date refreshed → Oct 30" },
  { v: "v1", date: "Oct 22", change: "Created · published to Originators" },
]

function WindowStatus({ status }: { status: "published" | "draft" | "expired" }) {
  if (status === "published") return <StatusBadge status="settled">Published</StatusBadge>
  if (status === "expired") return <StatusBadge status="expired" />
  return <StatusBadge status="draft" />
}

function ScenarioHeader() {
  return (
    <div className="flex items-start gap-3.5 border-b px-6 py-5">
      <div className="grid size-11 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground">
        <LineChart className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h4 className="text-lg font-semibold tracking-tight">Albion · Corn · Dec 2026</h4>
          <StatusBadge status="settled">Published</StatusBadge>
        </div>
        <div className="text-sm text-muted-foreground">
          CZ6 (Dec 2026 futures) · Posted Bid Date Nov 6, 2026
        </div>
      </div>
      <div className="ml-auto flex gap-2">
        <Button size="sm" variant="outline">Refresh market data</Button>
        <Button size="sm" variant="outline" className="size-8 p-0" aria-label="More">
          <MoreVertical />
        </Button>
      </div>
    </div>
  )
}

function IdentityFields() {
  const identity: { k: string; v: string }[] = [
    { k: "Location", v: "Albion (Lynx 00245)" },
    { k: "Commodity", v: "Corn" },
    { k: "Contract Month", v: "CZ6 · Dec 2026" },
    { k: "Time of Shipment", v: "Dec 2026" },
  ]
  const market: { k: string; v: string }[] = [
    { k: "Posted Bid Date", v: "Nov 6, 2026" },
    { k: "Posted Bid", v: "$4.12" },
    { k: "Max Bid", v: "$4.25" },
    { k: "Distance Cost", v: "$0.085 / mi" },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2">
      <div className="border-b px-6 py-4 sm:border-b-0 sm:border-r">
        <div className="text-sm font-semibold">Identity — fixed when editing</div>
        <dl className="mt-2">
          {identity.map(({ k, v }) => (
            <div key={k} className="flex items-baseline justify-between gap-4 border-b py-2 text-sm last:border-b-0">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="px-6 py-4">
        <div className="text-sm font-semibold">Market data — refreshable</div>
        <dl className="mt-2">
          {market.map(({ k, v }) => (
            <div key={k} className="flex items-baseline justify-between gap-4 border-b py-2 text-sm last:border-b-0">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-mono">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

function WindowsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ship window</TableHead>
          <TableHead>Futures</TableHead>
          <TableHead className="text-right">Posted Bid</TableHead>
          <TableHead className="text-right">Max Bid</TableHead>
          <TableHead className="text-right">Posted Bid Date</TableHead>
          <TableHead>Band · stale limit</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {windows.map((w) => (
          <TableRow key={w.window}>
            <TableCell className="font-medium">{w.window}</TableCell>
            <TableCell className="font-mono">{w.futures}</TableCell>
            <TableCell className="text-right font-mono">{w.posted}</TableCell>
            <TableCell className="text-right font-mono">{w.max}</TableCell>
            <TableCell className="text-right font-mono">
              {w.bidDate}
              {w.stale ? (
                <span className="ml-1.5 font-sans text-xs font-medium text-warning-700 dark:text-warning-400">stale</span>
              ) : null}
            </TableCell>
            <TableCell className="text-muted-foreground">{w.band}</TableCell>
            <TableCell><WindowStatus status={w.status} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function StaleBands() {
  const bands: { band: string; start: string; limit: string }[] = [
    { band: "Nearby", start: "Current or next month", limit: "2 business days" },
    { band: "Deferred", start: "2–5 months out", limit: "10 business days" },
    { band: "Far", start: "6+ months out", limit: "Never stale" },
  ]
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-5 py-3.5 text-sm font-semibold">Stale thresholds by band</div>
      <div className="px-5 pt-1 pb-4">
        {bands.map(({ band, start, limit }) => (
          <div key={band} className="flex items-baseline justify-between gap-4 border-b py-3 text-sm last:border-b-0">
            <div className="font-medium">{band}</div>
            <div className="text-muted-foreground">{start}</div>
            <div className="font-mono">{limit}</div>
          </div>
        ))}
      </div>
      <div className="border-t px-5 py-3 text-xs text-muted-foreground">
        Business days follow the CBOT grain trading calendar — weekends and CME
        grain holidays skipped, early-close days count. The band is relative,
        so the same scenario tightens from 10 days to 2 as its window approaches.
      </div>
    </div>
  )
}

function VersionHistory() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-5 py-3.5 text-sm font-semibold">Version history — one scenario</div>
      <div className="px-5 pt-1 pb-4">
        {versions.map(({ v, date, change }) => (
          <div key={v} className="flex items-baseline gap-4 border-b py-3 text-sm last:border-b-0">
            <div className="font-mono text-muted-foreground">{v}</div>
            <div className="min-w-0 flex-1">{change}</div>
            <div className="shrink-0 text-muted-foreground">{date}</div>
          </div>
        ))}
      </div>
      <div className="border-t px-5 py-3 text-xs text-muted-foreground">
        Every save is a version of the same scenario; nothing in a version can
        change identity. Originators see the latest published version only —
        Merchants see the full history, drafts included.
      </div>
    </div>
  )
}

export function PricingScenarioSection() {
  return (
    <Section
      id="pricing-scenario"
      eyebrow="Domain patterns"
      title="Pricing scenario"
      lead="The Merchant's central business object — a pricing decision for one market, run through computation and review, and the record that links published strategy to Originator execution. Identity is location + commodity + contract month + time of shipment; the Posted Bid Date is market data, refreshed on the same scenario."
    >
      <Subhead>Scenario header · identity vs market data</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        The four identity fields stay fixed when editing — change one and it is
        a different scenario. Everything on the right is market data: the
        Posted Bid Date can be refreshed without creating a new scenario, and
        every save becomes a version of this one.
      </p>
      <div className="overflow-hidden rounded-lg border bg-card">
        <ScenarioHeader />
        <IdentityFields />
      </div>

      <Subhead>One scenario per shipment window</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        A Merchant&rsquo;s posted bids for one location and commodity are one
        row per shipment window, and each row is its own scenario. Ended
        windows expire rather than archive; staleness is measured only from
        the Posted Bid Date, against the limit the band sets. Published and
        draft reuse the stable-state status hues.
      </p>
      <div className="overflow-hidden rounded-lg border bg-card">
        <WindowsTable />
      </div>

      <Subhead>Stale bands · versions</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        The band is a relative-time label measured in whole calendar months
        from the current month to the window start. It sets only the stale
        limit — the measurement itself is always business days since the
        Posted Bid Date.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <StaleBands />
        <VersionHistory />
      </div>
    </Section>
  )
}
