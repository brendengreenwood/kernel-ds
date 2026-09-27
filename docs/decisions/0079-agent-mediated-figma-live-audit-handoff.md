# 0079 — Use an agent-mediated handoff for live Figma audits

Date: 2026-09-27 · Status: accepted

## Context

Repository child processes cannot invoke the MCP-hosted Figma Desktop Bridge directly: the bridge is healthy inside the MCP host, but no approved repository client or dependency can reach it. The full-library migration still needs a deterministic, resumable live gate against the Kernel DS source file.

## Decision

Live Figma audits use a two-stage agent-mediated handoff. `ds:figma:live begin` validates the cohort and contracts, embeds the exact checked-in Plugin API implementation and scoped input into a content-hashed request, and declares the response path. The agent executes that generated code unmodified through the connected Desktop Bridge. `complete` verifies request, implementation, and response hashes before writing captures or durable evidence. `abort` removes incomplete local handoff state.

Preliminary audits remain capture-only. Only passing full audits may update component evidence, layout evidence, or acceptance proof. The handoff adds no runtime dependency and does not weaken the live-file proof requirement.

## Consequences

- A live audit is resumable across the repository/MCP process boundary.
- Tampered, stale, wrong-file, wrong-mode, or mismatched responses fail closed.
- The generated request and bounded response are proof artifacts and are not committed.
- Direct repository access to the bridge can replace this mechanism only through a later explicit decision.
