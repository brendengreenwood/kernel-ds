import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { TRANSACTION_REQUEST_SCHEMA, TRANSACTION_SCHEMA, assertReportedCreatedNodes, inventoryDelta, sha256, validateMutationReport, validateSnapshot, validateTransactionRequest } from "../component-transaction.mjs"

const fixture = JSON.parse(readFileSync(new URL("../__fixtures__/component-transaction/prohibited.json", import.meta.url), "utf8"))
const nodeTypes = ["COMPONENT", "COMPONENT_SET", "INSTANCE", "SECTION"]

for (const nodeType of nodeTypes) {
  test(`supported transaction state round-trips for ${nodeType}`, () => {
    const state = {
      name: "Button",
      x: 0,
      y: 16,
      width: 120,
      height: 40,
      opacity: 1,
      parentNodeId: "1:0",
      parentIndex: 2,
      pluginData: { entityId: "component.button" },
      sharedPluginData: { "kernel.dsds": { entityId: "component.button" } },
      description: "Canonical button family",
      fills: [{ type: "SOLID", color: { r: 0.1, g: 0.2, b: 0.3 }, opacity: 1 }],
      strokes: [],
      effects: [],
      cornerRadius: 4,
      boundVariables: { topLeftRadius: { type: "VARIABLE_ALIAS", id: "VariableID:81:1603" } },
    }
    const relationships = { type: nodeType, key: nodeType.includes("COMPONENT") ? "component-key" : null, componentSetId: null, mainComponentId: nodeType === "INSTANCE" ? "1:9" : null, componentProperties: null, variantProperties: null, childIds: [] }
    const snapshot = { $schema: TRANSACTION_SCHEMA, fileKey: "du0qpv9XrTt4HEWdPhesUh", entityId: "component.button", transactionId: `component.button-${nodeType}`, inventoryNodeIds: ["1:0", "1:1"], inventoryHash: "inventory-hash", snapshotHash: "snapshot-hash", nodes: [{ nodeId: "1:1", nodeType, state, preconditions: { parentNodeId: "1:0", parentIndex: 2, layoutMode: "NONE", layoutSizingHorizontal: "FIXED", layoutSizingVertical: "FIXED", constraints: { horizontal: "MIN", vertical: "MIN" }, relationships } }] }
    assert.deepEqual(validateSnapshot(JSON.parse(JSON.stringify(snapshot))), snapshot)
  })
}

test("every rollback-unsafe mutation class is rejected", () => {
  for (const property of fixture.properties) {
    assert.throws(() => validateMutationReport({ mutations: [{ property }] }), new RegExp(`Rollback-unsafe mutation ${property}`))
  }
})

test("unknown mutation classes are rejected", () => {
  assert.throws(() => validateMutationReport({ mutations: [{ property: "layoutMode" }] }), /Unsupported mutation layoutMode/)
})

const implementation = readFileSync(new URL("../component-transaction.js", import.meta.url), "utf8")

function buildRequest(overrides = {}) {
  const input = {
    operation: "capture",
    requestId: "request",
    requestHash: null,
    implementationHash: sha256(implementation),
    transactionId: "component.button",
    entityId: "component.button",
    snapshot: null,
    reportedCreatedNodeIds: [],
    expectNew: true,
    ...overrides,
  }
  const code = `const INPUT = ${JSON.stringify(input)}\n${implementation}`
  return {
    $schema: TRANSACTION_REQUEST_SCHEMA,
    ...input,
    requestHash: sha256({ ...input, requestHash: null }),
    output: "out.json",
    responsePath: "out.response.json",
    code,
    codeHash: sha256(code),
  }
}

test("expect-new capture request round-trips validation", () => {
  const request = buildRequest()
  assert.deepEqual(validateTransactionRequest(structuredClone(request), implementation), request)
})

test("tampering with expectNew fails the request hash", () => {
  const request = buildRequest()
  request.expectNew = false
  request.code = request.code.replace('"expectNew":true', '"expectNew":false')
  request.codeHash = sha256(request.code)
  assert.throws(() => validateTransactionRequest(request, implementation), /tampered/)
})

test("tampering with reportedCreatedNodeIds fails the request hash", () => {
  const request = buildRequest({ operation: "verify", expectNew: false, reportedCreatedNodeIds: ["1:2"] })
  request.reportedCreatedNodeIds = ["1:2", "1:3"]
  assert.throws(() => validateTransactionRequest(request, implementation), /tampered/)
})

test("created nodes are discovered from inventory delta", () => {
  const delta = inventoryDelta(["1:1"], ["1:1", "1:2", "1:3"])
  assert.deepEqual(delta.createdNodeIds, ["1:2", "1:3"])
  assert.deepEqual(assertReportedCreatedNodes(delta, ["1:3", "1:2"]), ["1:2", "1:3"])
  assert.throws(() => assertReportedCreatedNodes(delta, ["1:2"]), /do not match/)
})
