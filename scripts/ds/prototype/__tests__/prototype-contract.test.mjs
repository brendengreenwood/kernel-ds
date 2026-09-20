import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdtempSync, mkdirSync, readFileSync, renameSync, rmSync, unlinkSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import test from "node:test"
import { mapCatalogEntityContract } from "../../lib/dsds-contract.mjs"
import { verifyPromotionEvidence } from "../evidence.mjs"
import { concernStates, transitionMatrix } from "../schema.mjs"
import { authorizePrototypeTransition } from "../transition.mjs"
import { validatePrototypeRegistry } from "../validator.mjs"

const DATE = "2026-09-20"
const entities = [
  { id: "component.button", kind: "component", package: "@kernel/ui" },
  { id: "object.workspace", kind: "object", package: "@kernel/definitions" },
]

function history(state = "exploration") {
  const entries = [{ from: null, to: "exploration", date: DATE, actor: "tester", source: "fixture", reason: "Discovery recorded", evidence: [] }]
  if (state !== "exploration") entries.push({ from: "exploration", to: state, date: DATE, actor: "tester", source: "fixture", reason: "Fixture advanced", evidence: [] })
  return entries
}

function concern(concernName = "visual", state = "exploration", origin = "figma") {
  return { concern: concernName, state, origin, history: history(state) }
}

function initiative(overrides = {}) {
  return {
    id: "workspace-contract-discovery",
    title: "Workspace contract discovery",
    lifecycle: "active",
    scopeKey: "workspace/default",
    entityIds: ["object.workspace"],
    surfaces: { figma: [{ fileKey: "fixture", nodeId: "1:2", kind: "frame" }], kernelApp: [] },
    concerns: [concern("workflow", "exploration", "kernel-app")],
    ...overrides,
  }
}

function registry(initiatives = [initiative()]) {
  return { $schema: "kernel-ds/prototype-registry@1", version: 1, figma: { fileKey: "fixture", name: "Fixture DS" }, initiatives }
}

function transitionArgs(item, concernName, nextState, extra = {}) {
  return {
    initiative: item,
    concern: concernName,
    nextState,
    date: DATE,
    actor: "tester",
    source: "test",
    reason: "Audited transition",
    evidence: [],
    verifyPromotion: () => ({ ok: true, status: "verified", issues: [] }),
    ...extra,
  }
}

function run(root, command, args = []) {
  return execFileSync(command, args, { cwd: root, encoding: "utf8", windowsHide: true })
}

function write(root, path, contents) {
  const full = join(root, path)
  mkdirSync(join(full, ".."), { recursive: true })
  writeFileSync(full, contents)
}

function commit(root, message) {
  run(root, "git", ["add", "."])
  run(root, "git", ["commit", "-m", message])
  return run(root, "git", ["rev-parse", "HEAD"]).trim()
}

function createEvidenceRepo() {
  const root = mkdtempSync(join(tmpdir(), "kernel-prototype-evidence-"))
  run(root, "git", ["init", "-q"])
  run(root, "git", ["config", "user.email", "prototype@example.com"])
  run(root, "git", ["config", "user.name", "Prototype Test"])
  write(root, "packages/catalog/src/entities.ts", `export const catalog = [\n  {\n    "id": "object.workspace",\n    "name": "Workspace",\n    "kind": "object",\n    "package": "@kernel/definitions",\n    "documentation": { "portalAnchor": "workspace" },\n    "sourceFiles": ["packages/definitions/src/composition.ts"],\n    "relationships": []\n  }\n] as const satisfies readonly CatalogEntity[]\n`)
  write(root, "packages/definitions/package.json", JSON.stringify({ name: "@kernel/definitions", type: "module", exports: { ".": { import: "./dist/index.js" }, "./composition": { import: "./dist/composition.js" } } }, null, 2))
  write(root, "packages/definitions/src/index.ts", `export { compositionContract } from "./composition.ts"\n`)
  const initialCommit = commit(root, "chore: seed package")
  write(root, "packages/definitions/src/composition.ts", `export const compositionContract = { version: 1 }\n`)
  const canonicalCommit = commit(root, "feat: add composition contract")
  const snapshot = {
    repository: "brendengreenwood/kernel-ds",
    reviewId: "review-1",
    reviewer: "reviewer",
    submittedCommitSha: canonicalCommit,
    approvalText: "Approve workspace-contract-discovery workflow workspace/default promotion to @kernel/definitions.",
    initiativeId: "workspace-contract-discovery",
    concern: "workflow",
    scopeKey: "workspace/default",
    target: "@kernel/definitions",
    retrievedAt: "2026-09-20T01:00:00Z",
    sourceUrl: "https://example.invalid/reviews/1"
  }
  write(root, "docs/prototypes/acceptances/workspace-contract.json", `${JSON.stringify(snapshot, null, 2)}\n`)
  const acceptanceCommit = commit(root, "docs: record workspace promotion acceptance")
  return { root, initialCommit, canonicalCommit, acceptanceCommit }
}

