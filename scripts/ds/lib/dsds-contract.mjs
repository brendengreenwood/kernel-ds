export const DSDS_COMPATIBILITY_CONTRACT_VERSION = 2

export const kernelKindToDsdsKind = Object.freeze({
  component: "component",
  pattern: "pattern",
  element: "component",
  object: "pattern",
  domain: "pattern",
})

export function mapCatalogEntityContract(entity) {
  const kind = kernelKindToDsdsKind[entity.kind]
  if (kind === undefined) {
    throw new Error(`Unsupported Kernel catalog kind: ${entity.kind}`)
  }

  const identifier = entity.id.split(".").slice(1).join(".")
  if (!/^[a-z][a-z0-9-]*$/.test(identifier)) {
    throw new Error(`Kernel entity ID cannot produce a valid DSDS identifier: ${entity.id}`)
  }

  return {
    kind,
    identifier,
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
    },
  }
}
