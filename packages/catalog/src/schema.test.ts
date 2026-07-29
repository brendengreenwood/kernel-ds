import assert from "node:assert/strict"
import test from "node:test"
import { validCatalogFixture } from "./fixtures/valid.ts"
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
