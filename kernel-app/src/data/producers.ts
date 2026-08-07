import type { Commodity } from "@/components/ui/commodity-badge"

export type ContactType = "Text" | "Call" | "Email"
/** Two-line cell: a date and its relative age. */
export type Dated = { date: string; ago: string }

/** One open bid on a futures contract — a row of the expanded producer inset. */
export type Offer = {
  id: string
  /** Futures contract: display month + exchange symbol (July 2026 / ZCN6). */
  month: string
  symbol: string
  shipment: string
  commodity: Commodity
  /** Delivery elevator for this bid — not always the producer's home yard. */
  location: string
  postedBid: number
  producerMaxBid: number
  scenarioMaxBid: number
  topComp: string
  topCompBid: number
  created: string
}

export type Producer = {
  id: string
  rank: number
  name: string
  accountType: "Primary" | "Secondary"
  /** Delivery elevator (drives the location folder tabs). */
  location: string
  distanceMi: number
  commodities: Commodity[]
  lastSpot: Dated
  lastDelivery: Dated
  lastContact: Dated
  contactType: ContactType
  bids: number
  /** "My Producers" (assigned to this merchant) vs the full book. */
  mine: boolean
  /** Open bids, revealed by the row expander. Always `bids` long. */
  offers: Offer[]
}

/** Elevator locations — the folder tabs + the delivery-location column. */
export const locations = ["River Terminal", "Prairie Grove", "Birchwood", "Winnebago"]

type Seed = Omit<Producer, "offers">

const seeds: Seed[] = [
  { id: "PR-1", rank: 1, name: "Cedar Bluff Farms", accountType: "Primary", location: "River Terminal", distanceMi: 4.2, commodities: ["corn", "soybeans"], lastSpot: { date: "Mar 13", ago: "2d ago" }, lastDelivery: { date: "Mar 10", ago: "5d ago" }, lastContact: { date: "Feb 15", ago: "4w ago" }, contactType: "Text", bids: 4, mine: true },
  { id: "PR-2", rank: 2, name: "Greenwood Family Farms", accountType: "Primary", location: "Prairie Grove", distanceMi: 7, commodities: ["soybeans"], lastSpot: { date: "Mar 10", ago: "5d ago" }, lastDelivery: { date: "Mar 8", ago: "1w ago" }, lastContact: { date: "Feb 15", ago: "4w ago" }, contactType: "Call", bids: 2, mine: true },
  { id: "PR-3", rank: 3, name: "Bob's Farm", accountType: "Primary", location: "River Terminal", distanceMi: 12, commodities: ["corn"], lastSpot: { date: "Mar 12", ago: "3d ago" }, lastDelivery: { date: "Mar 8", ago: "1w ago" }, lastContact: { date: "Feb 8", ago: "5w ago" }, contactType: "Text", bids: 3, mine: true },
  { id: "PR-4", rank: 4, name: "Prairie Ridge Farms", accountType: "Primary", location: "Birchwood", distanceMi: 18, commodities: ["wheat", "corn"], lastSpot: { date: "Mar 8", ago: "1w ago" }, lastDelivery: { date: "Mar 1", ago: "2w ago" }, lastContact: { date: "Feb 15", ago: "4w ago" }, contactType: "Email", bids: 5, mine: true },
  { id: "PR-5", rank: 5, name: "Heartland Grain Co.", accountType: "Primary", location: "Prairie Grove", distanceMi: 18, commodities: ["corn"], lastSpot: { date: "Mar 8", ago: "1w ago" }, lastDelivery: { date: "Mar 1", ago: "2w ago" }, lastContact: { date: "Feb 22", ago: "3w ago" }, contactType: "Text", bids: 1, mine: true },
  { id: "PR-6", rank: 6, name: "Meridian Ag", accountType: "Primary", location: "Winnebago", distanceMi: 23, commodities: ["soybeans"], lastSpot: { date: "Mar 1", ago: "2w ago" }, lastDelivery: { date: "Feb 22", ago: "3w ago" }, lastContact: { date: "Feb 22", ago: "3w ago" }, contactType: "Text", bids: 6, mine: false },
  { id: "PR-7", rank: 7, name: "Northwind Producers", accountType: "Primary", location: "Birchwood", distanceMi: 27, commodities: ["corn"], lastSpot: { date: "Mar 1", ago: "2w ago" }, lastDelivery: { date: "Feb 22", ago: "3w ago" }, lastContact: { date: "Mar 1", ago: "2w ago" }, contactType: "Call", bids: 2, mine: false },
  { id: "PR-8", rank: 8, name: "Silverton Grain Co", accountType: "Primary", location: "River Terminal", distanceMi: 29, commodities: ["wheat"], lastSpot: { date: "Feb 22", ago: "3w ago" }, lastDelivery: { date: "Feb 8", ago: "5w ago" }, lastContact: { date: "Mar 1", ago: "2w ago" }, contactType: "Text", bids: 3, mine: false },
  { id: "PR-9", rank: 9, name: "Prairie Ridge Co-op", accountType: "Primary", location: "Winnebago", distanceMi: 33, commodities: ["corn", "wheat"], lastSpot: { date: "Feb 22", ago: "3w ago" }, lastDelivery: { date: "Feb 15", ago: "4w ago" }, lastContact: { date: "Mar 1", ago: "2w ago" }, contactType: "Text", bids: 4, mine: false },
  { id: "PR-10", rank: 10, name: "Hilltop Farms LLC", accountType: "Primary", location: "Prairie Grove", distanceMi: 38, commodities: ["soybeans"], lastSpot: { date: "Feb 15", ago: "4w ago" }, lastDelivery: { date: "Feb 1", ago: "6w ago" }, lastContact: { date: "Mar 8", ago: "1w ago" }, contactType: "Email", bids: 1, mine: false },
  { id: "PR-11", rank: 11, name: "Northwind Acres", accountType: "Primary", location: "Birchwood", distanceMi: 42, commodities: ["canola"], lastSpot: { date: "Feb 1", ago: "6w ago" }, lastDelivery: { date: "Jan 18", ago: "8w ago" }, lastContact: { date: "Mar 10", ago: "5d ago" }, contactType: "Call", bids: 2, mine: false },
  { id: "PR-12", rank: 12, name: "Valley Crest Ag", accountType: "Primary", location: "Winnebago", distanceMi: 45, commodities: ["corn"], lastSpot: { date: "Feb 8", ago: "5w ago" }, lastDelivery: { date: "Jan 25", ago: "7w ago" }, lastContact: { date: "Mar 8", ago: "1w ago" }, contactType: "Text", bids: 7, mine: false },
  { id: "PR-13", rank: 13, name: "Oakwood Grain", accountType: "Primary", location: "River Terminal", distanceMi: 48, commodities: ["soybeans"], lastSpot: { date: "Feb 1", ago: "6w ago" }, lastDelivery: { date: "Jan 20", ago: "8w ago" }, lastContact: { date: "Mar 11", ago: "4d ago" }, contactType: "Text", bids: 3, mine: false },
]

