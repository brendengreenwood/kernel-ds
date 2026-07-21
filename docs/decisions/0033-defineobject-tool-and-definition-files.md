# 0033 — The defineObject tool and definition files

Date: 2026-07-21
Status: accepted

## Context

Decisions 0030–0032 made the object system data-driven: objects arrive as
JSON (`parseObjectModel`, decision 0030), status badges speak the model's
language (decision 0031), and whole workspaces arrive as JSON
(`parseWorkspacePreset`, decision 0032). But everything was
session-scoped — the alien proofs (Incident, Incident-ops) registered at
runtime and vanished on reload. STATE.md explicitly deferred persistence
to "the studio defineObject tool, next plan". This is that plan's record.

## Decision

**Persisted tools are files.** A tool the studio agent authors is two
validated JSON documents under `kernel-portal/public/definitions/`:

- `objects/<key>.json` — an **object model**: fields (id/text/number/date/
  status/reference kinds), statuses each carrying a **required tone**
  (`draft | active | success | warning | danger | neutral`) and a label
  the UI displays verbatim, and associations (object-to-object links,
  null-guarded when the target is unregistered). Coordinates are
  optional — the deterministic djb2 derivation fires when absent.
- `workspaces/<key>.json` — a **workspace preset**: modes with rail
  label/icon, `objectKey` binding, a navigator idiom
  (`grouped | queries | associations`) with per-idiom coherence enforced
  at parse time (grouped requires `groupByOptions`; queries requires
  `savedQueries`; `defaultGroupBy` must be a member of `groupByOptions`),
  canvas view keys, and dock panels.

`manifest.json` lists both; the boot loader
(`src/lib/objects/definitions-loader.ts`) fetches the manifest once at
portal startup and registers every listed document — objects through
`parseObjectModel` → `registerObject`, presets through
`parseWorkspacePreset` into the runtime preset store. Tools therefore
**survive reload**. Session registration (`registerObject` at runtime)
remains available for demos; files are for persistence.

**Agents write through validation.** The studio server's write path
(`kernel-studio-server/src/lib/definitions.ts`) re-validates every
document against the portal's own schemas before touching disk:
`writeDefinition` spawns the portal's `validate-definition` CLI, and an
invalid verdict **throws with the schema errors and writes nothing**.
This is enforced, not stated: the vitest case
`rejects an invalid document (missing tone): validateDefinition says no,
writeDefinition throws without writing`
(`kernel-studio-server/src/__tests__/define-tools.test.ts`) proves it,
alongside cases for path-escape guarding (non-slug keys, forged `../`
paths), per-idiom coherence rejection, and manifest idempotence on
double-write. The manifest is rewritten **last** — atomic publish.

## The subprocess validation boundary

kernel-studio-server cannot import portal TypeScript: it is a separate
package, and mastra bundles from `.mastra/output`. Validation crosses
the boundary via a portal CLI (`kernel-portal/scripts/
validate-definition.mjs`) that imports `parseObjectModel` /
`parseWorkspacePreset` under `node --experimental-strip-types`, resolves
those imports from its own location (`import.meta.url`, cwd-independent),
reads the candidate document from a file arg or stdin, and prints one
machine-readable JSON verdict (exit 0 valid / 1 invalid / 2 usage).
Studio code spawns it with `process.execPath` (never bare `"node"` —
PATH ambiguity on Windows under mastra dev).

Rejected alternatives:

- **Shared TS imports** — the package boundary doesn't allow it
  (mastra's bundle can't reach portal sources), and pretending otherwise
  couples two packages' build systems.
- **Duplicated zod schemas in the studio server** — drift; the same
  disease the single-tone-map-source doctrine (decision 0030) cured at
  the object layer. Two schemas diverge silently and the "validated"
  claim rots.
- **Emit JSON Schema + a validator dependency** — a new dependency and a
  second source of truth; the zod refinements (per-idiom coherence)
  don't round-trip cleanly.

The subprocess costs a process spawn per validation and buys exactly one
source of truth: the portal's schemas validate the portal's inputs.

## The empty default manifest

The shipped `manifest.json` is `{ "version": 1, "definitions": [] }`.
The default rendered state of `/workspace-obj`, `/designs`, and every
legacy route is byte-identical to before this decision: with an empty
store the "Saved workspaces" affordance renders **no DOM at all**, and
the boot loader resolves to a no-op. All five baseline proof harnesses
pass unmodified with SHA-256 hashes unchanged — harness integrity and
pixel parity were design constraints, not accidents. Persisted
definitions appear only when the studio tool writes them.

## SPA-redirect tolerance (specified behavior)

The root `netlify.toml` redirects `/* → /index.html` with status **200**.
A missing `/definitions/manifest.json` on the deployed site therefore
returns HTML with HTTP 200 — a 404 branch never fires. The loader
treats any of: non-OK response, non-JSON content type, or JSON parse
failure as "zero definitions" and returns silently
(`definitions-loader.ts` — this is specified behavior, not defensive
garnish). Per-document failures are isolated: one bad document is
collected in `failed` and never takes down boot or its siblings; a
preset whose object document failed still lists and loads into the
existing "not registered" null-guard state.

## Arc position

0030 (objects arrive as JSON) → 0031 (labels from model) → 0032
(workspaces arrive as JSON) → **0033 (definitions persist as files;
agents write through validation)**. The generative-UI loop is closed:
a studio agent can emit a working tool as two documents, and the portal
derives a working workspace that survives reload — proven end-to-end by
a deterministic drive (library-book / library-ops, zero human-authored
TSX) exercising the real write path and the real CLI.

## Deliberately deferred

- **Live-LLM toolsmith-agent evaluation.** The deterministic proof
  exercises the same pipeline the agent's tool calls wrap; LLM output is
  non-deterministic and API-keyed, so gating on it would make a flaky
  gate. Exercising the live agent is an eval problem, tracked as a board
  item, not a persistence problem.
- **Definition editing/deletion UX.** The write path is append/overwrite
  by key; there is no portal UI to edit or remove a persisted definition
  yet.
- **Multi-workspace switching UX.** Saved workspaces load one at a time
  through the demo-controls affordance; a first-class switcher is future
  work.
