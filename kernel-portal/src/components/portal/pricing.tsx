import type { ReactNode } from "react"
import { TrendingUp, Upload } from "@/components/ui/icon"

import { Section, Subhead } from "@/components/portal/section"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CommodityLabel } from "@/components/ui/commodity-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/* -- bid worksheet --------------------------------------------------------- */

/** One line in the price stack. `strong` emphasizes a computed result. */
function StackRow({
  label,
  value,
  strong,
  tone,
}: {
  label: ReactNode
  value: string
  strong?: boolean
  tone?: "muted" | "pos"
}) {
  return (
    <div
      className={
        "flex items-baseline justify-between gap-4 py-1.5 " +
        (strong ? "border-t" : "")
      }
    >
      <span
        className={
          "text-sm " + (strong ? "font-medium text-foreground" : "text-muted-foreground")
        }
      >
        {label}
      </span>
      <span
        className={
          "font-mono tabular-nums " +
          (strong ? "text-[15px] font-semibold" : "text-sm") +
          (tone === "muted" ? " text-muted-foreground" : "") +
          (tone === "pos" ? " text-[var(--success-700)] dark:text-[var(--success-500)]" : "")
        }
      >
        {value}
      </span>
    </div>
  )
}

function BidWorksheet() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b px-5 py-3.5">
        <span className="text-sm font-semibold">Bid worksheet</span>
        <CommodityLabel commodity="corn">Corn</CommodityLabel>
        <span className="font-mono text-xs text-muted-foreground">Dec ’26 · ZCZ6</span>
      </div>
      <div className="grid gap-x-8 gap-y-4 px-5 py-4 sm:grid-cols-2">
        {/* buy side — the number you post */}
        <div>
          <div className="mb-1 text-xs font-medium tracking-[0.04em] text-muted-foreground uppercase">
            Buy side
          </div>
          <StackRow label="Board futures (ZCZ6)" value="$4.38" tone="muted" />
          <div className="flex items-center justify-between gap-4 py-1.5">
            <Label htmlFor="bid-basis" className="text-sm font-normal text-muted-foreground">
              Bid basis
            </Label>
            <Input
              id="bid-basis"
              defaultValue="−0.22"
              className="h-8 w-24 text-right font-mono tabular-nums"
            />
          </div>
          <StackRow label="Cash bid — posted" value="$4.16" strong />
        </div>
        {/* sell side — where the margin comes from */}
        <div>
          <div className="mb-1 text-xs font-medium tracking-[0.04em] text-muted-foreground uppercase">
            Sell side
          </div>
          <div className="flex items-center justify-between gap-4 py-1.5">
            <Label htmlFor="sell-basis" className="text-sm font-normal text-muted-foreground">
              Sell basis (terminal)
            </Label>
            <Input
              id="sell-basis"
              defaultValue="−0.05"
              className="h-8 w-24 text-right font-mono tabular-nums"
            />
          </div>
          <StackRow label="Sell price" value="$4.33" tone="muted" />
          <StackRow label="Freight + handling" value="−0.11" tone="muted" />
          <StackRow label="Gross margin / bu" value="$0.06" strong tone="pos" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2.5 border-t bg-muted/40 px-5 py-3">
        <TrendingUp className="size-4 text-muted-foreground" />
        <span className="font-mono text-xs text-muted-foreground">
          $0.06/bu × 10,000 bu = $600 · target $0.05/bu ✓
        </span>
      </div>
    </div>
  )
}

/* -- margin ladder --------------------------------------------------------- */

const ladder: {
  basis: string
  cash: string
  margin: string
  book: string
  current?: boolean
}[] = [
  { basis: "−0.26", cash: "$4.12", margin: "$0.10", book: "+$1,000" },
  { basis: "−0.24", cash: "$4.14", margin: "$0.08", book: "+$800" },
  { basis: "−0.22", cash: "$4.16", margin: "$0.06", book: "+$600", current: true },
  { basis: "−0.20", cash: "$4.18", margin: "$0.04", book: "+$400" },
  { basis: "−0.18", cash: "$4.20", margin: "$0.02", book: "+$200" },
]

