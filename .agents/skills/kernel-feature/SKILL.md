---
name: kernel-feature
description: Add or change a component, form element, or UI pattern in the Kernel design system, keeping the static preview and the real shadcn portal mirrored and wiring the per-page route. Use for "add a component", "new pattern", "add a section to the rail", "build a <thing> demo", or any change to a portal .tsx that must also land in the preview.
user-invocable: true
---

# Kernel — add/change a component or pattern

Two mirrored surfaces. Every rail item is its own **page** (decision 0011):
portal = a React Router route; preview = a `.section` toggled by the
`portal.js` hash router. Never reintroduce a single-scroll page or scrollspy.

## Portal (real build — `kernel-portal/`)

1. **Component**: a shadcn wrapper in `src/components/ui/` (customize minimally; keep `data-slot`) or a portal section in `src/components/portal/*.tsx`. Reuse tokens — never hardcode a control height (use `h-(--control-h)`; decision 0010) or a raw color (`bg-primary`, `bg-commodity-corn-500`, not raw hex).
2. **Wire it as a route**:
   - A **section** (rail item): add a `<Route path="…" element={<XSection />}/>` in `src/main.tsx`, a rail entry in `src/components/portal/app-sidebar.tsx`, and its slug to `src/lib/routes.ts` (`sectionRoutes`). Reuse the old anchor id as the slug so `routeForAnchor()` keeps legacy `#hash` links working.
   - A **component** (one of the 49): add its cluster to the relevant `src/components/portal/gallery-{forms,data,overlays,nav,misc}.tsx` exported list — `galleryClusters` + both nav surfaces read from it; the `/components/:slug` page renders automatically. No separate page file.
3. **Lifecycle**: add/adjust the `src/lib/component-meta.ts` entry (`experimental` until signed off; `note` says what's settling). New patterns start `experimental`.

## Preview (`Kernel Design System.html` + `portal.css`)

4. Add a `<section class="section" id="…">` inside `main.content .wrap`, reusing the same id as the portal slug. Add a `.nav-link` (with `data-section` + `data-title`) to the rail. The hash router shows one section at a time; no scrollspy.
5. Styles go in `portal.css`. Respect the mobile rules: explicit mobile grid column (`grid-cols-1 … sm:grid-cols-2`), `min-width:0` on grid children, atomic-width rows + tables get `overflow-x-auto`, 16px input floor on phones, coarse-pointer touch growth via the `@media (pointer: coarse)` block.
6. **Carve-out (decision 0012):** a feature that can't exist statically — a third-party React package like `border-beam` — is **portal-only**. Mark it "portal-only" in its `component-meta` note + STATE; don't fake a CSS knockoff.

## Keep example copy in-domain

Grain-buying merchant platform: loads, contracts, farms, bushels, basis, settlement, offers/producers. No lorem, no generic SaaS.

## Finish

`/kernel-verify` then `/kernel-ship`. If the change is a shaping decision (a new convention, dependency, or architecture), add an immutable `docs/decisions/NNNN-*.md` as part of shipping.
