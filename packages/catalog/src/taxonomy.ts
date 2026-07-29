export const entityKinds = ["component", "pattern", "element", "object", "domain"] as const
export type EntityKind = (typeof entityKinds)[number]

export const maturityLevels = ["experimental", "ready", "deprecated"] as const
export type Maturity = (typeof maturityLevels)[number]

export const accessibilityStates = ["reviewed", "pending"] as const
export type AccessibilityState = (typeof accessibilityStates)[number]

export const relationshipTypes = ["composedWith", "dependsOn", "usedBy", "recommendedPatterns"] as const
export type RelationshipType = (typeof relationshipTypes)[number]

export const packageOwners = ["kernel-portal", "@kernel/ui", "@kernel/definitions"] as const
export type PackageOwner = (typeof packageOwners)[number]

export const entityTags = [
  "component",
  "pattern",
  "element",
  "object",
  "domain",
  "experimental",
  "ready",
  "deprecated",
] as const
export type EntityTag = (typeof entityTags)[number]

export const entityCapabilities = [
  "documented",
  "accessibility-reviewed",
  "composition-contract",
] as const
export type EntityCapability = (typeof entityCapabilities)[number]
