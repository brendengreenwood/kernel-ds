import assert from "node:assert/strict"
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { resolve } from "node:path"
import test from "node:test"

const root = resolve(import.meta.dirname, "../../../..")
const proof = resolve(root, ".mastracode/plans/full-kernel-ui-figma-integration.proof/test-migrate-family")
const stateDir = resolve(root, ".mastracode/plans/full-kernel-ui-figma-integration.proof/family-migrations")
const command = resolve(root, "scripts/ds/commands/migrate-family.mjs")
const evidencePath = resolve(root, "docs/figma/component-evidence.json")
const layoutPath = resolve(root, "docs/figma/component-layout.json")
const entityId = "component.accordion"
const fileKey = "du0qpv9XrTt4HEWdPhesUh"
let originalEvidence
let originalLayout

function run(args) { return spawnSync(process.execPath, ["--experimental-strip-types", command, ...args], { cwd: root, encoding: "utf8" }) }
function requestPath(output) {
  const match = output.match(/(?:AGENT-)?HANDOFF-READY:\s+(?:\S+\s+)?(.+\.request\.json)/)
  assert.ok(match, output)
  return resolve(root, match[1].trim())
}
function respond(requestPath, payload) {
  const request = JSON.parse(readFileSync(requestPath, "utf8"))
  writeFileSync(resolve(root, request.responsePath), JSON.stringify({
    $schema: request.$schema.includes("transaction") ? "kernel-ds/figma-transaction-response@1" : "kernel-ds/figma-live-component-audit@1",
    operation: request.operation,
    requestId: request.requestId,
    requestHash: request.requestHash,
    implementationHash: request.implementationHash,
    transactionId: request.transactionId,
    entityId: request.entityId ?? null,
    mode: request.mode,
    fileKey,
    verdict: "pass",
    ...payload,
  }))
  return request
}
function transactionCapture(requestPath) {
  respond(requestPath, { payload: { inventoryNodeIds: ["1:1", "1:2"], nodes: [] } })
}
function transactionResult(requestPath, payload) { respond(requestPath, { payload }) }
function auditResult(requestPath) {
  const request = JSON.parse(readFileSync(requestPath, "utf8"))
  const contract = request.contracts[entityId]
  const contractHash = contract.contractHash
  const contractEvidence = {
    codeVariantAxes: contract.variantAxes ?? {},
    designStateAxes: contract.designStateAxes ?? {},
    figmaProperties: contract.figmaProperties ?? {},
    anatomySlots: [...(contract.slots ?? [])].sort(),
    requiredTokenRoles: contract.requiredTokenRoles ?? [],
  }
  respond(requestPath, {
    expected: 1, resolved: 1, failures: [],
    records: [{ entityId, fileKey, pageId: "1:1250", nodeId: "1:2", nodeType: "COMPONENT_SET", mainComponentKey: "key", sectionId: "1:1", sectionName: "Accordion", contractHash, contractEvidence, semanticBindings: ["radius/control"], accessibility: { nameRole: { verdict: "pass" }, target: { verdict: "notApplicable", reason: "runtime-or-instance-size-validation" }, focusState: { verdict: "notApplicable", reason: "runtime-proof-required" }, nonColorDifferentiation: { verdict: "notApplicable", reason: "family-class-audit-required" }, annotations: { verdict: "notApplicable", reason: "no-runtime-only-claim-in-static-contract" } } }],
    layouts: request.mode === "full" ? [{ entityId, sectionNodeId: "1:1", bounds: { x: 0, y: 0, width: 100, height: 100 }, expectedX: 0, predecessorSectionId: null, gap: null, verdict: "pass" }] : [],
    acceptance: request.mode === "full" ? [{ entityId, acceptanceInstanceNodeId: "1:3", mainComponentId: "1:2", mainComponentKey: "key", ownerSectionId: "1:4", detached: false, contractHash, verdict: "pass" }] : [],
  })
}
function clean() {
  rmSync(proof, { recursive: true, force: true })
  rmSync(resolve(stateDir, `${entityId}.json`), { force: true })
  rmSync(resolve(stateDir, `${entityId}.escalation.json`), { force: true })
  mkdirSync(proof, { recursive: true })
  writeFileSync(evidencePath, originalEvidence)
  writeFileSync(layoutPath, originalLayout)
}
function finishBegin(snapshot) {
  const first = run(["begin", "--scope-file", `docs/figma/cohorts/families/${entityId}.json`, "--transaction-id", entityId, "--snapshot", snapshot])
  assert.equal(first.status, 0, first.stderr)
  transactionCapture(requestPath(first.stdout))
  const second = run(["begin", "--scope-file", `docs/figma/cohorts/families/${entityId}.json`, "--transaction-id", entityId, "--snapshot", snapshot])
  assert.equal(second.status, 0, second.stderr)
  assert.match(second.stdout, /FIGMA-FAMILY-HANDOFF-READY/)
}

