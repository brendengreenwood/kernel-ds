import * as React from "react"
import { AlertCircle, Info } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { basis } from "@app/lib/format"
import type { Offer, Producer } from "@app/data/producers"

/* Accepting a bid is a decision with a ceiling, so the dialog is built around
   the ceiling rather than around the form. The three figures at the top are the
   ones being compared; the meter under them is those figures laid on one line;
   the two inputs are what the merchant adds. Nothing here creates a contract —
   the footer says so, because a green Confirm button on a grain screen looks
   like it moves bushels. */

const round2 = (n: number) => Math.round(n * 100) / 100
const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi)

/* A merchandiser working a board walks a bid rather than composing it, so the
   arrows move it a cent and Shift moves it a dime. The keys walk the meter's
   track and stop at its ends — a held key that moves nothing on screen reads
   as a broken key — while typing stays free, because a typed number is
   deliberate in a way a held key is not. */
const STEP = 0.01
const SHIFT_STEP = 0.1

/** A key cap on the dialog's own surface. The DS fills `Kbd` with `--muted`,
    which resolves to the same colour as `--card` — on a card the cap vanishes
    and the hint reads as loose glyphs. Same fault, and same fix, as `IconChip`:
    a foreground overlay sits on whatever it is dropped on. */
const Cap = ({ children }: { children: React.ReactNode }) => (
  <Kbd className="bg-foreground/10 px-1.5 text-foreground">{children}</Kbd>
)

/** Percent of the way from the posted bid to the scenario's ceiling. Both
    labels and fills use it, so a figure and its label can never disagree. */
const positionOn = (v: number, from: number, to: number) =>
  to === from ? 0 : Math.min(100, Math.max(0, ((v - from) / (to - from)) * 100))

/** A label pinned to a point on the meter. It is anchored by its own share of
    its width, so the label at 0% is left-aligned and the one at 100% is
    right-aligned — a centred label at either end hangs off the track. */
function Marker({
  pct,
  children,
  tone = "neutral",
}: {
  pct: number
  children: React.ReactNode
  tone?: "neutral" | "strong" | "over"
}) {
  return (
    <div
      className="absolute top-0"
      style={{ left: `${pct}%`, transform: `translateX(-${pct}%)` }}
    >
      <span
        className={cn(
          "block rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap tabular-nums",
          tone === "neutral" && "bg-muted-foreground text-background",
          tone === "strong" && "bg-foreground text-background",
          tone === "over" && "bg-destructive text-white"
        )}
      >
        {children}
      </span>
    </div>
  )
}

/** The meter: posted bid at the left, the scenario's ceiling at the right, and
    this producer's own ceiling filled in between. The fill is the room the
    merchant actually has on this producer — a far producer with a high max
    fills the track, a producer already at the posted bid leaves it empty, and
    that difference is the whole reason this dialog is not just two inputs. */
function BidMeter({
  posted,
  producerMax,
  scenarioMax,
  bid,
  over,
}: {
  posted: number
  producerMax: number
  scenarioMax: number
  bid: number | null
  over: boolean
}) {
  const maxPct = positionOn(producerMax, posted, scenarioMax)
  const bidPct = bid == null ? 0 : positionOn(bid, posted, scenarioMax)
  return (
    <div className="px-1 pt-1 pb-2">
      {/* Two label lanes with reserved height: the labels move as the bid is
          typed, and a lane that collapses when empty would walk the dialog. */}
      <div className="relative h-6">
        <Marker pct={maxPct}>Producer Max Bid: {basis(producerMax)}</Marker>
      </div>
      <div
        data-v2-meter
        className="relative h-4 w-full overflow-hidden rounded-xs bg-foreground/10"
      >
        <div
          className="absolute inset-y-0 left-0 bg-primary/45"
          style={{ width: `${maxPct}%` }}
        />
        {/* The ceiling reads as a stop, not as a colour change: a fill that
            simply ends looks like it ran out, a fill that ends at a rule looks
            like it was held there. */}
        <div className="absolute inset-y-0 right-0 w-px bg-foreground" />
        {bid != null && (
          <div
            className={cn(
              "absolute inset-y-0 w-0.5",
              over ? "bg-destructive" : "bg-foreground"
            )}
            style={{ left: `calc(${bidPct}% - 1px)` }}
          />
        )}
      </div>
      <div className="relative h-6 pt-1">
        <Marker pct={bidPct} tone={over ? "over" : "strong"}>
          Bid Accepted: {bid == null ? "–" : basis(bid)}
        </Marker>
      </div>
    </div>
  )
}

/** A label over its figure, on the dialog's own plate. Same order as the
    roll-up tiles: the label is the question, the figure is the answer. */
function BidBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div data-v2-frame className="rounded-lg border border-border px-3 py-2">
      <div className="text-xs leading-tight text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg leading-none font-semibold tabular-nums">{value}</div>
    </div>
  )
}

/** A small label-over-value pair for the two context bands. */
function Fact({ label, value, align = "left" }: { label: string; value: React.ReactNode; align?: "left" | "right" }) {
  return (
    <div className={cn("min-w-0", align === "right" && "text-right")}>
      <div className="text-xs leading-tight whitespace-nowrap text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm leading-tight font-medium whitespace-nowrap tabular-nums">{value}</div>
    </div>
  )
}

const commodityName: Record<string, string> = {
  corn: "Corn",
  soybeans: "Soybeans",
  wheat: "Wheat",
  canola: "Canola",
}

