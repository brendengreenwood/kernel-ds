const EVIDENCE_SCHEMA = "kernel-ds/reconciliation-evidence@1"
const REPORT_SCHEMA = "kernel-ds/reconciliation-report@1"

export const concernIds = ["visual", "contract", "data", "composition", "workflow"]
export const artifactRoles = [
  "reusable-component",
  "reusable-composition",
  "product-specific-composition",
  "exploration",
  "duplicate",
]
export const syncDirections = [
  "figma-to-code",
  "code-to-figma",
  "continue-in-figma",
  "continue-in-code",
  "no-sync",
]

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`)
  return value
}

function requireString(value, label) {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${label} must be a non-empty string`)
  return value.trim()
}

function requireStringArray(value, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new Error(`${label} must be an array of non-empty strings`)
  }
  return value.map((item) => item.trim())
}

export function validateEvidence(raw, catalogEntities) {
  const evidence = requireObject(raw, "evidence")
  if (evidence.$schema !== EVIDENCE_SCHEMA) throw new Error(`evidence.$schema must equal ${EVIDENCE_SCHEMA}`)

  const artifact = requireObject(evidence.artifact, "evidence.artifact")
  const surface = requireString(artifact.surface, "evidence.artifact.surface")
  if (!["figma", "code", "prototype"].includes(surface)) throw new Error("evidence.artifact.surface must be figma, code, or prototype")

  if (!Array.isArray(evidence.candidates) || evidence.candidates.length === 0 || evidence.candidates.length > 12) {
    throw new Error("evidence.candidates must contain 1-12 catalog candidates")
  }
  const catalogById = new Map(catalogEntities.map((entity) => [entity.id, entity]))
  const seen = new Set()
  const candidates = evidence.candidates.map((candidate, index) => {
    requireObject(candidate, `evidence.candidates[${index}]`)
    const entityId = requireString(candidate.entityId, `evidence.candidates[${index}].entityId`)
    if (seen.has(entityId)) throw new Error(`duplicate candidate: ${entityId}`)
    seen.add(entityId)
    const entity = catalogById.get(entityId)
    if (!entity) throw new Error(`unknown catalog candidate: ${entityId}`)
    return {
      entityId,
      evidence: requireString(candidate.evidence, `evidence.candidates[${index}].evidence`),
      catalog: {
        name: entity.name,
        kind: entity.kind,
        maturity: entity.maturity,
        package: entity.package,
        sourceFiles: entity.sourceFiles ?? [],
      },
    }
  })

  return {
    $schema: EVIDENCE_SCHEMA,
    artifact: {
      name: requireString(artifact.name, "evidence.artifact.name"),
      surface,
      reference: requireString(artifact.reference, "evidence.artifact.reference"),
      summary: requireString(artifact.summary, "evidence.artifact.summary"),
    },
    candidates,
    observations: requireStringArray(evidence.observations, "evidence.observations"),
    constraints: evidence.constraints === undefined ? [] : requireStringArray(evidence.constraints, "evidence.constraints"),
  }
}

export function buildJevRequest(evidence, model = "jev-latest") {
  const candidateCriteria = Object.fromEntries([
    ...evidence.candidates.map(({ entityId, evidence: candidateEvidence, catalog }) => [
      entityId,
      `${catalog.kind} “${catalog.name}” owned by ${catalog.package}; candidate evidence: ${candidateEvidence}`,
    ]),
    ["unmapped", "No candidate is a defensible semantic identity match."],
  ])

  const questions = {
    identity: {
      type: "choice",
      instructions: "Which catalog entity is the best semantic identity match for the artifact? Judge identity and contract, not visual resemblance alone.",
      criteria: candidateCriteria,
    },
    artifact_role: {
      type: "choice",
      instructions: "What role does this artifact currently play in the design-system operating model? Judge current evidence, not desired future maturity.",
      criteria: {
        "reusable-component": "A bounded reusable UI contract with stable anatomy or behavior.",
        "reusable-composition": "A reusable arrangement of components or regions with a stable cross-product contract.",
        "product-specific-composition": "A useful composition whose contract is specific to one product workflow.",
        exploration: "A study or proposal that lacks enough reusable contract evidence.",
        duplicate: "A redundant artifact that should reconcile into an existing artifact rather than establish a separate contract.",
      },
    },
    sync_direction: {
      type: "choice",
      instructions: "What single direction should the next reconciliation step take? Never recommend overwriting both directions in one operation.",
      criteria: {
        "figma-to-code": "Figma has stronger approved evidence for the concern and code should receive a reviewed change.",
        "code-to-figma": "Canonical code has stronger evidence and Figma should be updated to match it.",
        "continue-in-figma": "The artifact needs more design/component-system work before code mutation.",
        "continue-in-code": "The contract needs executable implementation evidence before Figma mutation.",
        "no-sync": "Evidence is insufficient, identity is ambiguous, or the surfaces intentionally differ.",
      },
    },
    evidence_sufficient: {
      type: "noul",
      instructions: "Is the supplied evidence strong enough to recommend one identity, role, and sync direction for human review?",
      criteria: {
        true: "The evidence distinguishes the leading recommendation from alternatives and names relevant constraints.",
        false: "Important source inspection, mapping, runtime evidence, or authority information is missing or contradictory.",
      },
    },
    requires_human_review: {
      type: "noul",
      instructions: "Does the recommended next step require explicit human review before any Figma, code, catalog, or lifecycle mutation?",
      criteria: {
        true: "Identity, authority, lifecycle, destructive edits, or product/design intent remain consequential.",
        false: "Only deterministic read-only reporting remains; no mutation or authority decision is involved.",
      },
    },
  }

  for (const concern of concernIds) {
    questions[`concern_${concern}`] = {
      type: "noul",
      instructions: `Is ${concern} an independently material concern in this reconciliation?`,
      criteria: {
        true: `The evidence contains a substantive ${concern} difference or proposal that should be tracked separately.`,
        false: `${concern} is incidental or unsupported by the supplied evidence.`,
      },
    }
  }

  return { state: evidence, model, questions }
}

