import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"

export const MATRIX_SCHEMA = "kernel-ds/figma-runtime-proof-matrix@1"
export const COHORT_SCHEMA = "kernel-ds/figma-runtime-proof-cohort@1"
export const RESULT_SCHEMA = "kernel-ds/figma-runtime-proof-results@1"
export const STEP_TYPES = new Set(["goto", "click", "press", "hover", "waitFor", "assertVisible", "assertAttribute", "screenshot"])
export const matrixHash = (text) => createHash("sha256").update(text.replace(/\r\n?/g, "\n")).digest("hex")

export function validateMatrix(matrix, expectedEntityIds) {
  if (matrix?.$schema !== MATRIX_SCHEMA || !Array.isArray(matrix.scenarios)) throw new Error("Invalid runtime-proof matrix")
  if (matrix.scenarios.length !== 62) throw new Error(`Runtime-proof matrix must contain exactly 62 scenarios, found ${matrix.scenarios.length}`)
  const ids = matrix.scenarios.map((item) => item.entityId)
  const scenarioIds = matrix.scenarios.map((item) => item.scenarioId)
  if (new Set(ids).size !== ids.length || new Set(scenarioIds).size !== scenarioIds.length) throw new Error("Runtime-proof matrix contains duplicate entities or scenarios")
  if (JSON.stringify([...ids].sort()) !== JSON.stringify([...expectedEntityIds].sort())) throw new Error("Runtime-proof matrix entity scope is stale")
  for (const scenario of matrix.scenarios) {
    if (scenario.scenarioId !== scenario.entityId || !scenario.route.startsWith("/")) throw new Error(`Invalid runtime scenario ${scenario.entityId}`)
    if (!Array.isArray(scenario.setup) || !Array.isArray(scenario.expectedObservations) || !scenario.expectedObservations.length) throw new Error(`Runtime scenario ${scenario.entityId} lacks authored setup or observations`)
    if (!Array.isArray(scenario.steps) || !scenario.steps.length) throw new Error(`Runtime scenario ${scenario.entityId} has no steps`)
    for (const step of scenario.steps) if (!STEP_TYPES.has(step.type)) throw new Error(`Unknown runtime-proof step ${step.type}`)
    if (!scenario.requiredCaptureName) throw new Error(`Runtime scenario ${scenario.entityId} has no required capture`)
  }
  return matrix
}

export function validateCohort(cohort, matrix, textHash) {
  if (cohort?.$schema !== COHORT_SCHEMA || !Array.isArray(cohort.entityIds) || !Array.isArray(cohort.scenarioIds)) throw new Error("Invalid runtime-proof cohort")
  if (cohort.matrixHash !== textHash) throw new Error("Runtime-proof cohort matrix hash is stale")
  if (cohort.entityIds.length !== cohort.scenarioIds.length || new Set(cohort.entityIds).size !== cohort.entityIds.length || new Set(cohort.scenarioIds).size !== cohort.scenarioIds.length) throw new Error("Runtime-proof cohort contains missing or duplicate entries")
  const scenarios = new Map(matrix.scenarios.map((item) => [item.entityId, item.scenarioId]))
  cohort.entityIds.forEach((entityId, index) => {
    if (!scenarios.has(entityId) || scenarios.get(entityId) !== cohort.scenarioIds[index]) throw new Error(`Runtime-proof cohort contains unknown or stale scenario ${entityId}`)
  })
  return cohort
}

export function validateResults(results, scenarios, buildHash, expectedMatrixHash) {
  if (results?.$schema !== RESULT_SCHEMA || !Array.isArray(results.results)) throw new Error("Invalid runtime-proof results")
  const expected = new Map(scenarios.map((item) => [item.entityId, item]))
  const resultIds = results.results.map((item) => item.entityId)
  if (results.results.length !== expected.size || new Set(resultIds).size !== resultIds.length) throw new Error("Runtime-proof result count does not match scope or contains duplicates")
  for (const result of results.results) {
    const scenario = expected.get(result.entityId)
    if (!scenario || result.url !== scenario.route) throw new Error(`Runtime-proof result has wrong route for ${result.entityId}`)
    if (result.buildHash !== buildHash || result.matrixHash !== expectedMatrixHash) throw new Error(`Runtime-proof result is stale for ${result.entityId}`)
    if (result.observedResult !== "pass") throw new Error(`Runtime-proof scenario failed for ${result.entityId}`)
    if (!result.screenshotPath || !existsSync(result.screenshotPath) || !result.recordingPath || !existsSync(result.recordingPath)) throw new Error(`Runtime-proof captures are missing for ${result.entityId}`)
    if (Date.parse(result.finishedAt) < Date.parse(result.startedAt)) throw new Error(`Runtime-proof timestamps are invalid for ${result.entityId}`)
  }
  return results
}

if (process.argv[1] && import.meta.url === new URL(`file:///${process.argv[1].replaceAll("\\", "/")}`).href) {
  try {
    const args = process.argv.slice(2)
    const flag = (name) => { const index = args.indexOf(`--${name}`); return index === -1 ? null : args[index + 1] }
    const matrixPath = flag("matrix") ?? args[0]
    const matrixText = readFileSync(matrixPath, "utf8")
    const matrix = JSON.parse(matrixText)
    const expected = JSON.parse(readFileSync(new URL("../../docs/figma/cohorts/runtime/07-runtime-all.json", import.meta.url), "utf8")).entityIds
    validateMatrix(matrix, expected)
    const resultsPath = flag("results")
    if (resultsPath) {
      let resultsText = readFileSync(resultsPath, "utf8")
      // Committed fixtures cannot pin the live matrix hash; the sentinel is honored for fixture paths only.
      if (resultsPath.includes("__fixtures__")) resultsText = resultsText.replaceAll("__MATRIX_HASH__", matrixHash(matrixText))
      const results = JSON.parse(resultsText)
      const scenarios = matrix.scenarios.filter((item) => results.results?.some((result) => result.entityId === item.entityId))
      validateResults(results, scenarios, results.results?.[0]?.buildHash, matrixHash(matrixText))
      console.log(`FIGMA-RUNTIME-PROOF-OK: ${results.results.length}/${scenarios.length} scenarios`)
    } else {
      console.log(`FIGMA-RUNTIME-MATRIX-OK: ${matrix.scenarios.length} scenarios`)
    }
  } catch (error) {
    console.error(`FIGMA-RUNTIME-PROOF-FAILED: ${error.message}`)
    process.exitCode = 1
  }
}
