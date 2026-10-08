# v2 patches to retire

v2 should be built from plain Kernel parts. Each row is a local workaround; remove it once its fix lands in Kernel or the map kit.

## Move into Kernel

| # | v2 patch | Kernel fix | Status |
|---|---|---|---|
| 1 | Segmented toggle CSS | `ToggleGroup variant="segmented"` | done (Kernel uncommitted) |
| 2 | Row hover tint | `Item` link hover uses `bg-foreground/5` | done (Kernel uncommitted) |
| 3 | Calendar today marker invisible in dark | `Calendar` today uses `bg-foreground/8` | done (Kernel uncommitted) |
| 4 | Hand-written all-caps labels | `text-overline` utility; portal `typeStyles.overline` uses it | done (Kernel uncommitted) |
| 5 | Pricing label weight 400 (`index.css`) | Decide: regular-weight `Label` everywhere, or delete | done (Kernel) |
| 6 | 1px field text nudge (`index.css`) | Decide: apply in `Input`/`Select`, or delete | done (Kernel) |
| 7 | `--om-float` + dark field fill | `--floating` token / `bg-floating` + `data-surface="floating"` field rule | done (Kernel uncommitted) |
| 10 | Root `color-scheme` rule | Kernel `:root` / `.dark` | done (Kernel uncommitted) |
| 11 | One-line scenario header (hand-built) | `compact` size on `PageHeader` | open |
| 12 | `Flag` glyph | Added to Kernel icon shim | done (Kernel uncommitted) |

## Move into the map kit

| # | v2 patch | Fix | Status |
|---|---|---|---|
| 8 | `--om-water`, `--om-roads` (`index.css`), ground (`map/kit/theme.ts`) | One map palette in `map/kit/theme.ts` from named steps | open |

## Delete after the above

| # | v2 patch | Why |
|---|---|---|
| 9 | `#bid-date` field styling (`index.css`) | Kernel Date Picker trigger should look like a field |
