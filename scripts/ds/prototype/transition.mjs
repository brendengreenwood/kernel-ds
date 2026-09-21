import { concernStates, reasonRequiredTransitions, transitionMatrix } from "./schema.mjs"

export function authorizePrototypeTransition({ initiative, concern, nextState, date, actor, source, reason, evidence = [], acceptance, canonical, verifyPromotion }) {
  const record = initiative?.concerns?.find((item) => item.concern === concern)
  const issues = []
  if (!record) return { ok: false, status: "invalid", issues: [`Unknown concern ${concern}`] }
  if (!concernStates.includes(nextState)) issues.push(`Unknown state ${nextState}`)
  if (!transitionMatrix[record.state]?.includes(nextState)) issues.push(`Illegal transition ${record.state} -> ${nextState}`)
  const edge = `${record.state}->${nextState}`
  if (reasonRequiredTransitions.has(edge) && !reason?.trim()) issues.push(`Transition ${edge} requires an audit reason`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "") || !actor?.trim() || !source?.trim() || !reason?.trim()) {
    issues.push("Transition requires explicit date, actor, source, and reason")
  }
  if (nextState === "promoted") {
    if (!acceptance) issues.push("Promotion requires an explicit committed acceptance artifact")
    if (!canonical) issues.push("Promotion requires immutable canonical evidence")
    if (issues.length === 0) {
      const verification = verifyPromotion({ initiative, concern: record, acceptance, canonical })
      if (verification.status === "unverifiable-history") return { ok: false, status: "unverifiable-history", issues: verification.issues }
      if (!verification.ok) issues.push(...verification.issues)
    }
  }
  if (issues.length > 0) return { ok: false, status: "invalid", issues }

  const updated = structuredClone(initiative)
  const updatedConcern = updated.concerns.find((item) => item.concern === concern)
  updatedConcern.state = nextState
  updatedConcern.history.push({
    from: record.state,
    to: nextState,
    date,
    actor,
    source,
    reason,
    evidence: [...evidence],
  })
  if (nextState === "promoted") {
    updatedConcern.acceptance = acceptance
    updatedConcern.canonical = canonical
  }
  return { ok: true, status: "authorized", initiative: updated, issues: [] }
}
