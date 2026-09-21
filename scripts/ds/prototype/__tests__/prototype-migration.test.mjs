import assert from "node:assert/strict"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"
import { parseCatalogFile } from "../../lib/catalog-file.mjs"
import { identifiableDriftIds, loadPrototypeMigration, validatePrototypeMigration } from "../migration.mjs"
import { checkFigmaProjection, checkPrototypeProjection, renderFigmaMap, renderPrototypeStatus } from "../projection.mjs"
import { loadPrototypeRegistry } from "../store.mjs"
import { validatePrototypeRegistry } from "../validator.mjs"

const repoRoot = resolve(fileURLToPath(new URL("../../../..", import.meta.url)))
const registry = loadPrototypeRegistry(resolve(repoRoot, "docs/prototypes/registry.json"))
const manifest = loadPrototypeMigration(repoRoot)
const figmaSnapshot = JSON.parse(readFileSync(resolve(repoRoot, "scripts/ds/__fixtures__/figma-map-pre-migration.json"), "utf8"))
const driftMarkdown = readFileSync(resolve(repoRoot, "docs/v2-prototype-drift.md"), "utf8")
const { entities } = parseCatalogFile(resolve(repoRoot, "packages/catalog/src/entities.ts"))

test("migration manifest classifies every Figma field and drift entry exactly once", () => {
  assert.deepEqual(validatePrototypeMigration(manifest, { root: repoRoot, figmaSnapshot, driftMarkdown, registry }), [])
  assert.equal(manifest.counts.figmaFields, 91)
  assert.equal(manifest.counts.driftEntries, 79)
  assert.equal(identifiableDriftIds(driftMarkdown).length, 79)
  assert.equal(manifest.counts.imported + manifest.counts.historicalOnly + manifest.counts.superseded + manifest.counts.duplicate, 79)
  assert.equal(new Set(manifest.figmaFields.map((entry) => entry.destination)).size, manifest.figmaFields.length)
})

test("every imported drift record resolves to a seeded concern and every exclusion explains itself", () => {
  const initiatives = new Map(registry.initiatives.map((initiative) => [initiative.id, initiative]))
  for (const entry of manifest.drift) {
    assert.ok(entry.rationale, `${entry.sourceId} must retain a migration rationale`)
    if (entry.disposition !== "imported") continue
    const initiative = initiatives.get(entry.initiativeId)
    assert.ok(initiative, `${entry.sourceId} target ${entry.initiativeId} must exist`)
    assert.ok(initiative.concerns.some((record) => record.concern === entry.concern), `${entry.sourceId} concern ${entry.concern} must exist`)
    assert.ok(entry.sourcePaths.every((sourcePath) => readFileSync(resolve(repoRoot, sourcePath))), `${entry.sourceId} source paths must remain live`)
  }
})

test("legacy imports remain distinct from explicit acceptance across unresolved, prototype-only, and Figma-only states", () => {
  assert.deepEqual(validatePrototypeRegistry(registry, { entities, root: repoRoot }), [])
  const imported = registry.initiatives.flatMap((initiative) => initiative.concerns.map((concern) => ({ initiative, concern })))
  assert.ok(imported.some(({ concern }) => concern.state === "exploration"))
  assert.ok(imported.some(({ concern }) => concern.state === "candidate"))
  assert.ok(imported.every(({ concern }) => concern.migrationImport?.type === "migration-import"))
  assert.ok(imported.every(({ concern }) => !concern.acceptance))
  assert.ok(registry.initiatives.some((initiative) => initiative.surfaces.figma.length > 0 && initiative.surfaces.kernelApp.length === 0))

  const prototypeOnly = structuredClone(registry)
  prototypeOnly.initiatives[0].concerns[0].state = "prototype-only"
  prototypeOnly.initiatives[0].concerns[0].history[0].to = "prototype-only"
  prototypeOnly.initiatives[0].concerns[0].migrationImport.mappedState = "prototype-only"
  assert.deepEqual(validatePrototypeRegistry(prototypeOnly, { entities, root: repoRoot }), [])
})

test("Figma and human-readable projections are deterministic, current, and preserve the compatibility bytes", () => {
  const expectedFigma = readFileSync(resolve(repoRoot, "scripts/ds/__fixtures__/figma-map-pre-migration.json"), "utf8")
  assert.equal(renderFigmaMap(registry), expectedFigma)
  assert.equal(renderFigmaMap(registry), renderFigmaMap(structuredClone(registry)))
  assert.equal(renderPrototypeStatus(registry), renderPrototypeStatus(structuredClone(registry)))
  assert.equal(checkFigmaProjection(resolve(repoRoot, "docs/figma/figma-map.json"), registry).ok, true)
  assert.equal(checkPrototypeProjection(resolve(repoRoot, "docs/prototypes/status.md"), registry).ok, true)
})

test("hand edits make both generated projections stale without changing canonical registry data", () => {
  const root = mkdtempSync(join(tmpdir(), "prototype-projections-"))
  try {
    const figma = join(root, "figma-map.json")
    const status = join(root, "status.md")
    writeFileSync(figma, `${renderFigmaMap(registry)}hand edit`)
    writeFileSync(status, `${renderPrototypeStatus(registry)}hand edit`)
    assert.equal(checkFigmaProjection(figma, registry).ok, false)
    assert.equal(checkPrototypeProjection(status, registry).ok, false)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
