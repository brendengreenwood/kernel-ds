# Kernel docs system

Two kinds of documentation live here, and the distinction is the whole point:

| Doc | Question it answers | Lifecycle |
|---|---|---|
| `STATE.md` | "What is true **right now**?" | Living — edited in place, always current |
| `worklog/` | "What was **done**, when, and why?" | Append-only — entries are never rewritten |
| `decisions/` | "**Why** is the system shaped this way?" | Immutable — superseded, never edited |
| `archive/` | "What used to be true?" | Cold storage — date-stamped, read-only |
| `a11y/` | "How accessible is it, as **measured**?" | Point-in-time reports — date-stamped, read-only |
| `audit/` | "Did reality match the **invariants** on date X?" | Point-in-time reports — date-stamped, read-only |

## The process (follow on every change)

1. **Do the work** (per the sync rules in `CLAUDE.md`).
2. **Append a worklog entry** to `worklog/YYYY-MM.md` (current month; create the
   file if it's a new month). Format:

   ```
   ## YYYY-MM-DD — short title
   **What:** one or two sentences on the change.
   **Why:** the reason/request behind it — this is the part git log can't tell you.
   **Touched:** key files/surfaces.
   ```

3. **Update `STATE.md`** so it reflects reality after the change:
   - Move finished items out of *In flight* (the worklog entry is their record).
   - Add/adjust *Current state* facts that changed.
   - Add new *Open questions* if the work surfaced any; delete resolved ones.
4. **If a shaping decision was made** — one that constrains future work
   (a convention, a dependency, an architecture choice) — add a record to
   `decisions/` as `NNNN-kebab-title.md` (next number in sequence):

   ```
   # NNNN — Title
   Date: YYYY-MM-DD · Status: accepted

   ## Context
   ## Decision
   ## Consequences
   ```

   To reverse a decision later: write a **new** record that supersedes it, and
   change the old one's status line to `superseded by NNNN`. Never rewrite the
   body.

## Archiving

`STATE.md` must stay short enough to read in one sitting. When a section of it
is no longer active (a completed initiative, a retired surface, a resolved
question cluster worth keeping):

- Move that content to `archive/YYYY-MM-DD-topic.md` with a one-line header
  saying why it was archived and, if relevant, which worklog entries cover it.
- Leave nothing behind in `STATE.md` except (optionally) a one-line pointer.

Worklog files are already the archive of activity — they never move. Old
monthly files just accumulate in `worklog/`.

## Rules of thumb

- Worklog = every meaningful change. Decisions = only choices with lasting
  constraints. Don't write a decision record for routine component work.
- "Why" beats "what". Git shows what changed; these docs exist to capture
  intent.
- If `STATE.md` and reality disagree, fixing `STATE.md` is part of the change
  that caused the disagreement — not a separate chore for later.
