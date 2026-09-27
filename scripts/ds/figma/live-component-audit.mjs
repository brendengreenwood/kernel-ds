import { createHash } from "node:crypto"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { mkdirSync } from "node:fs"
import { repoRoot, stableJson } from "./component-scope.mjs"

export const LIVE_AUDIT_SCHEMA = "kernel-ds/figma-live-component-audit@1"
export const EVIDENCE_SCHEMA = "kernel-ds/figma-component-evidence@1"
export const LAYOUT_SCHEMA = "kernel-ds/figma-component-layout@1"

export function hash(value) {
  return createHash("sha256").update(typeof value === "string" ? value : stableJson(value)).digest("hex")
}

export function validateLiveAuditResponse(response, request) {
  if (!response || response.$schema !== LIVE_AUDIT_SCHEMA) throw new Error("Invalid live-audit response schema")
  for (const field of ["requestId", "requestHash", "implementationHash", "mode"]) {
    if (response[field] !== request[field]) throw new Error(`Live-audit response ${field} does not match request`)
  }
  if (response.fileKey !== "du0qpv9XrTt4HEWdPhesUh") throw new Error(`Live audit returned wrong file ${response.fileKey}`)
  if (response.expected !== request.entities.length) throw new Error("Live-audit expected count does not match scope")
  if (response.verdict !== "pass" || response.failures?.length) throw new Error(`Live audit failed: ${stableJson(response.failures || [])}`)
  const ids = response.records.map((record) => record.entityId)
  if (new Set(ids).size !== ids.length || stableJson([...ids].sort()) !== stableJson([...request.entities].sort())) throw new Error("Live-audit records do not exactly match scope")
  const accessibilityFields = ["nameRole", "target", "focusState", "nonColorDifferentiation", "annotations"]
  for (const record of response.records) {
    const contract = request.contracts[record.entityId]
    if (record.contractHash !== contract?.contractHash) throw new Error(`Stale contract evidence for ${record.entityId}`)
    const expectedContractEvidence = {
      codeVariantAxes: contract.variantAxes || {},
      designStateAxes: contract.designStateAxes || {},
      figmaProperties: contract.figmaProperties || {},
      anatomySlots: [...(contract.slots || [])].sort(),
      requiredTokenRoles: contract.requiredTokenRoles || [],
    }
    if (stableJson(record.contractEvidence) !== stableJson(expectedContractEvidence)) throw new Error(`Invalid contract evidence for ${record.entityId}`)
    if (stableJson(Object.keys(record.accessibility || {}).sort()) !== stableJson(accessibilityFields.slice().sort())) throw new Error(`Incomplete accessibility checklist for ${record.entityId}`)
    for (const value of Object.values(record.accessibility)) {
      if (!value || !["pass", "notApplicable"].includes(value.verdict)) throw new Error(`Invalid accessibility checklist for ${record.entityId}`)
      if (value.verdict === "notApplicable" && !value.reason) throw new Error(`Missing notApplicable reason for ${record.entityId}`)
    }
  }
  if (request.mode === "full") {
    for (const [label, records] of [["layout", response.layouts], ["acceptance", response.acceptance]]) {
      const recordIds = records.map((record) => record.entityId)
      if (new Set(recordIds).size !== recordIds.length || stableJson(recordIds.slice().sort()) !== stableJson(request.entities.slice().sort())) throw new Error(`Full audit ${label} records do not exactly match scope`)
    }
    for (const layout of response.layouts) {
      if (layout.verdict !== "pass" || layout.expectedX !== 0 || !layout.sectionNodeId || !layout.bounds) throw new Error(`Invalid layout evidence for ${layout.entityId}`)
    }
    for (const record of response.acceptance) {
      if (record.verdict !== "pass" || record.detached !== false || !record.acceptanceInstanceNodeId || !record.mainComponentId || !record.mainComponentKey || !record.ownerSectionId || record.contractHash !== request.contracts[record.entityId]?.contractHash) throw new Error(`Invalid acceptance evidence for ${record.entityId}`)
      const evidenceRecord = response.records.find((item) => item.entityId === record.entityId)
      if (!evidenceRecord || evidenceRecord.mainComponentKey !== record.mainComponentKey) throw new Error(`Acceptance instance main component mismatch for ${record.entityId}`)
    }
  } else if (response.layouts.length || response.acceptance.length) throw new Error("Preliminary audit returned full-mode evidence")
  return response
}

function writeJson(path, value) {
  const absolute = resolve(repoRoot, path)
  mkdirSync(dirname(absolute), { recursive: true })
  writeFileSync(absolute, stableJson(value))
}

function mergeByEntity(existing, incoming, finalScope) {
  const records = new Map((existing?.records || []).map((record) => [record.entityId, record]))
  for (const record of incoming) records.set(record.entityId, record)
  const merged = [...records.values()].sort((a, b) => a.entityId.localeCompare(b.entityId))
  if (finalScope && merged.length !== incoming.length) throw new Error("Final 62-entity audit contains extra preserved evidence")
  return merged
}

export function persistLiveAudit(response, request) {
  writeJson(request.capture, response)
  if (!request.updateEvidence) return
  if (request.mode !== "full") throw new Error("Only full audits may update evidence")
  const evidencePath = resolve(repoRoot, "docs/figma/component-evidence.json")
  const prior = existsSync(evidencePath) ? JSON.parse(readFileSync(evidencePath, "utf8")) : null
  const records = mergeByEntity(prior, response.records, request.entities.length === 62)
  writeJson("docs/figma/component-evidence.json", { $schema: EVIDENCE_SCHEMA, fileKey: response.fileKey, records })
  const priorLayoutPath = resolve(repoRoot, "docs/figma/component-layout.json")
  const priorLayout = existsSync(priorLayoutPath) ? JSON.parse(readFileSync(priorLayoutPath, "utf8")) : null
  const layouts = mergeByEntity(priorLayout, response.layouts, request.entities.length === 62)
  writeJson("docs/figma/component-layout.json", { $schema: LAYOUT_SCHEMA, fileKey: response.fileKey, records: layouts })
  if (request.proofOut) writeJson(request.proofOut, { $schema: "kernel-ds/figma-acceptance@1", fileKey: response.fileKey, records: response.acceptance })
}
