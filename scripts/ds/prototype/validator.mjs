import { existsSync } from "node:fs"
import { resolve } from "node:path"
import {
  PROTOTYPE_REGISTRY_SCHEMA,
  acceptanceTypes,
  canonicalLocatorTypes,
  concernStates,
  concerns,
  figmaNodeKinds,
  initiativeLifecycles,
  originSurfaces,
  promotionTargets,
} from "./schema.mjs"

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SCOPE = /^[a-z0-9]+(?:[./-][a-z0-9]+)*$/
const NODE_ID = /^\d+:\d+$/
const COMPONENT_KEY = /^[a-f0-9]{40}$/
const SHA = /^[a-f0-9]{40}$/
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function issue(code, path, message) {
  return { code, path, message }
}

function isString(value) {
  return typeof value === "string" && value.length > 0
}

function validateAcceptance(value, path, issues) {
  if (!value || !acceptanceTypes.includes(value.type)) {
    issues.push(issue("invalid-acceptance", path, "Promotion acceptance must use an allowed artifact type"))
    return
  }
  if (!isString(value.path) || !isString(value.commit) || !SHA.test(value.commit)) {
    issues.push(issue("invalid-acceptance", path, "Acceptance must identify a committed artifact path and 40-character commit"))
  }
  if (!isString(value.initiativeId) || !isString(value.concern) || !isString(value.scopeKey) || !isString(value.target)) {
    issues.push(issue("invalid-acceptance", path, "Acceptance must bind initiative, concern, scope, and target"))
  }
}

function validateCanonical(value, path, issues) {
  if (!value || !promotionTargets.includes(value.package)) {
    issues.push(issue("invalid-canonical-evidence", path, "Promoted concern must identify a canonical package"))
    return
  }
  if (!canonicalLocatorTypes.includes(value.locatorType) || !isString(value.symbol) || !isString(value.sourcePath) || !SHA.test(value.commit ?? "")) {
    issues.push(issue("invalid-canonical-evidence", path, "Canonical evidence requires locator type, symbol, source path, and immutable commit"))
  }
}

function validateMigrationImport(value, record, path, issues) {
  if (!value) return
  if (value.type !== "migration-import" || !isString(value.sourcePath) || !Array.isArray(value.sourceIds) || value.sourceIds.length === 0 || !value.sourceIds.every(isString)) {
    issues.push(issue("invalid-migration-import", path, "Migration import requires its source ledger and source IDs"))
  }
  if (!ISO_DATE.test(value.migrationDate ?? "") || value.mappedState !== record.state || !Array.isArray(value.priorEvidence)) {
    issues.push(issue("invalid-migration-import", path, "Migration import must record date, mapped state, and prior evidence"))
  }
  if (record.history?.[0]?.source !== "migration-import") {
    issues.push(issue("invalid-migration-import", path, "Migration-import concerns require a distinct genesis authorization event"))
  }
}

