import * as React from "react"
import { Download, MoreVertical, Receipt } from "lucide-react"

import { Section, Subhead } from "@/components/portal/section"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/ui/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const meta: [string, React.ReactNode, boolean][] = [
  ["Contract", "#C-2148", true],
  ["Commodity", "Corn · #2 Yellow", false],
  ["Cash price", "$4.16 / bu", true],
  ["Settlement date", "Jun 24, 2026", false],
  ["Farm", "Hartmann Farms", false],
  ["Location", "Elevator #2 · Fairmont", false],
  ["Loads settled", "4", true],
  ["Payment terms", "Net 10 · ACH", false],
]

const loads: {
  id: string
  date: string
  gross: string
  tare: string
  net: string
  moisture: string
  shrink: string
  bu: string
  price: string
  amount: string
}[] = [
  { id: "#4356", date: "May 14, 2026", gross: "476,540", tare: "27,140", net: "449,400", moisture: "14.5%", shrink: "45", bu: "7,980", price: "4.16", amount: "33,196.80" },
  { id: "#4361", date: "May 19, 2026", gross: "503,220", tare: "27,220", net: "476,000", moisture: "14.8%", shrink: "62", bu: "8,438", price: "4.16", amount: "35,102.08" },
  { id: "#4370", date: "May 24, 2026", gross: "521,940", tare: "27,180", net: "494,760", moisture: "15.1%", shrink: "85", bu: "8,750", price: "4.16", amount: "36,400.00" },
  { id: "#4381", date: "May 28, 2026", gross: "543,660", tare: "27,340", net: "516,320", moisture: "15.6%", shrink: "100", bu: "9,120", price: "4.16", amount: "37,939.20" },
]

const adjustments: { label: string; detail: string; amount: string; muted?: boolean }[] = [
  { label: "Moisture shrink", detail: "Reflected in net bushels", amount: "−292 bu", muted: true },
  { label: "Drying charge", detail: "2 loads over 15.0%", amount: "−$412.30" },
  { label: "State checkoff", detail: "1¢ / bu on 34,288 bu", amount: "−$342.88" },
  { label: "Advance repayment", detail: "Issued May 2, 2026", amount: "−$25,000.00" },
  { label: "Lien payoff", detail: "First Ag Credit", amount: "−$18,500.00" },
]

function StatementHeader() {
  return (
    <div className="flex items-start gap-3.5 border-b px-6 py-5">
      <div className="grid size-11 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground">
        <Receipt className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h4 className="text-lg font-semibold tracking-tight">Settlement #SET-0143</h4>
          <StatusBadge status="settled" />
        </div>
        <div className="text-sm text-muted-foreground">
          Hartmann Farms · Contract #C-2148 · Corn
        </div>
      </div>
      <div className="ml-auto flex gap-2">
        <Button size="sm" variant="outline"><Download /> Download</Button>
        <Button size="sm" variant="outline" className="size-8 p-0" aria-label="More">
          <MoreVertical />
        </Button>
      </div>
    </div>
  )
}

