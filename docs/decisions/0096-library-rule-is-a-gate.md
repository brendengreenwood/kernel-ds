# 0096 — The library rule is a gate

Status: accepted
Date: 2026-11-09

## Decision

`kernel-portal/scripts/check-ds-usage.mjs` enforces the library rule: UI comes from `@kernel/ui`, and a missing piece is added to Kernel rather than built locally. The gate exits 1 when consumer code adds any of these:

- a raw `button`, `input`, `select`, `textarea`, `label` or `table` element
- a hand-built card surface (`rounded-lg` + `border` + `bg-card` on one element)
- an icon package other than the Kernel icon shim (`lucide-react`, `@heroicons/*`, `react-icons/*`)

It scans `kernel-portal/src` and `prototypes/origination-map-v2/src`. `packages/ui` is not scanned; that is where the raw elements are supposed to live.

## Ratchet

The gate follows the pane-usage pattern (decision 0083). `ds-usage-baseline.json` records today's offenders per file and rule. A count may only go down, and a new file starts at zero. `--update` rewrites the baseline after a cleanup.

Baseline on the day it landed: 157 across 47 files (hand-card 82, raw-button 51, raw-table 10, raw-label 9, raw-input 3, raw-select 1, raw-textarea 1, foreign-icons 0).

## Why

The rule existed only as prose, so nothing stopped a hand-spun control from shipping. The Pricing scenario page faked a status and hand-rolled a stale marker before decisions 0092 and 0095 fixed both by hand. A gate catches the next one at commit time.

The prototype is in scope because that is where local patches start. Decision 0093 keeps the map a prototype; this keeps it honest while it is one.

## Not covered

- Comments are stripped before counting, so prose about an element never counts.
- The gate reads source text, not the rendered tree. A raw element built through `React.createElement` or a spread `className` is missed.
- The baseline is debt, not approval. Some entries are deliberate (foundations demos that show a bare element); those stay baselined until the gate grows an allowlist.
- `kernel-app` is fenced unmanaged (decision 0036) and is not scanned.
