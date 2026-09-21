import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"
import { renderPrototypeStatus } from "../projection.mjs"
import { serializePrototypeRegistry, writeTextAtomic } from "../store.mjs"

const repoRoot = resolve(fileURLToPath(new URL("../../../..", import.meta.url)))
const cli = resolve(repoRoot, "scripts/ds/cli.mjs")

function emptyRegistry() {
  return {
    $schema: "kernel-ds/prototype-registry@1",
    version: 1,
    figma: { fileKey: "du0qpv9XrTt4HEWdPhesUh", name: "Kernel DS" },
    initiatives: [],
  }
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "prototype-cli-"))
  const registry = join(root, "registry.json")
  const projection = join(root, "status.md")
  const value = emptyRegistry()
  writeFileSync(registry, serializePrototypeRegistry(value))
  writeFileSync(projection, renderPrototypeStatus(value))
  return { root, registry, projection }
}

function run(subject, command, extra = []) {
  return spawnSync(process.execPath, [cli, "prototype", command, "--registry", subject.registry, "--projection", subject.projection, ...extra], {
    cwd: repoRoot,
    encoding: "utf8",
  })
}

const audit = ["--date", "2026-09-20", "--actor", "test-agent", "--source", "prototype-cli-test", "--reason", "exercise lifecycle"]

test("public CLI adds, links, transitions, projects, and remains idempotent", () => {
  const subject = fixture()
  try {
    const addArgs = ["--id", "workspace-flow", "--title", "Workspace flow", "--entity", "object.workspace", "--concern", "workflow", "--origin", "kernel-app", ...audit]
    assert.equal(run(subject, "add", addArgs).status, 0)
    const afterAdd = readFileSync(subject.registry, "utf8")
    const duplicate = run(subject, "add", addArgs)
    assert.equal(duplicate.status, 0)
    assert.match(duplicate.stdout, /PROTOTYPE-NOOP/)
    assert.equal(readFileSync(subject.registry, "utf8"), afterAdd)

    const figma = run(subject, "link", ["--initiative", "workspace-flow", "--surface", "figma", "--file-key", "du0qpv9XrTt4HEWdPhesUh", "--node-id", "1:14", "--kind", "frame"])
    assert.equal(figma.status, 0)
    const app = run(subject, "link", ["--initiative", "workspace-flow", "--surface", "kernel-app", "--route", "/", "--source-path", "kernel-app/src/pages/overview.tsx"])
    assert.equal(app.status, 0)
    const candidate = run(subject, "set", ["--initiative", "workspace-flow", "--concern", "workflow", "--state", "candidate", ...audit])
    assert.equal(candidate.status, 0)
    assert.match(candidate.stdout, /PROTOTYPE-SET-OK/)

    assert.equal(run(subject, "project").status, 0)
    assert.equal(run(subject, "check").status, 0)
    const status = run(subject, "status", ["--entity", "object.workspace"])
    assert.equal(status.status, 0)
    assert.match(status.stdout, /awaiting-call=1 ready-to-promote=0/)
    assert.match(status.stdout, /coverage-figma=object:1/)
    assert.match(status.stdout, /coverage-kernel-app=object:1/)
    const projectAgain = run(subject, "project")
    assert.equal(projectAgain.status, 0)
    assert.match(projectAgain.stdout, /PROTOTYPE-NOOP/)
  } finally {
    rmSync(subject.root, { recursive: true, force: true })
  }
})

test("illegal transition and invalid entity refuse before mutation", () => {
  const subject = fixture()
  try {
    const add = run(subject, "add", ["--id", "workspace-flow", "--title", "Workspace flow", "--entity", "object.workspace", "--concern", "workflow", "--origin", "kernel-app", ...audit])
    assert.equal(add.status, 0)
    const before = readFileSync(subject.registry, "utf8")
    const direct = run(subject, "set", ["--initiative", "workspace-flow", "--concern", "workflow", "--state", "promoted", ...audit])
    assert.notEqual(direct.status, 0)
    assert.match(direct.stderr, /Transition refused/)
    assert.equal(readFileSync(subject.registry, "utf8"), before)

    const unknown = run(subject, "add", ["--id", "unknown-flow", "--title", "Unknown", "--entity", "object.missing", "--concern", "workflow", "--origin", "kernel-app", ...audit])
    assert.notEqual(unknown.status, 0)
    assert.equal(readFileSync(subject.registry, "utf8"), before)
  } finally {
    rmSync(subject.root, { recursive: true, force: true })
  }
})

test("check rejects stale generated projection", () => {
  const subject = fixture()
  try {
    writeFileSync(subject.projection, "hand edited\n")
    const result = run(subject, "check")
    assert.equal(result.status, 1)
    assert.match(result.stderr, /stale/)
  } finally {
    rmSync(subject.root, { recursive: true, force: true })
  }
})

