/**
 * Object model — public surface.
 *
 * Objects are registered at runtime through `registerObject`. The two
 * static objects, Contract and Settlement, seed through the same path
 * any JSON-defined object uses, so everything downstream of the
 * registry is provably registration-agnostic.
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

export {
  registerObject,
  getObjectModel,
  getObjectRows,
  listObjectKeys,
  getRegistrySnapshot,
  subscribeToRegistry,
  type ObjectRegistrySnapshot,
} from "./registry.ts"
export {
  parseWorkspacePreset,
  workspacePresetSchema,
  type WorkspacePreset,
  type WorkspacePresetMode,
  type WorkspaceNavigatorIdiom,
} from "./workspace-preset.ts"


import { contractModel, contractRows } from "./contract.ts"
import { settlementModel, settlementRows } from "./settlement.ts"
import { getRegistrySnapshot, registerObject } from "./registry.ts"
import type { ObjectModel, ObjectRow } from "./types.ts"

// Seed the static objects through the runtime path.
registerObject(contractModel, contractRows)
registerObject(settlementModel, settlementRows)

/**
 * Object keys are open — any registered key is valid. The alias is kept
 * so existing imports stay working; it is now honestly `string`.
 */
export type ObjectKey = string

function liveView<T>(read: () => Readonly<Record<string, T>>): Readonly<Record<string, T>> {
  return new Proxy({} as Record<string, T>, {
    get: (_t, key) => (typeof key === "string" ? read()[key] : undefined),
    has: (_t, key) => typeof key === "string" && key in read(),
    ownKeys: () => Object.keys(read()),
    getOwnPropertyDescriptor: (_t, key) => {
      if (typeof key !== "string" || !(key in read())) return undefined
      return { value: read()[key], enumerable: true, configurable: true, writable: false }
    },
    set: () => false,
    deleteProperty: () => false,
  })
}

/**
 * Live, read-only views over the registry, API-compatible with the old
 * const exports: property access and `Object.keys()` reflect current
 * registrations. Mutation throws — registration flows through
 * `registerObject` only.
 */
export const objectRegistry: Readonly<Record<string, ObjectModel>> = liveView(
  () => getRegistrySnapshot().models
)
export const objectRowsRegistry: Readonly<Record<string, readonly ObjectRow[]>> = liveView(
  () => getRegistrySnapshot().rows
)
