# 0025 — Agent consolidation: one Mastra system for design + research

**Status:** accepted · 2026-07-14

## Decision

The UX research agent stack (previously the standalone
`mastra-ux-research-agent` repo) lives **inside `kernel-studio-server/`**,
in the same Mastra instance as the design agent:

- **One instance, four agents:** `kernel-design-agent`,
  `cognitive-research-agent`, `artifact-agent`, `supervisor-agent` — plus
  2 workflows, 3 scorers, the `ux-research-mcp` MCP server (10 tools),
  Mastra `apiRoutes` (brief/artifact/viewer), LibSQL storage
  (`file:./mastra.db`), and observability, merged in
  `src/mastra/index.ts`. The standalone Hono API (`src/api/`, port 3001,
  `npm run api`) came along unchanged.
- **Native bridge over MCP federation:** the design agent's `tools` now
  include `getPersonaTreeTool` and `searchTranscriptsTool`, so generated
  prototypes can be grounded in real research personas and transcripts by
  direct tool call — no cross-server MCP hop. The MCP surface is retained
  for *external* consumers; it is no longer the path between our own agents.
- **The research repo stays as an archive** (`main` + `spike/mastra-150`),
  untouched. Source of the port is the `spike/mastra-150` working tree
  (identical to main except the lockfile). No behavior changes in the port:
  every ported file is byte-identical to its research-repo original except
  the three config edits recorded as deviations below (no import-path
  rewrites were needed — relative structure was preserved; the only import
  edits were in the studio-owned `design-agent.ts`, D4).

## Why

- **Spike evidence (2026-07-13, verdict CONSOLIDATE, user-approved):**
  `spike/mastra-150` proved the research stack runs on `@mastra/core` 1.50.1
  with a **lockfile-only** change — `npm update` from 1.15, zero source
  edits, tsc clean, vitest 90/90, boot with 3 agents, live MCP handshake
  enumerating 10 tools (commit `f701489` in the research repo). Port cost
  was effectively zero, so federation's operational overhead (two servers,
  two dependency lines, MCP as the only bridge) bought nothing.
- **Consolidated proof:** on `feat/agent-consolidation` the merged server
  boots with 4 agents at `/api/agents`, the MCP handshake still enumerates
  the same 10 tools, the design agent invoked `getPersonaTreeTool` in a real
  streamed conversation (returned 4 personas), and the research agent
  completes cleanly. Merged suite: 104/104 (90 ported + 14 studio).

## DB paths (empirically settled)

All DB URLs are cwd-relative (`file:./mastra.db`, `file:./ux-research.db`).
Under `mastra dev`, they resolve to **`src/mastra/public/`** — the copied
DBs there are the ones the server reads and writes (boot and the runtime
smoke mutated `mastra.db`'s mtime/size in place; `ux-research.db` was read
untouched; no fresh empty DBs appeared anywhere else in the package). The
DBs are gitignored (`*.db`, `*.db-shm`, `*.db-wal`) and never committed.

## Deviations from a pure move (all user-escalated, recorded)

- **D2 — model re-pins.** The research repo carried stale Anthropic model
  IDs that now 404: `claude-sonnet-4-20250514` → `claude-sonnet-5`
  (`lib/rate-limit-guard.ts`, `agents/supervisor-agent.ts`) and
  `claude-3-5-haiku-20241022` → `claude-haiku-4-5-20251001`
  (`rate-limit-guard.ts` fallback, `processors/index.ts` injection
  detector).
- **D3 — TokenLimiter limit 4000 → 30000** (`processors/index.ts`). The
  research agent's ~12K-token system prompt exceeded the input-stage
  limit, tripping a TripWire that silently produced empty model output
  (bisected: no-input-processors → normal reply; input processors on →
  empty). 30000 leaves headroom without unbounding the guard.
- **D4 — `.js` import suffixes** on the two bridge imports in
  `design-agent.ts`, matching the studio package's import convention.

## Carried risk

- **Mastra tool-arg truncation bug (core 1.50 line):**
  `sanitizeToolCallInput`/`tryRepairJson` intermittently collapses large
  tool args to `{}`. The design agent already works around it
  (one-file-per-tool-call writes). Research tools are store-first with
  small args — lower exposure, same underlying bug. Not fixed here; watch
  upstream.
- **Chat memory stays client-side** for the studio panel (decision 0024's
  pattern unchanged): the portal replays full history per request. The
  merged server *does* now have LibSQL storage (the research stack needs
  it), but the studio chat was not migrated onto it — revisit if studio
  sessions grow long.

## Alternatives considered

- **MCP federation (two servers, bridge over MCP)** — rejected: the spike
  removed the only technical reason for it (version incompatibility), and
  one person running two Mastra servers + a portal is operational drag.
- **Consolidating onto `feat/kernel-studio` before merging PR #47** —
  rejected: would couple two reviews; #47 was merged first so this branch's
  diff is pure.