function MarginLadder() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b px-5 py-3.5">
        <span className="text-sm font-semibold">Margin ladder</span>
        <span className="font-mono text-xs text-muted-foreground">
          push basis to win bushels — margin is the cost
        </span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bid basis</TableHead>
              <TableHead className="text-right">Cash bid</TableHead>
              <TableHead className="text-right">Margin / bu</TableHead>
              <TableHead className="text-right">On 10,000 bu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ladder.map((r) => (
              <TableRow
                key={r.basis}
                className={r.current ? "bg-primary/8 font-medium" : undefined}
              >
                <TableCell className="font-mono tabular-nums">
                  {r.basis}
                  {r.current ? (
                    <Badge variant="outline" className="ml-2 text-[10px]">
                      current
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">{r.cash}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{r.margin}</TableCell>
                <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                  {r.book}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/* -- bid board ------------------------------------------------------------- */

const board: {
  location: string
  octNov: string
  dec: string
  janMar: string
  published: boolean
}[] = [
  { location: "Fairmont #2", octNov: "$4.16", dec: "$4.18", janMar: "$4.21", published: true },
  { location: "Blue Earth", octNov: "$4.14", dec: "$4.16", janMar: "$4.19", published: true },
  { location: "Trimont", octNov: "$4.12", dec: "$4.14", janMar: "$4.17", published: false },
  { location: "Welcome", octNov: "$4.15", dec: "$4.17", janMar: "$4.20", published: true },
]

function BidBoard() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b px-5 py-3.5">
        <span className="text-sm font-semibold">Bid board</span>
        <CommodityLabel commodity="corn">Corn</CommodityLabel>
        <span className="font-mono text-xs text-muted-foreground">cash bids by location · $/bu</span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Oct–Nov</TableHead>
              <TableHead className="text-right">Dec</TableHead>
              <TableHead className="text-right">Jan–Mar</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {board.map((r) => (
              <TableRow key={r.location}>
                <TableCell className="font-medium">{r.location}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{r.octNov}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{r.dec}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{r.janMar}</TableCell>
                <TableCell>
                  {r.published ? (
                    <Badge variant="success">Published</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Draft</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center gap-2.5 border-t bg-muted/40 px-5 py-3">
        <span className="font-mono text-xs text-muted-foreground">
          1 draft · last pushed 8m ago
        </span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="ghost">Preview sheet</Button>
          <Button size="sm"><Upload /> Push to portal</Button>
        </div>
      </div>
    </div>
  )
}

export function PricingSection() {
  return (
    <Section
      id="pricing"
      eyebrow="Patterns"
      title="Pricing worksheet"
      lead="The origination desk's core loop: set a cash bid from the board and basis, see what it does to margin, and push it to the country. Three surfaces — a worksheet that makes the buy/sell math legible, a ladder that prices the trade-off between winning bushels and holding margin, and the bid board that publishes the number."
    >
      <Subhead>Bid worksheet</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        The number you post is board plus basis; the margin is the sell basis
        minus the cost to move it. Both sides sit side by side in mono, so the
        cash bid and the gross margin it implies are one glance apart — basis is
        the only thing you type.
      </p>
      <BidWorksheet />

      <Subhead>Margin ladder</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Every cent of basis you give up to win bushels comes out of margin. The
        ladder shows the whole trade-off at once — cash bid, margin per bushel,
        and dollars on a typical load — with the posted basis marked, so the
        strategy call is visible, not buried in a spreadsheet.
      </p>
      <MarginLadder />

      <Subhead>Bid board</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Execution: the cash bids that go out to producers, by location and
        delivery window. Freight sets the spread between elevators; a bid stays a
        draft until it's pushed, and pushing is the one deliberate action that
        makes the price live.
      </p>
      <BidBoard />
    </Section>
  )
}
