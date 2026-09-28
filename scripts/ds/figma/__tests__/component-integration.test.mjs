import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { buildComponentContracts } from "../build-component-contracts.mjs"
import { buildComponentIntegrationManifest } from "../build-component-integration.mjs"
import { buildComponentCohorts } from "../check-component-scope.mjs"
import { loadComponentScope, stableJson } from "../component-scope.mjs"
import { validateLiveAuditResponse } from "../live-component-audit.mjs"

const fixtureCases = JSON.parse(readFileSync(new URL("../__fixtures__/component-integration/cases.json", import.meta.url), "utf8")).cases

test("component scope is exactly 62 components, 3 elements, and 3 non-catalog modules", () => {
  const scope = loadComponentScope()
  assert.equal(scope.components.length, 62)
  assert.equal(scope.elements.length, 3)
  assert.deepEqual(scope.nonCatalogPublicModules, ["code-block", "direction", "input-group"])
})

test("contracts and integration manifest are deterministic and evidence-backed", () => {
  const contracts = buildComponentContracts()
  assert.equal(contracts.components.length, 62)
  assert.equal(stableJson(contracts), stableJson(buildComponentContracts()))
  const manifest = buildComponentIntegrationManifest()
  assert.equal(manifest.components.length, 62)
  assert.equal(manifest.coverage.integrated, 35)
  assert.equal(manifest.coverage.notStarted, 27)
  assert.equal(stableJson(manifest), stableJson(buildComponentIntegrationManifest()))
  assert.equal(readFileSync("docs/figma/component-integration.json", "utf8"), stableJson(manifest))
})

test("generated cohorts cover every entity once", () => {
  const cohorts = buildComponentCohorts()
  const families = [...cohorts.entries()].filter(([path]) => path.includes("/families/"))
  assert.equal(families.length, 62)
  assert.equal(new Set(families.flatMap(([, value]) => value.entityIds)).size, 62)
})

test("02-foundations fixtures match committed evidence and layout exactly once per entity", () => {
  const cohort = JSON.parse(readFileSync("docs/figma/cohorts/02-foundations.json", "utf8"))
  const evidence = JSON.parse(readFileSync("docs/figma/component-evidence.json", "utf8"))
  const layout = JSON.parse(readFileSync("docs/figma/component-layout.json", "utf8"))
  const contracts = JSON.parse(readFileSync("docs/figma/component-contracts.json", "utf8"))
  assert.equal(cohort.entityIds.length, 18)
  const legacyRadius = /^radius\/(sm|md|lg|xl)$/
  for (const entityId of cohort.entityIds) {
    const fixture = JSON.parse(readFileSync(new URL(`../__fixtures__/cohorts/02-foundations/${entityId}.json`, import.meta.url), "utf8"))
    assert.equal(fixture.entityId, entityId)
    const evidenceRecords = evidence.records.filter((record) => record.entityId === entityId)
    const layoutRecords = layout.records.filter((record) => record.entityId === entityId)
    assert.equal(evidenceRecords.length, 1, `${entityId} resolves exactly once in evidence`)
    assert.equal(layoutRecords.length, 1, `${entityId} resolves exactly once in layout`)
    const [record] = evidenceRecords
    assert.equal(record.fileKey, "du0qpv9XrTt4HEWdPhesUh")
    assert.equal(record.nodeType, fixture.nodeType)
    assert.equal(record.mainComponentKey, fixture.mainComponentKey)
    assert.equal(record.sectionId, fixture.sectionId, `${entityId} section ownership`)
    assert.equal(record.sectionName, fixture.sectionName)
    const contract = contracts.components.find((item) => item.entityId === entityId)
    assert.equal(record.contractHash, contract.contractHash, `${entityId} contract hash is current`)
    assert.equal(fixture.contractHash, contract.contractHash, `${entityId} fixture contract hash is current`)
    assert.deepEqual(record.contractEvidence.anatomySlots, fixture.anatomySlots)
    assert.deepEqual(record.contractEvidence.requiredTokenRoles, fixture.requiredTokenRoles)
    for (const binding of record.semanticBindings) {
      assert.equal(legacyRadius.test(binding.name), false, `${entityId} binds no legacy radius (${binding.name})`)
      assert.equal(/^(semantic\/|radius\/(control|surface|floating|modal|full)$|control-h)/.test(binding.name), true, `${entityId} binding ${binding.name} is a semantic role variable`)
    }
    assert.equal(layoutRecords[0].sectionNodeId, fixture.layoutSectionNodeId)
    assert.equal(layoutRecords[0].bounds.x, 0)
    assert.equal(layoutRecords[0].verdict, "pass")
    assert.equal(fixture.layoutVerdict, "pass")
  }
})

