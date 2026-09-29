# Idea export — semantic geometry roles

Scope: one concept, **semantic geometry**, which the receiving repo does not have yet. This is a prose description of the idea and its reasoning, not code to copy. Every section ends with the source files it came from, so a reader of the origin repo can check the claims.

---

## 1. The idea in one line

**4px controls, 8px surfaces, square connected seams. Larger radii only for explicitly named roles.**

Each component picks corner geometry by its *role*, meaning what kind of thing it is. It does not pick by its size, and it does not inherit one global "softness" value.

Sources: `docs/decisions/0071-internal-tool-connected-geometry.md`, `docs/decisions/0072-semantic-geometry-levers.md`, `docs/decisions/0074-unified-non-control-geometry.md`

## 2. The problem it solved

- The system used to have **one base radius (14px)** that ran through cards, inputs, popovers and buttons. It was a single softness dial.
- In dense internal-tool layouts, where a navigator, canvas, dock and toolbar sit side by side, every region became its own soft rounded card. The screen read as a pile of padded cushions instead of **one work tool**.
- Buttons at the same radius as their container fought with the container's edge for attention.
- A single inherited radius can't tune compact controls, floating menus and blocking dialogs separately. Components compensated with their own local radius caps per size, which made small controls inconsistent.
- An older rule computed inner radius as "outer radius minus inset" (concentric corners). That tied corner shape to spacing, and it's retired.

The study that settled it compared Buttons at 4, 6, 8 and 12px sitting 12px in from identical 8px surface corners. At 4px the control stayed clearly clickable without competing with the surface's perimeter. A connected shell with square inner seams read as one surface.

Sources: `docs/decisions/0071-internal-tool-connected-geometry.md`, `docs/decisions/0072-semantic-geometry-levers.md`

## 3. The roles

| Role | Value | What uses it |
|---|---|---|
| **control** | 4px | Anything interactive and compact: buttons (every size and icon variant), inputs, textareas, select triggers, toggles, toggle groups, button groups |
| **surface** | 8px | The exposed outer edge of work surfaces: panels, tables, tiles, alerts, standalone content containers |
| **floating** | 8px | Non-blocking layers: menus, popovers, tooltips, command palettes |
| **modal** | 8px | Blocking dialogs and overlays |
| **seam** | 0px | Boundaries *between* connected regions inside one shell |
| **full / capsule** | fully round | Only for objects that are pill-shaped by meaning, such as status badges and avatars. Never used as a style choice. |

Key reasoning:

- **Only two numbers, but four names.** Surface, floating and modal all resolve to 8px, yet stay separate tokens. Each component names the role that matches its *behaviour*, so a family can diverge later through one decision, without reclassifying every consumer.
- **The modal radius was 12px and was pulled down to 8px.** Next to the other roles, the extra rounding added no useful hierarchy and brought back the soft look the work was removing. A modal's importance should come from placement, backdrop, elevation and the fact that it blocks, not from rounder corners.
- **Controls sit below surfaces.** A smaller radius on the control keeps it reading as "a thing inside the surface".
- **No radius per size.** Size variants don't bring their own radius unless there's an explicit semantic reason.

Sources: `docs/decisions/0072-semantic-geometry-levers.md`, `docs/decisions/0074-unified-non-control-geometry.md`, `packages/ui/src/styles.css`

## 4. Control heights (the companion lever)

Height is a role-level token too, not a per-component number:

| Token | Pointer: fine | Pointer: coarse (touch) |
|---|---|---|
| control height, small | 32px (compact toolbars, dense rows) | 40px |
| control height, default | 38px (resting default) | 44px |
| control height, large | 44px (hero actions) | 48px |

- On touch devices, the tokens themselves grow. Components don't branch.
- When a compact control is still under 44px, it gets an invisible hit-area extension, so it keeps its look while staying reachable.
- Radius role plus height token together describe a control's geometry. Components don't hardcode either one.

Sources: `packages/ui/src/styles.css` (control metrics block and coarse-pointer block; decisions 0007 and 0010 in the origin repo)

