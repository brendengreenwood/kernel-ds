import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

export const PROTOTYPE_MIGRATION_SCHEMA = "kernel-ds/prototype-migration@1"
export const migrationDispositions = Object.freeze(["imported", "closed-historical-only", "superseded", "duplicate"])

function leafPaths(value, prefix = "") {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => leafPaths(entry, `${prefix}[${index}]`))
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, entry]) => leafPaths(entry, prefix ? `${prefix}.${key}` : key))
  }
  return [prefix]
}

export function identifiableDriftIds(markdown) {
  const ids = []
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^(?:\|\s*|\*\*|##\s+)(\d+\.\d+)\b/)
    if (match && !ids.includes(match[1])) ids.push(match[1])
  }
  return ids.sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
}

export function validatePrototypeMigration(manifest, { root, figmaSnapshot, driftMarkdown, registry } = {}) {
  const issues = []
  if (manifest?.$schema !== PROTOTYPE_MIGRATION_SCHEMA || manifest?.version !== 1) {
    return [{ code: "invalid-migration-version", message: `Expected ${PROTOTYPE_MIGRATION_SCHEMA}` }]
  }

  const figmaPaths = leafPaths(figmaSnapshot)
  const mappedPaths = manifest.figmaFields?.map((entry) => entry.sourcePath) ?? []
  for (const sourcePath of figmaPaths) {
    if (!mappedPaths.includes(sourcePath)) issues.push({ code: "unclassified-figma-field", message: sourcePath })
  }
  for (const sourcePath of mappedPaths) {
    if (!figmaPaths.includes(sourcePath)) issues.push({ code: "unknown-figma-field", message: sourcePath })
  }
  if (new Set(mappedPaths).size !== mappedPaths.length) {
    issues.push({ code: "duplicate-figma-field", message: "Figma source field paths must be unique" })
  }
  const destinations = manifest.figmaFields?.map((entry) => entry.destination) ?? []
  if (new Set(destinations).size !== destinations.length) {
    issues.push({ code: "duplicate-figma-destination", message: "Figma canonical destinations must be unique" })
  }

  const driftIds = identifiableDriftIds(driftMarkdown)
  const dispositions = manifest.drift?.map((entry) => entry.sourceId) ?? []
  for (const sourceId of driftIds) {
    if (!dispositions.includes(sourceId)) issues.push({ code: "unclassified-drift", message: sourceId })
  }
  for (const sourceId of dispositions) {
    if (!driftIds.includes(sourceId)) issues.push({ code: "unknown-drift", message: sourceId })
  }
  if (new Set(dispositions).size !== dispositions.length) {
    issues.push({ code: "duplicate-drift-source", message: "Drift source IDs must be unique" })
  }

  const initiativeIds = new Set(registry?.initiatives?.map((initiative) => initiative.id) ?? [])
  for (const entry of manifest.drift ?? []) {
    if (!migrationDispositions.includes(entry.disposition)) {
      issues.push({ code: "invalid-drift-disposition", message: `${entry.sourceId}: ${entry.disposition}` })
    }
    if (!entry.rationale) issues.push({ code: "missing-drift-rationale", message: entry.sourceId })
    if (entry.disposition === "imported") {
      if (!entry.initiativeId || !entry.concern) {
        issues.push({ code: "missing-drift-target", message: entry.sourceId })
      } else if (!initiativeIds.has(entry.initiativeId)) {
        issues.push({ code: "unknown-drift-target", message: `${entry.sourceId}: ${entry.initiativeId}` })
      }
    }
  }

  const counts = manifest.counts ?? {}
  const actual = {
    figmaFields: figmaPaths.length,
    driftEntries: driftIds.length,
    imported: (manifest.drift ?? []).filter((entry) => entry.disposition === "imported").length,
    historicalOnly: (manifest.drift ?? []).filter((entry) => entry.disposition === "closed-historical-only").length,
    superseded: (manifest.drift ?? []).filter((entry) => entry.disposition === "superseded").length,
    duplicate: (manifest.drift ?? []).filter((entry) => entry.disposition === "duplicate").length,
  }
  for (const [key, value] of Object.entries(actual)) {
    if (counts[key] !== value) issues.push({ code: "migration-count-mismatch", message: `${key}: expected ${value}, recorded ${counts[key]}` })
  }
  if (actual.driftEntries !== actual.imported + actual.historicalOnly + actual.superseded + actual.duplicate) {
    issues.push({ code: "migration-count-mismatch", message: "Drift disposition totals do not reconcile" })
  }

  if (root) {
    for (const entry of manifest.drift ?? []) {
      for (const sourcePath of entry.sourcePaths ?? []) {
        if (!existsSync(resolve(root, sourcePath))) issues.push({ code: "missing-migration-source", message: `${entry.sourceId}: ${sourcePath}` })
      }
    }
  }
  return issues
}

export function loadPrototypeMigration(root) {
  return JSON.parse(readFileSync(resolve(root, "docs/prototypes/migration-manifest.json"), "utf8"))
}
