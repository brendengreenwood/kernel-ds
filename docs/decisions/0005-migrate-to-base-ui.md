# 0005 — Migrate the portal from Radix UI to Base UI

Date: 2026-07-03 · Status: accepted (execution in progress)

## Context

The portal's 48 shadcn wrappers are built on Radix primitives (unified
`radix-ui` package, `radix-nova` registry style). shadcn's distribution is
moving to Base UI as its default, and now ships an official migration skill
(`npx skills add shadcn/ui` → `migrate-radix-to-base`) that migrates
progressively — golden-pair swaps against the registry for pristine
wrappers, three-way merges that preserve customizations, one component at a
time with the build green throughout. Our style (`radix-nova`) has an exact
`base-nova` registry counterpart, making this the cheapest moment the
project will ever have for the switch: one deployment, no downstream
consumers.

## Decision

Migrate `kernel-portal` to Base UI (`@base-ui/react`) using the vendored
`migrate-radix-to-base` skill (committed at `.agents/skills/`), whole-project
mode. Execution happens in a **local** Claude Code session — the remote
environment's network policy blocks `ui.shadcn.com`, which the skill's
golden-pair path requires.

The static preview is unaffected (pure HTML/CSS). Non-Radix wrappers
(cmdk/command, vaul/drawer, sonner, input-otp, react-day-picker/calendar,
recharts/chart) are intentionally untouched per the skill's hard rules.
Customized wrappers (`alert.tsx`, `badge.tsx`) must keep their Kernel
notification variants through the merge; `status-badge.tsx` has no
primitives and needs no migration.

## Consequences

- `components.json` style becomes `base-nova`; future `shadcn add` delivers
  Base variants consistent with the rest of the project.
- `radix-ui` is removed from dependencies once the last wrapper migrates.
- Migration reports land in `kernel-portal/.migration/` (one per component
  plus `project.md`) — review flagged behavior deltas there (tabs
  activation, menu close-on-click).
- Post-migration, rerun the portal verification loop: build, headless
  console check, and the 375/390px mobile overflow scan (CLAUDE.md
  conventions), since wrapper DOM shapes may shift.
