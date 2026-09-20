export const PROTOTYPE_REGISTRY_SCHEMA = "kernel-ds/prototype-registry@1"
export const PROTOTYPE_EXTENSION_VERSION = 1

export const initiativeLifecycles = ["active", "superseded", "retired"]
export const concerns = ["visual", "component", "pattern", "object-model", "workflow", "data"]
export const concernStates = ["exploration", "candidate", "validated", "promoted", "prototype-only"]
export const originSurfaces = ["figma", "kernel-app"]
export const figmaNodeKinds = ["frame", "component", "component-set"]
export const acceptanceTypes = ["conversation-record", "decision-record", "pr-review-snapshot"]
export const promotionTargets = ["@kernel/ui", "@kernel/definitions"]
export const canonicalLocatorTypes = ["public-export", "contract-member"]

export const transitionMatrix = Object.freeze({
  exploration: ["candidate", "prototype-only"],
  candidate: ["exploration", "validated", "prototype-only"],
  validated: ["candidate", "promoted", "prototype-only"],
  promoted: [],
  "prototype-only": ["candidate"],
})

export const reasonRequiredTransitions = new Set([
  "exploration->prototype-only",
  "candidate->prototype-only",
  "validated->prototype-only",
  "prototype-only->candidate",
  "candidate->exploration",
  "validated->candidate",
])

export const registrySchema = {
  $id: PROTOTYPE_REGISTRY_SCHEMA,
  type: "object",
  required: ["$schema", "version", "figma", "initiatives"],
  properties: {
    $schema: { const: PROTOTYPE_REGISTRY_SCHEMA },
    version: { const: 1 },
    figma: { type: "object" },
    initiatives: { type: "array" },
  },
}
