import { Handshake, Reply, MoreVertical } from "@/components/ui/icon"

import { Section, Subhead } from "@/components/portal/section"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge, type Status } from "@/components/ui/status-badge"
import { CommodityLabel, commodityFromLabel } from "@/components/ui/commodity-badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/* -- offer queue ---------------------------------------------------------- */

const offers: {
  producer: string
  grain: string
  qty: string
  offer: string
  delta: string
  expires: string
  status: Status
  countered?: string
  bookable?: boolean
}[] = [
  { producer: "Hartmann Farms", grain: "Corn", qty: "10,000", offer: "$4.25", delta: "+$0.09", expires: "2h 10m", status: "pending" },
  { producer: "Valley Co-op", grain: "Soybean", qty: "8,000", offer: "$10.40", delta: "+$0.15", expires: "1d 4h", status: "pending", countered: "$10.30" },
  { producer: "Miller Bros", grain: "Wheat", qty: "12,000", offer: "$5.55", delta: "−$0.03", expires: "5h 40m", status: "pending", bookable: true },
  { producer: "Anders Farm", grain: "Corn", qty: "5,000", offer: "$4.30", delta: "+$0.14", expires: "—", status: "expired" },
]

function OfferQueue() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b px-5 py-3.5">
        <span className="text-sm font-semibold">Open offers</span>
        <span className="font-mono text-xs text-muted-foreground">corn bid $4.16 · beans $10.25 · wheat $5.58</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producer</TableHead>
            <TableHead>Grain</TableHead>
            <TableHead className="text-right">Qty (bu)</TableHead>
            <TableHead className="text-right">Offer</TableHead>
            <TableHead className="text-right">vs bid</TableHead>
            <TableHead className="text-right">Expires</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.map((o) => {
            const dead = o.status === "expired"
            return (
              <TableRow key={o.producer} className={dead ? "opacity-55" : undefined}>
                <TableCell className="font-medium">{o.producer}</TableCell>
                <TableCell><CommodityLabel commodity={commodityFromLabel(o.grain)}>{o.grain}</CommodityLabel></TableCell>
                <TableCell className="text-right font-mono">{o.qty}</TableCell>
                <TableCell className="text-right font-mono">{o.offer}</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">{o.delta}</TableCell>
                <TableCell className="text-right font-mono">{o.expires}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5">
                    <StatusBadge status={o.status} />
                    {o.countered && (
                      <Badge variant="outline" className="font-mono text-[11px]">
                        countered {o.countered}
                      </Badge>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {dead ? (
                    <Button size="sm" variant="ghost">Renew</Button>
                  ) : (
                    <span className="inline-flex gap-1.5">
                      <Button size="sm" variant={o.bookable ? "ghost" : "outline"}>Counter</Button>
                      <Button size="sm" variant={o.bookable ? "default" : "ghost"}>Book</Button>
                    </span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

/* -- counter composer ------------------------------------------------------ */

function CounterComposer() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="border-b px-5 py-3.5">
        <div className="text-sm font-semibold">Counter offer — Hartmann Farms</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          Corn · 10,000 bu · Oct–Nov delivery · Elevator #2, Fairmont
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-b bg-muted/30 px-5 py-3.5 sm:grid-cols-4">
        {(
          [
            ["Their offer", "$4.25"],
            ["Current bid", "$4.16"],
            ["Board (ZCZ6)", "$4.38"],
            ["Bid basis", "−0.22"],
          ] as const
        ).map(([k, v]) => (
          <div key={k}>
            <div className="text-xs font-medium text-muted-foreground">{k}</div>
            <div className="mt-0.5 font-mono text-sm">{v}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="orig-counter-price">Counter price</Label>
          <span className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">$</span>
            <Input id="orig-counter-price" defaultValue="4.20" className="pr-12 pl-7 font-mono" />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">/bu</span>
          </span>
        </div>
        <div className="grid gap-2">
          <Label>Counter expires</Label>
          <Select defaultValue="eod" items={{ "2h": "In 2 hours", eod: "End of day", "24h": "In 24 hours" }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2h">In 2 hours</SelectItem>
              <SelectItem value="eod">End of day</SelectItem>
              <SelectItem value="24h">In 24 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Note <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Input placeholder="Best I can do into Fairmont…" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2.5 border-t bg-muted/40 px-5 py-3">
        <span className="font-mono text-xs text-muted-foreground">$4.20 = −0.18 basis vs ZCZ6</span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="ghost">Cancel</Button>
          <Button size="sm" variant="outline">Book at $4.25</Button>
          <Button size="sm"><Reply /> Send counter</Button>
        </div>
      </div>
    </div>
  )
}

/* -- negotiation thread ----------------------------------------------------- */

const thread: { date: string; title: string; detail?: string }[] = [
  { date: "Jun 30, 2026", title: "Booked at $4.22", detail: "Creates contract #C-2231 · booked by M. Reyes" },
  { date: "Jun 30, 2026", title: "Producer countered", detail: "$4.22 · “meet in the middle”" },
  { date: "Jun 29, 2026", title: "Counter sent", detail: "$4.20 · expires end of day" },
  { date: "Jun 29, 2026", title: "Offer received", detail: "$4.25 target · via producer portal" },
]

function NegotiationThread() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-start gap-3.5 border-b px-5 py-4">
        <div className="grid size-10 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground">
          <Handshake className="size-[18px]" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h4 className="text-[15px] font-semibold tracking-tight">Offer #OF-3121</h4>
            <StatusBadge status="booked" />
          </div>
          <div className="text-xs text-muted-foreground">
            Hartmann Farms · Corn · 10,000 bu · Oct–Nov delivery
          </div>
        </div>
        <Button size="sm" variant="outline" className="ml-auto size-8 shrink-0 p-0" aria-label="More">
          <MoreVertical />
        </Button>
      </div>
      <ol className="px-5 py-4">
        {thread.map((a, i) => (
          <li key={a.title} className="relative flex gap-3.5 pb-5 last:pb-1">
            {i < thread.length - 1 ? (
              <span aria-hidden className="absolute top-3.5 left-[5px] h-full w-px bg-border" />
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

export function OriginationSection() {
  return (
    <Section
      id="origination"
      eyebrow="Patterns"
      title="Origination flow"
      lead="The origination loop: a producer offers grain at a target price, the merchant counters or books, and a booked offer becomes a contract. Three surfaces — a work queue that ranks the decisions, a counter composer that keeps the market math in view, and a negotiation thread that becomes the audit trail."
    >
      <Subhead>Offer queue</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        The queue leads with the decision: offer vs. current bid, in mono, side
        by side. An offer at or under the bid emphasizes <b>Book</b>; above it,
        <b> Counter</b>. An offer stays <i>pending</i> while a counter is out —
        the counter itself is an event (outline badge), not a lifecycle state.
        Expired rows mute and offer a renew.
      </p>
      <OfferQueue />

      <Subhead>Counter composer</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Countering is a pricing decision, so the market facts sit directly
        above the form: their number, your bid, the board. The footer restates
        the counter as basis so the trader sees both languages, and every
        counter carries an expiry — no open-ended quotes.
      </p>
      <CounterComposer />

      <Subhead>Negotiation thread</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Every touch on the offer lands in one thread, newest first. Booking is
        the terminal event and the handoff: it names the contract it created —
        from there, the record lives in Contract detail.
      </p>
      <NegotiationThread />
    </Section>
  )
}
