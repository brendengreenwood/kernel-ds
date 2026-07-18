import type { ObjectRow } from "./types.ts"

/**
 * Demo dataset — deterministic generated rows for the Workspace page
 * (decision 0029).
 *
 * The hand-written stub rows in `contract.ts` / `settlement.ts` are
 * intentionally tiny (8 + 6) and their IDs are load-bearing (walks,
 * merged pages). The Workspace navigator needs enough volume for
 * grouped counts to mean something, so this module generates a larger
 * dataset from a fixed-seed PRNG: same rows on every run, stable
 * screenshots, no drift.
 *
 * Deliberately NOT registered in `objectRowsRegistry` — the registry
 * feeds Designs/Collection/Record/etc., which stay on the stubs.
 * UI-agnostic like the rest of `lib/objects`: imports nothing from
 * `src/components/`.
 */

const SEED = 0x25029

/** mulberry32 — tiny seeded PRNG, uniform in [0, 1). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(SEED)

function pick<T>(pool: readonly T[]): T {
  return pool[Math.floor(rand() * pool.length)]
}

function rangeInt(min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/** ISO date offset in days from 2026-07-01 (UTC to avoid TZ drift). */
const EPOCH_MS = Date.UTC(2026, 6, 1)
function isoDate(dayOffset: number): string {
  return new Date(EPOCH_MS + dayOffset * 86_400_000).toISOString().slice(0, 10)
}

const counterparties = [
  // the six stub names
  "Prairie Grain Co.",
  "Midwest Ag Trust",
  "North Plains Elevator",
  "Boreal Canola Ltd.",
  "River Valley Farms",
  "Golden Fields Coop",
  // four new
  "Heartland Commodities",
  "Lakehead Grain Exchange",
  "Sunrise Elevator Group",
  "Cedar Ridge Ag",
] as const

const commodities = [
  { name: "corn", min: 4.2, max: 5.1 },
  { name: "soy", min: 10.8, max: 11.6 },
  { name: "wheat", min: 5.6, max: 6.4 },
  { name: "canola", min: 14.4, max: 15.3 },
] as const

const notesPool = [
  "Rail delivery.",
  "Delivery split across two elevators.",
  "Basis fixed at signing.",
  "Awaiting counterparty signature.",
  "Truck freight, buyer arranged.",
] as const

/** Weighted contract status: draft 20% / active 45% / settled 25% / cancelled 10%. */
function contractStatusDraw(): "draft" | "active" | "settled" | "cancelled" {
  const r = rand()
  if (r < 0.2) return "draft"
  if (r < 0.65) return "active"
  if (r < 0.9) return "settled"
  return "cancelled"
}

/** Weighted settlement status for partials on active contracts. */
function partialStatusDraw(): "pending" | "confirmed" | "reversed" {
  const r = rand()
  if (r < 0.5) return "pending"
  if (r < 0.9) return "confirmed"
  return "reversed"
}

function coordAxis(): number {
  return 5 + Math.round(rand() * 90)
}

function clampCoord(n: number): number {
  return Math.min(95, Math.max(5, Math.round(n)))
}

function generate(): { contracts: ObjectRow[]; settlements: ObjectRow[] } {
  const contracts: ObjectRow[] = []
  for (let i = 0; i < 60; i++) {
    const commodity = pick(commodities)
    const startOffset = rangeInt(0, 230) // Jul 2026 … mid-Feb 2027
    const spanDays = rangeInt(14, 42) // 2–6 weeks
    contracts.push({
      id: `K-25${String(i + 1).padStart(3, "0")}`,
      coord: { x: coordAxis(), y: coordAxis() },
      counterparty: pick(counterparties),
      commodity: commodity.name,
      quantity: rangeInt(10, 80) * 500, // 5,000–40,000 bu in 500 steps
      unitPrice: round2(commodity.min + rand() * (commodity.max - commodity.min)),
      deliveryStart: isoDate(startOffset),
      deliveryEnd: isoDate(startOffset + spanDays),
      status: contractStatusDraw(),
      notes: rand() < 0.25 ? pick(notesPool) : "",
    })
  }

  const settlements: ObjectRow[] = []
  let serial = 0
  const push = (
    contract: ObjectRow,
    fraction: number,
    status: "pending" | "confirmed" | "reversed",
  ) => {
    serial += 1
    const coord = contract.coord
    const quantity = contract.quantity as number
    const unitPrice = contract.unitPrice as number
    const endOffset = Math.round(
      (Date.UTC(
        Number((contract.deliveryEnd as string).slice(0, 4)),
        Number((contract.deliveryEnd as string).slice(5, 7)) - 1,
        Number((contract.deliveryEnd as string).slice(8, 10)),
      ) -
        EPOCH_MS) /
        86_400_000,
    )
    settlements.push({
      id: `S-92${String(serial).padStart(3, "0")}`,
      coord: { x: clampCoord(coord.x + (rand() * 8 - 4)), y: clampCoord(coord.y + (rand() * 8 - 4)) },
      contractId: contract.id,
      settledAt: isoDate(endOffset + rangeInt(1, 10)),
      settledQuantity: Math.round((quantity * fraction) / 500) * 500 || 500,
      settlementPrice: round2(unitPrice + (rand() * 0.1 - 0.05)),
      status,
    })
  }

  for (const contract of contracts) {
    if (contract.status === "settled") {
      // one or two settlements closing out the contract
      if (rand() < 0.5) {
        const split = 0.3 + rand() * 0.4
        push(contract, split, "confirmed")
        // occasionally the second leg was reversed and re-cut (stub
        // precedent: S-90316 on settled K-24086)
        push(contract, 1 - split, rand() < 0.2 ? "reversed" : "confirmed")
      } else {
        push(contract, 1, "confirmed")
      }
    } else if (contract.status === "active" && rand() < 1 / 3) {
      // a partial delivery in flight
      push(contract, 0.2 + rand() * 0.4, partialStatusDraw())
    }
  }

  return { contracts, settlements }
}

const generated = generate()

/** 60 deterministic contracts, IDs K-25001…K-25060. */
export const demoContractRows: ObjectRow[] = generated.contracts

/**
 * Settlements referencing the demo contracts via `contractId` —
 * full closes for settled contracts, partials for ~⅓ of active ones.
 * IDs S-92001…
 */
export const demoSettlementRows: ObjectRow[] = generated.settlements

/** Rows indexable by object key, mirroring `objectRowsRegistry`'s shape. */
export const demoDataset = {
  contract: demoContractRows,
  settlement: demoSettlementRows,
} satisfies Record<string, readonly ObjectRow[]>
