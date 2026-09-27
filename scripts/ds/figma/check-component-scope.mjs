import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { componentScopeRecord, loadComponentScope, repoRoot, stableJson } from "./component-scope.mjs"

export const COHORT_SCHEMA = "kernel-ds/figma-component-cohort@1"
const COHORT_DIR = "docs/figma/cohorts"

function write(path, value) {
  const absolute = resolve(repoRoot, path)
  mkdirSync(dirname(absolute), { recursive: true })
  writeFileSync(absolute, stableJson(value))
}

function cohort(id, entityIds, purpose) {
  return { $schema: COHORT_SCHEMA, id, purpose, entityIds: [...entityIds].sort() }
}

export function buildComponentCohorts(scope = loadComponentScope()) {
  const ids = scope.components.map((entity) => entity.id)
  const byId = new Set(ids)
  const baselineIds = ["component.button", "component.input", "component.sidebar"]
  for (const id of baselineIds) if (!byId.has(id)) throw new Error(`Baseline entity ${id} is missing from component scope`)

  const files = new Map()
  files.set(`${COHORT_DIR}/scope.json`, componentScopeRecord(scope))
  files.set(`${COHORT_DIR}/01-baseline.json`, cohort("01-baseline", baselineIds, "Existing mapped-family reconciliation baseline"))
  files.set(`${COHORT_DIR}/07-acceptance.json`, cohort("07-acceptance", ids, "Whole @kernel/ui component-library acceptance"))
  for (const id of ids) files.set(`${COHORT_DIR}/families/${id}.json`, cohort(id, [id], `Single-family migration for ${id}`))
  return files
}

export function writeComponentCohorts() {
  const scope = loadComponentScope()
  const files = buildComponentCohorts(scope)
  for (const [path, value] of files) write(path, value)
  return { scope, files }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { scope, files } = writeComponentCohorts()
    console.log(`FIGMA-COMPONENT-SCOPE-OK: ${scope.components.length} components; ${scope.elements.length} elements; ${scope.nonCatalogPublicModules.length} non-catalog modules`)
    console.log(`FIGMA-COHORTS-OK: ${files.size} generated files`)
  } catch (error) {
    console.error(`FIGMA-COMPONENT-SCOPE-FAILED: ${error.message}`)
    process.exitCode = 1
  }
}
