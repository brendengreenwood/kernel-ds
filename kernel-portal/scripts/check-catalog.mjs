import { spawnSync } from "node:child_process"
import { access } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

if (!process.execArgv.includes("--experimental-strip-types")) {
  const result = spawnSync(process.execPath, ["--experimental-strip-types", fileURLToPath(import.meta.url)], {
    cwd: process.cwd(),
    stdio: "inherit",
  })
  process.exit(result.status ?? 1)
}

const portalRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const repoRoot = resolve(portalRoot, "..")
const [{ catalog, selectPortalLifecycleMeta, validateCatalog }, { componentMeta }, store] = await Promise.all([
  import("../../packages/catalog/src/index.ts"),
  import("../src/lib/component-meta.ts"),
  import("../../scripts/ds/lib/catalog-file.mjs"),
])

const issues = validateCatalog(catalog)
const expectedLifecycle = selectPortalLifecycleMeta(catalog)
const uniqueDocSlugs = new Set(catalog.flatMap((entity) => entity.documentation.slug ? [entity.documentation.slug] : []))

if (JSON.stringify(componentMeta) !== JSON.stringify(expectedLifecycle)) {
  issues.push({ code: "invalid-entity", message: "Portal lifecycle adapter differs from catalog selectors" })
}
if (componentMeta.length !== catalog.length) {
  issues.push({ code: "invalid-entity", message: `Lifecycle adapter has ${componentMeta.length} entities; catalog has ${catalog.length}` })
}

// entities.ts is generated from the per-entity JSON store; fail when stale.
const entitiesFile = resolve(repoRoot, "packages/catalog/src/entities.ts")
if (store.hasCatalogStore(entitiesFile)) {
  const parsed = store.parseCatalogFile(entitiesFile)
  const expected = store.generateEntitiesSource(parsed, store.readCatalogStore(store.catalogStoreDir(entitiesFile)))
  if (expected !== store.serializeCatalogFile(parsed)) {
    issues.push({ code: "invalid-entity", message: "entities.ts is stale; regenerate it from packages/catalog/src/entities/*.json" })
  }
}

for (const entity of catalog) {
  for (const path of [entity.documentation.sourceFile, ...entity.sourceFiles].filter(Boolean)) {
    try {
      await access(resolve(repoRoot, path))
    } catch {
      issues.push({ code: "invalid-entity", entityId: entity.id, message: `${entity.id} references missing source ${path}` })
    }
  }
}

if (issues.length > 0) {
  for (const issue of issues) console.error(`CATALOG ${issue.code}: ${issue.message}`)
  process.exit(1)
}

console.log(`CATALOG-OK: ${catalog.length} entities, ${uniqueDocSlugs.size} documentation records, 0 violations`)