## 5. Connected composition: shells, groups, regions, seams

This is the structural half of the idea. The radius values alone don't produce the "one tool" look; *ownership* does.

- **Surface shell:** the one container that owns the exposed perimeter. That means its role radius, border, clipping, and any cast shadow.
- **Group:** arranges connected regions horizontally or vertically and provides the shared divider lines between them.
- **Region:** square by definition. The navigator, canvas, dock and toolbar inside a shell never add their own corner radius and never redraw the shell's edge.
- **Nested raised furniture** (a tile inside a panel): a fill one step off its parent, plus an optional top highlight, and **no** extra cast shadow.
- The rule for new components: before choosing geometry or elevation, **state whether the thing is a shell, a connected region, or nested raised furniture.** The role follows from that.
- **Vocabulary change:** an earlier "plate" model bundled fill, edge, lip, shadow and radius into one recipe. It was replaced by *surface shell* plus *elevation treatment*, because those concerns are now chosen independently. The old term stays only in historical records.
- The page's main content area is itself a surface shell with a real border, so its header must not add an inner corner radius.

Sources: `docs/decisions/0071-internal-tool-connected-geometry.md`, `docs/decisions/0075-surface-shell-and-elevation-treatment-language.md`, `packages/ui/src/components/ui/panels.tsx`

## 6. Naming and tokens: migrating without a big-bang rewrite

- The role tokens are the canonical interface: control, surface, floating and modal radius, plus the control-height scale.
- **Compatibility aliases:** the generic size-named radius steps (small, medium, large, extra-large) that utility classes already used were re-pointed to roles:
  - small → control
  - medium → control
  - large → surface
  - extra-large → modal
- Why: an inventory found **about 210 generic radius usages across 47 files**, mostly hand-rolled card containers. Rewriting them all in one mechanical pass would have assigned roles without looking at each component's anatomy. Leaving them on the old ramp would have kept known drift. The aliases make every existing usage follow the role levers **immediately**, and the explicit migration can then happen family by family.
- Aliased usages count as *accounted compatibility consumers*, not unexplained hardcodes. New components must name a role directly instead of relying on an alias.
- **Floating has no alias**, because no generic size step uniquely means "floating layer". Floating components must adopt the floating role explicitly.
- The old 14px base radius still exists only as a **temporary fallback** for components nobody has reviewed yet. Its presence is not an endorsement.
- Spacing sits on a 4px grid (decision 0064 in the origin repo). Insets are spacing decisions and are never inputs to radius arithmetic.

Sources: `docs/decisions/0073-semantic-geometry-compatibility-aliases.md`, `docs/decisions/0072-semantic-geometry-levers.md`, `packages/ui/src/styles.css`

## 7. Enforcement: the gate

A small deterministic script runs as a verification gate. In prose, it:

1. Fails if any role token has drifted from its canonical value (control 4px; surface, floating and modal 8px).
2. Fails if any compatibility alias stops pointing at its role.
3. Fails if the shared demo/content container stops using the surface role explicitly.
4. Fails if the page shell header adds an inner corner radius, which would break the square-seam rule.
5. On success, prints a one-line OK with the current **inventory**: how many generic small/medium/large/extra-large/full usages remain, and how many explicit role usages exist. The inventory is how migration progress is tracked. The number of explicit role usages should rise over time.

A separate style-fidelity gate bans ad-hoc radius hardcodes (arbitrary values and the extra-large sizes), with a small allowlist for deliberate one-offs.

The origin repo's convention for any gate: exit non-zero on violation, print one OK line on success, and prove it red then green (inject a violation, see it fail, revert, see it pass).

Sources: `kernel-portal/scripts/check-geometry-roles.mjs`, `kernel-portal/scripts/AGENTS.md`

## 8. The review surface: a Geometry foundation page

