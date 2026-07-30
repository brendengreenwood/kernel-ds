import type { CatalogEntity } from "../schema.ts"

export const validCatalogFixture: readonly CatalogEntity[] = [
  {
    id: "component.button",
    name: "Button",
    kind: "component",
    maturity: "ready",
    accessibility: "reviewed",
    package: "kernel-portal",
    tags: ["component", "ready"],
    capabilities: ["documented", "accessibility-reviewed"],
    relationships: [{ type: "recommendedPatterns", target: "pattern.crud-patterns" }],
    documentation: {
      slug: "button",
      sourceFile: "kernel-portal/src/lib/component-docs/button.ts",
      portalAnchor: "c-button",
    },
    ai: { bundleCategory: "general", guidanceSource: "component-docs" },
    sourceFiles: ["kernel-portal/src/components/ui/button.tsx"],
  },
  {
    id: "pattern.crud-patterns",
    name: "CRUD patterns",
    kind: "pattern",
    maturity: "ready",
    accessibility: "reviewed",
    package: "kernel-portal",
    tags: ["pattern", "ready"],
    capabilities: ["documented", "accessibility-reviewed"],
    relationships: [{ type: "composedWith", target: "component.button" }],
    documentation: {
      slug: "crud-patterns",
      sourceFile: "kernel-portal/src/lib/component-docs/crud-patterns.ts",
      portalAnchor: "patterns-crud",
    },
    ai: { bundleCategory: "design", guidanceSource: "component-docs" },
    sourceFiles: [],
  },
]
