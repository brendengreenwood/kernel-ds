---
"@kernel/ui": minor
---

Two scenario primitives. `Freshness` marks whether market data is still inside
its stale limit (`state="fresh" | "stale"`, clock glyph plus a text label, so
the signal never rests on color alone); the caller computes the verdict.
`VersionHistory` (+ `VersionHistoryItem`, `VersionHistoryLabel`,
`VersionHistorySummary`, `VersionHistoryMeta`) lists the saves of one object,
newest first, with `current` marking the live version via `aria-current`.
Additive; both experimental. Decision 0095.