test("03-controls fixtures match committed contracts, evidence, and layout exactly once per entity", () => {
  const cohort = JSON.parse(readFileSync("docs/figma/cohorts/03-controls-with-button-input.json", "utf8"))
  const evidence = JSON.parse(readFileSync("docs/figma/component-evidence.json", "utf8"))
  const layout = JSON.parse(readFileSync("docs/figma/component-layout.json", "utf8"))
  const contracts = JSON.parse(readFileSync("docs/figma/component-contracts.json", "utf8"))
  assert.equal(cohort.entityIds.length, 16)
  assert.equal(new Set(cohort.entityIds).size, 16)
  const legacyRadius = /^radius\/(sm|md|lg|xl)$/
  for (const entityId of cohort.entityIds) {
    const fixture = JSON.parse(readFileSync(new URL(`../__fixtures__/cohorts/03-controls/${entityId}.json`, import.meta.url), "utf8"))
    const records = evidence.records.filter((record) => record.entityId === entityId)
    const layouts = layout.records.filter((record) => record.entityId === entityId)
    const contract = contracts.components.find((item) => item.entityId === entityId)
    assert.equal(fixture.entityId, entityId)
    assert.equal(records.length, 1, `${entityId} resolves exactly once in evidence`)
    assert.equal(layouts.length, 1, `${entityId} resolves exactly once in layout`)
    assert.equal(records[0].nodeType, fixture.nodeType)
    assert.equal(records[0].mainComponentKey, fixture.mainComponentKey)
    assert.equal(records[0].sectionId, fixture.sectionId)
    assert.equal(records[0].sectionName, fixture.sectionName)
    assert.equal(records[0].contractHash, contract.contractHash)
    assert.equal(fixture.contractHash, contract.contractHash)
    assert.deepEqual(records[0].contractEvidence.codeVariantAxes, fixture.variantAxes)
    assert.deepEqual(records[0].contractEvidence.designStateAxes, fixture.designStateAxes)
    assert.deepEqual(records[0].contractEvidence.figmaProperties, fixture.figmaProperties)
    assert.deepEqual(records[0].contractEvidence.anatomySlots, fixture.anatomySlots)
    assert.deepEqual(records[0].contractEvidence.requiredTokenRoles, fixture.requiredTokenRoles)
    for (const binding of records[0].semanticBindings) assert.equal(legacyRadius.test(binding.name), false, `${entityId} binds no legacy radius (${binding.name})`)
    assert.equal(layouts[0].sectionNodeId, fixture.layoutSectionNodeId)
    assert.equal(layouts[0].bounds.x, 0)
    assert.equal(layouts[0].verdict, "pass")
    assert.equal(fixture.layoutVerdict, "pass")
  }
})

test("03-controls negative drift cases remain explicit", () => {
  const required = ["legacy-radius-binding", "missing-design-state:focus", "missing-design-state:invalid", "missing-design-state:disabled", "unknown-variant-value", "detached-acceptance-instance", "component-property-mismatch"]
  for (const code of required) {
    const request = { requestId: code, requestHash: "hash", implementationHash: "implementation", mode: "full", entities: [], contracts: {} }
    const response = { $schema: "kernel-ds/figma-live-component-audit@1", requestId: code, requestHash: "hash", implementationHash: "implementation", mode: "full", fileKey: "du0qpv9XrTt4HEWdPhesUh", expected: 0, resolved: 0, verdict: "fail", failures: [{ code }], records: [], layouts: [], acceptance: [] }
    assert.throws(() => validateLiveAuditResponse(response, request), /Live audit failed/)
  }
})

