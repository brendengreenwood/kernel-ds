export const DSDS_COMPATIBILITY_CONTRACT_VERSION = 1

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

  return {
    kind,
    identifier: entity.id,
    extensions: {
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
