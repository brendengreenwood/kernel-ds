import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { resolve } from "node:path"

import { compositionContract, primitives, regions, rules } from "./composition.ts"
import { deriveCoord, parseObjectModel, parseWorkspacePreset } from "./index.ts"
import { incidentJson, incidentWorkspaceJson } from "./presets.ts"

test("round-trips committed object and workspace fixtures", () => {
  const object = parseObjectModel(incidentJson)
  const reparsed = parseObjectModel(JSON.stringify(object))
  assert.deepEqual(reparsed, object)
  const workspace = parseWorkspacePreset(incidentWorkspaceJson)
  assert.deepEqual(parseWorkspacePreset(JSON.stringify(workspace)), workspace)
})

test("rejects invalid composition and duplicate workspace mode ids", () => {
  assert.throws(() => parseObjectModel(JSON.stringify({ model: { key: "bad", label: "Bad", plural: "Bads", fields: [], statuses: [{ key: "open", label: "Open" }], associations: [] }, rows: [] })))
  const workspace = JSON.parse(incidentWorkspaceJson)
  workspace.modes.push(workspace.modes[0])
  assert.throws(() => parseWorkspacePreset(JSON.stringify(workspace)))
})

test("derives stable bounded coordinates", () => {
  assert.deepEqual(deriveCoord("INC-1042"), deriveCoord("INC-1042"))
  const coord = deriveCoord("INC-1042")
  assert.ok(coord.x >= 5 && coord.x <= 95 && coord.y >= 5 && coord.y <= 95)
})

test("publishes complete composition contracts", () => {
  assert.equal(primitives.length, 6)
  assert.equal(regions.length, 4)
  assert.ok(rules.length >= 13)
  assert.equal(compositionContract.primitives, primitives)
})

test("keeps the committed definitions manifest compatible", async () => {
  const manifestPath = resolve(import.meta.dirname, "../../../kernel-portal/public/definitions/manifest.json")
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"))
  assert.ok(Array.isArray(manifest.definitions))
  for (const entry of manifest.definitions) {
    assert.ok(entry.kind === "object" || entry.kind === "workspace")
    assert.equal(typeof entry.path, "string")
  }
})
