/**
 * Portal lifecycle metadata derives from the canonical @kernel/catalog inventory.
 * Keep this adapter's public contract stable for portal callers; edit catalog
 * entities and run `npm run catalog:generate` from the repository root.
 */
export { componentMeta, components } from "./component-meta.generated.ts"
export type { PortalLifecycleMeta as ComponentMeta, Maturity } from "@kernel/catalog"
