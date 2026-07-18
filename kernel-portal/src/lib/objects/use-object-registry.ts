import { useSyncExternalStore } from "react"
// Side-effect import: evaluating the barrel seeds Contract + Settlement
// through `registerObject` before any component reads the snapshot.
import "./index.ts"
import {
  getRegistrySnapshot,
  subscribeToRegistry,
  type ObjectRegistrySnapshot,
} from "./registry.ts"

/**
 * React binding for the runtime object registry. Components that render
 * "every registered object" (Designs) subscribe here so runtime
 * registrations re-render them. Kept out of `registry.ts` so the
 * registry itself stays React-free.
 */
export function useObjectRegistry(): ObjectRegistrySnapshot {
  return useSyncExternalStore(subscribeToRegistry, getRegistrySnapshot)
}
