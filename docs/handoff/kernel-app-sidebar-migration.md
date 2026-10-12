# Handoff: move the kernel-app side nav to shadcn Sidebar

Brief for the agent working in the Cargill copy of kernel-app. That copy forked from this repo around late August 2026 and has drifted, so treat everything here as **a description of intent with reference files**, not code to paste. Read the reference, then build it in your own codebase with your own Kernel parts.

## Goal

Replace the current side nav with Kernel's shadcn `Sidebar`, and bring over the shell and workspace rules worked out in the origination-map v2 prototype.

## Read first (in this repo)

| File | Why |
|---|---|
| `prototypes/origination-map-v2/src/components/shell.tsx` | Reference shell: the rail, nav items, footer, role filtering |
| `prototypes/origination-map-v2/src/index.css` | Light-mode sidebar colors (the `--sidebar*` overrides) |
| `prototypes/origination-map-v2/WORKSPACE-DESIGN-SYSTEM.md` | Workspace rules (navigator, header, Publish) |
| `prototypes/origination-map-v2/PRIORITY-AREAS.md` | Priority areas object and lifecycle |
| `prototypes/origination-map-v2/PATCHES.md` | What is still prototype-only and where it should land |
| `docs/decisions/0085-*.md`, `docs/decisions/0086-*.md` | Kernel changes made since your fork |
| `docs/STATE.md` → "Token surface added since the Cargill fork" | Token names to add on your side |

## 1. The shell

- Kernel `SidebarProvider` + `Sidebar variant="inset" collapsible="icon"`, `defaultOpen={false}`, `--sidebar-width-icon: 3rem`.
- **One tile style for both states**: 48px tile, 24px icon pinned 12px in. Collapsing only narrows the sidebar and fades the label; nothing reflows. See the `RAIL` class string in `shell.tsx`.
- Nav items are `SidebarMenuButton render={<NavLink/>}` with `isActive` and `tooltip` (the tooltip is the label when collapsed).
- **Home is the first item.** Nav order in the prototype: Home · Scenarios · Producers · …
- Footer, bottom up: theme toggle, collapse button, persona switcher. The persona switcher is a **prototype stand-in for signing in**. Don't ship it. In the real app the role comes from RBAC.
- **Items are filtered by role.** Each nav item can list the roles that see it (no list = everyone). A route the role can't use redirects to Home. Merchants and originators share one system; RBAC picks what loads.
- Mobile: a floating `SidebarTrigger` shows below `md`.

## 2. Sidebar colors (light mode)

The rail is dark in light mode too. Values from the prototype:

- `--sidebar: var(--brand-950)`, `--sidebar-foreground: var(--neutral-50)`
- `--sidebar-accent: color-mix(in oklch, var(--brand-950) 80%, var(--cream-300))`: the active tile is a lighter step of the rail, not a loud color
- `--sidebar-border: var(--neutral-500)`, `--sidebar-primary: var(--lime-300)`
- Active tile: border `--neutral-700`, no shadow. Menu labels are two steps lighter than icons.

Dark mode is unchanged. Check the computed colors against your theme. If your token **names** differ, stop and map them; don't guess. A missing token falls back silently (usually to transparent).

## 3. Kernel changes to pick up

From decisions 0085 and 0086. Add these if your copy doesn't have them:

- `--floating` / `bg-floating` plus `data-surface="floating"`: one surface for anything floating over content, with dark-mode field fill.
- `text-overline`: small all-caps panel titles.
- `ToggleGroup variant="segmented"`: **replaces kernel-app's local `[data-v2-segmented]` CSS** in `v2-layer.css` (the Overview range toggle). Delete the local copy.
- `color-scheme` set on `:root` / `.dark` (native date pickers and scrollbars follow the theme).
- `Label` is regular weight; `Input`/`Select` text sits 1px higher at the same height.
- `Item` hover and `Calendar` today use a foreground tint so they show on cards in dark mode.
- `Flag` icon in the icon shim.

Gotcha: a custom dark override of a Tailwind utility must sit in `@layer utilities`, or the compiled `dark:` utility wins.

## 4. Workspace rules (for the pages behind the nav)

From `WORKSPACE-DESIGN-SYSTEM.md`, short version:

1. Nothing goes out until **Publish**. Bid edits, priority and drawn areas are drafts until then.
2. One scenario in focus.
3. The navigator is a work list, not a menu. It stays usable when collapsed (calendar tiles).
4. The map is the ground; user-drawn things use a stroke style, never a new hue.
5. Numbers carry the weight, labels don't.
6. One floating surface.
7. Kernel parts only. A missing part goes into Kernel with a decision record, not a local patch.
8. Add things only when they're defined. Undefined content says "Not defined yet".

## 5. Suggested order

1. Inventory the current nav: items, routes, icons, any role logic.
2. Add the missing Kernel tokens and parts from section 3. Diff token **names** first.
3. Build the shell with `Sidebar` per section 1, then apply section 2's colors.
4. Swap the Overview range toggle to `variant="segmented"` and delete `[data-v2-segmented]`.
5. Verify: collapsed and expanded, light and dark, mobile trigger, keyboard focus on every tile, and active state on nested routes.

## Not in scope

- The v2 Home page is still being worked out. Don't port it.
- All prototype data is simulated. Bring over the patterns, not the data.
