import { randomUUID } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, relative, resolve } from "node:path"
import { parseFlags } from "../lib/args.mjs"
import { repoRoot, stableJson, validateEntityIds } from "../figma/component-scope.mjs"
import { loadComponentScope } from "../figma/component-scope.mjs"
import { EXPECTED_FILE_KEY, TRANSACTION_REQUEST_SCHEMA, TRANSACTION_SCHEMA, sha256, validateSnapshot, validateTransactionRequest, validateTransactionResponse } from "../figma/component-transaction.mjs"

const stateDir = resolve(repoRoot, ".mastracode/plans/full-kernel-ui-figma-integration.proof/transactions/requests")
function fail(message) { console.error(`FIGMA-TRANSACTION-FAILED: ${message}`); process.exitCode = 1 }
function readJson(path) { return JSON.parse(readFileSync(resolve(repoRoot, path), "utf8")) }
function writeJson(path, value) { const target = resolve(repoRoot, path); mkdirSync(dirname(target), { recursive: true }); writeFileSync(target, stableJson(value)) }
function required(flags, names, command) { for (const name of names) if (!flags[name] || flags[name] === true) throw new Error(`${command} requires --${name} <value>`) }

function entityFromScope(scopeFile) {
  const cohort = readJson(scopeFile)
  const scope = loadComponentScope()
  const ids = validateEntityIds(cohort.entityIds, new Set(scope.components.map((item) => item.id)), "transaction cohort")
  if (ids.length !== 1) throw new Error("Transaction cohort must contain exactly one entity")
  return ids[0]
}

function begin(operation, flags) {
  let entityId = null
  let transactionId = flags["transaction-id"] || null
  let snapshot = null
  let output = flags.snapshot || null
  if (operation === "capture") {
    required(flags, ["scope-file", "snapshot"], "capture")
    entityId = entityFromScope(flags["scope-file"])
    transactionId ||= entityId
    if (transactionId !== entityId) throw new Error("Production transaction IDs must equal the cohort entity ID")
    if (transactionId === "transaction-smoke") throw new Error("Proof IDs are not valid production transactions")
  } else if (["restore", "verify"].includes(operation)) {
    required(flags, ["snapshot"], operation)
    snapshot = validateSnapshot(readJson(flags.snapshot))
    entityId = snapshot.entityId
    transactionId = snapshot.transactionId
  } else if (operation === "smoke-run") {
    if (flags["proof-id"] !== "transaction-smoke") throw new Error("smoke-run requires --proof-id transaction-smoke")
    required(flags, ["snapshot"], "smoke-run")
    transactionId = "transaction-smoke"
  }
  const implementation = readFileSync(resolve(repoRoot, "scripts/ds/figma/component-transaction.js"), "utf8")
  const requestId = randomUUID()
  const implementationHash = sha256(implementation)
  const reportedCreatedNodeIds = ["restore", "verify"].includes(operation) && flags["created-nodes"] && flags["created-nodes"] !== true ? flags["created-nodes"].split(",").filter(Boolean) : []
  const expectNew = operation === "capture" && flags["expect-new"] === true
  const input = { operation, requestId, requestHash: null, implementationHash, transactionId, entityId, snapshot, reportedCreatedNodeIds, expectNew }
  input.requestHash = sha256(input)
  const code = implementation.replace("__KERNEL_TRANSACTION_INPUT__", JSON.stringify(input))
  const responsePath = `.mastracode/plans/full-kernel-ui-figma-integration.proof/transactions/requests/${requestId}.response.json`
  const request = { $schema: TRANSACTION_REQUEST_SCHEMA, ...input, output, responsePath, code, codeHash: sha256(code) }
  const requestPath = resolve(stateDir, `${requestId}.request.json`)
  writeJson(requestPath, request)
  console.log(`FIGMA-TRANSACTION-HANDOFF-READY: ${relative(repoRoot, requestPath).replaceAll("\\", "/")}`)
}

