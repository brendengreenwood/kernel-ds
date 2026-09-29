# 0072 — Semantic geometry levers

Date: 2026-09-26

Status: accepted

Extends: 0071 (internal-tool connected geometry)

## Context

Decision 0071 separated controls, exposed work surfaces, and connected seams. That resolved the first Button and panel slice, but most primitives still inherited the legacy `--radius` ramp. A single inherited radius cannot independently tune compact controls, floating menus, and blocking overlays, and component-local caps made small controls inconsistent.

The design system needs a small set of semantic levers that can be changed centrally and previewed before broad migration. Components must select a geometry role; they must not infer their role from size or silently fall back to a generic softness scale forever.

## Decision

Kernel defines these canonical geometry roles:

- `--radius-control: 0.25rem` (4px) for interactive controls such as Button, Input, Textarea, Select triggers, Native Select, Toggle, Toggle Group, and Button Group furniture.
- `--radius-surface: 0.5rem` (8px) for exposed panel, table, tile, and standalone work-surface perimeters.
- `--radius-floating: 0.5rem` (8px) for menus, popovers, tooltips, command palettes, and other non-blocking floating layers.
- `--radius-modal: 0.75rem` (12px) for blocking dialogs and overlays.
- `0px` for seams between connected regions inside a shared shell.
- full/capsule geometry only for semantically pill-shaped objects such as statuses and avatars.

The legacy `--radius` ramp remains a temporary migration fallback for components that have not been reviewed and assigned a role. Its presence is not an endorsement for new primitives.

The portal exposes a dedicated `/geometry` foundation page. It documents the roles, provides live controls that override the same CSS variables consumed by `@kernel/ui`, and demonstrates connected composition. This page is the review surface for future geometry changes.

The first migration wave assigns the control role to Input, Textarea, Select trigger, Native Select, Toggle, Toggle Group, and Button Group. Select popup content uses the floating role. Other floating layers, surfaces, and modals are migrated family by family so each assignment is reviewed rather than mechanically replaced.

## Consequences

- Geometry can be tuned system-wide through named variables without forcing every layer to share one value.
- Size variants no longer introduce separate radius caps unless the component has an explicit semantic reason.
- Connected composition continues to round the shell once and keep internal seams square.
- Remaining `rounded-lg` and legacy-radius consumers are migration inventory, not the desired end state.
- Figma variables should mirror the same role names and values; component families are synchronized one reviewed slice at a time.
- Verification must prove both package behavior and the portal foundation page. A later enforcement gate may reject new generic radius utilities in canonical package primitives once the migration inventory is reduced enough to avoid a blanket allowlist.
