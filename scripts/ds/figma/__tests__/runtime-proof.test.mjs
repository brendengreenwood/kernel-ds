import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { loadComponentScope } from "../component-scope.mjs"
import { matrixHash, validateCohort, validateMatrix, validateResults } from "../../../../kernel-portal/scripts/check-figma-runtime-proof.mjs"

const matrixUrl = new URL("../../../../docs/figma/runtime-proof-matrix.json", import.meta.url)
const matrixText = readFileSync(matrixUrl, "utf8")
const matrix = JSON.parse(matrixText)
const entityIds = loadComponentScope().components.map((item) => item.id)
const runtimeDir = new URL("../../../../docs/figma/cohorts/runtime/", import.meta.url)

function cohort(relativePath) {
  return JSON.parse(readFileSync(new URL(relativePath, runtimeDir), "utf8"))
}

test("runtime matrix covers exactly the 62 component entities", () => {
  assert.equal(validateMatrix(matrix, entityIds).scenarios.length, 62)
})

test("baseline runtime scenarios exercise component-specific behavior", () => {
  for (const entityId of ["component.button", "component.input", "component.sidebar"]) {
    const scenario = matrix.scenarios.find((item) => item.entityId === entityId)
    assert.ok(scenario.expectedObservations.length >= 2)
    assert.ok(scenario.steps.some((step) => ["click", "press", "assertAttribute"].includes(step.type)))
  }
})

test("runtime matrix rejects unknown step types and duplicate scenarios", () => {
  const brokenStep = structuredClone(matrix)
  brokenStep.scenarios[0].steps[0].type = "evaluate"
  assert.throws(() => validateMatrix(brokenStep, entityIds), /Unknown runtime-proof step/)
  const duplicate = structuredClone(matrix)
  duplicate.scenarios[1].scenarioId = duplicate.scenarios[0].scenarioId
  assert.throws(() => validateMatrix(duplicate, entityIds), /duplicate/)
})

test("generated runtime cohorts are complete, unique, and matrix-bound", () => {
  const hash = matrixHash(matrixText)
  const familyFiles = readdirSync(new URL("families/", runtimeDir)).sort()
  assert.deepEqual(familyFiles, entityIds.map((id) => `${id}.json`).sort())
  const baseline = validateCohort(cohort("01-baseline.json"), matrix, hash)
  assert.deepEqual(baseline.entityIds, ["component.button", "component.input", "component.sidebar"])
  const all = validateCohort(cohort("07-runtime-all.json"), matrix, hash)
  assert.deepEqual(all.entityIds, entityIds)
  for (const entityId of entityIds) assert.deepEqual(validateCohort(cohort(`families/${entityId}.json`), matrix, hash).entityIds, [entityId])
})

test("runtime cohorts reject stale hashes, duplicates, unknown entities, and hand-added scenarios", () => {
  const hash = matrixHash(matrixText)
  const base = cohort("01-baseline.json")
  assert.throws(() => validateCohort({ ...base, matrixHash: "stale" }, matrix, hash), /hash is stale/)
  assert.throws(() => validateCohort({ ...base, entityIds: [...base.entityIds, base.entityIds[0]], scenarioIds: [...base.scenarioIds, base.scenarioIds[0]] }, matrix, hash), /duplicate/)
  assert.throws(() => validateCohort({ ...base, entityIds: ["component.unknown"], scenarioIds: ["component.unknown"] }, matrix, hash), /unknown or stale/)
  assert.throws(() => validateCohort({ ...base, scenarioIds: [...base.scenarioIds, "hand-added"] }, matrix, hash), /missing or duplicate/)
})

test("committed runtime-proof fixtures pass and fail through the checker", () => {
  const hash = matrixHash(matrixText)
  const fixturesDir = new URL("../../../../kernel-portal/scripts/__fixtures__/figma-runtime-proof/", import.meta.url)
  const smoke = validateCohort(JSON.parse(readFileSync(new URL("../../../../docs/figma/cohorts/01-runtime-smoke.json", import.meta.url), "utf8")), matrix, hash)
  assert.deepEqual(smoke.entityIds, ["component.button", "component.input", "component.sidebar"])
  const load = (name) => {
    const parsed = JSON.parse(readFileSync(new URL(name, fixturesDir), "utf8").replaceAll("__MATRIX_HASH__", hash))
    for (const record of parsed.results) {
      record.screenshotPath = new URL("capture.png", fixturesDir).pathname.replace(/^\//, "")
      record.recordingPath = new URL("capture.webm", fixturesDir).pathname.replace(/^\//, "")
    }
    return parsed
  }
  const scenarios = matrix.scenarios.filter((item) => item.entityId === "component.button")
  assert.equal(validateResults(load("pass.json"), scenarios, "fixture-build", hash).results.length, 1)
  assert.throws(() => validateResults(load("fail.json"), scenarios, "fixture-build", hash), /scenario failed/)
})

test("runtime results reject duplicate records", () => {
  const scenario = matrix.scenarios[0]
  const result = { entityId: scenario.entityId, url: scenario.route, buildHash: "build", matrixHash: "matrix", observedResult: "pass", screenshotPath: "missing", recordingPath: "missing", startedAt: new Date().toISOString(), finishedAt: new Date().toISOString() }
  assert.throws(() => validateResults({ $schema: "kernel-ds/figma-runtime-proof-results@1", results: [result, result] }, [scenario], "build", "matrix"), /duplicates/)
})
