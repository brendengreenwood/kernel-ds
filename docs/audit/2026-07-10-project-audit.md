# 2026-07-10 project audit

Full audit of kernel-ds against its own invariants (CLAUDE.md sync rules, decision
records, docs discipline) after main fast-forwarded 47 commits to `880a721`
(motion system, MDI icon migration per decision 0019, tabs system, Install
rewrite, pricing worksheet, menu promotions). Follows the tradition of the
2026-07-03 sync audit (worklog, "Full sync audit" entry), extended to five areas:
surface parity, conventions conformance, a11y gates, mobile/visual, build
health, and docs freshness.

- **Branch:** `audit/2026-07-10-project-audit` (from `main` @ `880a721`)
- **Environment:** Windows / cmd, Node via `npm ci` in `kernel-portal/`
  (450 packages, 0 vulnerabilities). Playwright installed session-only
  (`npm i --no-save playwright` + `npx playwright install chromium`) — never
  entered `package.json`/`package-lock.json`.
- **Rules of engagement:** mechanical findings (small, local, no design
  judgment) fixed inline with red→green evidence; everything else backlogged.
  Untracked local artifacts inventoried, untouched (user decision 2026-07-10).
- **Evidence:** raw command transcripts live in the session proof bundle
  (`gates/`, `fixes/NN-<slug>/{red,green}.txt`, `screenshots/`, `demo.md`) —
  outside the repo, referenced below by filename. Repo-side evidence is the
  audit commits: `a3e4931` (parity), `b83ba31` (conventions), `019b253`
  (docs freshness), and the Phase 6 ship-check fix commit (adversarial
  review: three more unused-import removals + report corrections).

## Methodology

All portal commands from `kernel-portal/`; everything else from repo root.

| Check | Command |
|---|---|
| Types | `npx tsc -b` |
| Build | `npm run build` |
| Lint | `npm run lint` (oxlint) |
| Contrast (AA) | `node scripts/contrast-audit.mjs` |
| Mobile (390px) | `npm run build` → `npx vite preview --port 4173` → `node scripts/mobile-audit.mjs <urls>` |
| Token parity | throwaway `token-parity.mjs`: theme.css ↔ index.css value maps (`:root` + `.dark`), index.css-only classification, HTML token-reference coverage |
| Nav/status parity | throwaway `nav-parity.mjs` / `status-parity.mjs`: preview nav+sections ↔ portal routes; preview status table ↔ `component-meta.ts` |
| Conventions | greps per CLAUDE.md + decisions (lucide-react, web fonts, hardcoded heights, motion literals, status/notification separation, commodity OKLCH identity) |
| Screenshots | throwaway playwright script: both surfaces × light/dark × 1440px/390px (8 PNGs) |
| Docs freshness | STATE facts vs repo, `git log --oneline --since="2026-07-03"` vs worklog, decision numbering/supersede links, README file map |

## Results by area

### 1 · Surface parity (preview ↔ portal) — 1 discrepancy, fixed

- **Tokens:** theme.css defines 296 light-block tokens and 41 dark-block
  overrides. Every theme.css token exists in `kernel-portal/src/index.css`
  with an **identical value**, light and dark — 0 value drift after the one
  fix below. (The 07-03 audit counted 231 tokens; today's 296 is growth from
  the motion + commodity work, not drift.)
  - Found: `--shadow-color` present in theme.css `:root` and `.dark` and in
    index.css `:root`, but **missing from index.css `.dark`** — dark-mode
    shadows in the portal silently fell back to the light value. Fixed
    (commit `a3e4931`, +1 line). Evidence: `fixes/01-shadow-color-dark-block/`.
  - index.css-only names (shadcn bridge layer: `--background`, `--primary`,
    sidebar vars, etc.) all resolve to Kernel tokens via `var(...)`, except
    five literal shadow-geometry primitives (`--shadow-opacity`, `--shadow-blur`,
    `--shadow-spread`, `--shadow-offset-x`, `--shadow-offset-y`) — **accepted**:
    portal-only shadcn bridge inputs, not duplicated Kernel values.
