# Kernel — build conventions

Kernel is the design system of a grain-merchant platform (loads, contracts,
farms, bushels, basis, settlement). Components are shadcn-style wrappers over
**Base UI** (`@base-ui/react`), themed with Kernel tokens, compiled into this
bundle. React 19.

## Setup & wrapping
- No global provider is required — components render standalone.
- **Tooltip** needs `<TooltipProvider>` around the subtree. **Sidebar** needs
  `<SidebarProvider>`. Forms use react-hook-form via `Form`/`FormField`/
  `FormItem`/`FormLabel`/`FormControl`/`FormMessage`.
- **Toasts**: mount one `<Toaster />` and fire with `toast(...)` — both are
  exports of THIS library. Never import `toast` from anywhere else: a second
  sonner instance fires toasts the mounted Toaster never renders.
- **Charts**: compose `ChartContainer` (with a `config`) around recharts
  primitives exported from THIS library — `BarChart`, `Bar`, `AreaChart`,
  `Area`, `LineChart`, `Line`, `PieChart`, `Pie`, `XAxis`, `YAxis`,
  `CartesianGrid`, `Cell`, `ReferenceLine`, and `RechartsTooltip` /
  `RechartsLegend` (aliased; use `content={<ChartTooltipContent />}` /
  `content={<ChartLegendContent />}`). Set `isAnimationActive={false}` for
  static rendering. Series colors: `var(--color-<seriesKey>)` from the config.
- Dark mode: add class `dark` to a root element; every token remaps.

## Base UI composition rules (this is NOT Radix)
- Triggers compose via `render={<Button>Open</Button>}` — there is no
  `asChild` (exception: `DrawerTrigger` is vaul and uses `asChild`).
- Accordion/ToggleGroup values are ARRAYS: `defaultValue={["a"]}`; no
  `type=`/`collapsible` props.
- Menu labels need a group parent: `DropdownMenuGroup` wraps
  `DropdownMenuLabel` + items.
- Checkbox indeterminate is its own boolean prop.
- `Select` shows its value statically only with `items={{value: "Label"}}`
  on the root.

## Styling idiom
- Style YOUR layout glue with **inline styles using Kernel CSS variables** —
  do not invent utility class names (only classes already compiled into
  `styles.css` exist; unknown Tailwind classes silently do nothing).
- Token vocabulary (all defined in `styles.css`):
  - Role: `--background --foreground --card --card-foreground --muted
    --muted-foreground --primary --primary-foreground --secondary --accent
    --destructive --border --input --ring`
  - Scales (steps 50…950): `--brand-* --neutral-*`; notifications (50…900):
    `--success-* --warning-* --error-* --info-*`; charts/data:
    `--viz-crop-* --viz-wheat-* --viz-clay-* --viz-sky-* --viz-plum-*
    --viz-teal-* --viz-rust-* --viz-slate-*` (+`--chart-1…5`)
  - Domain statuses: `--status-draft --status-pending --status-booked
    --status-intransit --status-delivered --status-settled --status-onhold
    --status-rejected --status-cancelled --status-expired`
  - Type/shape: `--font-sans --font-mono --radius --control-h --control-h-sm
    --control-h-lg`
- **Doctrine — statuses vs notifications**: persistent lifecycle state uses
  `<StatusBadge status="settled" />` (10 states, one hue each); momentary
  event outcomes use `Badge`/`Alert` variants `success|warning|info|
  destructive`. Never mix the two.
- Numbers in tables/stats: `fontFamily: "var(--font-mono)",
  fontVariantNumeric: "tabular-nums"`, right-aligned.

## Where the truth lives
Read `styles.css` for the full token sheet before styling; each component's
`.d.ts` is its exact API and its `.prompt.md` shows verified compositions.

## Idiomatic example
```jsx
<Card style={{ maxWidth: 380 }}>
  <CardHeader>
    <CardTitle>Contract CTR-4471</CardTitle>
    <CardDescription>Hartmann Farms · Corn · Jun 2026</CardDescription>
  </CardHeader>
  <CardContent style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <StatusBadge status="in_transit" />
    <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>
      18,400 bu · $4.62/bu
    </span>
  </CardContent>
  <CardFooter style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
    <Button variant="outline" size="sm">Export</Button>
    <Button size="sm">Settle</Button>
  </CardFooter>
</Card>
```