function validPromotion(repo, overrides = {}) {
  return {
    initiative: initiative({ concerns: [concern("workflow", "validated", "kernel-app")] }),
    concern: { concern: "workflow" },
    acceptance: {
      type: "pr-review-snapshot",
      path: "docs/prototypes/acceptances/workspace-contract.json",
      commit: repo.acceptanceCommit,
      initiativeId: "workspace-contract-discovery",
      concern: "workflow",
      scopeKey: "workspace/default",
      target: "@kernel/definitions",
    },
    canonical: {
      entityId: "object.workspace",
      package: "@kernel/definitions",
      locatorType: "public-export",
      symbol: "compositionContract",
      sourcePath: "packages/definitions/src/composition.ts",
      commit: repo.canonicalCommit,
    },
    ...overrides,
  }
}

test("valid mixed visual and contract-data registry survives JSON persistence", () => {
  const mixed = initiative({
    entityIds: ["object.workspace", "component.button"],
    concerns: [concern("visual"), concern("data", "candidate", "kernel-app")],
  })
  const original = registry([mixed])
  const loaded = JSON.parse(`${JSON.stringify(original, null, 2)}\n`)
  assert.deepEqual(loaded, original)
  assert.deepEqual(validatePrototypeRegistry(loaded, { entities, checkLivePaths: false }), [])
})

test("DSDS projection includes deterministic prototype concerns by catalog entity", () => {
  const entity = {
    id: "component.button",
    kind: "component",
    name: "Button",
    package: "@kernel/ui",
    documentation: { portalAnchor: "c-button" },
    sourceFiles: ["packages/ui/src/components/ui/button.tsx"],
    relationships: [],
  }
  const input = registry([
    initiative({
      id: "button-polish",
      entityIds: ["component.button"],
      scopeKey: "button/default",
      concerns: [concern("visual", "candidate")],
    }),
  ])
  const first = mapCatalogEntityContract(entity, input)
  const second = mapCatalogEntityContract(entity, JSON.parse(JSON.stringify(input)))
  assert.deepEqual(first, second)
  assert.deepEqual(first.$extensions["com.kernel.prototype"], {
    contractVersion: 1,
    initiatives: [{
      initiativeId: "button-polish",
      lifecycle: "active",
      scopeKey: "button/default",
      concerns: [{ concern: "visual", state: "candidate" }],
    }],
  })
})

test("validator rejects invalid entities, paths, Figma kinds, retirement, and duplicate active scopes", () => {
  const invalid = initiative({
    entityIds: ["object.missing"],
    lifecycle: "retired",
    surfaces: {
      figma: [{ fileKey: "fixture", nodeId: "bad", kind: "published-widget" }],
      kernelApp: [{ route: "/workspace", sourcePath: "kernel-app/src/missing.tsx" }],
    },
    concerns: [concern("workflow", "candidate", "kernel-app")],
  })
  const duplicate = initiative({ id: "duplicate-workspace", concerns: [concern("workflow")] })
  const duplicateAgain = initiative({ id: "duplicate-workspace-again", concerns: [concern("workflow")] })
  const codes = validatePrototypeRegistry(registry([invalid, duplicate, duplicateAgain]), { entities, root: process.cwd() }).map((entry) => entry.code)
  for (const expected of ["unknown-entity", "invalid-figma-reference", "missing-live-path", "unresolved-retired-initiative", "duplicate-active-scope"]) assert(codes.includes(expected), expected)
})