- **Token reference:** all 296 theme.css tokens appear in the
  "Tokens — complete reference" blocks in `Kernel Design System.html` (0 missing).
- **Nav/routes:** preview 24 nav-links = 24 sections; portal 29 routes. The
  delta is portal-only routes sanctioned by decision 0012/0011 (e.g.
  `border-beam`, recorded in `component-meta.ts` and STATE) — 0 unexplained.
- **Component status:** 68 rows on both surfaces, ready 57 / experimental 11
  on both — the 2026-07-09 reconciliation still holds.
- Evidence: `gates/token-parity.txt`, `gates/nav-parity.txt`,
  `gates/status-parity.txt`.

### 2 · Conventions conformance — 4 clean, 1 fixed, 2 backlogged

| # | Check | Result |
|---|---|---|
| 1 | No lucide-react imports (decision 0019) | **Clean** — 0 imports; only comment/prose mentions (`install.tsx`, `icon.tsx`) |
| 2 | No web fonts (decision 0002) | **Clean** — 0 hits either surface |
| 3 | No hardcoded control heights | 8 `h-[...px]` literals; 7 are non-control layout/vendored sizing (accepted); `filters.tsx:25` `h-[30px]` filter chip → **backlog** (no matching control token: scale is 32/38/44px) |
| 4 | Motion tokens used, not literals | portal components clean; `portal.css` has ~30 raw duration literals predating the motion system + `navigation-menu.tsx` `duration-[0.35s]` (vendored Base-UI styling, no 350ms token) → **backlog**; skeleton 1.5s shimmer and `0.01ms !important` reduced-motion override **accepted** |
| 5 | Status vs notification separation (decision 0003) | **Clean** at component level — status tokens only in status UI, notification scales only in alert/notification UI. (Token-definition aliases like `--status-settled: var(--success-500)` are the sanctioned bridge, not contamination.) |
| 6 | Commodity OKLCH identity across three surfaces | **Clean** — 421 literal oklch values in the HTML (88 commodity + 333 other) all match theme.css; theme.css ↔ index.css identity proven by the parity script (0 drift) |

- Lint: 53 warnings → 49, 0 errors. Fixed four unused imports:
  `StatusBadge` at `dashboard.tsx:8` (the `type Status` import on the same
  line is used and stays) — commit `b83ba31`; plus `ChevronRight`
  (`nav-patterns.tsx:7`), `AvatarImage` (`gallery-data.tsx:17`), and `Info`
  (`form-elements.tsx:15`) — ship-check commit, found via adversarial
  review. Zero `no-unused-vars` warnings remain; all 49 remaining are
  fast-refresh/other classes. The named one, `tabsListVariants` fast-refresh
  (`tabs.tsx:142`), needs an export-location decision → **backlog**.
- Evidence: `gates/conventions.txt`, `gates/lint-before.txt` (53) /
  `gates/lint-after.txt` (49), `fixes/02-unused-statusbadge-import/`,
  `fixes/06-unused-chevronright-import/`, `fixes/07-unused-avatarimage-import/`,
  `fixes/08-unused-info-import/`.

### 3 · A11y gates + mobile/visual — clean (1 accepted exception)

- **Contrast:** 70 pairs checked, 0 below AA 4.5:1, 0 below AA 3:1 — all
  StatusBadge permutations pass, light + dark (`gates/contrast.txt`).
- **Mobile audit (390px):** 6 URLs — static preview, portal `/`, `/dashboard`,
  `/pricing`, `/forms`, `/tables`. All 0 overflow / 0 clipped / 0 small fonts /
  0 small hit areas **except** `/forms`: the switch rail (h=18px) trips the
  16px-text and 44px-hit-area heuristics — the documented by-design
  switch/compact-input exception (kernel-verify skill), **accepted**
  (`gates/mobile.txt`).
- **Screenshots:** 8 PNGs — both surfaces × light/dark × 1440px/390px —
  spot-checked for correct theme and clean rendering (`screenshots/`).