test("prototype check and doctor reject unknown entities and missing live paths", () => {
  const subject = fixture()
  const doctorRoot = mkdtempSync(join(tmpdir(), "prototype-doctor-"))
  try {
    const invalid = emptyRegistry()
    invalid.initiatives.push({
      id: "broken-flow",
      title: "Broken flow",
      lifecycle: "active",
      scopeKey: "default",
      entityIds: ["object.workspace", "object.missing"],
      surfaces: { figma: [], kernelApp: [{ route: "/broken", sourcePath: "kernel-app/src/pages/missing.tsx" }] },
      concerns: [{
        concern: "workflow",
        state: "exploration",
        origin: "kernel-app",
        history: [{ from: null, to: "exploration", date: "2026-09-20", actor: "test-agent", source: "prototype-cli-test", reason: "invalid fixture", evidence: [] }],
      }],
    })
    writeFileSync(subject.registry, serializePrototypeRegistry(invalid))
    writeFileSync(subject.projection, renderPrototypeStatus(invalid))
    const checked = run(subject, "check")
    assert.equal(checked.status, 1)
    assert.match(checked.stderr, /unknown-entity/)
    assert.match(checked.stderr, /missing-live-path/)

    mkdirSync(join(doctorRoot, "docs/prototypes"), { recursive: true })
    writeFileSync(join(doctorRoot, "entities.ts"), readFileSync(resolve(repoRoot, "packages/catalog/src/entities.ts"), "utf8"))
    writeFileSync(join(doctorRoot, "docs/prototypes/registry.json"), serializePrototypeRegistry(invalid))
    writeFileSync(join(doctorRoot, "docs/prototypes/status.md"), renderPrototypeStatus(invalid))
    const diagnosed = spawnSync(process.execPath, [cli, "doctor", "--fixture", doctorRoot], { cwd: repoRoot, encoding: "utf8" })
    assert.equal(diagnosed.status, 1)
    assert.match(diagnosed.stderr, /unknown-entity/)
    assert.match(diagnosed.stderr, /missing-live-path/)
  } finally {
    rmSync(subject.root, { recursive: true, force: true })
    rmSync(doctorRoot, { recursive: true, force: true })
  }
})

test("atomic rename failure preserves original bytes and removes temporary file", () => {
  const root = mkdtempSync(join(tmpdir(), "prototype-atomic-"))
  const path = join(root, "registry.json")
  try {
    writeFileSync(path, "original\n")
    assert.throws(() => writeTextAtomic(path, "replacement\n", { rename: () => { throw new Error("simulated rename failure") } }), /simulated rename failure/)
    assert.equal(readFileSync(path, "utf8"), "original\n")
    assert.deepEqual(readdirSync(root), ["registry.json"])
    assert.equal(existsSync(join(root, `.registry.json.${process.pid}.tmp`)), false)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("status distinguishes unverifiable retained history from invalid registry evidence", () => {
  const subject = fixture()
  try {
    const missingCommit = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    const registry = emptyRegistry()
    registry.initiatives.push({
      id: "historical-flow",
      title: "Historical flow",
      lifecycle: "active",
      scopeKey: "default",
      entityIds: ["object.workspace"],
      surfaces: { figma: [], kernelApp: [] },
      concerns: [{
        concern: "workflow",
        state: "promoted",
        origin: "kernel-app",
        history: [
          { from: null, to: "exploration", date: "2026-09-20", actor: "test-agent", source: "prototype-cli-test", reason: "discover", evidence: [] },
          { from: "exploration", to: "candidate", date: "2026-09-20", actor: "test-agent", source: "prototype-cli-test", reason: "candidate", evidence: [] },
          { from: "candidate", to: "validated", date: "2026-09-20", actor: "test-agent", source: "prototype-cli-test", reason: "validate", evidence: [] },
          { from: "validated", to: "promoted", date: "2026-09-20", actor: "test-agent", source: "prototype-cli-test", reason: "promote", evidence: [] },
        ],
        acceptance: { type: "conversation-record", path: "docs/prototypes/acceptances/historical.md", commit: missingCommit, initiativeId: "historical-flow", concern: "workflow", scopeKey: "default", target: "@kernel/definitions" },
        canonical: { entityId: "object.workspace", package: "@kernel/definitions", locatorType: "public-export", symbol: "compositionContract", sourcePath: "packages/definitions/src/composition.ts", commit: missingCommit },
      }],
    })
    writeFileSync(subject.registry, serializePrototypeRegistry(registry))
    writeFileSync(subject.projection, renderPrototypeStatus(registry))
    const result = run(subject, "status")
    assert.equal(result.status, 2)
    assert.match(result.stdout, /unverifiable-history/)
    assert.doesNotMatch(result.stderr, /invalid-evidence|PROTOTYPE-STATUS-FAILED/)
  } finally {
    rmSync(subject.root, { recursive: true, force: true })
  }
})
