import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { buildComponentContracts, CONTRACTS_PATH } from "./build-component-contracts.mjs"
import { buildComponentIntegrationManifest, MANIFEST_PATH } from "./build-component-integration.mjs"
import { buildComponentCohorts } from "./check-component-scope.mjs"
import { repoRoot, stableJson } from "./component-scope.mjs"

function compare(path, expected, violations) {
  const absolute = resolve(repoRoot, path)
  if (!existsSync(absolute)) violations.push({ code: "missing-generated-file", message: `${path} is missing` })
  else if (readFileSync(absolute, "utf8") !== stableJson(expected)) violations.push({ code: "stale-generated-file", message: `${path} is stale` })
}

export function collectComponentIntegrationViolations() {
  const violations = []
  try {
    compare(CONTRACTS_PATH, buildComponentContracts(), violations)
    compare(MANIFEST_PATH, buildComponentIntegrationManifest(), violations)
    for (const [path, cohort] of buildComponentCohorts()) compare(path, cohort, violations)

    const evidence = JSON.parse(readFileSync(resolve(repoRoot, "docs/figma/component-evidence.json"), "utf8"))
    const layout = JSON.parse(readFileSync(resolve(repoRoot, "docs/figma/component-layout.json"), "utf8"))
    const evidenceIds = evidence.records?.map((item) => item.entityId) || []
    const layoutIds = layout.records?.map((item) => item.entityId) || []
    if (new Set(evidenceIds).size !== evidenceIds.length) violations.push({ code: "duplicate-evidence", message: "component evidence contains duplicate entity IDs" })
    if (new Set(layoutIds).size !== layoutIds.length) violations.push({ code: "duplicate-layout", message: "component layout contains duplicate entity IDs" })
    if (evidence.fileKey !== "du0qpv9XrTt4HEWdPhesUh" || layout.fileKey !== evidence.fileKey) violations.push({ code: "wrong-figma-file", message: "component evidence/layout target the wrong Figma file" })
    for (const record of evidence.records || []) {
      if (!record.sectionId || !record.nodeId || !record.contractHash) violations.push({ code: "sparse-evidence", message: `${record.entityId} evidence is incomplete` })
      if (record.semanticBindings?.some((binding) => /^radius\/(?:sm|md|lg|xl)$/.test(binding.name))) violations.push({ code: "legacy-radius-binding", message: `${record.entityId} uses ${record.semanticBindings.find((binding) => /^radius\/(?:sm|md|lg|xl)$/.test(binding.name)).name}` })
    }
    for (const record of layout.records || []) if (record.verdict !== "pass" || record.expectedX !== 0) violations.push({ code: "invalid-layout", message: `${record.entityId} layout evidence failed` })
  } catch (error) {
    violations.push({ code: "component-integration-invalid", message: error.message })
  }
  return violations
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const violations = collectComponentIntegrationViolations()
  for (const violation of violations) console.error(`FIGMA-INTEGRATION ${violation.code}: ${violation.message}`)
  if (violations.length) {
    console.error(`FIGMA-INTEGRATION-CHECK-FAILED: ${violations.length} violations`)
    process.exitCode = 1
  } else console.log("FIGMA-INTEGRATION-CHECK-OK: contracts, cohorts, evidence, layout, and ledger are current")
}
