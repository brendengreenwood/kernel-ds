import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseCatalogFile } from "../lib/catalog-file.mjs"

export const repoRoot = resolve(fileURLToPath(new URL("../../..", import.meta.url)))
export const COMPONENT_SCOPE_SCHEMA = "kernel-ds/figma-component-scope@1"
export const EXPECTED_COMPONENT_COUNT = 62
// Experimental @kernel/ui components not yet built in the Figma library (decision 0084).
// Remove an entry once its Figma family exists; the scope count then rises with it.
export const FIGMA_DEFERRED_COMPONENTS = new Set(["component.panes"])
export const EXPECTED_ELEMENT_COUNT = 3
export const EXPECTED_NON_CATALOG_MODULE_COUNT = 3

export function readJson(path) {
  return JSON.parse(readFileSync(resolve(repoRoot, path), "utf8"))
}

export function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex")
}

export function loadComponentScope() {
  const { entities } = parseCatalogFile(resolve(repoRoot, "packages/catalog/src/entities.ts"))
  const api = readJson("packages/ui/api.json")
  const components = entities
    .filter((entity) => entity.kind === "component" && entity.package === "@kernel/ui")
    .filter((entity) => !FIGMA_DEFERRED_COMPONENTS.has(entity.id))
    .sort((a, b) => a.id.localeCompare(b.id))
  const elementModules = new Set(["animated-number", "border-beam", "commodity-badge"])
  const elements = entities
    .filter((entity) => entity.kind === "element" && entity.sourceFiles.some((path) => elementModules.has(path.match(/\/([^/]+)\.tsx$/)?.[1])))
    .sort((a, b) => a.id.localeCompare(b.id))
  const nonCatalogPublicModules = api.modules
    .filter((entry) => !entry.catalogBacked)
    .map((entry) => entry.module)
    .sort()

  if (components.length !== EXPECTED_COMPONENT_COUNT) throw new Error(`Expected ${EXPECTED_COMPONENT_COUNT} @kernel/ui components, found ${components.length}`)
  if (elements.length !== EXPECTED_ELEMENT_COUNT) throw new Error(`Expected ${EXPECTED_ELEMENT_COUNT} @kernel/ui elements, found ${elements.length}`)
  if (nonCatalogPublicModules.length !== EXPECTED_NON_CATALOG_MODULE_COUNT) throw new Error(`Expected ${EXPECTED_NON_CATALOG_MODULE_COUNT} non-catalog modules, found ${nonCatalogPublicModules.length}`)

  return {
    $schema: COMPONENT_SCOPE_SCHEMA,
    components,
    elements,
    nonCatalogPublicModules,
    api,
  }
}

export function componentScopeRecord(scope = loadComponentScope()) {
  return {
    $schema: COMPONENT_SCOPE_SCHEMA,
    componentEntityIds: scope.components.map((entity) => entity.id),
    elementEntityIds: scope.elements.map((entity) => entity.id),
    nonCatalogPublicModules: scope.nonCatalogPublicModules,
  }
}

export function validateEntityIds(ids, allowedIds, label) {
  if (!Array.isArray(ids) || ids.length === 0) throw new Error(`${label} must contain at least one entity ID`)
  const unique = new Set(ids)
  if (unique.size !== ids.length) throw new Error(`${label} contains duplicate entity IDs`)
  const unknown = ids.filter((id) => !allowedIds.has(id))
  if (unknown.length) throw new Error(`${label} contains unknown entity IDs: ${unknown.join(", ")}`)
  return [...ids].sort()
}