test("live-audit fixtures cover the required pass and failure cases", () => {
  const request = {
    requestId: "request",
    requestHash: "request-hash",
    implementationHash: "implementation-hash",
    mode: "full",
    entities: ["component.button"],
    contracts: { "component.button": { contractHash: "contract", variantAxes: { variant: ["default"] }, designStateAxes: { State: ["default"] }, figmaProperties: { Label: { type: "TEXT", mapsTo: "children" } }, slots: ["button"], requiredTokenRoles: ["radius/control"] } },
  }
  const base = {
    $schema: "kernel-ds/figma-live-component-audit@1",
    requestId: request.requestId,
    requestHash: request.requestHash,
    implementationHash: request.implementationHash,
    mode: request.mode,
    fileKey: "du0qpv9XrTt4HEWdPhesUh",
    expected: 1,
    resolved: 1,
    verdict: "pass",
    failures: [],
    records: [{ entityId: "component.button", contractHash: "contract", mainComponentKey: "key", contractEvidence: { codeVariantAxes: { variant: ["default"] }, designStateAxes: { State: ["default"] }, figmaProperties: { Label: { type: "TEXT", mapsTo: "children" } }, anatomySlots: ["button"], requiredTokenRoles: ["radius/control"] }, accessibility: { nameRole: { verdict: "pass" }, target: { verdict: "notApplicable", reason: "runtime-or-instance-size-validation" }, focusState: { verdict: "notApplicable", reason: "runtime-proof-required" }, nonColorDifferentiation: { verdict: "notApplicable", reason: "family-class-audit-required" }, annotations: { verdict: "notApplicable", reason: "no-runtime-only-claim-in-static-contract" } } }],
    layouts: [{ entityId: "component.button", sectionNodeId: "1:2", bounds: { x: 0, y: 0, width: 100, height: 100 }, expectedX: 0, predecessorSectionId: null, gap: null, verdict: "pass" }],
    acceptance: [{ entityId: "component.button", acceptanceInstanceNodeId: "1:3", mainComponentId: "1:4", mainComponentKey: "key", ownerSectionId: "1:5", detached: false, contractHash: "contract", verdict: "pass" }],
  }
  assert.equal(validateLiveAuditResponse(structuredClone(base), request).verdict, "pass")
  for (const fixture of fixtureCases.filter((item) => item.mutation)) {
    const response = structuredClone(base)
    if (fixture.mutation.records) response.records = fixture.mutation.records
    if (fixture.mutation.duplicateRecord) response.records.push(structuredClone(response.records[0]))
    if (fixture.mutation.contractHash) response.records[0].contractHash = fixture.mutation.contractHash
    if (fixture.mutation.fileKey) response.fileKey = fixture.mutation.fileKey
    if (fixture.mutation.accessibilityReason === null) response.records[0].accessibility.target.reason = null
    if (fixture.mutation.acceptanceMainKey) response.acceptance[0].mainComponentKey = fixture.mutation.acceptanceMainKey
    if (fixture.mutation.failure) {
      response.verdict = "fail"
      response.failures = [{ code: fixture.mutation.failure }]
    }
    assert.throws(() => validateLiveAuditResponse(response, request), new RegExp(fixture.error, "i"), fixture.name)
  }
  assert.equal(fixtureCases.some((item) => item.name === "invalid-override"), true)
})

test('invalid reviewed overrides fail contract generation with targeted errors', () => {
  const overrides = (components) => ({ $schema: 'kernel-ds/figma-component-contract-overrides@1', components })
  const cases = [
    [{ 'component.unknown': {} }, /unknown entity component\.unknown/],
    [{ 'component.button': { bogusKey: true } }, /Unknown override key bogusKey/],
    [{ 'component.button': { variantAxes: { Tone: ['default'] } } }, /Unknown variant axis Tone/],
    [{ 'component.button': { variantAxes: { variant: ['sparkly'] } } }, /Unknown variant value variant=sparkly/],
    [{ 'component.button': { publicProperties: ['notAProp'] } }, /Unknown public property notAProp/],
    [{ 'component.button': { slots: ['not-a-slot'] } }, /Unknown anatomy slot not-a-slot/],
    [{ 'component.button': { designStateAxes: { State: [] } } }, /Invalid design state axis State/],
    [{ 'component.button': { designStateAxes: { State: [''] } } }, /Invalid design state axis State/],
    [{ 'component.button': { figmaProperties: { Label: { type: 'VARIANT', mapsTo: 'children' } } } }, /Invalid Figma property Label/],
    [{ 'component.button': { figmaProperties: { Label: { type: 'TEXT', mapsTo: 'styling' } } } }, /Invalid Figma property mapping Label/],
    [{ 'component.button': { figmaProperties: { Label: { type: 'TEXT', mapsTo: 'public-property', property: 'notAProp' } } } }, /Unknown mapped public property notAProp/],
  ]
  for (const [components, error] of cases) assert.throws(() => buildComponentContracts(overrides(components)), error)
})
