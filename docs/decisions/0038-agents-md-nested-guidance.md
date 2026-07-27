# 0038 — Nested AGENTS.md as the agent operational map

Date: 2026-07-27
Status: accepted

## Context

The repo's agent guidance lived entirely in a single root `CLAUDE.md`. That file
is excellent at design *conventions* (the three color axes, token discipline,
mobile ergonomics, the docs ritual) but it carried no operational map: which
package to work in for a given task, the exact build/test/typecheck commands per
package, the verification-gate catalogue, or the source-tree architecture. An
agent starting cold had to re-derive all of that by grepping.

The two-package layout (`kernel-portal` + `kernel-studio-server`, sibling npm
packages, no workspace root) makes this worse: the correct command depends on
*where* you are, and running the wrong package's build is slow and useless. The
`ds-bundle` location, the studio's cross-package path resolution, and the gate
scripts were all tribal knowledge.

Mastra's own monorepo solves this with nested `AGENTS.md` files: a terse root
file that says "prefer the most specific AGENTS.md for the changed area," plus a
package-local file per package carrying the narrowest build/test commands and
architecture, plus deeper files where domain knowledge is dense.

## Decision

**Adopt Mastra's nested-AGENTS.md pattern as this repo's operational map, and
keep CLAUDE.md as the design-conventions layer.**

- **Root `AGENTS.md`** — hierarchy directive ("read the most specific first"),
  the two-package layout, narrowest-build-first philosophy, the docs ritual, and
  a top-level architecture map. Points at `CLAUDE.md` for conventions.
- **`kernel-portal/AGENTS.md`** — build/lint/dev commands, the full
  verification-gate catalogue (parity, coverage, prose, style-fidelity,
  status-map, composition, contrast/mobile audits, the `__check__` assertions),
  the token/icon/overline conventions in brief, and the `src/` architecture.
- **`kernel-studio-server/AGENTS.md`** — vitest/check/dev commands, the
  cross-package path facts from `src/lib/paths.ts` (repo-root `ds-bundle`,
  `public/definitions`, `prototypes`, and their env overrides), and the mastra
  architecture.
- **Deeper files** where knowledge is dense: `docs/`, `kernel-portal/scripts/`,
  `kernel-portal/src/lib/`, `kernel-portal/src/components/ui/`,
  `.../components/portal/`, `.../components/portal/objects/`,
  `kernel-studio-server/src/mastra/`, and `kernel-studio-server/prototypes/`.
- **`CLAUDE.md`** keeps all its design conventions and gains a one-line pointer at
  the top directing operational questions to the AGENTS.md chain.

## Voice

Telegraphic, one fact per line, no prose paragraphs — matching Mastra's format so
the files stay scannable and cheap to load. Commands are literal and runnable.
Every claim was verified against the running repo, not memory.

## The single-source principle

Same discipline as 0035–0037: guidance points at one authority instead of
re-stating it. The nested files reference `CLAUDE.md` for conventions and each
other for scope, rather than duplicating rules that would drift.

## Deliberately deferred

- **A gate that checks AGENTS.md paths still resolve.** The files cite real
  scripts and dirs; a drift guard that fails when a referenced path disappears is
  a possible follow-up, not built now.
- **Studio-side lint.** The portal has an oxlint step; the studio's guidance
  documents `test` + `check` only, matching its current scripts.
