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
  /** Why they passed. Rejects only — an accept has no reason to give. */
  reason?: string
  /** The offer's quantity. An accept books these bushels; a reject is the
      quantity that walked. */
  bushels: number
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
  /** Basis, not a cash price: cents over/under the futures month. */
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
  { id: "SC-2041", futuresMonth: "Jul 2026", shipment: "Spot",        commodity: "corn",     location: "River Terminal", postedBid: -0.18, maxBid: -0.02, adjustedMaxBid: -0.05, updated: "6 min ago",  status: "active" },
  { id: "SC-2039", futuresMonth: "Jul 2026", shipment: "Jul 2026",    commodity: "soybeans", location: "River Terminal", postedBid: -0.24, maxBid: -0.02, adjustedMaxBid: -0.07, updated: "18 min ago", status: "active" },
  { id: "SC-2036", futuresMonth: "Sep 2026", shipment: "Aug–Sep 2026", commodity: "wheat",   location: "Prairie Grove",  postedBid: -0.31, maxBid: -0.12, adjustedMaxBid: -0.16, updated: "42 min ago", status: "active" },
  { id: "SC-2034", futuresMonth: "Dec 2026", shipment: "Fall 2026",   commodity: "corn",     location: "Prairie Grove",  postedBid: -0.26, maxBid: -0.07, adjustedMaxBid: -0.13, updated: "1 h ago",    status: "paused" },
  { id: "SC-2031", futuresMonth: "Nov 2026", shipment: "Oct 2026",    commodity: "soybeans", location: "Birchwood",      postedBid: -0.35, maxBid: -0.07, adjustedMaxBid: -0.14, updated: "1 h ago",    status: "active" },
  { id: "SC-2028", futuresMonth: "Sep 2026", shipment: "Spot",        commodity: "corn",     location: "Birchwood",      postedBid: -0.2, maxBid: -0.06, adjustedMaxBid: -0.08, updated: "2 h ago",    status: "draft" },
  { id: "SC-2025", futuresMonth: "Jul 2026", shipment: "Jul 2026",    commodity: "wheat",    location: "Winnebago",      postedBid: -0.28, maxBid: -0.08, adjustedMaxBid: -0.12, updated: "3 h ago",    status: "active" },
  { id: "SC-2022", futuresMonth: "Dec 2026", shipment: "Dec 2026",    commodity: "corn",     location: "Winnebago",      postedBid: -0.3, maxBid: -0.11, adjustedMaxBid: -0.17, updated: "4 h ago",    status: "paused" },
  { id: "SC-2019", futuresMonth: "Nov 2026", shipment: "Fall 2026",   commodity: "soybeans", location: "Prairie Grove",  postedBid: -0.22, maxBid: 0.05, adjustedMaxBid: 0.01, updated: "yesterday",  status: "active" },
  { id: "SC-2014", futuresMonth: "May 2026", shipment: "Spot",        commodity: "corn",     location: "River Terminal", postedBid: -0.33, maxBid: -0.16, adjustedMaxBid: -0.22, updated: "2 days ago", status: "expired" },
  { id: "SC-2011", futuresMonth: "Jul 2026", shipment: "Jul 2026",    commodity: "wheat",    location: "Birchwood",      postedBid: -0.15, maxBid: 0.03, adjustedMaxBid: 0, updated: "2 days ago", status: "draft" },
  { id: "SC-2007", futuresMonth: "Mar 2027", shipment: "Mar 2027",    commodity: "soybeans", location: "Winnebago",      postedBid: -0.27, maxBid: 0.01, adjustedMaxBid: -0.06, updated: "3 days ago", status: "active" },
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

/** Why a producer passed. Short enough to sit in a table cell, specific
    enough to be worth a column: a book of "Declined" tells the merchant
    nothing, and the difference between "sold elsewhere" and "holding for
    higher" is the difference between a lost bushel and a later one. */
