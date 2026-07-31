import type { CatalogEntity } from "./schema.ts"
import type { AccessibilityState, EntityKind, Maturity } from "./taxonomy.ts"

export type PortalLifecycleMeta = {
  name: string
  anchor: string
  group: EntityKind
  maturity: Maturity
  a11y: AccessibilityState
  note?: string
}

const kindOrder: Record<EntityKind, number> = {
  component: 0,
  element: 1,
  pattern: 2,
  domain: 3,
  object: 4,
}

export function selectPortalLifecycleMeta(entities: readonly CatalogEntity[]): PortalLifecycleMeta[] {
  return entities
    .map((entity) => ({
      name: entity.name,
      anchor: entity.documentation.portalAnchor,
      group: entity.kind,
      maturity: entity.maturity,
      a11y: entity.accessibility,
      ...(entity.note ? { note: entity.note } : {}),
    }))
    .sort((left, right) => kindOrder[left.group] - kindOrder[right.group] || left.name.localeCompare(right.name))
}

export function selectEntitiesByKind(entities: readonly CatalogEntity[], kind: EntityKind): CatalogEntity[] {
  return entities.filter((entity) => entity.kind === kind).sort((left, right) => left.name.localeCompare(right.name))
}

export function selectEntitiesByMaturity(entities: readonly CatalogEntity[], maturity: Maturity): CatalogEntity[] {
  return entities.filter((entity) => entity.maturity === maturity).sort((left, right) => left.name.localeCompare(right.name))
}

export function selectPortalAnchors(entities: readonly CatalogEntity[]): string[] {
  return [...new Set(entities.map((entity) => entity.documentation.portalAnchor))].sort()
}
