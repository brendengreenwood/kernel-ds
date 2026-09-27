# DSDS reconciliation judgments

`npm run ds:reconcile` turns inspected Figma, code, or prototype evidence into a bounded Jev recommendation. It is a read-only review step in the DSDS reconciliation loop; it cannot mutate Figma, code, catalog identity, or prototype lifecycle state.

## Evidence

Create a JSON document with schema `kernel-ds/reconciliation-evidence@1`:

```json
{
  "$schema": "kernel-ds/reconciliation-evidence@1",
  "artifact": {
    "name": "Workspace study",
    "surface": "figma",
    "reference": "figma://file-key/node-id",
    "summary": "What was inspected and what the artifact currently represents."
  },
  "candidates": [
    {
      "entityId": "object.workspace",
      "evidence": "Why this catalog identity is plausible."
    }
  ],
  "observations": ["Concrete evidence from Figma, code, browser behavior, or gates."],
  "constraints": ["Authority or equivalence limits the judgment must respect."]
}
```

Candidate IDs must resolve in `@kernel/catalog`. Supply 1–12 candidates; the request always includes an `unmapped` outcome.

## Run

Preview the exact Jev request without credentials or writes:

```bash
npm run ds:reconcile -- --evidence path/to/evidence.json --dry-run
```

Call Jev and write a report:

```bash
TYPESAFE_API_KEY=... npm run ds:reconcile -- \
  --evidence path/to/evidence.json \
  --out .release/reconciliation/workspace.json
```

On Windows, set `TYPESAFE_API_KEY` in the process environment before running the command. `--model` defaults to `jev-latest`.

Tests and review replays may pass `--response-file <json>` to validate a saved TypeSafe response without making a live API call.

## Judgment contract

Jev answers independent typed questions for:

- catalog identity (`Choice`, including `unmapped`)
- current artifact role (`Choice`)
- material concerns: visual, contract, data, composition, workflow (`Noul` each)
- one recommended sync direction (`Choice`)
- evidence sufficiency and human-review need (`Noul` each)

The generated `kernel-ds/reconciliation-report@1` always contains:

```json
{
  "authorization": {
    "status": "human-review-required",
    "mutationsAllowed": false
  }
}
```

Thresholds identify blockers for review; they do not grant authority. After review, an agent or human may explicitly authorize one directional mutation in a separate action. Existing deterministic gates remain responsible for builds, accessibility, registry validity, and projection freshness.

## Boundary

Jev recommends; it does not canonize. The command never:

- edits Figma or code
- creates or changes catalog identities
- advances `ds:prototype` lifecycle state
- claims runtime equivalence from a design artifact
- recommends overwriting both directions in one operation
