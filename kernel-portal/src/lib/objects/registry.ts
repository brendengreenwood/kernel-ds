import type { ObjectModel, ObjectRow } from "./types.ts"

/**
 * Runtime object registry — the mechanism that makes objects data.
 *
 * Objects arrive through `registerObject` (static seeds in `index.ts`
 * use the same path a JSON-defined object will), and React surfaces
 * subscribe via `subscribeToRegistry` + `getRegistrySnapshot` (see
 * `use-object-registry.ts`). UI-agnostic: no react, no component
 * imports — the file stays loadable from Node scripts and checks.
 */

export interface ObjectRegistrySnapshot {
  readonly models: Readonly<Record<string, ObjectModel>>
  readonly rows: Readonly<Record<string, readonly ObjectRow[]>>
}

const models: Record<string, ObjectModel> = {}
const rowsByKey: Record<string, readonly ObjectRow[]> = {}
const listeners = new Set<() => void>()

/**
 * Cached snapshot, replaced only inside `registerObject`. The stable
 * reference between registrations is what `useSyncExternalStore`
 * requires — returning a fresh object per read would loop React.
 */
let snapshot: ObjectRegistrySnapshot = { models: {}, rows: {} }

/**
 * Register (or re-register) an object. Idempotent by `model.key`:
 * registering an existing key replaces its model + rows and notifies
 * subscribers. This is the only write path into the registry.
 */
export function registerObject(model: ObjectModel, rows: readonly ObjectRow[]): void {
  models[model.key] = model
  rowsByKey[model.key] = rows
  snapshot = { models: { ...models }, rows: { ...rowsByKey } }
  for (const listener of listeners) listener()
}

export function getObjectModel(key: string): ObjectModel | undefined {
  return models[key]
}

export function getObjectRows(key: string): readonly ObjectRow[] {
  return rowsByKey[key] ?? []
}

export function listObjectKeys(): string[] {
  return Object.keys(models)
}

/** Stable between registrations — safe for `useSyncExternalStore`. */
export function getRegistrySnapshot(): ObjectRegistrySnapshot {
  return snapshot
}

export function subscribeToRegistry(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
