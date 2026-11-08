export const DSDS_COMPATIBILITY_CONTRACT_VERSION = 3
export const PROTOTYPE_EXTENSION_CONTRACT_VERSION = 1

// DSDS 0.20+ dropped the "pattern" kind. Kernel kinds that are not
// components map to namespaced custom kinds (a first-class 0.23 feature)
// instead of collapsing into one bucket, so the DSDS document keeps the
// catalog's full taxonomy.
export const kernelKindToDsdsKind = Object.freeze({
  component: "component",
  pattern: "kernel.pattern",
  element: "component",
  object: "kernel.object",
  domain: "kernel.domain",
})

function prototypeExtension(entityId, registry) {
  const initiatives = (registry?.initiatives ?? [])
    .filter((initiative) => initiative.entityIds.includes(entityId))
    .map((initiative) => ({
      initiativeId: initiative.id,
      lifecycle: initiative.lifecycle,
      scopeKey: initiative.scopeKey,
      concerns: initiative.concerns
        .map(({ concern, state }) => ({ concern, state }))
        .sort((left, right) => left.concern.localeCompare(right.concern)),
    }))
    .sort((left, right) => left.initiativeId.localeCompare(right.initiativeId))
  return {
    contractVersion: PROTOTYPE_EXTENSION_CONTRACT_VERSION,
    initiatives,
  }
}

export function mapCatalogEntityContract(entity, registry) {
  const kind = kernelKindToDsdsKind[entity.kind]
  if (kind === undefined) {
    throw new Error(`Unsupported Kernel catalog kind: ${entity.kind}`)
  }

  const id = entity.id.split(".").slice(1).join(".")
  if (!/^[a-z][a-z0-9-]*$/.test(id)) {
    throw new Error(`Kernel entity ID cannot produce a valid DSDS entry id: ${entity.id}`)
  }

  return {
    kind,
    id,
    description: `The ${entity.name} ${entity.kind} from the Kernel design-system catalog.`,
    $extensions: {
      "com.kernel.catalog": {
        contractVersion: DSDS_COMPATIBILITY_CONTRACT_VERSION,
        kind: entity.kind,
        entityId: entity.id,
        package: entity.package,
        portalAnchor: entity.documentation.portalAnchor,
        sourceFiles: [...entity.sourceFiles],
        relationships: entity.relationships.map((relationship) => ({ ...relationship })),
      },
      "com.kernel.prototype": prototypeExtension(entity.id, registry),
    },
  }
}
