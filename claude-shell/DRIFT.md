# Claude-shell experiment — drift log

Goal: build a real product screen (claude.ai's project view) using only Kernel
parts, and record every place Kernel couldn't do it. Decision 0082.

## Reference values (claude.ai computed `--om-*`, 2026-10-01)

| Role | Dark | Light |
|---|---|---|
| bg-app (page) | `#1c1b19` ≈ L0.22 | `#faf9f5` |
| bg-panel | `#222220` ≈ L0.25 | `#f8f7f3` |
| bg-surface / elevated | `#2a2927` ≈ L0.285 | `#fff` |
| bg-muted | `#2e2c26` | `#f0eee6` |
| bg-active / selected | `#35332c` / `#3c392f` | `#e8e6dc` / `#e3dacc` |
| hover | fg 13% | ink 4% |
| borders subtle/default/card/strong | fg 10/12/14/24% | ink 8/10/12/22% |
| text primary/prose/secondary/disabled | fg 92/80/64/32% | same on ink |

Layout: shell 8px inset = 8px gap; sidebar 250px (resizable 250–768);
preview pane 40% min 180px; file rows 44px; section labels 10px/650/uppercase
/0.6px; radii 8px bubbles, 14px main card + composer.

## Fixed in Kernel (on this branch)

- Surface ladder, light + dark, measured (0082)
- Status roles info/success/warning/error (+foreground, +muted)
- Contrast: `--input` 3:1 both modes, dark `--destructive` 4.5:1
- Button `inverse` variant on the brand ramp (+ docs)
- Ghost hover visible in dark; control fills decoupled from `--input`
- Optical padding for narrow icons (chevrons); sm/lg icon-side padding
- `--shadow-panel`
- 8 MDI icons added to the shim
- Portal header: one control size, padding = (bar height − control) / 2

## Still faked in the screen (gaps)

1. **Composer** — hand-built card; Textarea stripped of its border/ring by overrides.
2. **Notice with actions** — hand-built; clips at the bottom.
3. **File tree row** — expand, indent, file-type icon, selected state.
4. **File-type color role** — stylesheet/script/HTML tints.
5. **Drop zone.**
6. **Reading/serif font role** — none in Kernel.
7. **Avatar brand tone** — `bg-secondary` class override on AvatarFallback.
8. **Page level behind panels** — `--background` does double duty.
9. **Pane layout roles** — shell inset/gap, nav pane, detail pane, reading width.

## Open

- Name the surface steps as roles and gate the steps.
- Check `/forms` and `/dashboard` in both modes.
- Screen is static: no real state wiring yet.
