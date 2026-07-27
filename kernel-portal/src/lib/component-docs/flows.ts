import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Flows — pattern doc entity. */
export const flowsDoc: ComponentDoc = parseComponentDoc({
  id: "flows",
  name: "Flows",
  slug: "flows",
  summary:
    "A guided multi-step task that carries the user from start to finish — onboarding, a booking, a structured submission — breaking a big job into ordered steps with clear progress and a way back. Use a flow when the task is sequential and skipping ahead would produce invalid state.",
  status: "ready",
  sourceFiles: [],
  metadata: { owner: "ds", kind: "pattern" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Break the task into a small number of ordered steps and show where the user is with a Progress bar or stepper.",
        "Let users go back to revise earlier steps without losing what they've entered.",
        "Validate each step before advancing so errors surface close to their cause.",
      ],
      donts: [
        "Don't force a flow on a task that isn't sequential — a single form is faster when order doesn't matter.",
        "Don't hide progress or the total number of steps; uncertainty makes users abandon.",
        "Don't discard entered data when a user steps backward or the session hiccups.",
      ],
    },
    {
      kind: "useCases",
      use: [
        "Onboarding or account setup in ordered steps.",
        "A structured submission where later steps depend on earlier ones.",
        "A wizard for a complex, sequential task.",
      ],
      dontUse: [
        "A short form where all fields fit on one screen.",
        "Independent settings the user edits in any order.",
        "Quick create/edit — use a Dialog form.",
      ],
    },
  ],
})
