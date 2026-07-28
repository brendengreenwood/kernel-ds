import type { Commodity } from "@/components/ui/commodity-badge"

export type ScenarioStatus = "active" | "draft" | "paused" | "expired"

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
}

/** The user's elevator locations — drive the location tabs. */
export const locations = ["River Terminal", "Prairie Grove", "Birchwood", "Winnebago"]

export const scenarios: Scenario[] = [
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