export function AcceptBidDialog({
  producer,
  offer,
  open,
  onOpenChange,
}: {
  producer: Producer
  offer: Offer | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [bid, setBid] = React.useState("")
  const [volume, setVolume] = React.useState("")

  // Each offer opens its own blank form — a bid typed against one contract
  // must not be sitting in the field when a different one is opened.
  React.useEffect(() => {
    if (open) {
      setBid("")
      setVolume("")
    }
  }, [open, offer?.id])

  if (!offer) return null

  const parsed = bid.trim() === "" ? null : Number(bid)
  const bidValue = parsed == null || Number.isNaN(parsed) ? null : round2(parsed)
  const over = bidValue != null && bidValue > offer.producerMaxBid
  const volumeValue = Number(volume.replace(/,/g, ""))
  const hasVolume = volume.trim() !== "" && !Number.isNaN(volumeValue) && volumeValue > 0
  const ready = bidValue != null && !over && hasVolume
  const valueOver = round2(offer.producerMaxBid - offer.topCompBid)

  const stepBid = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const dir = e.key === "ArrowUp" ? 1 : e.key === "ArrowDown" ? -1 : 0
    if (dir === 0) return
    // Left alone, an arrow key throws the caret to one end of the field and a
    // held key scrolls the dialog instead of moving the bid.
    e.preventDefault()
    // An empty field has nothing to step from, so the first press lands on the
    // posted bid: the board's own number is where a raise starts.
    const next =
      bidValue == null
        ? offer.postedBid
        : bidValue + dir * (e.shiftKey ? SHIFT_STEP : STEP)
    // Stepping normalises the field to the cent grid it walks on.
    setBid(clamp(round2(next), offer.postedBid, offer.scenarioMaxBid).toFixed(2))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent width="lg" className="gap-0 p-0">
        <DialogHeader className="mx-0 mt-0 px-4">
          <DialogTitle>Accept Bid</DialogTitle>
        </DialogHeader>

        {/* Who and what. The contract line is the producer's subtitle because
            a bid is only ever a bid on one contract. */}
        <div className="flex items-start justify-between gap-6 border-b border-border bg-foreground/[0.03] px-4 py-3">
          <div className="min-w-0">
            <div className="text-base leading-tight font-semibold">{producer.name}</div>
            <div className="mt-0.5 text-sm text-muted-foreground">
              {commodityName[offer.commodity] ?? offer.commodity} · {offer.month} ({offer.symbol}) · {offer.location}
            </div>
          </div>
          <div className="flex shrink-0 items-start gap-6">
            <Fact label="Distance" value={`${producer.distanceMi} mi`} align="right" />
            <Fact label="Time of Shipment" value={offer.shipment} align="right" />
          </div>
        </div>

        {/* The rival. Kept next to the identity rather than beside the meter:
            it is why the ceiling is where it is, not part of the arithmetic. */}
        <div className="grid grid-cols-4 gap-4 border-b border-border px-4 py-3">
          <Fact label="Top Comp." value={offer.topComp} />
          <Fact label="Comp. Location" value={offer.location} />
          <Fact label="Top Comp. Bid" value={basis(offer.topCompBid)} />
          <Fact label="Value over" value={basis(valueOver)} />
        </div>

        <div className="flex flex-col gap-4 px-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            <BidBox label="Posted Bid" value={basis(offer.postedBid)} />
            <BidBox label="Producer Max Bid" value={basis(offer.producerMaxBid)} />
            <BidBox label="Scenario Max Bid" value={basis(offer.scenarioMaxBid)} />
          </div>

          <BidMeter
            posted={offer.postedBid}
            producerMax={offer.producerMaxBid}
            scenarioMax={offer.scenarioMaxBid}
            bid={bidValue}
            over={over}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border px-4 py-4">
          <div>
            <Label htmlFor="accept-bid" className="text-sm font-medium">
              Bid Accepted
            </Label>
            <InputGroup className="mt-2 h-10">
              <InputGroupAddon className="border-r border-border bg-foreground/[0.04] px-2.5">
                <InputGroupText>$</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="accept-bid"
                inputMode="decimal"
                placeholder=""
                aria-invalid={over || undefined}
                aria-describedby={over ? "accept-bid-error" : "accept-bid-keys"}
                value={bid}
                onChange={(e) => setBid(e.target.value)}
                onKeyDown={stepBid}
                className="tabular-nums"
              />
            </InputGroup>
            {/* One lane under the field, never two: the hint says the keys are
                there, and the error takes the lane when the ceiling breaks. A
                lane that appears would push the footer down as a bid is typed.
                The message names the ceiling it broke — "Invalid" would leave
                the merchant looking for which of the three numbers he passed. */}
            <div className="mt-2 min-h-5">
              {over ? (
                <p
                  id="accept-bid-error"
                  className="flex items-center gap-1.5 text-sm leading-5 font-medium text-destructive"
                >
                  <AlertCircle className="size-4 shrink-0" />
                  Exceeds Producer Max Bid
                </p>
              ) : (
                <p
                  id="accept-bid-keys"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <KbdGroup>
                    <Cap>↑</Cap>
                    <Cap>↓</Cap>
                  </KbdGroup>
                  1¢, hold
                  <Cap>Shift</Cap>
                  for 10¢
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="accept-volume" className="text-sm font-medium">
              Volume
            </Label>
            <InputGroup className="mt-2 h-10">
              <InputGroupInput
                id="accept-volume"
                inputMode="numeric"
                placeholder="0"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="tabular-nums"
              />
              <InputGroupAddon align="inline-end" className="border-l border-border bg-foreground/[0.04] px-2.5">
                <InputGroupText>bu</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 items-center gap-3 sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="size-4 shrink-0" />
            Market feedback only. No contract created.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button disabled={!ready} onClick={() => onOpenChange(false)}>
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
