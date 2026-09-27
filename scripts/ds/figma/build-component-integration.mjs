import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { loadComponentScope, stableJson } from "./component-scope.mjs"

export const MANIFEST_SCHEMA = "kernel-ds/figma-component-integration@1"
export const MANIFEST_PATH = "docs/figma/component-integration.json"

const repoRoot = resolve(fileURLToPath(new URL("../../..", import.meta.url)))

function readJson(path, fallback = null) {
  const absolute = resolve(repoRoot, path)
  return existsSync(absolute) ? JSON.parse(readFileSync(absolute, "utf8")) : fallback
}

export function buildComponentIntegrationManifest() {
  const scope = loadComponentScope()
  const contracts = readJson("docs/figma/component-contracts.json")
  const evidence = readJson("docs/figma/component-evidence.json", { records: [] })
  const figmaMap = readJson("docs/figma/figma-map.json")
  if (contracts?.$schema !== "kernel-ds/figma-component-contracts@1") throw new Error("Missing or invalid generated component contracts")
  if (!Array.isArray(evidence.records)) throw new Error("Invalid component evidence")

  const contractsById = new Map(contracts.components.map((item) => [item.entityId, item]))
  const evidenceById = new Map(evidence.records.map((item) => [item.entityId, item]))
  if (contractsById.size !== scope.components.length) throw new Error("Component contract scope is stale")
  if (evidenceById.size !== evidence.records.length) throw new Error("Duplicate component evidence")

  const components = scope.components.map((entity) => {
    const contract = contractsById.get(entity.id)
    const live = evidenceById.get(entity.id) ?? null
    if (!contract) throw new Error(`Missing component contract for ${entity.id}`)
    if (live && live.contractHash !== contract.contractHash) throw new Error(`Stale component evidence for ${entity.id}`)
    return {
      entityId: entity.id,
      name: entity.name,
      maturity: entity.maturity,
      sourceFiles: entity.sourceFiles,
      documentation: entity.documentation,
      publicModules: scope.api.modules.filter((entry) => entry.catalogBacked && entity.sourceFiles.some((path) => path.endsWith(`/${entry.module}.tsx`))).map((entry) => entry.module).sort(),
      figma: live ? {
        status: "integrated",
        nodeId: live.nodeId,
        key: live.mainComponentKey,
        kind: live.nodeType,
        page: "Components",
        sectionId: live.sectionId,
        sectionName: live.sectionName,
        auditedAt: live.auditedAt,
      } : {
        status: "not-started",
        nodeId: null,
        key: null,
        kind: null,
        page: "Components",
        sectionId: null,
        sectionName: null,
        auditedAt: null,
      },
      contract: {
        contractHash: contract.contractHash,
        sourceHash: contract.sourceHash,
        variantAxes: contract.variantAxes,
        publicProperties: contract.publicProperties,
        propTypeExpressions: contract.propTypeExpressions,
        slots: contract.slots,
        requiredTokenRoles: contract.requiredTokenRoles,
        notes: contract.notes,
      },
      lifecycle: {
        canonicalOwner: "@kernel/ui",
        canonicalSource: "code",
        figmaStatus: live ? "audited" : "unmapped",
        promotionBlockedUntil: live ? [] : ["contract-extracted", "semantic-tokens-bound", "accessibility-audited", "page-layout-verified"],
      },
    }
  })

  return {
    $schema: MANIFEST_SCHEMA,
    manifestVersion: 1,
    direction: "code-to-figma",
    authority: { identity: "@kernel/catalog", componentContract: "@kernel/ui", tokens: "packages/ui/src/styles.css", figmaFile: figmaMap.file },
    policy: {
      identityKey: "catalog entityId",
      mutationDirection: "one-way-per-approved-operation",
      defaultLifecycle: "exploration",
      requiredVerification: ["variant-and-property-parity", "semantic-token-bindings", "accessibility", "targeted-screenshot", "full-page-layout-screenshot"],
      forbidden: ["legacy-radius-inheritance", "hardcoded-semantic-colors", "orphan-component-identities", "opportunistic-canvas-coordinates", "silent-lifecycle-promotion"],
    },
    coverage: {
      catalogOwnedComponents: components.length,
      integrated: components.filter((entry) => entry.figma.status === "integrated").length,
      notStarted: components.filter((entry) => entry.figma.status === "not-started").length,
      packageIntegration: `${components.filter((entry) => entry.figma.status === "integrated").length}/${components.length}`,
      nonCatalogPublicModules: [...scope.nonCatalogPublicModules].sort(),
    },
    tokenPrerequisites: {
      geometry: { control: "radius/control = 4", surface: "radius/surface = 8", floating: "radius/floating = 8", modal: "radius/modal = 8", connectedSeam: "0" },
      controlHeights: ["control-h-sm", "control-h", "control-h-lg"],
      semanticCollections: ["Kernel Semantic", "Kernel Metrics", "Kernel Primitives"],
    },
    components,
  }
}

export function writeComponentIntegrationManifest() {
  const manifest = buildComponentIntegrationManifest()
  writeFileSync(resolve(repoRoot, MANIFEST_PATH), stableJson(manifest))
  return manifest
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const manifest = writeComponentIntegrationManifest()
    console.log(`FIGMA-INTEGRATION-MANIFEST-OK: ${manifest.coverage.catalogOwnedComponents} components; ${manifest.coverage.integrated} integrated; ${manifest.coverage.notStarted} not started`)
  } catch (error) {
    console.error(`FIGMA-INTEGRATION-MANIFEST-FAILED: ${error.message}`)
    process.exitCode = 1
  }
}
