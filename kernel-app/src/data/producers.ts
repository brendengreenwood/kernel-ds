import type { Commodity } from "@/components/ui/commodity-badge"

export type ProducerStatus = "active" | "prospect" | "inactive"

export type Producer = {
  id: string
  name: string
  contact: string
  location: string
  commodities: Commodity[]
  activeContracts: number
  openBushels: number
  status: ProducerStatus
  updated: string
}

export const producers: Producer[] = [
  { id: "PR-1042", name: "Hartmann Farms",    contact: "Elsie Hartmann",  location: "Lake Crystal, MN", commodities: ["corn", "soybeans"], activeContracts: 3, openBushels: 18600, status: "active",   updated: "6 min ago" },
  { id: "PR-1039", name: "Becker Ag",         contact: "Ron Becker",      location: "Mapleton, MN",     commodities: ["soybeans"],          activeContracts: 2, openBushels: 6200,  status: "active",   updated: "22 min ago" },
  { id: "PR-1036", name: "Sunrise Acres",     contact: "Priya Nair",      location: "St. James, MN",    commodities: ["wheat", "corn"],     activeContracts: 2, openBushels: 22500, status: "active",   updated: "1 h ago" },
  { id: "PR-1031", name: "Kowalski Grain",    contact: "Marta Kowalski",  location: "Winnebago, MN",    commodities: ["canola"],            activeContracts: 1, openBushels: 18000, status: "active",   updated: "3 h ago" },
  { id: "PR-1028", name: "Doyle Brothers",    contact: "Pat Doyle",       location: "Amboy, MN",        commodities: ["soybeans", "corn"],  activeContracts: 1, openBushels: 800,   status: "active",   updated: "yesterday" },
  { id: "PR-1024", name: "Vos Family Farm",   contact: "Henk Vos",        location: "Good Thunder, MN", commodities: ["corn"],              activeContracts: 0, openBushels: 0,     status: "prospect", updated: "2 days ago" },
  { id: "PR-1019", name: "Cedar Ridge Co-op", contact: "Dana Whitfield",  location: "Madelia, MN",      commodities: ["corn", "wheat"],     activeContracts: 0, openBushels: 0,     status: "prospect", updated: "4 days ago" },
  { id: "PR-1012", name: "Halvorsen Farms",   contact: "Erik Halvorsen",  location: "Truman, MN",       commodities: ["soybeans", "wheat"], activeContracts: 0, openBushels: 0,     status: "prospect", updated: "1 week ago" },
  { id: "PR-1004", name: "Old Mill Grain",    contact: "Sam Ortega",      location: "Vernon Center, MN",commodities: ["corn"],              activeContracts: 0, openBushels: 0,     status: "inactive", updated: "1 mo ago" },
  { id: "PR-0998", name: "Prairie Wind Farm", contact: "Lauren Frey",     location: "Garden City, MN",  commodities: ["canola", "wheat"],   activeContracts: 0, openBushels: 0,     status: "inactive", updated: "2 mo ago" },
]
