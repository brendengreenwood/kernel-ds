import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** CRUD Patterns — pattern doc entity. */
export const crudPatternsDoc: ComponentDoc = parseComponentDoc({
  id: "crud-patterns",
  name: "CRUD Patterns",
  slug: "crud-patterns",
  summary:
    "The standard shape of create/read/update/delete work — a DataTable listing records, a Dialog or Sheet for create and edit, a detail panel for read, and an AlertDialog guarding delete. Following the same shape everywhere means users learn it once and apply it to every collection.",
  status: "ready",
  sourceFiles: [],
  metadata: { owner: "ds", kind: "pattern" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "List records in a DataTable, open create/edit in a Dialog or Sheet, and show a record's detail in a dedicated panel.",
        "Guard delete with an AlertDialog and confirm the outcome with a toast, offering Undo where possible.",
        "Keep the same create/edit form for both operations so validation and layout stay consistent.",
      ],
      donts: [
        "Don't invent a different edit affordance per collection — reuse the shape so it's learnable.",
        "Don't delete without confirmation, and don't leave the user guessing whether it worked.",
        "Don't scatter create/edit across full pages and modals inconsistently within one app.",
      ],
    },
    {
      kind: "useCases",
      use: [
        "Managing a collection of records end to end.",
        "In-place create and edit over a listed dataset.",
        "Safe deletion with confirmation and undo.",
      ],
      dontUse: [
        "A guided multi-step creation — use a flow.",
        "A read-only report or dashboard.",
        "Bulk data import — use a dedicated import flow.",
      ],
    },
  ],
})