test("validator rejects false documentation-only and wrong-owner promotions", () => {
  const promoted = initiative({ concerns: [{
    ...concern("workflow", "promoted", "kernel-app"),
    canonical: { entityId: "object.workspace", package: "@kernel/ui", locatorType: "public-export", symbol: "DocsOnly", sourcePath: "docs/example.md", commit: "a".repeat(40) },
    acceptance: { type: "decision-record", path: "docs/decisions/0001-example.md", commit: "b".repeat(40), initiativeId: "workspace-contract-discovery", concern: "workflow", scopeKey: "workspace/default", target: "@kernel/ui" },
  }] })
  const codes = validatePrototypeRegistry(registry([promoted]), { entities, checkLivePaths: false }).map((entry) => entry.code)
  assert(codes.includes("invalid-promotion-target"))
  assert(codes.includes("canonical-owner-mismatch"))
})

test("transition matrix authorizes every allowed edge and refuses every other edge", () => {
  for (const from of concernStates) {
    for (const to of concernStates) {
      const item = initiative({ concerns: [{ ...concern("visual"), state: from, history: [{ from: null, to: from, date: DATE, actor: "tester", source: "fixture", reason: "Initial fixture state", evidence: [] }] }] })
      const result = authorizePrototypeTransition(transitionArgs(item, "visual", to, to === "promoted" ? {
        acceptance: { type: "decision-record" },
        canonical: { package: "@kernel/ui" },
      } : {}))
      assert.equal(result.ok, transitionMatrix[from].includes(to), `${from} -> ${to}`)
    }
  }
})

test("rollback, prototype-only, and reopen transitions require an audit reason", () => {
  for (const [from, to] of [["candidate", "exploration"], ["validated", "candidate"], ["exploration", "prototype-only"], ["prototype-only", "candidate"]]) {
    const item = initiative({ concerns: [{ ...concern("visual"), state: from, history: [{ from: null, to: from, date: DATE, actor: "tester", source: "fixture", reason: "Initial fixture state", evidence: [] }] }] })
    const result = authorizePrototypeTransition(transitionArgs(item, "visual", to, { reason: "" }))
    assert.equal(result.ok, false, `${from} -> ${to}`)
  }
})

test("promotion rejects actor-only, missing, generic, and mismatched acceptance", () => {
  const item = initiative({ concerns: [concern("workflow", "validated", "kernel-app")] })
  for (const acceptance of [undefined, { acceptedBy: "reviewer" }, { type: "pr-review-snapshot" }]) {
    const result = authorizePrototypeTransition(transitionArgs(item, "workflow", "promoted", {
      acceptance,
      canonical: { package: "@kernel/definitions" },
      verifyPromotion: () => ({ ok: false, status: "invalid", issues: ["Acceptance artifact is generic or mismatched"] }),
    }))
    assert.equal(result.ok, false)
  }
})

test("canonical evidence verifies direct source through a public re-export", () => {
  const repo = createEvidenceRepo()
  try {
    const result = verifyPromotionEvidence({ root: repo.root, entities, ...validPromotion(repo) })
    assert.deepEqual(result, { ok: true, status: "verified", issues: [] })
  } finally { rmSync(repo.root, { recursive: true, force: true }) }
})

