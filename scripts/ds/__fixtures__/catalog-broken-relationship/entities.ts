/* Fixture catalog: relationship pointing at a missing target. */
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
    "relationships": [
      {
        "type": "composedWith",
        "target": "component.fixture-missing"
      }
    ],
    "documentation": {
      "slug": "fixture-button",
      "portalAnchor": "c-fixture-button"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": []
  }
] as const satisfies readonly CatalogEntity[]