function LoadLineItems() {
  return (
    <Table className="whitespace-nowrap tabular-nums">
      <TableHeader>
        <TableRow>
          <TableHead>Load</TableHead>
          <TableHead>Delivered</TableHead>
          <TableHead className="text-right">Gross lb</TableHead>
          <TableHead className="text-right">Tare lb</TableHead>
          <TableHead className="text-right">Net lb</TableHead>
          <TableHead className="text-right">Moist</TableHead>
          <TableHead className="text-right">Shrink bu</TableHead>
          <TableHead className="text-right">Net bu</TableHead>
          <TableHead className="text-right">$ / bu</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loads.map((l) => (
          <TableRow key={l.id}>
            <TableCell className="font-mono">{l.id}</TableCell>
            <TableCell>{l.date}</TableCell>
            <TableCell className="text-right font-mono">{l.gross}</TableCell>
            <TableCell className="text-right font-mono">{l.tare}</TableCell>
            <TableCell className="text-right font-mono">{l.net}</TableCell>
            <TableCell className="text-right font-mono">{l.moisture}</TableCell>
            <TableCell className="text-right font-mono text-muted-foreground">−{l.shrink}</TableCell>
            <TableCell className="text-right font-mono">{l.bu}</TableCell>
            <TableCell className="text-right font-mono">{l.price}</TableCell>
            <TableCell className="text-right font-mono">{l.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={7}>Totals · 4 loads</TableCell>
          <TableCell className="text-right font-mono">34,288</TableCell>
          <TableCell />
          <TableCell className="text-right font-mono">$142,638.08</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

function AdjustmentsPanel() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-5 py-3.5 text-sm font-semibold">Adjustments</div>
      <ul className="px-5 py-1.5">
        {adjustments.map((a) => (
          <li
            key={a.label}
            className="flex items-baseline justify-between gap-4 border-b py-3 last:border-b-0"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium">{a.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{a.detail}</div>
            </div>
            <div
              className={`shrink-0 font-mono text-sm tabular-nums ${a.muted ? "text-muted-foreground" : ""}`}
            >
              {a.amount}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SettlementSummary() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="border-b px-5 py-3.5 text-sm font-semibold">Settlement summary</div>
      <div className="px-5 pt-1.5">
        {(
          [
            ["Gross amount", "$142,638.08"],
            ["Total deductions", "−$44,255.18"],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4 py-3">
            <div className="text-sm text-muted-foreground">{k}</div>
            <div className="font-mono text-sm tabular-nums">{v}</div>
          </div>
        ))}
      </div>
      <Separator />
      <div className="flex items-baseline justify-between gap-4 px-5 py-4">
        <div className="text-sm font-semibold">Net payable</div>
        <div className="font-mono text-2xl font-semibold tracking-tight tabular-nums">
          $98,382.90
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-7 gap-y-3 border-t bg-muted/40 px-5 py-3.5">
        <Badge variant="success">Paid</Badge>
        {(
          [
            ["Method", "ACH · Farmers State Bank ····4417", false],
            ["Reference", "PMT-30291", true],
            ["Paid", "Jul 1, 2026", false],
          ] as const
        ).map(([k, v, mono]) => (
          <div key={k}>
            <div className="text-[11px] font-medium text-muted-foreground">{k}</div>
            <div className={`mt-0.5 text-[13px] ${mono ? "font-mono" : ""}`}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SettlementStatementSection() {
  return (
    <Section
      id="settlement"
      eyebrow="Domain"
      title="Settlement statement"
      lead="The final accounting for delivered loads against a contract. Scale weights and moisture become bushels and dollars, line by line; deductions are itemized rather than buried; and the statement closes on a single number — net payable — with the payment that cleared it."
    >
      <Subhead>Header · load line items</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        The header carries identity and the terminal lifecycle state (settled);
        the meta grid pins the statement to its contract, farm, and date. Every
        delivered load becomes a line item — weights, moisture, shrink, net
        bushels, price — in mono with tabular figures so the arithmetic scans,
        and the footer reconciles bushels and gross dollars.
      </p>
      <div className="overflow-hidden rounded-lg border bg-card">
        <StatementHeader />
        <dl className="grid grid-cols-2 gap-x-6 border-b px-6 pb-5 pt-2 sm:grid-cols-4">
          {meta.map(([k, v, mono]) => (
            <div key={k} className="border-b py-3.5">
              <dt className="text-xs font-medium text-muted-foreground">{k}</dt>
              <dd className={`mt-1 text-sm ${mono ? "font-mono" : ""}`}>{v}</dd>
            </div>
          ))}
        </dl>
        <LoadLineItems />
      </div>

      <Subhead>Adjustments · totals · payment</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Deductions get their own block — drying, checkoff, advances and liens —
        each with the reason on the row. Shrink is already inside net bushels,
        so it appears here as bushels, not dollars, to avoid double counting.
        The summary runs gross → deductions → a prominent net payable, and the
        payment strip records how and when it was paid.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <AdjustmentsPanel />
        <SettlementSummary />
      </div>
    </Section>
  )
}