test("canonical evidence rejects wrong path, missing symbol, foreign owner, and pre-implementation commit", () => {
  const repo = createEvidenceRepo()
  try {
    const cases = [
      { canonical: { ...validPromotion(repo).canonical, sourcePath: "packages/definitions/src/missing.ts" } },
      { canonical: { ...validPromotion(repo).canonical, symbol: "missingContract" } },
      { canonical: { ...validPromotion(repo).canonical, package: "@kernel/ui" } },
      { canonical: { ...validPromotion(repo).canonical, commit: repo.initialCommit } },
    ]
    for (const overrides of cases) {
      const result = verifyPromotionEvidence({ root: repo.root, entities, ...validPromotion(repo, overrides) })
      assert.equal(result.ok, false)
      assert.equal(result.status, "invalid")
    }
  } finally { rmSync(repo.root, { recursive: true, force: true }) }
})

test("unreachable history is reported separately from invalid evidence", () => {
  const repo = createEvidenceRepo()
  try {
    const promotion = validPromotion(repo)
    promotion.canonical.commit = "f".repeat(40)
    const result = verifyPromotionEvidence({ root: repo.root, entities, ...promotion })
    assert.equal(result.status, "unverifiable-history")
  } finally { rmSync(repo.root, { recursive: true, force: true }) }
})

test("historical evidence remains valid after its source path moves at HEAD", () => {
  const repo = createEvidenceRepo()
  try {
    renameSync(join(repo.root, "packages/definitions/src/composition.ts"), join(repo.root, "packages/definitions/src/composition-moved.ts"))
    commit(repo.root, "refactor: move composition source")
    const result = verifyPromotionEvidence({ root: repo.root, entities, ...validPromotion(repo) })
    assert.equal(result.ok, true)
  } finally { rmSync(repo.root, { recursive: true, force: true }) }
})

test("tampered offline PR snapshot blocks promotion", () => {
  const repo = createEvidenceRepo()
  try {
    const snapshotPath = join(repo.root, "docs/prototypes/acceptances/workspace-contract.json")
    const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8"))
    snapshot.concern = "data"
    writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`)
    const tamperedCommit = commit(repo.root, "docs: tamper fixture acceptance")
    const promotion = validPromotion(repo)
    promotion.acceptance.commit = tamperedCommit
    const result = verifyPromotionEvidence({ root: repo.root, entities, ...promotion })
    assert.equal(result.ok, false)
    assert(result.issues.some((entry) => entry.includes("concern")))
  } finally { rmSync(repo.root, { recursive: true, force: true }) }
})

test("promotion transition requires the committed acceptance artifact to remain untampered at HEAD", () => {
  const repo = createEvidenceRepo()
  try {
    const promotion = validPromotion(repo)
    const acceptancePath = join(repo.root, promotion.acceptance.path)
    writeFileSync(acceptancePath, `${readFileSync(acceptancePath, "utf8")}tampered\n`)
    const tampered = verifyPromotionEvidence({ root: repo.root, entities, ...promotion, requireLiveAcceptance: true })
    assert.equal(tampered.ok, false)
    assert(tampered.issues.some((entry) => entry.includes("does not match")))

    unlinkSync(acceptancePath)
    const removed = verifyPromotionEvidence({ root: repo.root, entities, ...promotion, requireLiveAcceptance: true })
    assert.equal(removed.ok, false)
    assert(removed.issues.some((entry) => entry.includes("not present at HEAD")))

    const historical = verifyPromotionEvidence({ root: repo.root, entities, ...promotion })
    assert.equal(historical.ok, true)
  } finally { rmSync(repo.root, { recursive: true, force: true }) }
})

test("invented kernel-app sample data cannot promote without definitions evidence and acceptance", () => {
  const item = initiative({ concerns: [concern("data", "validated", "kernel-app")] })
  const result = authorizePrototypeTransition(transitionArgs(item, "data", "promoted", {
    canonical: { package: "kernel-app", sourcePath: "kernel-app/src/data/sample.ts" },
    verifyPromotion: () => ({ ok: false, status: "invalid", issues: ["Sample records are not a reusable @kernel/definitions contract"] }),
  }))
  assert.equal(result.ok, false)
})