const rejectReasons = [
  "Basis too low",
  "Sold elsewhere",
  "Holding for higher",
  "Delivery window",
  "Freight too far",
  "Quality spec",
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

/** Newest first, so slicing the front gives "since last update". Long enough
    that a per-scenario stagger never wraps — a wrap would break the ordering. */
const agesAll = ["4 min ago", "12 min ago", "22 min ago", "37 min ago", "1 h ago", "2 h ago", "3 h ago", "6 h ago", "9 h ago", "yesterday", "2 days ago", "3 days ago", "4 days ago", "5 days ago", "6 days ago"]

function activityFor(s: Omit<Scenario, "activity">): Record<ActivityRange, Activity> {
  const r = lcg(fnv(s.id))
  // Stagger each scenario's clock so the book-wide feed doesn't read as one
  // burst of simultaneous events. Offset + index never exceeds agesAll.
  const ageOffset = fnv(s.id + "t") % 4

  const eventCount = 4 + Math.floor(r() * 5) // 4–8 all-time
  // Cycle farms from a per-scenario offset, like the competitors: per-event
  // hashing can collide into the same farm several times in a row, which reads
  // as a bug ("Heartland accepted four times in 40 minutes"), not as data.
  const fOffset = fnv(s.id + "f") % farms.length
  const events: ProducerEvent[] = Array.from({ length: eventCount }, (_, i) => {
    const id = `${s.id}-E${i + 1}`
    // Accepts outnumber rejects, which is what a working scenario looks like.
    const action = r() < 0.68 ? "accepted" : "rejected"
    return {
      id,
      producer: farms[(fOffset + i) % farms.length],
      action,
      bid: round2(s.postedBid + (r() * 0.1 - 0.04)),
      // 5,000–35,000 bu in 500-bu steps — truck-lot sized offers.
      bushels: (10 + Math.floor(r() * 61)) * 500,
      // Hashed off the event id rather than drawn from `r`, so adding a reason
      // does not reshuffle every number already on screen.
      reason: action === "rejected" ? rejectReasons[fnv(id + "r") % rejectReasons.length] : undefined,
      when: agesAll[ageOffset + i],
    }
  })

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
      when: agesAll[ageOffset + i],
    }
  })

  // "Since last update" = the newest slice of the same lists. Some scenarios
  // have genuinely been quiet — the slice must be allowed to reach zero, or a
  // row-level activity flag lights every row and tells the merchant nothing.
  const sinceEvents = Math.floor(r() * (eventCount * 0.6 + 1))
  const sinceMoves = Math.floor(r() * (moveCount * 0.7 + 1))
  return {
    all: { events, moves },
    since: { events: events.slice(0, sinceEvents), moves: moves.slice(0, sinceMoves) },
  }
}

export const scenarios: Scenario[] = seeds.map((s) => ({ ...s, activity: activityFor(s) }))

/** What a slice of activity did to the book — derived, never stored.

    An accept books its bushels, so bought is the sum over accepts only. The
    average is volume-weighted: a merchant's average basis is what the bushels
    cost, not what the offers averaged, and a 5,000 bu accept must not move it
    as far as a 35,000 bu one.

    `avgBasis` is null when nothing was bought. There is no average of nothing,
    and 0.00 would read as a flat bid rather than as an absence. */
export const tally = (a: Activity) => {
  const accepted = a.events.filter((e) => e.action === "accepted")
  const rejected = a.events.filter((e) => e.action === "rejected")
  const bushels = accepted.reduce((n, e) => n + e.bushels, 0)
  return {
    accepted: accepted.length,
    rejected: rejected.length,
    bushels,
    /** What walked: the quantity on the rejects. */
    walked: rejected.reduce((n, e) => n + e.bushels, 0),
    avgBasis:
      bushels === 0
        ? null
        : accepted.reduce((n, e) => n + e.bid * e.bushels, 0) / bushels,
  }
}

/** How much has happened since the merchant last touched this scenario — the
    number the row-level activity flag reports.

    Producer events only: the competitor-movement panel is shelved, and a flag
    that counted moves would promise more than the opened row shows. `moves` is
    still generated so the panel can come back without re-deriving the data. */
export const sinceCount = (s: Scenario) => s.activity.since.events.length

/** A producer event with the scenario it happened against — the shape the
    book-wide feed on the Overview renders. */
export type BookEvent = ProducerEvent & {
  scenarioId: string
  futuresMonth: string
  location: string
  commodity: Commodity
}

/** Everything that has happened across the book since last update, newest
    first. Derived from the same per-scenario slices the row flags count, so the
    Overview feed, the flags, and the opened rows can never disagree. */
export const bookActivity: BookEvent[] = scenarios
  .flatMap((s) =>
    s.activity.since.events.map((e) => ({
      ...e,
      scenarioId: s.id,
      futuresMonth: s.futuresMonth,
      location: s.location,
      commodity: s.commodity,
    }))
  )
  // `when` values all come from agesAll, which is ordered newest-first.
  .sort((a, b) => agesAll.indexOf(a.when) - agesAll.indexOf(b.when))
