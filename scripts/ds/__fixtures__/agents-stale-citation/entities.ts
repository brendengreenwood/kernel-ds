/* Fixture catalog: valid entities for DS command success-path tests. */
import type { CatalogEntity } from "../../../../packages/catalog/src/schema.ts"

export const catalog = [
  {
    "id": "component.fixture-button",
    "name": "Fixture Button",
    "kind": "component",
    "maturity": "ready",
    "accessibility": "reviewed",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "ready"
    ],
    "capabilities": [
      "documented",
      "accessibility-reviewed"
    ],
    "relationships": [],
    "documentation": {
      "slug": "fixture-button",
      "portalAnchor": "c-fixture-button"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": []
  },
  {
    "id": "pattern.fixture-flow",
    "name": "Fixture Flow",
    "kind": "pattern",
    "maturity": "experimental",
    "accessibility": "pending",
    "package": "kernel-portal",
    "tags": [
      "pattern",
      "experimental"
    ],
    "capabilities": [],
    "relationships": [],
    "documentation": {
      "slug": "fixture-flow",
      "portalAnchor": "pattern-fixture-flow"
    },
    "ai": {
      "bundleCategory": "design",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": []
  }
] as const satisfies readonly CatalogEntity[]
