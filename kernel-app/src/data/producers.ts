import type { Commodity } from "@/components/ui/commodity-badge"

export type ContactType = "Text" | "Call" | "Email"
/** Two-line cell: a date and its relative age. */
export type Dated = { date: string; ago: string }

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
}

/** Elevator locations — the folder tabs + the delivery-location column. */
export const locations = ["River Terminal", "Prairie Grove", "Birchwood", "Winnebago"]

export const producers: Producer[] = [
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
