import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const repoRoot = resolve(fileURLToPath(new URL("../../../..", import.meta.url)))
const skillPath = resolve(repoRoot, ".agents/skills/kernel-prototype/SKILL.md")
const scenariosPath = resolve(repoRoot, "scripts/ds/__fixtures__/prototype-conversation-scenarios.json")

const skill = readFileSync(skillPath, "utf8")
const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"))

test("kernel-prototype contains the complete conversational protocol", () => {
  for (const required of [
    "npm run ds:prototype -- check",
    "npm run ds:prototype -- status",
    "docs/prototypes/registry.json",
    "visual",
    "component",
    "pattern",
    "object-model",
    "workflow",
    "data",
    "@kernel/ui",
    "@kernel/definitions",
    "explicit tuple-specific acceptance",
    "three commits",
    "npm run ds:generate",
    "docs/STATE.md",
    "docs/worklog/2026-09.md",
  ]) assert.match(skill, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), required)
})

test("existing implementation and verification skills delegate prototype bookkeeping", () => {
  for (const path of [
    ".agents/skills/kernel-feature/SKILL.md",
    ".agents/skills/kernel-ds-component/SKILL.md",
    ".agents/skills/kernel-ds-definition/SKILL.md",
    ".agents/skills/kernel-token/SKILL.md",
    ".agents/skills/kernel-verify/SKILL.md",
    "docs/figma/GUIDE.md",
  ]) {
    assert.match(readFileSync(resolve(repoRoot, path), "utf8"), /kernel-prototype/, path)
  }
})

test("cold-agent scenarios route concerns, owners, stops, and the three-commit sequence deterministically", () => {
  assert.equal(scenarios.length, 6)
  const byRequest = new Map(scenarios.map((scenario) => [scenario.request, scenario]))
  assert.deepEqual([byRequest.get("change this Figma panel").concern, byRequest.get("change this Figma panel").owner], ["visual", "@kernel/ui"])
  assert.deepEqual([byRequest.get("make this workflow use real contract data").concern, byRequest.get("make this workflow use real contract data").owner], ["data", "@kernel/definitions"])
  assert.equal(byRequest.get("promote this component").stop, "validated")
  assert.ok(!byRequest.get("promote this component").sequence.includes("set-promoted"))
  assert.equal(byRequest.get("promote this component after explicit acceptance").stop, "promoted")
  assert.ok(byRequest.get("promote this component after explicit acceptance").sequence.includes("verify-acceptance"))
  assert.deepEqual(byRequest.get("implement and promote this new contract").sequence, ["commit-canonical-code", "commit-acceptance-artifact", "set-promoted", "generate", "commit-registry-projections"])
  assert.equal(byRequest.get("implement and promote this new contract").commits, 3)
  assert.deepEqual([byRequest.get("keep this prototype-only").stop, byRequest.get("keep this prototype-only").owner], ["prototype-only", null])
})
