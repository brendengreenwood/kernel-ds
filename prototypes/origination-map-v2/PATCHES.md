# v2 patches to retire

v2 should be built from plain Kernel parts. Each row is a local workaround; remove it once its fix lands in Kernel or the map kit.

## Move into Kernel

| # | v2 patch | Kernel fix | Status |
|---|---|---|---|
| 1 | Segmented toggle CSS (`index.css`, copied from kernel-app `v2-layer.css`) | `segmented` style on `ToggleGroup`; kernel-app switches too | open |
| 2 | Row hover/selected `bg-foreground/5`, `/8` (`scenarios.tsx`) | `Item` uses a see-through tint, not `bg-muted` (invisible on dark cards) | open |
| 3 | Calendar today marker invisible in dark | Same tint fix in `Calendar` | open |
| 4 | Hand-written all-caps labels ("PRICING", legend titles) | Named all-caps small-label style | open |
| 5 | Pricing label weight 400 (`index.css`) | Decide: regular-weight `Label` everywhere, or delete | needs decision |
| 6 | 1px field text nudge (`index.css`) | Decide: apply in `Input`/`Select`, or delete | needs decision |
| 7 | `--om-float` + darker dark-mode field fill (`index.css`) | One Kernel floating-panel surface for dark, fields tuned to it | open |
| 10 | Root `color-scheme` rule (`index.css`) | Kernel base CSS | open |

## Move into the map kit

| # | v2 patch | Fix | Status |
|---|---|---|---|
| 8 | `--om-water`, `--om-roads` (`index.css`), ground (`map/kit/theme.ts`) | One map palette in `map/kit/theme.ts` from named steps | open |

## Delete after the above

| # | v2 patch | Why |
|---|---|---|
| 9 | `#bid-date` field styling (`index.css`) | Kernel Date Picker trigger should look like a field, or fold into #7 |