export function validatePrototypeRegistry(registry, { entities = [], root = process.cwd(), checkLivePaths = true } = {}) {
  const issues = []
  const entityMap = new Map(entities.map((entity) => [entity.id, entity]))
  if (!registry || registry.$schema !== PROTOTYPE_REGISTRY_SCHEMA || registry.version !== 1) {
    issues.push(issue("invalid-registry-version", "$", `Expected ${PROTOTYPE_REGISTRY_SCHEMA} version 1`))
    return issues
  }
  if (!registry.figma || !isString(registry.figma.fileKey) || !isString(registry.figma.name)) {
    issues.push(issue("invalid-figma-file", "figma", "Registry requires canonical Figma file metadata"))
  }
  if (!Array.isArray(registry.initiatives)) {
    issues.push(issue("invalid-initiatives", "initiatives", "Registry initiatives must be an array"))
    return issues
  }

  const initiativeIds = new Set()
  const activeTuples = new Set()
  for (const [index, initiative] of registry.initiatives.entries()) {
    const base = `initiatives[${index}]`
    if (!ID.test(initiative.id ?? "") || initiativeIds.has(initiative.id)) {
      issues.push(issue("invalid-initiative-id", `${base}.id`, "Initiative id must be unique kebab-case"))
    }
    initiativeIds.add(initiative.id)
    if (!isString(initiative.title) || !initiativeLifecycles.includes(initiative.lifecycle) || !SCOPE.test(initiative.scopeKey ?? "")) {
      issues.push(issue("invalid-initiative", base, "Initiative requires title, lifecycle, and typed scopeKey"))
    }
    if (!Array.isArray(initiative.entityIds) || initiative.entityIds.length === 0) {
      issues.push(issue("missing-entity", `${base}.entityIds`, "Initiative must reference at least one catalog entity"))
    }
    for (const entityId of initiative.entityIds ?? []) {
      if (!entityMap.has(entityId)) issues.push(issue("unknown-entity", `${base}.entityIds`, `Unknown catalog entity ${entityId}`))
    }
    for (const supersededId of initiative.supersedes ?? []) {
      if (!isString(supersededId) || supersededId === initiative.id) issues.push(issue("invalid-supersedes", `${base}.supersedes`, "Supersedes references another initiative id"))
    }

    for (const [surfaceIndex, figma] of (initiative.surfaces?.figma ?? []).entries()) {
      const path = `${base}.surfaces.figma[${surfaceIndex}]`
      if (!figmaNodeKinds.includes(figma.kind) || !isString(figma.fileKey) || !NODE_ID.test(figma.nodeId ?? "")) {
        issues.push(issue("invalid-figma-reference", path, "Figma reference requires known kind, file key, and node id"))
      }
      if (["component", "component-set"].includes(figma.kind) && !COMPONENT_KEY.test(figma.key ?? "")) {
        issues.push(issue("invalid-figma-reference", `${path}.key`, "Published Figma components require a 40-character key"))
      }
    }
    for (const [surfaceIndex, app] of (initiative.surfaces?.kernelApp ?? []).entries()) {
      const path = `${base}.surfaces.kernelApp[${surfaceIndex}]`
      if (!isString(app.route) || !app.route.startsWith("/") || !isString(app.sourcePath)) {
        issues.push(issue("invalid-kernel-app-reference", path, "kernel-app reference requires an absolute route and source path"))
      } else if (checkLivePaths && !existsSync(resolve(root, app.sourcePath))) {
        issues.push(issue("missing-live-path", `${path}.sourcePath`, `Live source path does not exist: ${app.sourcePath}`))
      }
    }

    if (!Array.isArray(initiative.concerns) || initiative.concerns.length === 0) {
      issues.push(issue("missing-concern", `${base}.concerns`, "Initiative must contain at least one concern"))
      continue
    }
    const seenConcerns = new Set()
    for (const [concernIndex, record] of initiative.concerns.entries()) {
      const path = `${base}.concerns[${concernIndex}]`
      if (!concerns.includes(record.concern) || seenConcerns.has(record.concern)) {
        issues.push(issue("invalid-concern", `${path}.concern`, "Concern must be allowed and unique within an initiative"))
      }
      seenConcerns.add(record.concern)
      if (!concernStates.includes(record.state) || !originSurfaces.includes(record.origin)) {
        issues.push(issue("invalid-concern-state", path, "Concern requires a known state and origin surface"))
      }
      validateMigrationImport(record.migrationImport, record, `${path}.migrationImport`, issues)
      if (!Array.isArray(record.history) || record.history.length === 0) {
        issues.push(issue("missing-transition-history", `${path}.history`, "Concern requires append-only transition history"))
      } else {
        let state
        for (const [historyIndex, entry] of record.history.entries()) {
          const historyPath = `${path}.history[${historyIndex}]`
          if (!concernStates.includes(entry.to) || (entry.from !== null && !concernStates.includes(entry.from)) || !ISO_DATE.test(entry.date ?? "") || !isString(entry.actor) || !isString(entry.source) || !isString(entry.reason) || !Array.isArray(entry.evidence)) {
            issues.push(issue("invalid-transition-history", historyPath, "History entry requires from/to/date/actor/source/reason/evidence"))
          }
          if (entry.from !== state && !(historyIndex === 0 && entry.from === null)) issues.push(issue("broken-transition-history", historyPath, "History entries must form an append-only state chain"))
          state = entry.to
        }
        if (state !== record.state) issues.push(issue("broken-transition-history", path, "Concern state must match its final history entry"))
      }
      if (initiative.lifecycle === "retired" && ["candidate", "validated"].includes(record.state)) {
        issues.push(issue("unresolved-retired-initiative", path, "Retired initiatives cannot retain candidate or validated concerns"))
      }
      if (initiative.lifecycle === "active") {
        for (const entityId of initiative.entityIds ?? []) {
          const tuple = `${entityId}|${record.concern}|${initiative.scopeKey}`
          if (activeTuples.has(tuple)) issues.push(issue("duplicate-active-scope", path, `Duplicate active tuple ${tuple}`))
          activeTuples.add(tuple)
        }
      }
      if (record.state === "promoted") {
        validateCanonical(record.canonical, `${path}.canonical`, issues)
        validateAcceptance(record.acceptance, `${path}.acceptance`, issues)
        const expectedTarget = ["object-model", "workflow", "data"].includes(record.concern) ? "@kernel/definitions" : "@kernel/ui"
        if (record.canonical?.package !== expectedTarget) issues.push(issue("invalid-promotion-target", path, `${record.concern} promotions must target ${expectedTarget}`))
        const owner = entityMap.get(record.canonical?.entityId)?.package
        if (owner !== record.canonical?.package) issues.push(issue("canonical-owner-mismatch", path, "Canonical entity owner must match the promotion package"))
      }
    }
  }
  for (const [index, initiative] of registry.initiatives.entries()) {
    for (const supersededId of initiative.supersedes ?? []) {
      if (!initiativeIds.has(supersededId)) issues.push(issue("unknown-supersedes", `initiatives[${index}].supersedes`, `Unknown initiative ${supersededId}`))
    }
  }
  return issues
}
