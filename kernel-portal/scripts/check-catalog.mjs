import { spawnSync } from "node:child_process"
import { access, mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
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
const [{ catalog, validateCatalog }, { componentMeta }] = await Promise.all([
  import("../../packages/catalog/src/index.ts"),
  import("../src/lib/component-meta.ts"),
])

const issues = validateCatalog(catalog)
const expectedByKey = new Map(componentMeta.map((entity) => [`${entity.group}:${entity.name}`, entity]))
const uniqueDocSlugs = new Set(catalog.flatMap((entity) => entity.documentation.slug ? [entity.documentation.slug] : []))

for (const entity of catalog) {
  const expected = expectedByKey.get(`${entity.kind}:${entity.name}`)
  if (!expected) {
    issues.push({ code: "invalid-entity", entityId: entity.id, message: `${entity.id} has no lifecycle metadata source` })
    continue
  }
  if (
    entity.maturity !== expected.maturity ||
    entity.accessibility !== expected.a11y ||
    entity.documentation.portalAnchor !== expected.anchor ||
    entity.note !== expected.note
  ) {
    issues.push({ code: "invalid-entity", entityId: entity.id, message: `${entity.id} differs from lifecycle metadata` })
  }
}

if (catalog.length !== componentMeta.length) {
  issues.push({ code: "invalid-entity", message: `Catalog has ${catalog.length} entities; lifecycle metadata has ${componentMeta.length}` })
}
if (uniqueDocSlugs.size !== 81) {
  issues.push({ code: "invalid-entity", message: `Catalog references ${uniqueDocSlugs.size} unique docs; expected 81` })
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

const tempDir = await mkdtemp(resolve(tmpdir(), "kernel-catalog-"))
const generatedFiles = [resolve(tempDir, "entities-a.ts"), resolve(tempDir, "entities-b.ts")]
try {
  let migrationFailed = false
  for (const generatedFile of generatedFiles) {
    const migration = spawnSync(
      process.execPath,
      ["--experimental-strip-types", resolve(portalRoot, "scripts/migrate-catalog.mjs"), generatedFile],
      { cwd: repoRoot, encoding: "utf8" },
    )
    if (migration.status !== 0) {
      issues.push({ code: "invalid-entity", message: migration.stderr || migration.stdout || "Catalog migration failed" })
      migrationFailed = true
      break
    }
  }

  if (!migrationFailed) {
    const [firstGeneration, secondGeneration, trackedGeneration] = await Promise.all([
      readFile(generatedFiles[0], "utf8"),
      readFile(generatedFiles[1], "utf8"),
      readFile(resolve(repoRoot, "packages/catalog/src/entities.ts"), "utf8"),
    ])
    if (firstGeneration !== secondGeneration) {
      issues.push({ code: "invalid-entity", message: "Catalog migration is nondeterministic" })
    }
    if (firstGeneration !== trackedGeneration) {
      issues.push({ code: "invalid-entity", message: "Generated catalog is stale; run kernel-portal/scripts/migrate-catalog.mjs" })
    }
  }
} finally {
  await rm(tempDir, { recursive: true, force: true })
}

if (issues.length > 0) {
  for (const issue of issues) console.error(`CATALOG ${issue.code}: ${issue.message}`)
  process.exit(1)
}

console.log(`CATALOG-OK: ${catalog.length} entities, ${uniqueDocSlugs.size} documentation records, 0 violations`)
