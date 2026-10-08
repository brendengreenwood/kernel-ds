// Merchant scenario objects. Only what the navigator and header show today;
// add a field here when a screen needs it, not before.
// All values are simulated. Bids are basis ($/bu vs the futures contract).

export type Commodity = "corn" | "soybeans"

/** A Cargill buying location a merchant prices for. */
export interface Location {
  id: string
  name: string
}

/**
 * One location × commodity × futures contract × shipment window.
 * The unit a merchant models and publishes a bid for.
 */
export interface Scenario {
  id: string
  locationId: string
  commodity: Commodity
  /** Futures contract the basis is quoted against, e.g. ZCU26. */
  contract: string
  /** Shipment window, ISO dates (inclusive). */
  shipStart: string
  shipEnd: string
  /** Basis currently posted to farmers, $/bu. */
  postedBid: number
  /** Highest basis the scenario allows, $/bu. */
  maxBid: number
  updated: string
}

export const COMMODITY_LABEL: Record<Commodity, string> = { corn: "Corn", soybeans: "Soybeans" }

export const LOCATIONS: Location[] = [
  { id: "albion", name: "Cargill Albion" },
  { id: "lima", name: "Cargill Lima" },
]

const UPDATED = "2026-09-01T14:22:00-05:00"

function s(id: string, locationId: string, commodity: Commodity, contract: string, shipStart: string, shipEnd: string, postedBid: number, maxBid: number): Scenario {
  return { id, locationId, commodity, contract, shipStart, shipEnd, postedBid, maxBid, updated: UPDATED }
}

export const SCENARIOS: Scenario[] = [
  s("alb-c-2609", "albion", "corn", "ZCU26", "2026-09-01", "2026-09-30", -0.2, -0.1),
  s("alb-c-2705", "albion", "corn", "ZCK27", "2027-05-01", "2027-05-31", -0.32, -0.25),
  s("alb-c-2707a", "albion", "corn", "ZCN27", "2027-07-01", "2027-07-15", -0.35, -0.28),
  s("alb-s-2611a", "albion", "soybeans", "ZSX26", "2026-11-01", "2026-11-15", -0.55, -0.45),
  s("alb-s-2611b", "albion", "soybeans", "ZSX26", "2026-11-16", "2026-11-30", -0.5, -0.42),
  s("alb-s-2701", "albion", "soybeans", "ZSF27", "2027-01-01", "2027-01-31", -0.4, -0.33),
  s("alb-s-2703", "albion", "soybeans", "ZSH27", "2027-03-01", "2027-03-31", -0.38, -0.3),
  s("alb-s-2707b", "albion", "soybeans", "ZSN27", "2027-07-16", "2027-07-31", -0.42, -0.35),
  s("lim-c-2612", "lima", "corn", "ZCZ26", "2026-12-01", "2026-12-31", -0.28, -0.2),
  s("lim-c-2703", "lima", "corn", "ZCH27", "2027-03-01", "2027-03-31", -0.24, -0.18),
  s("lim-s-2705", "lima", "soybeans", "ZSK27", "2027-05-01", "2027-05-31", -0.45, -0.38),
]

const MONTH = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" })
const d = (iso: string) => new Date(iso + "T00:00:00Z")

/** "Sep 1–30" */
export function shipWindow(sc: Scenario) {
  const a = d(sc.shipStart), b = d(sc.shipEnd)
  return `${MONTH.format(a)} ${a.getUTCDate()}–${b.getUTCDate()}`
}

/** "Sep 2026" */
export function shipMonth(sc: Scenario) {
  const a = d(sc.shipStart)
  return `${MONTH.format(a)} ${a.getUTCFullYear()}`
}

export function basis(n: number) {
  return `${n < 0 ? "−" : "+"}$${Math.abs(n).toFixed(2)}`
}

export function updatedLabel(iso: string, withZone = true) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: withZone ? "numeric" : undefined,
    hour: "numeric", minute: "2-digit", timeZone: "America/Chicago",
    timeZoneName: withZone ? "short" : undefined,
  }).format(new Date(iso))
}

/** Soonest shipment first. */
export const byShipStart = (a: Scenario, b: Scenario) => a.shipStart.localeCompare(b.shipStart)
