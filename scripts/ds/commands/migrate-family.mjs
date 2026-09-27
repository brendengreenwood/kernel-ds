import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { dirname, relative, resolve } from "node:path"
import { parseFlags } from "../lib/args.mjs"
import { repoRoot, stableJson, validateEntityIds, loadComponentScope } from "../figma/component-scope.mjs"
import { EXPECTED_FILE_KEY, sha256, validateSnapshot } from "../figma/component-transaction.mjs"

const STATE_SCHEMA = "kernel-ds/figma-family-migration-state@1"
const TRANSCRIPT_SCHEMA = "kernel-ds/figma-family-migration-transcript@1"
const proofRoot = resolve(repoRoot, ".mastracode/plans/full-kernel-ui-figma-integration.proof")
const stateDir = resolve(proofRoot, "family-migrations")
const transactionCommand = resolve(repoRoot, "scripts/ds/commands/figma-transaction.mjs")
const liveCommand = resolve(repoRoot, "scripts/ds/commands/figma-live.mjs")
const evidencePath = resolve(repoRoot, "docs/figma/component-evidence.json")
const layoutPath = resolve(repoRoot, "docs/figma/component-layout.json")

function fail(message) { console.error(`FIGMA-FAMILY-MIGRATION-FAILED: ${message}`); process.exitCode = 1 }
function read(path) { return JSON.parse(readFileSync(resolve(repoRoot, path), "utf8")) }
function write(path, value) { const target = resolve(repoRoot, path); mkdirSync(dirname(target), { recursive: true }); writeFileSync(target, stableJson(value)) }
function statePath(id) { return resolve(stateDir, `${id}.json`) }
function hashFile(path) { return existsSync(path) ? sha256(readFileSync(path)) : null }
function stateHash(state) { const value = { ...state }; delete value.stateHash; return sha256(stableJson(value)) }
function saveState(state) { state.stateHash = stateHash(state); writeFileSync(statePath(state.transactionId), stableJson(state)) }
function loadState(id) {
  const target = statePath(id)
  if (!existsSync(target)) throw new Error(`Migration ${id} has not begun`)
  const state = JSON.parse(readFileSync(target, "utf8"))
  if (state.$schema !== STATE_SCHEMA || state.entityId !== id || state.stateHash !== stateHash(state)) throw new Error("Migration state is invalid or tampered with")
  return state
}
function run(command, args) {
  const result = spawnSync(process.execPath, ["--experimental-strip-types", command, ...args], { cwd: repoRoot, encoding: "utf8" })
  if (result.status !== 0) throw new Error((result.stderr || result.stdout).trim())
  return `${result.stdout}${result.stderr}`.trim()
}
function requestFrom(output) {
  const match = output.match(/HANDOFF-READY:\s+(.+\.request\.json)/)
  if (!match) throw new Error(`Expected agent-mediated handoff request, received: ${output}`)
  return resolve(repoRoot, match[1].trim())
}
function responsePath(requestPath) { return resolve(repoRoot, JSON.parse(readFileSync(requestPath, "utf8")).responsePath) }
function handoff(state, kind, requestPath) {
  state.stage = `${kind}-handoff`
  state.pending = { kind, requestPath: relative(repoRoot, requestPath).replaceAll("\\", "/"), responsePath: relative(repoRoot, responsePath(requestPath)).replaceAll("\\", "/") }
  saveState(state)
  console.log(`FIGMA-FAMILY-AGENT-HANDOFF-READY: ${kind} ${state.pending.requestPath}`)
}
function completePending(state, command) {
  const requestPath = resolve(repoRoot, state.pending.requestPath)
  if (!existsSync(resolve(repoRoot, state.pending.responsePath))) {
    console.log(`FIGMA-FAMILY-AGENT-HANDOFF-READY: ${state.pending.kind} ${state.pending.requestPath}`)
    return false
  }
  const kind = state.pending.kind
  const responseFile = resolve(repoRoot, state.pending.responsePath)
  state.signatures.push(run(command, ["complete", "--request", requestPath]))
  if (kind === "restore" && existsSync(responseFile)) state.restorePayload = JSON.parse(readFileSync(responseFile, "utf8")).payload || null
  state.pending = null
  return true
}
function rollbackEvidence(state) {
  for (const [backup, target, expected] of [[state.backups.evidenceBackup, evidencePath, state.backups.evidenceHash], [state.backups.layoutBackup, layoutPath, state.backups.layoutHash]]) {
    if (backup && existsSync(resolve(repoRoot, backup))) writeFileSync(target, readFileSync(resolve(repoRoot, backup)))
    if (hashFile(target) !== expected) throw new Error(`Evidence rollback failed for ${relative(repoRoot, target)}`)
  }
}
function snapshotSummary(path) {
  const snapshot = read(path)
  validateSnapshot(snapshot)
  return { fileKey: snapshot.fileKey, snapshotHash: snapshot.snapshotHash, beforeInventoryHash: snapshot.inventoryHash, beforeNodeIds: snapshot.inventoryNodeIds }
}
function auditCapture(path, entityId, mode) {
  const capture = read(path)
  if (capture.mode !== mode || capture.verdict !== "pass" || capture.expected !== 1 || capture.resolved !== 1 || capture.records?.[0]?.entityId !== entityId) throw new Error(`${mode} audit capture did not pass for ${entityId}`)
  return capture
}
function escalation(state, message) {
  const packet = { $schema: "kernel-ds/figma-family-migration-escalation@1", entityId: state.entityId, transactionId: state.transactionId, driftDetails: message, affectedNodes: state.beforeNodeIds, affectedInstances: [], backupEvidence: state.backups, proposedDestructiveOperation: "restore the captured pre-mutation component state", invalidatedProofScope: [state.scopeFile, state.preliminaryCapture, state.fullCapture].filter(Boolean) }
  const path = resolve(proofRoot, "family-migrations", `${state.transactionId}.escalation.json`)
  write(path, packet)
  return relative(repoRoot, path).replaceAll("\\", "/")
}

