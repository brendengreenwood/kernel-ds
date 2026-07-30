import type { Commodity } from "@/components/ui/commodity-badge"

export type ScenarioStatus = "active" | "draft" | "paused" | "expired"

/** Which slice of history the detail cards show. */
export type ActivityRange = "since" | "all"

/** A producer acting on this scenario's bid. */
export type ProducerEvent = {
  id: string
  producer: string
  action: "accepted" | "rejected"
  /** The bid they acted on. */
  bid: number
  when: string
}

/** A rival buyer moving their posted bid. */
export type CompetitorMove = {
  id: string
  competitor: string
  from: number
  to: number
  when: string
}

export type Activity = {
  events: ProducerEvent[]
  moves: CompetitorMove[]
}

export type Scenario = {
  id: string
  futuresMonth: string
  shipment: string
  commodity: Commodity
  location: string
  postedBid: number
  maxBid: number
  adjustedMaxBid: number
  updated: string
  status: ScenarioStatus
  /** Detail-row activity. "since" is the tail of "all", never a separate set. */
  activity: Record<ActivityRange, Activity>
}

/** The user's elevator locations — drive the location tabs. */
export const locations = ["River Terminal", "Prairie Grove", "Birchwood", "Winnebago"]

const seeds: Omit<Scenario, "activity">[] = [
  { id: "SC-2041", futuresMonth: "Jul 2026", shipment: "Spot",        commodity: "corn",     location: "River Terminal", postedBid: 4.52, maxBid: 4.68, adjustedMaxBid: 4.65, updated: "6 min ago",  status: "active" },
  { id: "SC-2039", futuresMonth: "Jul 2026", shipment: "Jul 2026",    commodity: "soybeans", location: "River Terminal", postedBid: 11.38, maxBid: 11.60, adjustedMaxBid: 11.55, updated: "18 min ago", status: "active" },
  { id: "SC-2036", futuresMonth: "Sep 2026", shipment: "Aug–Sep 2026", commodity: "wheat",   location: "Prairie Grove",  postedBid: 6.05, maxBid: 6.24, adjustedMaxBid: 6.20, updated: "42 min ago", status: "active" },
  { id: "SC-2034", futuresMonth: "Dec 2026", shipment: "Fall 2026",   commodity: "corn",     location: "Prairie Grove",  postedBid: 4.41, maxBid: 4.60, adjustedMaxBid: 4.54, updated: "1 h ago",    status: "paused" },
  { id: "SC-2031", futuresMonth: "Nov 2026", shipment: "Oct 2026",    commodity: "soybeans", location: "Birchwood",      postedBid: 11.12, maxBid: 11.40, adjustedMaxBid: 11.33, updated: "1 h ago",    status: "active" },
  { id: "SC-2028", futuresMonth: "Sep 2026", shipment: "Spot",        commodity: "corn",     location: "Birchwood",      postedBid: 4.48, maxBid: 4.62, adjustedMaxBid: 4.60, updated: "2 h ago",    status: "draft" },
  { id: "SC-2025", futuresMonth: "Jul 2026", shipment: "Jul 2026",    commodity: "wheat",    location: "Winnebago",      postedBid: 5.98, maxBid: 6.18, adjustedMaxBid: 6.14, updated: "3 h ago",    status: "active" },
  { id: "SC-2022", futuresMonth: "Dec 2026", shipment: "Dec 2026",    commodity: "corn",     location: "Winnebago",      postedBid: 4.39, maxBid: 4.58, adjustedMaxBid: 4.52, updated: "4 h ago",    status: "paused" },
  { id: "SC-2019", futuresMonth: "Nov 2026", shipment: "Fall 2026",   commodity: "soybeans", location: "Prairie Grove",  postedBid: 11.05, maxBid: 11.32, adjustedMaxBid: 11.28, updated: "yesterday",  status: "active" },
  { id: "SC-2014", futuresMonth: "May 2026", shipment: "Spot",        commodity: "corn",     location: "River Terminal", postedBid: 4.33, maxBid: 4.50, adjustedMaxBid: 4.44, updated: "2 days ago", status: "expired" },
  { id: "SC-2011", futuresMonth: "Jul 2026", shipment: "Jul 2026",    commodity: "wheat",    location: "Birchwood",      postedBid: 6.02, maxBid: 6.20, adjustedMaxBid: 6.17, updated: "2 days ago", status: "draft" },
  { id: "SC-2007", futuresMonth: "Mar 2027", shipment: "Mar 2027",    commodity: "soybeans", location: "Winnebago",      postedBid: 11.20, maxBid: 11.48, adjustedMaxBid: 11.41, updated: "3 days ago", status: "active" },
]