function validateProbability(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${label} must be a probability from 0 to 1`)
  }
  return value
}

function validateChoice(answer, question, label) {
  requireObject(answer, label)
  if (answer.type !== "choice") throw new Error(`${label}.type must equal choice`)
  const allowed = Object.keys(question.criteria)
  if (!allowed.includes(answer.choice)) throw new Error(`${label}.choice is not in the request criteria`)
  requireObject(answer.probabilities, `${label}.probabilities`)
  for (const option of allowed) validateProbability(answer.probabilities[option], `${label}.probabilities.${option}`)
  const total = allowed.reduce((sum, option) => sum + answer.probabilities[option], 0)
  if (Math.abs(total - 1) > 0.001) throw new Error(`${label}.probabilities must sum to 1`)
  return {
    choice: answer.choice,
    probability: answer.probabilities[answer.choice],
    confidence: validateProbability(answer.confidence, `${label}.confidence`),
    probabilities: Object.fromEntries(allowed.map((option) => [option, answer.probabilities[option]])),
  }
}

function validateNoul(answer, label) {
  requireObject(answer, label)
  if (answer.type !== "noul") throw new Error(`${label}.type must equal noul`)
  return validateProbability(answer.noul, `${label}.noul`)
}

export function buildReport({ evidence, request, response, evidencePath, modelRequested }) {
  const payload = requireObject(response, "TypeSafe response")
  const answers = requireObject(payload.answers, "TypeSafe response.answers")
  const identity = validateChoice(answers.identity, request.questions.identity, "answers.identity")
  const artifactRole = validateChoice(answers.artifact_role, request.questions.artifact_role, "answers.artifact_role")
  const syncDirection = validateChoice(answers.sync_direction, request.questions.sync_direction, "answers.sync_direction")
  const evidenceSufficient = validateNoul(answers.evidence_sufficient, "answers.evidence_sufficient")
  const requiresHumanReview = validateNoul(answers.requires_human_review, "answers.requires_human_review")
  const concerns = Object.fromEntries(concernIds.map((concern) => [
    concern,
    validateNoul(answers[`concern_${concern}`], `answers.concern_${concern}`),
  ]))

  const blockers = []
  if (identity.choice === "unmapped") blockers.push("No catalog identity was established.")
  if (evidenceSufficient < 0.7) blockers.push("Jev judged the supplied evidence insufficient for a directional recommendation.")
  if (identity.probability < 0.7) blockers.push("The leading identity match is below the 0.70 review threshold.")
  if (syncDirection.probability < 0.7) blockers.push("The leading sync direction is below the 0.70 review threshold.")

  return {
    $schema: REPORT_SCHEMA,
    generatedAt: new Date().toISOString(),
    evidence: {
      path: evidencePath,
      artifact: evidence.artifact,
      candidates: evidence.candidates.map(({ entityId, evidence: candidateEvidence }) => ({ entityId, evidence: candidateEvidence })),
    },
    judgment: {
      modelRequested,
      modelResolved: requireString(payload.model, "TypeSafe response.model"),
      identity,
      artifactRole,
      concerns,
      syncDirection,
      evidenceSufficient,
      requiresHumanReview,
      usage: payload.usage ?? null,
    },
    authorization: {
      status: "human-review-required",
      mutationsAllowed: false,
      boundary: "This report may recommend work but cannot edit Figma, code, catalog identity, or prototype lifecycle state.",
      blockers,
      nextStep: blockers.length > 0
        ? "Gather or clarify evidence, then rerun reconciliation."
        : "Review the recommendation and explicitly authorize one directional mutation in a separate command or agent action.",
    },
  }
}
