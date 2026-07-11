# a11y review — batch 1: Form controls (2026-07-11)

13 components reviewed against the campaign checklist (roles/ARIA, keyboard matrix,
focus-visible ring light+dark, not-color-only, touch targets at 390px). Method: the
generalized Playwright harness (`review-runner.mjs` + `batch-1.config.mjs`, proof-side)
run against the served production build on `http://localhost:4173`. Full transcript:
proof `gates\batch-1.txt` (49 pass / 0 fail after one mechanical fix); ring screenshots:
proof `screenshots\batch-1\` (9 interactive controls × light+dark).

Contrast (AA) is covered globally by `scripts/contrast-audit.mjs` (70 pairs / 0 below AA,
re-verified at the campaign baseline); no batch-specific extra pairs were needed — all
form controls use the audited token pairs (`ring`, `primary`/`primary-foreground`,
`input`, `muted-foreground`).

## Where each component was exercised

Rows sharing an anchor were reviewed on the shared gallery page (named per row below).
`/forms` (Label `fe-anatomy`, Checkbox/Switch `fe-selection` anchors) was mobile-audited;
the richer interactive exemplars for those three live on `/components/input` and were
reviewed there.

## Verdicts

| Component | Exercised on | Roles/ARIA | Keyboard | Focus ring (L/D) | Not color-only | Touch 390px | Verdict |
|---|---|---|---|---|---|---|---|
| Button | /components/button | PASS — 12 native buttons, disabled attr real | n/a beyond focus (native button) | PASS/PASS (`button-ring-*.png`) | n/a | 0/0/0/0 | **reviewed** |
| Toggle | /components/toggle | PASS — `aria-pressed`, icon toggles have `aria-label` | PASS — Space flips `aria-pressed` | PASS/PASS (`toggle-ring-*.png`) | pressed state = bg fill + `aria-pressed` | 0/0/0/0 | **reviewed** |
| Toggle Group | /components/toggle | PASS — `role=group`, items expose `aria-pressed` | PASS — ArrowRight moves focus between items | PASS/PASS (`toggle-group-ring-*.png`) | same as Toggle | 0/0/0/0 | **reviewed** |
| Input | /components/input | PASS — explicit `for`/`id` label association | native text field | PASS/PASS (`input-ring-*.png`) | n/a | 0/0/0/0 | **reviewed** |
| Textarea | /components/input | PASS — explicit `for`/`id` label association | native text field | PASS/PASS (`textarea-ring-*.png`) | n/a | 0/0/0/0 | **reviewed** |
| Label | /components/input | PASS — 3 explicit `for`/`id` + 2 implicit wrap associations | n/a (static) | n/a | n/a | 0/0/0/0 | **reviewed** |
| Select | /components/input | PASS — trigger is `role=combobox` with `aria-expanded` | PASS — Enter opens listbox (3 options), Escape closes, focus returns to trigger | PASS/PASS (`select-ring-*.png`) | n/a | 0/0/0/0 | **reviewed** |
| Checkbox | /components/input | PASS — `role=checkbox` + `aria-checked` | PASS — Space flips `aria-checked` | PASS/PASS (`checkbox-ring-*.png`) | PASS — checked state renders check icon (shape) | 0/0/0/0 | **reviewed** |
| Switch | /components/input | PASS — `role=switch` + `aria-checked` | PASS — Space flips `aria-checked` | PASS/PASS (`switch-ring-*.png`) | PASS — thumb translates on state change (position + color) | 0/0/0/0 (rail h=18px accepted, decision 0007 pseudo-element extension) | **reviewed** |
| Radio Group | /components/radio-group | PASS — `radiogroup`/`radio` roles + `aria-checked` | PASS — ArrowDown moves focus **and** selection (roving tabindex) | PASS/PASS (`radio-ring-*.png`) | selected state renders indicator dot (shape) | 0/0/0/0 | **reviewed** |
| Slider | /components/slider | PASS — native `<input type=range>` (value/min/max real) | PASS — ArrowRight increments 64→65 | native range focus handled by thumb styling; keyboard op proven | value shown as adjacent text | 0/0/0/0 | **reviewed** |
| Input OTP | /components/slider | PASS — backed by real `<input>` with `autocomplete=one-time-code`, `inputmode=numeric` | PASS — typing fills slots | caret/slot highlight (library-managed) | n/a | 0/0/0/0 | **reviewed** |
| Form | /components/form | PASS — FormLabel `for`/`id`, description in `aria-describedby` | PASS — invalid submit sets `aria-invalid` + FormMessage joined into `aria-describedby` | via child controls (Input reviewed above) | error conveyed by text message, not color alone | 0/0/0/0 | **reviewed** |

## Mechanical fix (red/green in proof `fixes\01-icon-button-aria-label\`)

- **Icon-only Button exemplar had no accessible name** — `gallery-forms.tsx` `size="icon"`
  outline button contained only a `<Plus />` glyph. Red: `every button has accessible
  name — 1 unnamed of 12`. Fix: `aria-label="Add item"` on the exemplar. Green: 49/0.
  Demo-site fix only; the Button component itself was not changed.

## Disclosed scope limits

- Focus-ring verdicts assert a computed non-transparent `0 0 0 3px` ring segment after
  real keyboard focus (temp-element + Tab technique; script `.focus()` does not reliably
  enter Chromium's `:focus-visible` keyboard modality — harness lesson recorded).
- Slider/Input OTP focus styling is delegated to the native input/library caret and was
  not screenshot-asserted; keyboard operability was asserted instead.
- Screen-reader (AT) behavior was not tested — this review covers DOM semantics,
  keyboard operability, and visual affordances only.
- Touch-target evidence is `scripts/mobile-audit.mjs` per route (button, toggle, input,
  radio-group, slider, form, /forms — all 0 overflow / 0 clipped / 0 text<16px /
  0 hit<44px), appended to proof `gates\batch-1.txt`.