function complete(flags) {
  required(flags, ["request"], "transaction completion")
  const requestPath = resolve(repoRoot, flags.request)
  const request = readJson(flags.request)
  const implementation = readFileSync(resolve(repoRoot, "scripts/ds/figma/component-transaction.js"), "utf8")
  validateTransactionRequest(request, implementation)
  if (!existsSync(resolve(repoRoot, request.responsePath))) throw new Error(`Missing transaction response ${request.responsePath}`)
  const response = validateTransactionResponse(readJson(request.responsePath), request)
  if (request.operation === "capture") {
    const snapshotBase = {
      $schema: TRANSACTION_SCHEMA,
      fileKey: EXPECTED_FILE_KEY,
      entityId: request.entityId,
      transactionId: request.transactionId,
      capturedAt: new Date().toISOString(),
      inventoryNodeIds: response.payload.inventoryNodeIds,
      inventoryHash: sha256(response.payload.inventoryNodeIds),
      nodes: response.payload.nodes,
    }
    const snapshot = { ...snapshotBase, snapshotHash: sha256(snapshotBase) }
    validateSnapshot(snapshot)
    writeJson(request.output, snapshot)
    console.log(`FIGMA-TRANSACTION-CAPTURE-OK: ${request.transactionId}`)
  } else if (request.operation === "verify") {
    if (response.payload.deletedNodeIds.length) throw new Error(`Transaction verification found deleted=${response.payload.deletedNodeIds.length}`)
    if (response.payload.createdNodeIds.length && response.payload.createdNodeAgreementVerdict !== "exact-match") throw new Error(`Transaction verification found unreported created nodes: ${response.payload.createdNodeIds.length}`)
    console.log(`FIGMA-TRANSACTION-VERIFY-OK: ${request.transactionId}${response.payload.createdNodeIds.length ? ` (created nodes verified: ${response.payload.createdNodeIds.length})` : ""}`)
  } else if (request.operation === "restore") {
    if (response.payload.residualNodeIds.length) throw new Error(`Transaction restore left residual nodes: ${response.payload.residualNodeIds.join(",")}`)
    const preserved = response.payload.preservedNodeIds || []
    console.log(`FIGMA-TRANSACTION-RESTORE-OK: ${request.transactionId}${preserved.length ? ` (preserved unscoped nodes: ${preserved.join(",")})` : ""}`)
  } else if (request.operation === "smoke-run") {
    if (!response.payload.restored || !response.payload.createdNodeId) throw new Error("Live transaction smoke did not restore the disposable node")
    writeJson(request.output, { $schema: "kernel-ds/figma-transaction-smoke@1", fileKey: EXPECTED_FILE_KEY, proofId: request.transactionId, requestHash: request.requestHash, createdNodeId: response.payload.createdNodeId, cleanupVerified: true })
    console.log("FIGMA-TRANSACTION-SMOKE-OK: transaction-smoke")
  }
  rmSync(requestPath)
}

function abort(flags) {
  required(flags, ["request"], "abort")
  const requestPath = resolve(repoRoot, flags.request)
  if (existsSync(requestPath)) {
    const request = readJson(flags.request)
    if (request.$schema === TRANSACTION_REQUEST_SCHEMA && existsSync(resolve(repoRoot, request.responsePath))) rmSync(resolve(repoRoot, request.responsePath))
    rmSync(requestPath)
  }
  console.log("FIGMA-TRANSACTION-ABORTED")
}

try {
  const [action, ...rest] = process.argv.slice(2)
  const { flags, positional } = parseFlags(rest)
  if (positional.length) throw new Error(`Unexpected positional arguments: ${positional.join(" ")}`)
  if (action === "abort") abort(flags)
  else if (flags.request) complete(flags)
  else if (["capture", "restore", "verify", "smoke-run"].includes(action)) begin(action, flags)
  else throw new Error("Expected capture, restore, verify, smoke-run, or abort")
} catch (error) { fail(error.message) }
