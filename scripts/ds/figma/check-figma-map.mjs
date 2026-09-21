import { existsSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { checkFigmaProjection, FIGMA_MAP_PATH } from "../prototype/projection.mjs"
import { loadPrototypeRegistry } from "../prototype/store.mjs"
import { validatePrototypeRegistry } from "../prototype/validator.mjs"

const REGISTRY_PATH = "docs/prototypes/registry.json"
const FIGMA_ISSUE_CODES = new Set(["invalid-figma-file", "invalid-figma-reference", "unknown-entity"])

/**
 * Reuse the canonical prototype registry validator and generated-projection
 * freshness check. The Figma map is compatibility output, never a second
 * hand-authored authority.
 */
export function collectFigmaMapViolations(entities, root) {
  const registryFile = resolve(root, REGISTRY_PATH)
  if (!existsSync(registryFile)) return [{ code: "prototype-registry-missing", message: `${REGISTRY_PATH} is missing` }]
  let registry
  try {
    registry = loadPrototypeRegistry(registryFile)
  } catch (error) {
    return [{ code: "prototype-registry-invalid", message: `${REGISTRY_PATH} is not valid JSON: ${error.message}` }]
  }
  const violations = validatePrototypeRegistry(registry, { entities, root })
    .filter((entry) => FIGMA_ISSUE_CODES.has(entry.code))
    .map((entry) => ({ code: entry.code, message: `${entry.path}: ${entry.message}` }))
  if (registry.figma?.compatibility) {
    const projection = checkFigmaProjection(resolve(root, FIGMA_MAP_PATH), registry)
    if (!projection.ok) violations.push({ code: "figma-map-stale", message: projection.message })
  }
  return violations
}

/** Coverage report derived from registry Figma surfaces, by catalog kind. */
export function figmaCoverage(entities, root) {
  const registryFile = resolve(root, REGISTRY_PATH)
  const registry = existsSync(registryFile) ? loadPrototypeRegistry(registryFile) : { initiatives: [] }
  const mapped = new Set(registry.initiatives.filter((initiative) => initiative.surfaces?.figma?.length).flatMap((initiative) => initiative.entityIds))
  const byKind = {}
  for (const entity of entities) {
    byKind[entity.kind] ??= { total: 0, mapped: 0 }
    byKind[entity.kind].total += 1
    if (mapped.has(entity.id)) byKind[entity.kind].mapped += 1
  }
  return byKind
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const { catalogEntitiesFile, repoRoot } = await import("../lib/context.mjs")
  const { parseCatalogFile } = await import("../lib/catalog-file.mjs")
  const { entities } = parseCatalogFile(catalogEntitiesFile)
  const violations = collectFigmaMapViolations(entities, repoRoot)
  for (const violation of violations) console.error(`FIGMA-MAP ${violation.code}: ${violation.message}`)
  const coverage = figmaCoverage(entities, repoRoot)
  for (const [kind, { mapped, total }] of Object.entries(coverage)) console.log(`FIGMA-COVERAGE ${kind}: ${mapped}/${total}`)
  if (violations.length > 0) {
    console.error(`FIGMA-MAP-FAILED: ${violations.length} violations`)
    process.exitCode = 1
  } else {
    console.log("FIGMA-MAP-OK: generated projection is current with the prototype registry")
  }
}