test.before(() => { originalEvidence = readFileSync(evidencePath); originalLayout = readFileSync(layoutPath) })

test("family migration orchestrates capture, preliminary audit, full evidence audit, verify, and transcript", () => {
  clean()
  const snapshot = resolve(proof, "success.json")
  const preliminary = resolve(proof, "preliminary.json")
  const full = resolve(proof, "full.json")
  finishBegin(snapshot)
  let step = run(["complete", "--transaction-id", entityId, "--preliminary-capture", preliminary, "--full-capture", full])
  auditResult(requestPath(step.stdout))
  step = run(["complete", "--transaction-id", entityId, "--preliminary-capture", preliminary, "--full-capture", full])
  assert.equal(step.status, 0, step.stderr)
  assert.equal(readFileSync(evidencePath).equals(originalEvidence), true, "preliminary audit must not persist evidence")
  auditResult(requestPath(step.stdout))
  step = run(["complete", "--transaction-id", entityId, "--preliminary-capture", preliminary, "--full-capture", full])
  assert.equal(step.status, 0, step.stderr)
  transactionResult(requestPath(step.stdout), { currentNodeIds: ["1:1", "1:2"], createdNodeIds: [], deletedNodeIds: [] })
  step = run(["complete", "--transaction-id", entityId, "--preliminary-capture", preliminary, "--full-capture", full])
  assert.equal(step.status, 0, step.stderr)
  assert.match(step.stdout, /FIGMA-FAMILY-MIGRATION-OK/)
  const transcript = JSON.parse(readFileSync(`${snapshot}.transcript.json`, "utf8"))
  assert.equal(transcript.fileKey, fileKey)
  assert.match(transcript.preliminarySignature, /FIGMA-LIVE-AUDIT-PRELIMINARY-OK/)
  assert.match(transcript.fullSignature, /FIGMA-LIVE-AUDIT-OK/)
  assert.equal(transcript.finalEvidenceHash.length, 64)
})

test("forced abort cancels pending handoffs, restores the snapshot, and records cleanup evidence", () => {
  clean()
  const snapshot = resolve(proof, "abort.json")
  finishBegin(snapshot)
  let step = run(["abort", "--transaction-id", entityId])
  assert.equal(step.status, 0, step.stderr)
  const restoreRequest = requestPath(step.stdout)
  transactionResult(restoreRequest, { deletedNodeIds: ["2:3", "2:2"], residualNodeIds: [], restoredNodeIds: [] })
  step = run(["abort", "--transaction-id", entityId])
  assert.equal(step.status, 0, step.stderr)
  assert.match(step.stdout, /FIGMA-FAMILY-MIGRATION-ABORTED/)
  const transcript = JSON.parse(readFileSync(`${snapshot}.transcript.json`, "utf8"))
  assert.equal(transcript.cleanupVerdict, "reverse-order-cleanup-passed")
  assert.equal(transcript.absenceVerdict, "verified")
  assert.equal(transcript.restoreResult, "restored")
  assert.equal(existsSync(resolve(stateDir, `${entityId}.json`)), false)
})

test("failed or interrupted audit handoffs preserve durable state and can be aborted", () => {
  clean()
  const snapshot = resolve(proof, "interrupted.json")
  finishBegin(snapshot)
  const step = run(["complete", "--transaction-id", entityId, "--preliminary-capture", resolve(proof, "preliminary.json"), "--full-capture", resolve(proof, "full.json")])
  assert.equal(step.status, 0, step.stderr)
  assert.equal(existsSync(resolve(stateDir, `${entityId}.json`)), true)
  const aborted = run(["abort", "--transaction-id", entityId])
  assert.equal(aborted.status, 0, aborted.stderr)
  assert.match(aborted.stdout, /FIGMA-FAMILY-AGENT-HANDOFF-READY: restore/)
})

test.after(() => { writeFileSync(evidencePath, originalEvidence); writeFileSync(layoutPath, originalLayout); rmSync(proof, { recursive: true, force: true }); rmSync(resolve(stateDir, `${entityId}.json`), { force: true }) })
