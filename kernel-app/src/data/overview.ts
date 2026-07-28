// Placeholder analytics for the Overview — grain-merchant world (loads,
// contracts, bushels, basis, settlement). Static; a real backend swaps this.

export type Point = { d: string; v: number }

const series = (vals: number[], start = 10): Point[] =>
  vals.map((v, i) => ({ d: `May ${start + i}`, v }))

export const range = "May 10 – Jun 9, 2026"

export const kpis = {
  revenue: {
    label: "Revenue",
    value: "$823,451",
    delta: +8.2,
    data: series([31, 38, 34, 40, 30, 55, 33, 44, 39, 47, 42, 35, 61, 48, 52, 58, 46, 63, 51, 57]),
  },
  contracts: {
    label: "Active contracts",
    value: "2,948",
    delta: +3.1,
    data: series([12, 14, 13, 15, 16, 15, 17, 18, 19, 21, 20, 22, 24, 23, 26, 28, 27, 31, 44, 62]),
  },
  costs: {
    label: "Costs",
    value: "$216,023",
    delta: -2.4,
    data: series([22, 30, 26, 34, 24, 44, 28, 20, 38, 30, 42, 26, 48, 22, 40, 30, 46, 24, 36, 28]),
  },
  costPerBushel: {
    label: "Cost per bushel",
    value: "$0.57",
    delta: -1.1,
    data: series([18, 26, 22, 30, 20, 40, 24, 16, 34, 26, 38, 22, 44, 18, 36, 26, 42, 20, 32, 24]),
  },
  grossMargin: {
    label: "Gross margin",
    value: "73%",
    delta: +1.6,
    data: series([58, 60, 59, 62, 61, 63, 64, 63, 66, 68, 67, 69, 70, 69, 71, 72, 71, 73, 72, 73]),
  },
}

export const revenue3mo: Point[] = [
  { d: "Apr 01", v: 540 }, { d: "Apr 08", v: 610 }, { d: "Apr 15", v: 580 },
  { d: "Apr 22", v: 660 }, { d: "Apr 29", v: 705 }, { d: "May 06", v: 690 },
  { d: "May 13", v: 748 }, { d: "May 20", v: 792 }, { d: "May 27", v: 770 },
  { d: "Jun 03", v: 823 }, { d: "Jun 09", v: 861 },
]

export const latestOrders = [
  { id: "#4468", who: "Valley Co-op", status: "settled" as const, amount: "$101,049", when: "12m ago" },
  { id: "#4471", who: "Hartmann Farms", status: "in_transit" as const, amount: "18,400 bu", when: "38m ago" },
  { id: "#4465", who: "Birchwood", status: "on_hold" as const, amount: "12,750 bu", when: "1h ago" },
  { id: "#4460", who: "Hartmann Farms", status: "rejected" as const, amount: "—", when: "2h ago" },
]

export const availableBalance = "$492,441"
