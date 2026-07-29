import {
  accessibilityStates,
  entityCapabilities,
  entityKinds,
  entityTags,
  maturityLevels,
  packageOwners,
  relationshipTypes,
  type AccessibilityState,
  type EntityCapability,
  type EntityKind,
  type EntityTag,
  type Maturity,
  type PackageOwner,
  type RelationshipType,
} from "./taxonomy.ts"

export type CatalogRelationship = {
  type: RelationshipType
  target: string
}

export type CatalogDocumentation = {
  slug?: string
  sourceFile?: string
  portalAnchor: string
}

export type CatalogAiReference = {
  bundleCategory: "general" | "design"
  guidanceSource: "component-docs" | "composition-contract" | "lifecycle-metadata"
}

export type CatalogEntity = {
  id: `${EntityKind}.${string}`
  name: string
  kind: EntityKind
  maturity: Maturity
  accessibility: AccessibilityState
  package: PackageOwner
  tags: readonly EntityTag[]
  capabilities: readonly EntityCapability[]
  relationships: readonly CatalogRelationship[]
  documentation: CatalogDocumentation
  ai: CatalogAiReference
  sourceFiles: readonly string[]
  note?: string
}

const entityIdPattern = /^(component|pattern|element|object|domain)\.[a-z0-9]+(?:-[a-z0-9]+)*$/
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type CatalogIssue = {
  code: "invalid-entity" | "invalid-taxonomy" | "duplicate-id" | "illegal-relationship" | "missing-relationship-target"
  entityId?: string
  message: string
}

export function validateCatalog(entities: readonly CatalogEntity[]): CatalogIssue[] {
  const issues: CatalogIssue[] = []
  const ids = new Set<string>()

  for (const entity of entities) {
    if (
      !entityIdPattern.test(entity.id) ||
      !entity.id.startsWith(`${entity.kind}.`) ||
      !entity.name.trim() ||
      !entity.documentation.portalAnchor.trim() ||
      (entity.documentation.slug !== undefined && !slugPattern.test(entity.documentation.slug))
    ) {
      issues.push({ code: "invalid-entity", entityId: entity.id, message: `Invalid catalog entity: ${entity.id}` })
    }

    if (
      !entityKinds.includes(entity.kind) ||
      !maturityLevels.includes(entity.maturity) ||
      !accessibilityStates.includes(entity.accessibility) ||
      !packageOwners.includes(entity.package) ||
      entity.tags.some((tag) => !entityTags.includes(tag)) ||
      entity.capabilities.some((capability) => !entityCapabilities.includes(capability))
    ) {
      issues.push({ code: "invalid-taxonomy", entityId: entity.id, message: `Invalid taxonomy value on ${entity.id}` })
    }

    if (ids.has(entity.id)) {
      issues.push({ code: "duplicate-id", entityId: entity.id, message: `Duplicate catalog entity id: ${entity.id}` })
    }
    ids.add(entity.id)
  }

  for (const entity of entities) {
    for (const relationship of entity.relationships) {
      if (!relationshipTypes.includes(relationship.type)) {
        issues.push({
          code: "illegal-relationship",
          entityId: entity.id,
          message: `${entity.id} uses illegal relationship type ${relationship.type}`,
        })
      } else if (!ids.has(relationship.target)) {
        issues.push({
          code: "missing-relationship-target",
          entityId: entity.id,
          message: `${entity.id} has ${relationship.type} relationship to missing target ${relationship.target}`,
        })
      }
    }
  }

  return issues
}
