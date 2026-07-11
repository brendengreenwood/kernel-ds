# a11y review — batch 2: overlays & menus (2026-07-11)

Second batch of the per-component a11y review campaign (methodology: `tabs-review-2026-07.md`;
batch 1: `batch-1-form-controls-2026-07.md`). 13 components exercised against the served
production build (`vite preview`, port 4173) with Playwright/Chromium at 1280×900, plus
`mobile-audit.mjs` at 390px per route.

**Result: 12 reviewed, 1 backlogged (Drawer).** Harness: 58 pass / 1 fail.

Evidence: `kernel-ds-github-button-a11y-campaign.proof\gates\batch-2.txt` (transcript incl.
per-route mobile audits), `...\screenshots\batch-2\` (focus-ring screenshots, light+dark),
`...\fixes\b2-*` (red/green pairs), `...\gates\batch-2-red.txt` (pre-fix run).

## Where each component was exercised

| Component | Route (exemplar) |
|---|---|
| Dialog, Alert Dialog | `/components/dialog` |
| Sheet, Drawer | `/components/sheet` |
| Popover, Hover Card | `/components/popover` |
| Tooltip | `/components/sonner` (aliased anchor `c-sonner` — tooltip demo lives beside the toast demo) |
| Dropdown Menu, Context Menu | `/components/dropdown-menu` |
| Menubar, Navigation Menu | `/components/navigation-menu` |
| Command, Combobox | `/components/command` |

## Verdicts

Checks per the campaign checklist, scaled for overlays: roles/ARIA wiring, modality
(aria-modal **or** hidden background — see note), focus trap (modals), Escape close +
focus return, hover/focus open timing, focus-visible ring light+dark (exact `0 0 0 3px`
ring segment), touch targets at 390px. Contrast is covered by the global
`contrast-audit.mjs` (popover/menu surfaces use the already-audited
`popover`/`popover-foreground` and `muted` pairs; no new component-specific pairs).

| Component | Roles/ARIA | Modality | Focus trap | Escape + focus return | Keyboard/pointer | Ring (light/dark) | Touch 390px | Verdict |
|---|---|---|---|---|---|---|---|---|
| Dialog | PASS (role=dialog, labelledby+describedby resolve) | PASS (background aria-hidden) | PASS (Tab ×8 stays inside) | PASS | — | PASS/PASS | 0/0/0/0 | **reviewed** |
| Alert Dialog | PASS (role=alertdialog) | PASS | PASS | PASS; Cancel also closes + returns focus | — | PASS/PASS | 0/0/0/0 | **reviewed** |
| Sheet | PASS (role=dialog; close button has accessible name "Close") | PASS | PASS | PASS | — | PASS/PASS | 0/0/0/0 | **reviewed** |
| Drawer | PASS (role=dialog, labelled/described) | PASS (background aria-hidden) | **FAIL — Tab escapes to page content behind the open drawer** | PASS | — | PASS/PASS | 0/0/0/0 | **pending — backlogged** |
| Popover | PASS (aria-expanded flip + aria-haspopup) | n/a (non-modal) | n/a | PASS | opens on click | PASS/PASS | 0/0/0/0 | **reviewed** |
| Hover Card | PASS (trigger is a focusable button with text name) | n/a | n/a | closes on pointer-leave | opens on hover within delay budget | PASS/PASS | 0/0/0/0 | **reviewed** |
| Tooltip | PASS (trigger has own aria-label — fixed, see b2-04) | n/a | n/a | Escape dismisses | opens on keyboard focus | PASS/PASS | 0/0/0/0 | **reviewed** |
| Dropdown Menu | PASS (role=menu, menuitem children, aria-haspopup) | n/a | n/a | PASS (closes + returns focus) | ArrowDown moves through items | PASS/PASS | 0/0/0/0 | **reviewed** |
| Context Menu | PASS (right-click opens role=menu with menuitems) | n/a | n/a | PASS (Escape closes) | — | n/a (trigger is a non-focusable demo surface; see scope limits) | 0/0/0/0 | **reviewed** |
| Menubar | PASS (role=menubar, 3 triggers; open menu role=menu) | n/a | n/a | PASS | trigger opens on click | PASS/PASS (fixed, see b2-03) | 0/0/0/0 | **reviewed** |
| Navigation Menu | PASS (aria-expanded flip, content links) | n/a | n/a | PASS | opens on click (hover delay 50ms is documented behavior) | PASS/PASS | 0/0/0/0 | **reviewed** |
| Command | PASS (combobox/listbox/option roles, aria-controls resolves) | n/a | n/a | — | typing filters to 1 option; ArrowDown moves active option | n/a (input focus conveyed by cmdk selected-state; ring check not applicable to bare input-in-panel) | 0/0/0/0 | **reviewed** |
| Combobox | PASS (popover + command composition) | n/a | n/a | Enter closes popover | type-filter + Enter selects, trigger label updates | PASS/PASS | 0/0/0/0 | **reviewed** |

## Findings & fixes

1. **Modality technique (harness note, no component change).** Base UI dialogs do not set
   `aria-modal="true"`; they hide the background instead (`aria-hidden="true"` on the app
   wrapper while open) — the APG-sanctioned alternative. The first harness run flagged all
   four modal components on a wrong `aria-modal` assumption (`batch-2-red.txt`); the check
   was corrected to accept either technique. Vaul (Drawer) also hides the background.
2. **Menubar trigger had no focus-visible style** (`outline-hidden` with no ring class —
   keyboard focus was invisible). Mechanical fix: added `focus-visible:ring-3
   focus-visible:ring-ring/50` to `menubar.tsx` trigger, matching the navigation-menu
   trigger convention. Red/green: `fixes\b2-03-menubar-focus-ring\`.
3. **Tooltip icon trigger had no accessible name** — the icon-only button's only label was
   the tooltip itself (which is not a name, and only present while open). Mechanical fix:
   `aria-label="Add to library"` on the demo trigger in `gallery-overlays.tsx`. Red/green:
   `fixes\b2-04-tooltip-trigger-name\`.
4. **Drawer (vaul) does not trap keyboard focus — backlogged.** With the drawer open,
   focus stays on the trigger and Tab walks the page content behind the overlay
   (pager links) before reaching the drawer's Confirm button. Background is properly
   `aria-hidden` (screen-reader side is covered) and Escape/focus-return work, but the
   modal keyboard contract is broken for sighted keyboard users. Not mechanical
   (vaul behavior, likely interaction with React 19 / vaul's focus management) →
   STATE backlog; `a11y` stays `pending`.

## Disclosed scope limits

- **Context Menu ring:** the demo trigger is a non-focusable `<div>` (right-click target),
  so there is no focus-ring case to assert; menu items themselves are reviewed via the
  dropdown-menu primitives they share.
- **Command ring:** the cmdk input sits inside a bordered panel and conveys focus by the
  selected-option highlight; the exact-3px-ring assertion doesn't apply to it. Keyboard
  operability is covered by the filter/ArrowDown checks.
- Submenus (dropdown/context/menubar `*-sub-*` slots) have no exemplar in the gallery;
  reviewed only as far as the rendered demos go.
- Sonner (toast) itself is batch 3; only the Tooltip on this page was reviewed here.
- Hover Card open/close was verified with pointer + focusable-trigger checks; its
  content is supplementary (name + bio) and not keyboard-required content.