- **A11y backlog #3 status** (assessed, not executed — out of audit scope):
  part 1 (contrast audit + report) done 2026-07-03; part 2 (role-token fixes)
  done 2026-07-04; **part 3 not started** — focus states, keyboard nav in
  interactive patterns, preview-CSS pairing pass, and per-component reviews
  (the `component-meta.ts` a11y column is still `pending` on all 68 entries).

### 4 · Build health — green (1 baseline warning)

- `npx tsc -b` clean; `npm run build` succeeds (index.html 0.62 kB, CSS
  189.71 kB, JS 1,862.13 kB); `npm run lint` 0 errors. Matches CI
  (`.github/workflows/ci.yml`: npm ci → tsc → build → lint).
- The JS chunk exceeds Vite's 500 kB warning threshold at **1,862 kB** —
  pre-existing; code-splitting is out of audit scope → **backlog**.
- Evidence: `gates/tsc.txt`, `gates/build.txt`, `gates/lint-after.txt`.

### 5 · Docs freshness — 3 fixed, 2 gaps reported

All in commit `019b253`; transcripts in `gates/docs-freshness.txt`.

- `docs/STATE.md` `Last touched` header said 2026-07-05; file last changed
  2026-07-09 — **fixed** to 2026-07-10 (`fixes/03-state-last-touched/`).
- STATE's lifecycle-status sentence still described the pre-promotion world
  ("the five delta-flagged components + contract-detail") — **fixed** to
  ready 57 / experimental 11 with the accurate list, matching
  `component-meta.ts` (`fixes/04-state-experimental-list/`).
- Decision 0016's status line still said `accepted` although 0017 supersedes
  it — **fixed** to `superseded by 0017` per the explicit rule in
  `docs/README.md` (status line only; body immutable)
  (`fixes/05-decision-0016-superseded/`).
- Decision numbering 0001–0021 contiguous; other supersede links resolve.
  Minor note: decisions 0019–0021 use a `**Status:** accepted · date` header
  format vs 0001–0018's `Date: … · Status: …` — cosmetic drift, report-only.
- **Worklog coverage:** `git log --oneline --since="2026-07-03"` → 34
  pre-audit commits. Two have no worklog entry — `8545649` (tabs pill:
  tighter padding, roomier container, subtle outline) and `bdd3b1d`
  (overview lead: reframe scope to merchants/origination) → **backlog**
  (backfilling is not mechanical). Coverage bound: `--since` filters by
  commit date, so commits authored before 2026-07-03 escape this check —
  they are the 07-03 sync audit's scope, not this one's.
- STATE "In flight" and backlog items verified accurate against the worklog
  and repo.

### 6 · Environment/skills + untracked artifacts — report-only

- `.agents/skills/kernel-verify/SKILL.md` (in-repo) hardcodes
  Linux-sandbox paths (`/opt/...`, lines 30–31/47–48) that don't exist on
  this Windows machine, and its dark-mode recipe (line 49) uses a
  `vite-ui-theme` storageKey that doesn't match the portal's actual
  next-themes setup (`kernel-portal/src/main.tsx` passes no `storageKey`,
  so the default `theme` key applies) → **backlog**. Evidence:
  `gates/skill-drift.txt`.
- `.agents/skills/kernel-ship/SKILL.md` encodes environment-specific rules
  (working-branch name, sandbox-proxy notes, commit trailers) that have
  drifted from the current environment → **backlog** (review pass).
  Evidence: `gates/skill-drift.txt`.
- **Untracked local artifacts** (inventoried, untouched per user decision):

| Path | Kind | Size | Apparent purpose |
|---|---|---|---|
| `.ds-sync/` | dir, 545 files | ~71.2 MB | design-sync tooling workspace (lib, node_modules, storybook, package-build/capture scripts) |
| `ds-bundle/` | dir, 314 files | ~7.1 MB | exported DS bundle (components, guidelines, tokens, previews, screenshots, vendor) |
| `design-sync-batch1.txt` | file | 161 B | batch note for the design-sync effort |
| `kernel-portal/.ds-cards/` | dir, 14 files | ~237 KB | generated DS cards (components, foundations, patterns) |

