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
const [{ catalog, selectPortalLifecycleMeta, validateCatalog }, { componentMeta }] = await Promise.all([
  import("../../packages/catalog/src/index.ts"),
  import("../src/lib/component-meta.ts"),
])

const issues = validateCatalog(catalog)
const expectedLifecycle = selectPortalLifecycleMeta(catalog)
const uniqueDocSlugs = new Set(catalog.flatMap((entity) => entity.documentation.slug ? [entity.documentation.slug] : []))

if (JSON.stringify(componentMeta) !== JSON.stringify(expectedLifecycle)) {
  issues.push({ code: "invalid-entity", message: "Portal lifecycle adapter differs from catalog selectors" })
}
if (catalog.length !== 97 || componentMeta.length !== 97) {
  issues.push({ code: "invalid-entity", message: `Expected 97 catalog and lifecycle entities; found ${catalog.length} and ${componentMeta.length}` })
}
if (uniqueDocSlugs.size !== 85) {
  issues.push({ code: "invalid-entity", message: `Catalog references ${uniqueDocSlugs.size} unique docs; expected 85` })
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
