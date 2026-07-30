import assert from "node:assert/strict"
import test from "node:test"
import { catalog } from "./entities.ts"
import { validCatalogFixture } from "./fixtures/valid.ts"
import {
  selectEntitiesByKind,
  selectEntitiesByMaturity,
  selectPortalAnchors,
  selectPortalLifecycleMeta,
} from "./selectors.ts"
import { validateCatalog, type CatalogEntity } from "./schema.ts"

test("accepts a valid catalog", () => {
  assert.deepEqual(validateCatalog(validCatalogFixture), [])
})

test("rejects duplicate entity ids", () => {
  const duplicate = [...validCatalogFixture, validCatalogFixture[0]]
  assert.equal(validateCatalog(duplicate).some((issue) => issue.code === "duplicate-id"), true)
})

test("rejects invalid entities", () => {
  const invalid: CatalogEntity = {
    ...validCatalogFixture[0],
    id: "component.Button",
  }
  assert.equal(validateCatalog([invalid]).some((issue) => issue.code === "invalid-entity"), true)
})

test("rejects invalid taxonomy values", () => {
  const invalidTaxonomy = structuredClone(validCatalogFixture[0])
  Reflect.set(invalidTaxonomy, "tags", ["not-a-kernel-tag"])
  assert.equal(validateCatalog([invalidTaxonomy]).some((issue) => issue.code === "invalid-taxonomy"), true)
})

test("rejects illegal relationship types", () => {
  const illegalRelationship = structuredClone(validCatalogFixture[0])
  Reflect.set(illegalRelationship, "relationships", [{ type: "contains", target: "pattern.crud-patterns" }])
  assert.equal(validateCatalog([illegalRelationship]).some((issue) => issue.code === "illegal-relationship"), true)
})

test("rejects relationships to missing entities", () => {
  const missingTarget: CatalogEntity = {
    ...validCatalogFixture[0],
    relationships: [{ type: "dependsOn", target: "component.missing" }],
  }
  assert.equal(
    validateCatalog([missingTarget]).some((issue) => issue.code === "missing-relationship-target"),
    true,
  )
})

test("sorts portal lifecycle metadata by group and name", () => {
  const lifecycle = selectPortalLifecycleMeta(catalog)
  const groups = lifecycle.map((entity) => entity.group)
  assert.equal(lifecycle.length, 93)
  assert.deepEqual(lifecycle.slice(0, 3).map((entity) => entity.name), ["Accordion", "Alert", "Alert Dialog"])
  assert.equal(groups.lastIndexOf("component") < groups.indexOf("element"), true)
  assert.equal(groups.lastIndexOf("element") < groups.indexOf("pattern"), true)
  assert.equal(groups.lastIndexOf("pattern") < groups.indexOf("domain"), true)
  assert.equal(groups.lastIndexOf("domain") < groups.indexOf("object"), true)
})

test("selects stable group and maturity views", () => {
  const components = selectEntitiesByKind(catalog, "component")
  const ready = selectEntitiesByMaturity(catalog, "ready")
  const experimental = selectEntitiesByMaturity(catalog, "experimental")
  assert.equal(components.length, 62)
  assert.equal(ready.length, 82)
  assert.equal(experimental.length, 11)
  assert.deepEqual(components.map((entity) => entity.name), [...components].map((entity) => entity.name).sort())
})

test("returns unique sorted portal anchors", () => {
  const anchors = selectPortalAnchors(catalog)
  assert.equal(new Set(anchors).size, anchors.length)
  assert.deepEqual(anchors, [...anchors].sort())
})

test("resolves catalog source and documentation references", () => {
  const entities: readonly CatalogEntity[] = catalog
  const documented = entities.filter((entity) => entity.documentation.slug)
  assert.equal(new Set(documented.map((entity) => entity.documentation.slug)).size, 81)
  assert.equal(documented.every((entity) => entity.documentation.sourceFile?.startsWith("kernel-portal/src/lib/component-docs/")), true)
  assert.equal(entities.every((entity) => entity.documentation.portalAnchor.length > 0), true)
})
