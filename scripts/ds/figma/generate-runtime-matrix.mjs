import { createHash } from "node:crypto"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { loadComponentScope, stableJson } from "./component-scope.mjs"
import { validateMatrix } from "../../../kernel-portal/scripts/check-figma-runtime-proof.mjs"

const sha256 = (value) => createHash("sha256").update(value).digest("hex")
const components = loadComponentScope().components
const matrixPath = "docs/figma/runtime-proof-matrix.json"
const matrixText = readFileSync(matrixPath, "utf8")
const matrix = validateMatrix(JSON.parse(matrixText), components.map((entity) => entity.id))
const matrixHash = sha256(matrixText)
const scenarioIds = new Map(matrix.scenarios.map((scenario) => [scenario.entityId, scenario.scenarioId]))
const cohortDir = "docs/figma/cohorts/runtime"
mkdirSync(`${cohortDir}/families`, { recursive: true })
const cohort = (name, entityIds) => ({
  $schema: "kernel-ds/figma-runtime-proof-cohort@1",
  name,
  matrixHash,
  entityIds,
  scenarioIds: entityIds.map((entityId) => scenarioIds.get(entityId)),
})
writeFileSync(`${cohortDir}/01-baseline.json`, stableJson(cohort("01-baseline", ["component.button", "component.input", "component.sidebar"])))
writeFileSync("docs/figma/cohorts/01-runtime-smoke.json", stableJson(cohort("01-runtime-smoke", ["component.button", "component.input", "component.sidebar"])))
writeFileSync(`${cohortDir}/07-runtime-all.json`, stableJson(cohort("07-runtime-all", components.map((entity) => entity.id))))
for (const entity of components) writeFileSync(`${cohortDir}/families/${entity.id}.json`, stableJson(cohort(entity.id, [entity.id])))
console.log(`FIGMA-RUNTIME-MATRIX-OK: ${matrix.scenarios.length} scenarios; ${components.length + 3} generated cohorts; ${matrixHash}`)
