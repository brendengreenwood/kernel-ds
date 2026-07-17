/**
 * Object model — public re-exports.
 *
 * The stub covers two objects: Contract and Settlement. Later
 * segments consume `objectRegistry` and `objectRowsRegistry` to
 * demonstrate the object-centric IA against real data.
 */

export type {
  ObjectId,
  ObjectStatus,
  ObjectField,
  ObjectAssociation,
  ObjectModel,
  ObjectRow,
  StatusTone,
  FieldType,
} from "./types.ts"

export { contractModel, contractRows } from "./contract.ts"
export { settlementModel, settlementRows } from "./settlement.ts"

import { contractModel, contractRows } from "./contract.ts"
import { settlementModel, settlementRows } from "./settlement.ts"

export const objectRegistry = {
  contract: contractModel,
  settlement: settlementModel,
} as const

export const objectRowsRegistry = {
  contract: contractRows,
  settlement: settlementRows,
} as const

export type ObjectKey = keyof typeof objectRegistry
