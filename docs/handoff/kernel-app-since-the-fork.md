# Handoff: what changed in Kernel since the Cargill fork

The Cargill copy forked around late August 2026. Kernel is a theme in the live
kernel-app, so token and status **names** are a contract. This page is the one
place that lists every name that was added, renamed, or removed since the fork,
in the order the work side should adopt them. It describes intent with
reference files; it is not code to paste.

Read this first, then the two detailed handoffs it points to.

## 1. Breaking changes — do these first

These are the only changes that can break a build or a screen. Search the
live app for each old name before merging any values.

### Status ledger (decision 0092)

`StatusBadge` now carries the three real domain lifecycles, 12 statuses:

| Lifecycle | Statuses, in order |
| --- | --- |
| Scenario | `draft` → `published` → `archived` |
| Producer bid | `pending` → `accepted` or `rejected` |
| Contract | `booked` → `in_transit` → `delivered` → `settled`; `cancelled` exits |
| Shared | `expired` |

- **Removed:** the `on_hold` status and the `--status-onhold` token. A dead
  record becomes `cancelled`; a bid awaiting action becomes `pending`.
- **Added:** `published` (`--status-published`, sky), `archived`
  (`--status-archived`, clay), `accepted` (`--status-accepted`, crop green).
- The live app's scenario statuses (`published | draft | archived` in
  `types/scenario.ts`) now map one-to-one. Delete any local mapping that
  borrowed another status and overrode its label. The new Expired state for
  a scenario whose time of shipment has ended uses the shared `expired`.

### Neutral warm (decision 0087)

- **Renamed:** `--cream-*` → `--neutral-warm-*` (50 through 950), with
  `--color-neutral-warm-*` theme aliases.
- **Rule change:** neutral warm is for the map only. Interface surfaces use
  `--neutral-*`. Any app surface painted with a cream token moves to the
  matching neutral step, not to neutral warm.

## 2. Additions — safe to adopt in any order

Nothing here breaks existing screens. Diff the names, then merge values.

| Added | Kind | Decision |
| --- | --- | --- |
| `--floating` / `--color-floating` (`bg-floating`) | color token | 0085 |
| `data-surface="floating"` | attribute hook | 0085 |
| `text-overline` | utility | 0085 |
| `color-scheme` on `:root` / `.dark` | base rule | 0085 |
| `ToggleGroup` / `Toggle` `variant="segmented"` | component variant | 0085 |
| Regular-weight `Label`, field-text size | component default | 0086 |
| `--map-*` (13 tokens) + `--color-map-*` (`bg-map-*`) | map theme tokens | 0089 |
| `Flag`, `Map` | icons | 0085 / 0088 |
| Floating pane components (`PaneCanvas`, `FloatingPane`, `PaneStack`, `PanePill`, `PanePillBar`, `FilterDock`, `PaneCorner`) | components | 0083 |
| `--pane-inset`, `--pane-gap`, `--state-hover`, `--state-press`, `--duration-fast/base/slow`, `--ease-out` | layout and motion tokens | 0083 / 0084 |

One fix rides along: `CommandDialog` previously threw when opened, because its
title sat outside the dialog content. If the live app worked around that
locally, remove the workaround.

## 3. The two detailed handoffs

| Handoff | What it covers |
| --- | --- |
| `kernel-app-sidebar-migration.md` | Moving the side nav to the Kernel Sidebar: 48px tiles, 24px icons, collapse behavior |
| `kernel-app-map-theme.md` | Adopting `--map-*` on CARTO Voyager through one binding file |

## 4. Suggested order

1. Search the live app for `on_hold`, `--status-onhold`, and `--cream-`.
   Record every hit before changing anything.
2. Apply the status ledger. Replace borrowed statuses with the real ones.
3. Apply the neutral-warm rename and move interface surfaces to neutral.
4. Merge the additions table.
5. Run the sidebar migration handoff.
6. Run the map theme handoff.
7. Verify light and dark on a scenario list, a contract list, and the map.

## Not in scope

- The origination-map prototypes. The map stays a prototype (decision 0093);
  only its tokens, grammar, and catalog objects are canonical.
- Repository tooling (generated catalog, gate manifest, styles partials,
  decision 0094). None of it changes a name the live app reads.
- Inventing a status or hue the ledgers do not have. If the app needs one,
  stop and write a decision record here first.
