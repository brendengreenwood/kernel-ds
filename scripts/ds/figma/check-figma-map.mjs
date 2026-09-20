import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const FIGMA_MAP_PATH = "docs/figma/figma-map.json"
const NODE_ID_PATTERN = /^\d+:\d+$/
const VALID_KINDS = new Set(["component-set", "component", "frame"])
const VALID_STATUSES = new Set(["built", "exploration"])

/**
 * Validate docs/figma/figma-map.json against the DSDS catalog: every entity
 * key must resolve to a real catalog entity, and every entry must carry a
 * well-formed node reference so deletions/staleness are detectable. Returns
 * doctor-shaped violations ({ code, message }).
 */
export function collectFigmaMapViolations(entities, root) {
  const mapFile = resolve(root, FIGMA_MAP_PATH)
  if (!existsSync(mapFile)) return []
  let map
  try {
    map = JSON.parse(readFileSync(mapFile, "utf8"))
  } catch (error) {
    return [{ code: "figma-map-invalid", message: `${FIGMA_MAP_PATH} is not valid JSON: ${error.message}` }]
  }

  const violations = []
  const catalogIds = new Set(entities.map((entity) => entity.id))

  if (!map.file?.fileKey) {
    violations.push({ code: "figma-map-invalid", message: `${FIGMA_MAP_PATH} is missing file.fileKey` })
  }

  for (const [id, entry] of Object.entries(map.entities ?? {})) {
    if (!catalogIds.has(id)) {
      violations.push({ code: "figma-unknown-entity", message: `${FIGMA_MAP_PATH} maps unknown catalog entity ${id}` })
    }
    if (!NODE_ID_PATTERN.test(entry.nodeId ?? "")) {
      violations.push({ code: "figma-missing-node", message: `${id} entry has no valid nodeId` })
    }
    if (!VALID_KINDS.has(entry.kind)) {
      violations.push({ code: "figma-invalid-kind", message: `${id} entry kind "${entry.kind}" is not one of ${[...VALID_KINDS].join("/")}` })
    }
    if (!VALID_STATUSES.has(entry.status)) {
      violations.push({ code: "figma-invalid-status", message: `${id} entry status "${entry.status}" is not one of ${[...VALID_STATUSES].join("/")}` })
    }
    if ((entry.kind === "component-set" || entry.kind === "component") && !/^[0-9a-f]{40}$/.test(entry.key ?? "")) {
      violations.push({ code: "figma-missing-key", message: `${id} entry has no valid component key` })
    }
    for (const [childName, child] of Object.entries(entry.children ?? {})) {
      if (!NODE_ID_PATTERN.test(child.nodeId ?? "")) {
        violations.push({ code: "figma-missing-node", message: `${id} child ${childName} has no valid nodeId` })
      }
    }
  }

  return violations
}

/** Coverage report: which catalog entities have Figma builds, by kind. */
export function figmaCoverage(entities, root) {
  const mapFile = resolve(root, FIGMA_MAP_PATH)
  const map = existsSync(mapFile) ? JSON.parse(readFileSync(mapFile, "utf8")) : { entities: {} }
  const mapped = new Set(Object.keys(map.entities ?? {}))
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
  for (const violation of violations) {
    console.error(`FIGMA-MAP ${violation.code}: ${violation.message}`)
  }
  const coverage = figmaCoverage(entities, repoRoot)
  for (const [kind, { mapped, total }] of Object.entries(coverage)) {
    console.log(`FIGMA-COVERAGE ${kind}: ${mapped}/${total}`)
  }
  if (violations.length > 0) {
    console.error(`FIGMA-MAP-FAILED: ${violations.length} violations`)
    process.exitCode = 1
  } else {
    console.log("FIGMA-MAP-OK: map is valid against the catalog")
  }
}