/* Activity is derived deterministically from the scenario id, same as the
   producers' open bids: stable across reloads and screenshots, and internally
   consistent — the "since last update" slice is literally the most recent tail
   of the all-time list, so its counts can never contradict the longer view. */

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
const pick = <T,>(r: () => number, xs: readonly T[]) => xs[Math.floor(r() * xs.length)]

/** Rival buyers — the same invented book the producers page uses. */
const competitors = [
  "Northfield Grain",
  "Delta Milling",
  "Summit Ag",
  "Clearwater Grain",
  "Harvest Union",
] as const

const farms = [
  "Cedar Bluff Farms",
  "Greenwood Family Farms",
  "Bob's Farm",
  "Prairie Ridge Farms",
  "Heartland Grain Co.",
  "Meridian Ag",
  "Northwind Producers",
  "Silverton Grain Co",
  "Hilltop Farms LLC",
  "Valley Crest Ag",
] as const

/** Newest first, so slicing the front gives "since last update". */
const agesAll = ["4 min ago", "22 min ago", "1 h ago", "3 h ago", "6 h ago", "yesterday", "2 days ago", "3 days ago", "5 days ago"]

function activityFor(s: Omit<Scenario, "activity">): Record<ActivityRange, Activity> {
  const r = lcg(fnv(s.id))

  const eventCount = 4 + Math.floor(r() * 5) // 4–8 all-time
  const events: ProducerEvent[] = Array.from({ length: eventCount }, (_, i) => ({
    id: `${s.id}-E${i + 1}`,
    producer: farms[(fnv(s.id + i) + i) % farms.length],
    // Accepts outnumber rejects, which is what a working scenario looks like.
    action: r() < 0.68 ? "accepted" : "rejected",
    bid: round2(s.postedBid + (r() * 0.1 - 0.04)),
    when: agesAll[i % agesAll.length],
  }))

  const moveCount = 3 + Math.floor(r() * 3) // 3–5 all-time
  // Cycle rather than sample: a rival buyer should appear once in the list, or
  // it reads as a bug rather than as three separate moves.
  const cOffset = fnv(s.id + "c") % competitors.length
  const moves: CompetitorMove[] = Array.from({ length: moveCount }, (_, i) => {
    const from = round2(s.postedBid + (r() * 0.12 - 0.08))
    return {
      id: `${s.id}-M${i + 1}`,
      competitor: competitors[(cOffset + i) % competitors.length],
      from,
      to: round2(from + (r() * 0.1 - 0.045)),
      when: agesAll[i % agesAll.length],
    }
  })

  // "Since last update" = the newest slice of the same lists.
  const sinceEvents = Math.max(1, Math.round(eventCount * 0.4))
  const sinceMoves = Math.max(1, Math.round(moveCount * 0.5))
  return {
    all: { events, moves },
    since: { events: events.slice(0, sinceEvents), moves: moves.slice(0, sinceMoves) },
  }
}

export const scenarios: Scenario[] = seeds.map((s) => ({ ...s, activity: activityFor(s) }))

/** Accept/reject tallies for a slice — derived, never stored. */
export const tally = (a: Activity) => ({
  accepted: a.events.filter((e) => e.action === "accepted").length,
  rejected: a.events.filter((e) => e.action === "rejected").length,
})