const [action, ...rest] = process.argv.slice(2)
const { flags, positional } = parseFlags(rest)
try {
  if (positional.length) throw new Error(`Unexpected positional arguments: ${positional.join(" ")}`)
  if (action === "begin") {
    for (const name of ["scope-file", "transaction-id", "snapshot"]) if (!flags[name] || flags[name] === true) throw new Error(`begin requires --${name} <value>`)
    const scope = loadComponentScope()
    const cohort = read(flags["scope-file"])
    const ids = validateEntityIds(cohort.entityIds, new Set(scope.components.map((item) => item.id)), "family cohort")
    if (ids.length !== 1 || ids[0] !== flags["transaction-id"]) throw new Error("Family cohort must contain exactly the transaction entity")
    mkdirSync(stateDir, { recursive: true })
    let state
    if (!existsSync(statePath(ids[0]))) {
      const backups = { evidenceHash: hashFile(evidencePath), layoutHash: hashFile(layoutPath), evidenceBackup: null, layoutBackup: null }
      for (const [key, source] of [["evidenceBackup", evidencePath], ["layoutBackup", layoutPath]]) {
        if (!existsSync(source)) continue
        const target = resolve(stateDir, `${ids[0]}.${key}.json`)
        writeFileSync(target, readFileSync(source))
        backups[key] = relative(repoRoot, target).replaceAll("\\", "/")
      }
      state = { $schema: STATE_SCHEMA, fileKey: EXPECTED_FILE_KEY, entityId: ids[0], transactionId: ids[0], scopeFile: flags["scope-file"], snapshot: flags.snapshot, transcript: `${flags.snapshot}.transcript.json`, handoffAt: new Date().toISOString(), stage: "capture-start", pending: null, signatures: [], backups }
      saveState(state)
      const output = run(transactionCommand, ["capture", "--scope-file", state.scopeFile, "--snapshot", state.snapshot, ...(flags["expect-new"] === true ? ["--expect-new"] : [])])
      handoff(state, "capture", requestFrom(output))
    } else {
      state = loadState(ids[0])
      if (state.scopeFile !== flags["scope-file"] || state.snapshot !== flags.snapshot) throw new Error("Begin arguments do not match the resumable migration state")
      if (state.pending && !completePending(state, transactionCommand)) process.exit(0)
      if (state.stage === "capture-handoff") {
        Object.assign(state, snapshotSummary(state.snapshot))
        state.stage = "handoff-ready"
        saveState(state)
      }
      if (state.stage !== "handoff-ready") throw new Error(`Migration cannot begin from stage ${state.stage}`)
      console.log(`FIGMA-FAMILY-HANDOFF-READY: ${state.entityId}`)
    }
  } else if (action === "complete") {
    for (const name of ["transaction-id", "preliminary-capture", "full-capture"]) if (!flags[name] || flags[name] === true) throw new Error(`complete requires --${name} <value>`)
    const state = loadState(flags["transaction-id"])
    state.preliminaryCapture = flags["preliminary-capture"]
    state.fullCapture = flags["full-capture"]
    if (flags["created-nodes"] && flags["created-nodes"] !== true) state.createdNodes = flags["created-nodes"]
    if (state.pending) {
      const command = state.pending.kind.startsWith("audit-") ? liveCommand : transactionCommand
      if (!completePending(state, command)) process.exit(0)
      if (state.stage === "audit-preliminary-handoff") {
        auditCapture(state.preliminaryCapture, state.entityId, "preliminary")
        if (hashFile(evidencePath) !== state.backups.evidenceHash || hashFile(layoutPath) !== state.backups.layoutHash) throw new Error("Preliminary audit modified durable evidence or layout")
        state.preliminarySignature = state.signatures.at(-1)
        state.stage = "preliminary-passed"
      } else if (state.stage === "audit-full-handoff") {
        auditCapture(state.fullCapture, state.entityId, "full")
        state.fullSignature = state.signatures.at(-1)
        state.stage = "full-passed"
      } else if (state.stage === "verify-handoff") state.stage = "verified"
      saveState(state)
    }
    if (state.stage === "handoff-ready") {
      const output = run(liveCommand, ["begin", "--mode", "preliminary", "--scope-file", state.scopeFile, "--capture", state.preliminaryCapture])
      handoff(state, "audit-preliminary", requestFrom(output))
    } else if (state.stage === "preliminary-passed") {
      const output = run(liveCommand, ["begin", "--mode", "full", "--scope-file", state.scopeFile, "--capture", state.fullCapture, "--update-evidence"])
      handoff(state, "audit-full", requestFrom(output))
    } else if (state.stage === "full-passed") {
      const output = run(transactionCommand, ["verify", "--snapshot", state.snapshot, ...(state.createdNodes ? ["--created-nodes", state.createdNodes] : [])])
      handoff(state, "verify", requestFrom(output))
    } else if (state.stage === "verified") {
      const full = auditCapture(state.fullCapture, state.entityId, "full")
      const afterNodeIds = full.inventoryNodeIds || state.beforeNodeIds
      const before = new Set(state.beforeNodeIds)
      const after = new Set(afterNodeIds)
      const createdNodeIds = afterNodeIds.filter((id) => !before.has(id))
      const deletedNodeIds = state.beforeNodeIds.filter((id) => !after.has(id))
      const transcript = { $schema: TRANSCRIPT_SCHEMA, fileKey: state.fileKey, entityId: state.entityId, transactionId: state.transactionId, snapshotHash: state.snapshotHash, beforeInventoryHash: state.beforeInventoryHash, beforeNodeIds: state.beforeNodeIds, afterNodeIds, createdNodeIds, deletedNodeIds, reportedCreatedNodeIds: (state.createdNodes || "").split(",").filter(Boolean), preliminarySignature: state.preliminarySignature, fullSignature: state.fullSignature, cleanupVerdict: "not-required", absenceVerdict: "verified-by-transaction", restoreResult: "not-required", finalEvidenceHash: hashFile(evidencePath), completedAt: new Date().toISOString() }
      write(state.transcript, transcript)
      for (const backup of [state.backups.evidenceBackup, state.backups.layoutBackup]) if (backup && existsSync(resolve(repoRoot, backup))) rmSync(resolve(repoRoot, backup))
      rmSync(statePath(state.transactionId))
      console.log(`FIGMA-FAMILY-MIGRATION-OK: ${state.entityId}`)
    } else throw new Error(`Migration cannot complete from stage ${state.stage}`)
  } else if (action === "abort") {
    if (!flags["transaction-id"] || flags["transaction-id"] === true) throw new Error("abort requires --transaction-id <value>")
    if (!existsSync(statePath(flags["transaction-id"]))) { console.log(`FIGMA-FAMILY-MIGRATION-ABORTED: ${flags["transaction-id"]}`); process.exit(0) }
    const state = loadState(flags["transaction-id"])
    if (state.pending && state.pending.kind !== "restore") {
      const request = resolve(repoRoot, state.pending.requestPath)
      if (existsSync(request)) run(state.pending.kind.startsWith("audit-") ? liveCommand : transactionCommand, ["abort", "--request", request])
      state.pending = null
      saveState(state)
    }
    if (!existsSync(resolve(repoRoot, state.snapshot))) { rmSync(statePath(state.transactionId)); console.log(`FIGMA-FAMILY-MIGRATION-ABORTED: ${state.entityId}`); process.exit(0) }
    if (state.stage !== "restore-handoff") {
      const restoreArgs = ["restore", "--snapshot", state.snapshot]
      const restoreCreatedNodes = flags["created-nodes"] && flags["created-nodes"] !== true ? flags["created-nodes"] : state.createdNodes
      if (restoreCreatedNodes) restoreArgs.push("--created-nodes", restoreCreatedNodes)
      const output = run(transactionCommand, restoreArgs)
      handoff(state, "restore", requestFrom(output))
    } else if (!completePending(state, transactionCommand)) process.exit(0)
    else {
      rollbackEvidence(state)
      const restorePayload = state.restorePayload || {}
      const transcript = { $schema: TRANSCRIPT_SCHEMA, fileKey: state.fileKey, entityId: state.entityId, transactionId: state.transactionId, snapshotHash: state.snapshotHash, beforeInventoryHash: state.beforeInventoryHash, beforeNodeIds: state.beforeNodeIds, afterNodeIds: state.beforeNodeIds, createdNodeIds: restorePayload.discoveredCreatedNodeIds || [], reportedCreatedNodeIds: restorePayload.reportedCreatedNodeIds || [], createdNodeAgreementVerdict: restorePayload.createdNodeAgreementVerdict || "delta-discovered", deletedNodeIds: restorePayload.deletedNodeIds || [], preservedNodeIds: restorePayload.preservedNodeIds || [], residualNodeIds: restorePayload.residualNodeIds || [], restoredNodeIds: restorePayload.restoredNodeIds || [], preliminarySignature: state.preliminarySignature || null, fullSignature: state.fullSignature || null, cleanupVerdict: (restorePayload.residualNodeIds || []).length ? "cleanup-residual" : "reverse-order-cleanup-passed", absenceVerdict: (restorePayload.residualNodeIds || []).length ? "residual-detected" : "verified", restoreResult: "restored", evidenceRestored: true, finalEvidenceHash: hashFile(evidencePath), abortedAt: new Date().toISOString() }
      write(state.transcript, transcript)
      for (const backup of [state.backups.evidenceBackup, state.backups.layoutBackup]) if (backup && existsSync(resolve(repoRoot, backup))) rmSync(resolve(repoRoot, backup))
      rmSync(statePath(state.transactionId))
      console.log(`FIGMA-FAMILY-MIGRATION-ABORTED: ${state.entityId}`)
    }
  } else throw new Error("Expected begin, complete, or abort")
} catch (error) {
  const driftError = /rollback-unsafe-drift|incompatible-|state-drift/.test(error.message)
  if (driftError && flags["transaction-id"] && existsSync(statePath(flags["transaction-id"]))) error.message += `; escalation=${escalation(loadState(flags["transaction-id"]), error.message)}`
  if ((driftError || action === "complete") && flags["transaction-id"] && existsSync(statePath(flags["transaction-id"]))) {
    try {
      const state = loadState(flags["transaction-id"])
      if (state.fullSignature || ["full-passed", "verify-handoff", "verified"].includes(state.stage)) {
        rollbackEvidence(state)
        if (state.stage !== "restore-handoff") {
          state.pending = null
          const autoRestoreArgs = ["restore", "--snapshot", state.snapshot]
          if (state.createdNodes) autoRestoreArgs.push("--created-nodes", state.createdNodes)
          const output = run(transactionCommand, autoRestoreArgs)
          handoff(state, "restore", requestFrom(output))
        }
        error.message += "; evidence rolled back to pre-migration bytes; complete the restore handoff via abort"
      }
    } catch (rollbackError) {
      error.message += `; automatic rollback failed: ${rollbackError.message}`
    }
  }
  fail(error.message)
}