/* Offers are derived deterministically (seeded off the producer id) so the
   inset always shows exactly as many bids as the row's Bids badge, and the
   numbers stay stable across reloads and screenshots. */

const fnv = (s: string) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/** Linear congruential generator — a deterministic stand-in for Math.random. */
const lcg = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}

const round2 = (n: number) => Math.round(n * 100) / 100
const between = (r: () => number, lo: number, hi: number) => round2(lo + r() * (hi - lo))
const pick = <T,>(r: () => number, xs: readonly T[]) => xs[Math.floor(r() * xs.length)]

/** CME-style contract months, with their single-letter codes. */
const months = [
  { name: "March", code: "H", last: 31 },
  { name: "May", code: "K", last: 31 },
  { name: "July", code: "N", last: 31 },
  { name: "September", code: "U", last: 30 },
  { name: "December", code: "Z", last: 31 },
] as const

const symbolRoot: Record<Commodity, string> = {
  corn: "ZC",
  soybeans: "ZS",
  wheat: "ZW",
  canola: "RS",
}

/** Rival buyers — made up, like the rest of the sample book. */
const competitors = [
  "Northfield Grain",
  "Delta Milling",
  "Summit Ag",
  "Clearwater Grain",
  "Harvest Union",
] as const

const createdDates = ["July 2", "July 5", "July 8", "July 11", "July 14", "July 17"] as const

function offersFor(p: Seed): Offer[] {
  const r = lcg(fnv(p.id))
  const offset = fnv(p.id) % months.length
  return Array.from({ length: p.bids }, (_, i) => {
    // Cycle month × shipment-half so a producer never lists the same window twice.
    const m = months[(i + offset) % months.length]
    const firstHalf = Math.floor((i + offset) / months.length) % 2 === 0
    // Cycle rather than sample, so a two-crop producer shows both.
    const commodity = p.commodities[i % p.commodities.length]
    const postedBid = between(r, -0.3, 0.02)
    const producerMaxBid = round2(postedBid + between(r, 0, 0.05))
    const scenarioMaxBid = round2(producerMaxBid + between(r, 0.02, 0.18))
    // Usually a shade under our max bid, so we hold a small edge.
    const topCompBid = round2(producerMaxBid - between(r, -0.02, 0.06))
    return {
      id: `${p.id}-O${i + 1}`,
      month: `${m.name} 2026`,
      symbol: `${symbolRoot[commodity]}${m.code}6`,
      shipment: firstHalf ? `${m.name} 1–15` : `${m.name} 16–${m.last}`,
      commodity,
      location: pick(r, locations),
      postedBid,
      producerMaxBid,
      scenarioMaxBid,
      topComp: pick(r, competitors),
      topCompBid,
      created: pick(r, createdDates),
    }
  })
}

export const producers: Producer[] = seeds.map((p) => ({ ...p, offers: offersFor(p) }))
