# 0069 — Hand-written guidance citations are gated

Date: 2026-09-03 · Status: accepted

## Context

Decision 0038 made nested `AGENTS.md` files the operational map and decision
0046 split each file into hand-authored prose and generated inventory blocks.
The generated blocks cannot rot: `agents:generate` rewrites them and
`agents:check` fails when they drift. The prose around them cites paths and
`npm run` scripts by hand, and 0038 explicitly deferred a gate for those.

The ui-package extraction then moved the token sheet, the icon shim, the ui
primitives, and the marks assertions out of the portal. The generated blocks in
`kernel-portal/AGENTS.md` updated on the next generate. The prose three lines
above them kept telling an agent to run `node src/components/ui/marks/__check__.mjs`
and to edit `index.css`, neither of which existed any more. A dozen such lines
across `CLAUDE.md`, the portal, the ui package, and the studio were found by a
one-off scan, not by any gate.

## Decision

**Every path and `npm run` script cited in `AGENTS.md` and `CLAUDE.md` prose
must resolve, enforced by the `agents-citations` check in `ds:doctor`.**

What counts as a citation, outside the `kernel-ds:generated` markers:

- a token with a source or doc file extension (`main.tsx`, `.github/workflows/ci.yml`);
- a token ending in `/` (`components/portal/`);
- a slash token whose first segment is a real directory (`kernel-portal/src`).
  `light/dark` and `pass/fail` are prose, not paths, and are ignored;
- `npm run <script>`, resolved against the package.json chain from the file
  upward, or against the directory named by a preceding `cd <dir> &&`.

How a citation resolves: relative to the guidance file's directory, each
ancestor, their `src/` children (the portal's shorthand), and any directory
cited earlier in the same paragraph, so "Architecture (src/)" followed by
"main.tsx — router" still reads. A bare basename that fails all of those is
searched by name inside the nearest package. Placeholders (`YYYY-MM.md`,
`<slug>.ts`, `*.tsx`), package specifiers (`@kernel/ui`), URLs, and gitignored
outputs (`dist/`, `ds-bundle/`, `.release/`) are never citations.

Authoring rule that follows: root files (`AGENTS.md`, `CLAUDE.md`) cite
repo-relative paths; package files cite package-relative ones; a word pair that
happens to contain a slash (`docs/design`) is written out as words when the
first half is a real directory.

## Consequences

- `agents-citations` is a registered, fixture-safe `ds:doctor` check, so it
  runs in CI's `automation` job from this commit on. The red fixture
  `scripts/ds/__fixtures__/agents-stale-citation/` and the assertions in
  `scripts/ds/__check__.mjs` pin exactly what it flags and what it ignores.
- Moving a file now fails the doctor until the guidance that cites it is
  updated, which is the point: the map and the territory drift together or not
  at all.
- The heuristics are deliberately narrow. A false positive is fixed by
  rewriting the sentence (that ambiguity confuses a reader too), not by
  widening the allowlist.
- Closes the deferral in decision 0038. Decisions 0038 and 0046 remain
  authoritative for the file hierarchy and the generated/authored boundary.
