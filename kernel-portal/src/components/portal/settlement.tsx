import { Banknote, Download, MoreVertical } from "@kernel/ui/icon"

import { Section, Subhead } from "@/components/portal/section"
import { Button } from "@kernel/ui"
import { StatusBadge } from "@kernel/ui"
import { AnimatedNumber } from "@kernel/ui"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@kernel/ui"

const loads: {
  id: string
  ticket: string
  date: string
  bu: string
  moisture: string
  price: string
  amount: string
}[] = [
  { id: "#4402", ticket: "88-1988", date: "May 28, 2026", bu: "9,120", moisture: "15.1%", price: "$4.16", amount: "$37,939.20" },
  { id: "#4433", ticket: "88-2016", date: "Jun 2, 2026", bu: "8,760", moisture: "15.6%", price: "$4.16", amount: "$36,441.60" },
  { id: "#4471", ticket: "88-2041", date: "Jun 7, 2026", bu: "8,420", moisture: "15.4%", price: "$4.16", amount: "$35,027.20" },
]

const deductions: { label: string; detail: string; amount: string }[] = [
  { label: "Drying charge", detail: "26,300 bu × $0.072 · avg 15.4% → 15.0%", amount: "−$1,893.60" },
  { label: "State check-off", detail: "0.5¢/bu × 26,300 bu", amount: "−$131.50" },
  { label: "Advance repayment", detail: "Note APR-2026 · balance retired", amount: "−$25,000.00" },
]

function StatementHeader() {
  return (
    <div className="flex items-start gap-3.5 border-b px-6 py-5">
      <div className="grid size-11 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground">
        <Banknote className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h4 className="text-lg font-semibold tracking-tight">Settlement #S-1042</h4>
          <StatusBadge status="settled" />
        </div>
        <div className="text-sm text-muted-foreground">
          Hartmann Farms · Corn · Contract #C-2214 · Issued Jun 12, 2026
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

function LoadsSettledTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Load</TableHead>
          <TableHead>Ticket</TableHead>
          <TableHead>Delivered</TableHead>
          <TableHead className="text-right">Net bu</TableHead>
          <TableHead className="text-right">Moisture</TableHead>
          <TableHead className="text-right">Price / bu</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loads.map((l) => (
          <TableRow key={l.id}>
            <TableCell className="font-mono">{l.id}</TableCell>
            <TableCell className="font-mono">{l.ticket}</TableCell>
            <TableCell>{l.date}</TableCell>
            <TableCell className="text-right font-mono">{l.bu}</TableCell>
            <TableCell className="text-right font-mono">{l.moisture}</TableCell>
            <TableCell className="text-right font-mono">{l.price}</TableCell>
            <TableCell className="text-right font-mono">{l.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Gross · 3 loads</TableCell>
          <TableCell className="text-right font-mono">26,300</TableCell>
          <TableCell colSpan={2} />
          <TableCell className="text-right font-mono">$109,408.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

function DeductionsTable() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="border-b px-5 py-3.5 text-sm font-semibold">Deductions</div>
      <Table>
        <TableBody>
          {deductions.map((d) => (
            <TableRow key={d.label}>
              <TableCell className="whitespace-normal">
                <div className="font-medium">{d.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{d.detail}</div>
              </TableCell>
              <TableCell className="text-right align-top font-mono">{d.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total deductions</TableCell>
            <TableCell className="text-right font-mono">−$27,025.10</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

function NetPayable() {
  // Only the climactic total animates (restraint) — the line items stay still.
  const rows: { k: string; v: string; total?: boolean; animate?: number }[] = [
    { k: "Gross proceeds", v: "$109,408.00" },
    { k: "Total deductions", v: "−$27,025.10" },
    { k: "Net payable", v: "$82,382.90", total: true, animate: 82382.9 },
  ]
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-5 py-3.5 text-sm font-semibold">Net payable</div>
      <div className="px-5 pt-1 pb-4">
        {rows.map(({ k, v, total, animate }) => (
          <div
            key={k}
            className={`flex items-baseline justify-between gap-4 border-b py-3 last:border-b-0 ${
              total ? "text-[15px] font-semibold" : "text-sm"
            }`}
          >
            <div className={total ? "" : "text-muted-foreground"}>{k}</div>
            <div className="font-mono">
              {animate != null ? (
                <AnimatedNumber value={animate} prefix="$" format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
              ) : (
                v
              )}
            </div>
          </div>
        ))}
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>Paid · ACH ····2201 · Jun 12, 2026</span>
          <span className="font-mono">ref 771-40218</span>
        </div>
      </div>
      <div className="border-t px-5 py-3 text-xs text-muted-foreground">
        Net 10 after settlement per contract #C-2214 · questions to the Fairmont office.
      </div>
    </div>
  )
}

export function SettlementSection() {
  return (
    <Section
      id="settlement"
      eyebrow="Domain patterns"
      title="Settlement statement"
      lead="The money document — what the merchant owes the farmer for delivered grain. The loads being settled with their scale-ticket facts, priced against the contract; the deductions that come out of the check; and the net payable the farmer actually receives."
    >
      <Subhead>Statement header · loads settled</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        A settlement is issued against a contract, so the header carries both
        identities and the lifecycle badge. Every money fact is monospace and
        right-aligned; the footer reconciles bushels and gross dollars to the
        contract&rsquo;s delivered total.
      </p>
      <div className="overflow-hidden rounded-lg border bg-card">
        <StatementHeader />
        <LoadsSettledTable />
      </div>

      <Subhead>Deductions · net payable</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Deductions each carry their own math so the farmer can re-derive the
        check: gross, minus deductions, equals net — stated once, in order,
        with the payment record attached.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <DeductionsTable />
        <NetPayable />
      </div>
    </Section>
  )
}
