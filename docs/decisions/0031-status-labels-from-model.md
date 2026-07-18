# 0031 — Status badge text derives from model-declared labels

Date: 2026-07-18
Status: accepted
Amends: extends 0030 (composition contract) rule `status-via-model-tones`; builds on Amendment A4 (single tone map) and decision 0030.

## Context

The dynamic-objects work (decision 0030, PR #58) proved an object can arrive as validated JSON and derive its full suite. Its designed finding: `StatusBadge`'s default vocabulary is trade-shaped (`booked` / `settled` / `cancelled` …), so an Incident's `open` status — mapped through the `danger` tone — rendered a badge reading **"Cancelled"**. Right color path, wrong words. Separately, the Query preview's filter chips already showed the model's label while the row badge showed the component default, breaking the "chip and badge agree" claim.

## Decision

**Labels are display truth; tones are color truth.**

- `status-map.ts` gains `statusLabelFromModel(model, value)` and `statusLabelForObject(objectKey, value)` — they return the model's declared `ObjectStatus.label`, or `undefined` for unknown keys (the badge then falls back to its default label, consistent with the tone path's silent fallback).
- Every object-layer `StatusBadge` call site passes the label as `children`. The component is **not modified**: it already renders `children ?? defaultLabel[status]`. This is consumption of the existing public API, not a component change.
- The composition rule `status-via-model-tones` now states both halves: colors via the single `toneToStatus` map, text via model-declared labels.

## The system never edits a model's language

During execution the user directed (Amendment A1 of the status-labels plan) that the planned `contract.ts` `"Active"` → `"Booked"` label rename be **dropped**. The fixture models are placeholder data; bending a model's declared words to match a component's default vocabulary is exactly the failure mode this decision removes. Contract's `active` badge therefore reads **"Active"** — the model's own word. If a domain wants "Booked", it declares "Booked".

## Consequences

- Incident (registered from JSON) shows "Open" / "Mitigating" / "Resolved" / "Postmortem". Settlement shows "Confirmed" / "Reversed" / "Pending". Contract shows "Active" / "Draft" / "Settled" / "Cancelled".
- Colors are unchanged. Tone→color granularity remains an open follow-up: `danger` still renders the `cancelled` variant (viz-slate), so an open incident reads "Open" in slate — right word, debatable color (board item).
- Unknown status keys keep today's behavior: tone-fallback color, component default label — the recorded silent-fallback follow-up.
