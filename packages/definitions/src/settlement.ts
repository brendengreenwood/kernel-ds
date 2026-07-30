import type { ObjectModel, ObjectRow } from "./types.ts"

/**
 * Settlement — closes out a delivered portion of a Contract. One
 * contract may have multiple settlements (partial deliveries). Every
 * settlement carries a `contractId` referencing its parent contract.
 */
export const settlementModel: ObjectModel = {
  key: "settlement",
  label: "Settlement",
  plural: "Settlements",
  fields: [
    { key: "id", label: "Settlement #", type: "text", sample: "S-90312" },
    { key: "contractId", label: "Contract", type: "ref", sample: "K-24081" },
    { key: "settledAt", label: "Settled at", type: "date", sample: "2026-08-14" },
    { key: "settledQuantity", label: "Quantity (bu)", type: "number", sample: 8500 },
    { key: "settlementPrice", label: "Settlement price", type: "money", sample: 4.72 },
    { key: "status", label: "Status", type: "status", sample: "confirmed" },
  ],
  statuses: [
    { key: "pending", label: "Pending", tone: "warning" },
    { key: "confirmed", label: "Confirmed", tone: "success" },
    { key: "reversed", label: "Reversed", tone: "danger" },
  ],
  associations: [
    { key: "contract", label: "Contract", targetObjectKey: "contract" },
  ],
}

export const settlementRows: ObjectRow[] = [
  {
    id: "S-90312",
    coord: { x: 24, y: 20 },
    contractId: "K-24081",
    settledAt: "2026-08-14",
    settledQuantity: 8500,
    settlementPrice: 4.72,
    status: "confirmed",
  },
  {
    id: "S-90313",
    coord: { x: 26, y: 23 },
    contractId: "K-24081",
    settledAt: "2026-08-24",
    settledQuantity: 9000,
    settlementPrice: 4.71,
    status: "pending",
  },
  {
    id: "S-90314",
    coord: { x: 42, y: 29 },
    contractId: "K-24082",
    settledAt: "2026-07-30",
    settledQuantity: 18500,
    settlementPrice: 11.15,
    status: "confirmed",
  },
  {
    id: "S-90315",
    coord: { x: 50, y: 77 },
    contractId: "K-24086",
    settledAt: "2026-08-04",
    settledQuantity: 12000,
    settlementPrice: 11.32,
    status: "confirmed",
  },
  {
    id: "S-90316",
    coord: { x: 53, y: 80 },
    contractId: "K-24086",
    settledAt: "2026-08-18",
    settledQuantity: 10000,
    settlementPrice: 11.28,
    status: "reversed",
  },
  {
    id: "S-90317",
    coord: { x: 70, y: 84 },
    contractId: "K-24087",
    settledAt: "2026-09-20",
    settledQuantity: 14000,
    settlementPrice: 5.98,
    status: "pending",
  },
]
