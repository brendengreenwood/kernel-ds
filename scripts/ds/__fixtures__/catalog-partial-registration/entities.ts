/* Fixture catalog: entity registered without its docs or source files on disk. */
import type { CatalogEntity } from "../../../../packages/catalog/src/schema.ts"

export const catalog = [
  {
    "id": "component.fixture-widget",
    "name": "Fixture Widget",
    "kind": "component",
    "maturity": "experimental",
    "accessibility": "pending",
    "package": "@kernel/ui",
    "tags": [
      "component",
      "experimental"
    ],
    "capabilities": [],
    "relationships": [],
    "documentation": {
      "slug": "fixture-widget",
      "sourceFile": "docs/fixture-widget.ts",
      "portalAnchor": "c-fixture-widget"
    },
    "ai": {
      "bundleCategory": "general",
      "guidanceSource": "component-docs"
    },
    "sourceFiles": [
      "src/fixture-widget.tsx"
    ]
  }
] as const satisfies readonly CatalogEntity[]
