# Tabs a11y review — 2026-07 (first per-component review)

Per-component accessibility review of **Tabs** (`kernel-portal/src/components/ui/tabs.tsx`,
Base UI `@base-ui/react/tabs` v1.6.0) — the first component to earn
`a11y: "reviewed"` in `component-meta.ts` (backlog #3, part 3 begins here).
Run against the **built** portal (`vite preview`, `/components/tabs`) with
Playwright DOM assertions, keyboard simulation, and screenshots; contrast
checked with the same oklch→sRGB / WCAG 2.x math as the 2026-07 contrast audit.

- **Reviewed at:** commit `82dc0ab` (automatic activation — `activateOnFocus`
  defaults `true`, decision 0023) on branch `feat/promote-tabs-ready`.
- **Tools (repeatable):** review harness + transcripts live with the promotion
  proof bundle (outside the repo): `a11y-review.mjs` → `gates/a11y-review.txt`,
  `tabs-contrast.mjs` → `gates/tabs-contrast.txt`,
  `scripts/mobile-audit.mjs http://localhost:4173/components/tabs` →
  `gates/mobile-tabs.txt`, focus screenshots → `screenshots/focus-*.png`.
- **Verdict: PASS — 0 unresolved failures.** 20 automated checks pass, 8
  contrast pairs pass AA, mobile audit clean, disabled-tab semantics verified
  in Base UI source.

## Summary table

| # | Check | Result | Evidence |
| - | --- | --- | --- |
| 1 | `role=tablist` on every list (6 on page) | PASS | a11y-review.txt §1 |
| 2 | `role=tab` on every trigger | PASS | a11y-review.txt §1 |
| 3 | `aria-selected`: exactly one `true` per tablist | PASS | a11y-review.txt §1 |
| 4 | `aria-orientation` horizontal (or omitted-as-default) | PASS | a11y-review.txt §1 |
| 5 | `role=tabpanel` + `aria-labelledby`↔`aria-controls` wiring, 6/6 | PASS | a11y-review.txt §1 |
| 6 | ArrowRight/ArrowLeft move focus **and activate** (automatic) | PASS | a11y-review.txt §2 |
| 7 | Home/End jump **and activate** | PASS | a11y-review.txt §2 |
| 8 | Focus loops at both ends (`loopFocus` default) | PASS | a11y-review.txt §2 |
| 9 | Enter/Space activation (manual-mode path) | PASS | Phase-1 `red.txt` — the pre-change default-`false` run exercises the exact `activateOnFocus={false}` code path |
| 10 | Disabled tabs: focusable-but-inert, never activated | PASS (source-verified) | see below |
| 11 | Focus-visible ring renders, 3 variants × light + dark | PASS | a11y-review.txt §3 + `screenshots/focus-{pill,underline,folder}-{light,dark}.png` |
| 12 | Contrast: 4 rendered token pairs × both modes ≥ AA 4.5:1 | PASS (8/8) | tabs-contrast.txt |
| 13 | `TabDot` not color-only: `aria-hidden` + paired with visible text | PASS (5/5 instances) | a11y-review.txt §4 |
| 14 | Mobile 390px: overflow/clipping/text-size/hit-area | PASS (0/0/0/0) | mobile-tabs.txt |

## Notes per area

### Activation semantics (decision 0023)

Arrows activate immediately (`activateOnFocus` defaults `true` in the wrapper,
overridable by prop) — shadcn/Radix parity, and the WAI-ARIA APG recommended
default for tabs whose panels render instantly (ours do: local content, no
fetch). The manual path stays reachable per instance via
`<TabsList activateOnFocus={false}>`.

### Disabled tabs (check 10)

Base UI does **not** skip disabled tabs — it makes them **focusable but
inert**, which is the APG-recommended pattern (disabled controls stay
discoverable to screen-reader and keyboard users). Verified in
`@base-ui/react@1.6.0` source, not DOM-testable on the built page (no disabled
exemplar in the gallery, and DOM-injected `disabled` can't reach Base UI's
React state):

- `tabs/tab/TabsTab.js:114` — `focusableWhenDisabled: true`
- `tabs/tab/TabsTab.js:102-107,120,133,136` — disabled tabs are never
  highlighted or activated, including under automatic activation
- `tabs/list/TabsList.js:118` — `disabledIndices: EMPTY_ARRAY` (navigation
  deliberately includes all tabs; the DOM `disabled` fallback in
  `floating-ui-react/utils/composite.js:390` is bypassed by design)

### Focus ring (check 11)

`focus-visible:ring-[3px] ring-ring/50` renders on keyboard focus in all three
variants, both modes — computed ring entry `0 0 0 3px` with `--ring` at 50 %.
One harness gotcha worth recording: the trigger has `transition-all` (0.15 s),
so the ring **fades in** — a computed-style read or screenshot taken at t=0
sees a zero-width transparent ring and false-fails. The harness settles 400 ms
before asserting. This is a measurement artifact, not a defect: the ring is
fully visible within ~150 ms of focus.

### Contrast (check 12)

The four pairs Tabs actually renders, light + dark (worst first):

| Pair | Light | Dark |
| --- | ---: | ---: |
| inactive `--muted-foreground` on `--muted` (pill container) | 4.59:1 | 4.50:1 |
| active pill `--primary-foreground` on `--primary` | 4.81:1 | 12.27:1 |
| inactive `--muted-foreground` on `--background` (underline/folder) | 5.14:1 | 7.45:1 |
| active `--foreground` on `--card` (underline/folder) | 17.50:1 | 17.50:1 |

Dark `muted-foreground on muted` at exactly 4.50:1 has zero headroom — any
future darkening of dark `--muted-foreground` or lightening of dark `--muted`
re-fails this pair. Flagged for the token layer, not a Tabs problem.

### Usage guidance

- **`TabDot` must never be the only signal.** It is `aria-hidden` decoration;
  always pair it with a visible `TabCount` or text (the gallery settle
  exemplar does: "Settlements 3 •"). A dot alone is invisible to assistive
  tech and fails WCAG 1.4.1 (use of color).
- **Vertical orientation** is prop-level support passed through to Base UI
  (`aria-orientation` verified as attribute wiring); there is no vertical
  exemplar in the portal, so it has not been visually reviewed. Re-review
  when the first vertical usage lands.
- The gallery wraps tab strips in `overflow-x-auto` at the usage site; no
  scroll-on-focus jank observed at 390px (mobile audit clean).