- The docs site has a dedicated **Geometry** page. It lists each role, what uses it, and live sliders that override the *same* variables the component package reads. Moving a slider re-renders real components.
- It shows a connected-composition demo (a shell rounded once, with square inner seams) and marks the legacy radius as a temporary fallback.
- Geometry changes get reviewed on this page first. Radius documentation was moved off the Spacing page, so there's one place for corners.

Sources: `kernel-portal/src/components/portal/geometry-foundation.tsx`, `docs/decisions/0072-semantic-geometry-levers.md`, `docs/decisions/0073-semantic-geometry-compatibility-aliases.md`

## 9. How migration went, and what's left

- **Wave 1:** Button, all sizes and icon variants, moved to control. Panel shells moved to surface, and inner regions were made square.
- **Wave 2:** Input, Textarea, Select trigger, Native Select, Toggle, Toggle Group and Button Group were assigned control. Select's popup was assigned floating.
- **Then:** the aliases, so all remaining generic usages follow the levers. After that, the modal was unified down to 8px.
- **Still open:**
  - Some control families still reference the legacy ramp in places: Select, Native Select, Toggle, Toggle Group.
  - Floating layers (menus, popovers, tooltips) need explicit family-by-family adoption of floating.
  - Many portal content containers are still hand-rolled "rounded card with border" recipes instead of a shared surface component.
  - The current inventory is roughly 21 small, 79 medium, 93 large, 0 extra-large, 33 full and 11 explicit. So most usages are still going through aliases.
- **Design-tool mirror:** design-tool variables should use the same role names and values, synchronized one reviewed slice at a time. (The origin repo's design-tool migration was abandoned as too heavy. The *variable naming* is the part worth keeping.)

Sources: `docs/decisions/0071-internal-tool-connected-geometry.md`, `docs/decisions/0072-semantic-geometry-levers.md`, `docs/decisions/0073-semantic-geometry-compatibility-aliases.md`, `docs/decisions/0074-unified-non-control-geometry.md`, `docs/STATE.md`, `kernel-portal/scripts/check-geometry-roles.mjs`

## 10. Open questions for the receiving repo

- **Full/capsule policy:** exactly which objects count as "semantically pill-shaped"? This is not formally closed.
- **When may surface, floating and modal diverge again?** Each would need its own decision. What evidence should that require?
- **When to retire the aliases and the legacy base radius:** probably once the inventory of explicit role usages dominates and a gate can reject new generic usages without a big allowlist.
- **Classifying edge cases:** is a card inside a scrolling list a surface or nested raised furniture? The "state shell / region / furniture first" rule helps, but borderline components will need a call.
- **Density:** should dense data views get their own control-height preset, or stay on the small token?

Sources: `docs/decisions/0072-semantic-geometry-levers.md`, `docs/decisions/0074-unified-non-control-geometry.md`, `docs/decisions/0075-surface-shell-and-elevation-treatment-language.md`

---

## Suggested adoption order

1. Add the four role tokens and the control-height scale.
2. Re-point the generic radius steps to roles (the aliases), so nothing breaks and everything follows the levers at once.
3. Add the gate (values, aliases, inventory report).
4. Build a shell/group/region trio, with square seams and a single perimeter owner.
5. Add a Geometry review page with live levers.
6. Migrate families by role: controls, then surfaces, then floating layers. Record each one as a decision.

## Provenance

The concept, role names, values, reasoning and gate are original to the origin repo. The generic size-step names being aliased are standard utility-class names from Tailwind CSS. Only the names are referenced here. **PROVENANCE: UNSURE** applies only to the general practice of concentric corner radii mentioned in section 2, which is common design folklore rather than something from this repo.

## Excluded

- **Code:** no source is copied. File paths are listed only so the ideas can be traced back.
- **Everything else in the origin repo** (catalog, lifecycle tooling, decision process, design-tool integration): left out on purpose, because the receiving repo already has the pre-geometry snapshot.
- **Product, employer and personal details, design-tool file or node identifiers, hosting identifiers, keys and secrets:** none included.
- **Colour, elevation values and typography:** mentioned only where they touch geometry (elevation treatment in section 5).
