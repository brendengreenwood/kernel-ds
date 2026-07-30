---
name: kernel-feature
description: Add or change a component, form element, or UI pattern in the Kernel design system, wiring the per-page route and component-meta. Use for "add a component", "new pattern", "add a section to the rail", "build a <thing> demo", or any change to a portal .tsx.
user-invocable: true
---

# Kernel — add/change a component or pattern

One surface: the portal (`kernel-portal/`; decision 0022). Every rail item is
its own **page** (decision 0011): a React Router route. Never reintroduce a
single-scroll page or scrollspy.

## Portal (real build — `kernel-portal/`)

1. **Component**: a shadcn wrapper in `src/components/ui/` (customize minimally; keep `data-slot`) or a portal section in `src/components/portal/*.tsx`. Reuse tokens — never hardcode a control height (use `h-(--control-h)`; decision 0010) or a raw color (`bg-primary`, `bg-commodity-corn-500`, not raw hex).
2. **Wire it as a route**:
   - A **section** (rail item): add a `<Route path="…" element={<XSection />}/>` in `src/main.tsx`, a rail entry in `src/components/portal/app-sidebar.tsx`, and its slug to `src/lib/routes.ts` (`sectionRoutes`). Reuse the old anchor id as the slug so `routeForAnchor()` keeps legacy `#hash` links working.
   - A **component** (one of the 49): add its cluster to the relevant `src/components/portal/gallery-{forms,data,overlays,nav,misc}.tsx` exported list — `galleryClusters` + both nav surfaces read from it; the `/components/:slug` page renders automatically. No separate page file.
3. **Lifecycle**: add/adjust the canonical entity in `packages/catalog/src/entities.ts` (`experimental` until signed off; `note` says what's settling), then run `npm run catalog:generate` from the repository root. Never edit `src/lib/component-meta.generated.ts` by hand. New patterns start `experimental`.

## Keep example copy in-domain

Grain-buying merchant platform: loads, contracts, farms, bushels, basis, settlement, offers/producers. No lorem, no generic SaaS.

## Finish

`/kernel-verify` then `/kernel-ship`. If the change is a shaping decision (a new convention, dependency, or architecture), add an immutable `docs/decisions/NNNN-*.md` as part of shipping.
