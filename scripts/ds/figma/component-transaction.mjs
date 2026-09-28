import { createHash } from "node:crypto"

export const EXPECTED_FILE_KEY = "du0qpv9XrTt4HEWdPhesUh"
export const TRANSACTION_SCHEMA = "kernel-ds/figma-component-transaction@1"
export const TRANSACTION_REQUEST_SCHEMA = "kernel-ds/figma-transaction-request@1"
export const TRANSACTION_RESPONSE_SCHEMA = "kernel-ds/figma-transaction-response@1"
export const SUPPORTED_MUTATIONS = ["boundVariables", "cornerRadius", "description", "effects", "fills", "height", "name", "opacity", "parentIndex", "parentNodeId", "pluginData", "sharedPluginData", "strokes", "width", "x", "y"]
export const PROHIBITED_MUTATIONS = ["componentProperties", "componentSetMembership", "instanceMainComponent", "key", "variantProperties", "children"]

export function sha256(value) {
  return createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex")
}

export function validateSnapshot(snapshot) {
  if (!snapshot || snapshot.$schema !== TRANSACTION_SCHEMA) throw new Error("Invalid component transaction schema")
  if (snapshot.fileKey !== EXPECTED_FILE_KEY || !snapshot.entityId || !snapshot.transactionId) throw new Error("Component transaction identity is incomplete")
  if (!Array.isArray(snapshot.nodes) || !Array.isArray(snapshot.inventoryNodeIds) || !snapshot.inventoryHash || !snapshot.snapshotHash) throw new Error("Component transaction snapshot is incomplete")
  if (new Set(snapshot.inventoryNodeIds).size !== snapshot.inventoryNodeIds.length) throw new Error("Component transaction inventory contains duplicate node IDs")
  for (const node of snapshot.nodes) {
    if (!node.nodeId || !node.nodeType || !node.preconditions?.relationships) throw new Error("Component transaction node snapshot is incomplete")
    for (const key of Object.keys(node.state || {})) if (!SUPPORTED_MUTATIONS.includes(key)) throw new Error(`Unsupported restorable property ${key}`)
  }
  return snapshot
}

export function validateMutationReport(report) {
  for (const mutation of report?.mutations || []) {
    if (PROHIBITED_MUTATIONS.includes(mutation.property)) throw new Error(`Rollback-unsafe mutation ${mutation.property}`)
    if (!SUPPORTED_MUTATIONS.includes(mutation.property)) throw new Error(`Unsupported mutation ${mutation.property}`)
  }
  return report
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]))
  return value
}

export function fingerprint(value) {
  const text = JSON.stringify(canonical(value))
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `${text.length}:${(hash >>> 0).toString(16).padStart(8, "0")}`
}

export function allowsTrackedSectionChildren({ nodeType, expectedChildIdsHash, currentChildIds, reportedCreatedNodeIds }) {
  const reported = new Set(reportedCreatedNodeIds)
  const unreportedChildIds = currentChildIds.filter((id) => !reported.has(id))
  return nodeType === "SECTION" &&
    currentChildIds.some((id) => reported.has(id)) &&
    fingerprint(unreportedChildIds) === expectedChildIdsHash
}

export function inventoryDelta(beforeIds, afterIds) {
  const before = new Set(beforeIds)
  const after = new Set(afterIds)
  return { createdNodeIds: [...after].filter((id) => !before.has(id)).sort(), deletedNodeIds: [...before].filter((id) => !after.has(id)).sort() }
}

export function assertReportedCreatedNodes(delta, reportedIds = []) {
  const discovered = JSON.stringify([...delta.createdNodeIds].sort())
  const reported = JSON.stringify([...new Set(reportedIds)].sort())
  if (reportedIds.length && discovered !== reported) throw new Error("Mutation-reported node IDs do not match the inventory delta")
  return delta.createdNodeIds
}

export function validateTransactionRequest(request, implementation) {
  if (!request || request.$schema !== TRANSACTION_REQUEST_SCHEMA) throw new Error("Invalid transaction request schema")
  if (sha256(implementation) !== request.implementationHash || sha256(request.code) !== request.codeHash) throw new Error("Transaction request implementation was tampered with")
  const input = { operation: request.operation, requestId: request.requestId, requestHash: null, implementationHash: request.implementationHash, transactionId: request.transactionId, entityId: request.entityId || null, snapshot: request.snapshot || null, reportedCreatedNodeIds: request.reportedCreatedNodeIds || [], expectNew: request.expectNew === true }
  if (sha256(input) !== request.requestHash) throw new Error("Transaction request input was tampered with")
  return request
}

export function validateTransactionResponse(response, request) {
  if (!response || response.$schema !== TRANSACTION_RESPONSE_SCHEMA || response.verdict !== "pass") throw new Error("Transaction response failed")
  for (const key of ["operation", "requestId", "requestHash", "implementationHash", "transactionId"]) if (response[key] !== request[key]) throw new Error(`Transaction response mismatched ${key}`)
  if (response.fileKey !== EXPECTED_FILE_KEY || response.entityId !== (request.entityId || null)) throw new Error("Transaction response returned wrong file or entity")
  if (!response.payload || typeof response.payload !== "object") throw new Error("Transaction response payload is missing")
  return response
}
