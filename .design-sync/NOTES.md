# design-sync notes — kernel-portal

Repo-specific facts a future sync needs. Config: `.design-sync/config.json`.

## Build shape
- kernel-portal is an APP, not a packaged library. The sync entry is the
  hand-made barrel `kernel-portal/src/ds-entry.ts` (RELATIVE imports only —
  `@/` aliases in emitted .d.ts don't resolve and discovery finds 0 components).
- Component discovery needs the declarations build: `npx tsc -p
  tsconfig.lib.json` emits `dist/types/` (62 files). `package.json#types`
  points at `dist/types/ds-entry.d.ts`. Full buildCmd is in config.
- `cfg.cssEntry` = `dist/kernel.css`, produced by `scripts/copy-css-entry.mjs`
  from the hashed Vite asset — it carries the full token sheet AND every
  compiled Tailwind utility the components use.
- The barrel exports 258 PascalCase symbols; cards are pruned to ~48 real
  components via `componentSrcMap` nulls (parts like DialogTrigger stay
  importable but get no card). New recharts re-exports are also nulled.
- Windows: write JSON/config with BOM-less UTF-8 ([System.IO.File] APIs, or
  the agent Write tool) — PowerShell's `-Encoding utf8` BOM breaks JSON.parse.

## Preview recipes (authored previews live in .design-sync/previews/)
- Overlays capture statically: `open`/`defaultOpen` on Base UI roots
  (NavigationMenu: root `defaultValue` + item `value`; Menubar: `open` on
  MenubarMenu; vaul Drawer alone uses `asChild` triggers). Content wrappers
  already ship Portal/Positioner — pass side/align to Content.
- Select needs `items={{value: "Label"}}` on the Root for the selected label
  to render statically.
- Sliders/Progress need a value AND a sized container or they render blank.
- Base UI value props are arrays (Accordion/ToggleGroup `defaultValue={[...]}`).
- Form error states: `React.useEffect(() => { void form.trigger() }, [form])`
  with invalid defaults renders FormMessage in a static capture.
- Sonner: toast() must come from the SAME sonner instance as <Toaster> —
  fixed by re-exporting `toast` from the barrel (see Fixes below). The
  Toaster preview anchors `position:absolute` inside a relative container so
  the viewport-fixed toast stays inside the cell.
- recharts: primitives re-exported from the barrel (single copy — see Fixes);
  recharts' Tooltip/Legend are aliased RechartsTooltip/RechartsLegend to
  avoid clashing with Kernel's Tooltip/Label. `isAnimationActive={false}` on
  series or captures freeze mid-animation. Plot basis as positive magnitudes
  (negative values flip the area baseline to the top).
- AspectRatio spreads props after its own style — an inline `style` on it
  must re-include `"--ratio"`.
- Carousel arrows sit 48px outside the track — pad the wrapper 56px.
- SidebarFooter clips at the card's bottom edge in the 900x520 viewport —
  leave it out of the preview.
- lucide-react, react-hook-form, zod resolve fine in previews from
  kernel-portal/node_modules.

## Fixes applied to the DS itself during sync
- `ds-entry.ts` re-exports `toast` from sonner (dual-instance trap otherwise)
  and 16 recharts primitives (BarChart, Bar, AreaChart, Area, LineChart,
  Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ReferenceLine,
  ResponsiveContainer, RechartsTooltip, RechartsLegend) so the design agent
  can actually build charts from window.Kernel with ChartContainer's context.

## Known render warns
- (none recorded yet — 2 pre-authoring RENDER_BLANKs on Progress/Slider were
  fixed by authored previews)

## Re-sync risks
- `dist/kernel.css` regenerates from the app build: hashed asset name changes
  every build; `scripts/copy-css-entry.mjs` must run after `npm run build`
  (it errors if it doesn't find exactly one css asset).
- The ChartContainer preview depends on the barrel's recharts re-exports; if
  those are ever removed, the preview silently renders 0x0 (dual-copy trap).
- Playwright version must pin the cached chromium build
  (%LOCALAPPDATA%\ms-playwright); `.ds-sync` installs its own playwright.
- The Toaster preview replicates the Kernel wrapper's classNames/vars inline;
  if `src/components/ui/sonner.tsx` styling changes, re-port the preview.
- Component pruning lives in `componentSrcMap` — a NEW export in ds-entry.ts
  will appear as a new card unless nulled there.