## Findings table

| # | Finding | Class | Disposition | Evidence |
|---|---|---|---|---|
| 1 | `--shadow-color` missing from index.css `.dark` | mechanical | fixed | `a3e4931`, `fixes/01-shadow-color-dark-block/` |
| 2 | Unused `StatusBadge` import, `dashboard.tsx:8` | mechanical | fixed | `b83ba31`, `fixes/02-unused-statusbadge-import/` |
| 3 | STATE `Last touched` stale (07-05 → 07-10) | mechanical | fixed | `019b253`, `fixes/03-state-last-touched/` |
| 4 | STATE experimental list stale (pre-promotion) | mechanical | fixed | `019b253`, `fixes/04-state-experimental-list/` |
| 5 | Decision 0016 status line not marked superseded | mechanical | fixed | `019b253`, `fixes/05-decision-0016-superseded/` |
| 6 | 5 index.css-only literal shadow primitives | — | accepted (shadcn bridge inputs) | `gates/token-parity.txt` |
| 7 | `/forms` switch rail 390px heuristic hits | — | accepted (documented by-design exception) | `gates/mobile.txt` |
| 8 | JS chunk 1,862 kB (>500 kB warning) | non-trivial | backlog | `gates/build.txt` |
| 9 | `tabsListVariants` fast-refresh warning | non-trivial | backlog | `gates/lint-after.txt` |
| 10 | `filters.tsx:25` `h-[30px]` chip, no matching token | non-trivial | backlog | `gates/conventions.txt` |
| 11 | portal.css motion literals (~30) + `duration-[0.35s]` | non-trivial | backlog | `gates/conventions.txt` |
| 12 | 2 worklog gaps (`8545649`, `bdd3b1d`) | non-trivial | backlog | `gates/docs-freshness.txt` |
| 13 | kernel-verify skill: Linux paths + storageKey drift | non-trivial | backlog | `gates/skill-drift.txt` |
| 14 | kernel-ship skill: environment-rule drift | non-trivial | backlog | `gates/skill-drift.txt` |
| 15 | Untracked artifacts (4 entries, ~78 MB) | — | report-only (user decision) | report §6 |
| 16 | Decision header format drift (0019–0021) | — | report-only (cosmetic) | `gates/docs-freshness.txt` |
| 17 | A11y backlog #3 part 3 not started | — | status reported (separate tracked effort) | STATE backlog #3 |
| 18 | Unused `ChevronRight` import, `nav-patterns.tsx:7` | mechanical | fixed (ship-check commit) | `fixes/06-unused-chevronright-import/` |
| 19 | Unused `AvatarImage` import, `gallery-data.tsx:17` | mechanical | fixed (ship-check commit) | `fixes/07-unused-avatarimage-import/` |
| 20 | Unused `Info` import, `form-elements.tsx:15` | mechanical | fixed (ship-check commit) | `fixes/08-unused-info-import/` |

**Totals:** 8 mechanical (all fixed, red→green captured) · 7 non-trivial
(backlogged) · 5 accepted/report-only/status. Findings 18–20 were surfaced
by the Phase 6 adversarial review (18 directly; 19–20 by the follow-up
sweep it prompted).

## Backlog (feeds STATE)

1. **Bundle size:** code-split the portal (JS 1,862 kB single chunk).
2. **Motion migration:** sweep portal.css's ~30 raw duration literals onto the
   motion tokens; decide whether `navigation-menu.tsx`'s 350ms/custom-bezier
   vendored styling gets a token.
3. **Filter-chip height:** give `filters.tsx`'s 30px chip a home in the size
   system (or re-size to `--control-h-sm`).
4. **`tabsListVariants` export location** (fast-refresh warning).
5. **Worklog backfill:** entries for `8545649` and `bdd3b1d`.
6. **Skills refresh:** kernel-verify (Linux paths, theme storageKey) and
   kernel-ship (environment rules) need a portability pass.
7. **A11y part 3** (already tracked as backlog #3): focus states, keyboard
   nav, preview-CSS pairing, per-component reviews.
