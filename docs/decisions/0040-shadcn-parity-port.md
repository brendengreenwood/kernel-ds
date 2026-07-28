# 0040 — Salvaged shadcn primitives ported through the documentation pipeline

Date: 2026-07-28
Status: accepted

## Context

Thirteen component files were stranded on the salvage tag
`salvage/ds-shadcn-full-parity` (`fb0238b`, Jul 15 2026): the chat primitives
(`message`, `message-scroller`, `bubble`, `attachment`, `spinner`, `marker`,
plus a `direction` re-export), the form and layout primitives (`field`,
`button-group`, `item`, `empty`, `kbd`, `native-select`), and a Base UI
`combobox`.

That branch could not be merged. It forked 56 commits back, and its diff would
have regressed `main` in three separate ways:

- It deleted the thirteen `componentMeta` entries in the `"object"` group and
  narrowed the `group` union to drop `"object"` — undoing the object-model work.
- It replaced `typeStyles.overline` with hand-rolled `uppercase` + `tracking-`
  recipes in `components-index.tsx` and `gallery-nav.tsx`, which is exactly the
  drift `check-style-fidelity.mjs` (decision 0037) exists to catch.
- It rewrote unrelated gallery clusters, splitting combined cards in a way that
  had nothing to do with the new components.

It also assumed a documentation pipeline that no longer exists. On the salvage
branch a component was a source file plus a gallery entry. On `main` a component
is a source file, a `componentMeta` entry, a doc entity, a barrel registration,
and a gallery cluster with a live demo — and five gate scripts check that those
agree with each other and with the source.

## Decision

Salvage the source files only. Cherry-pick the fourteen `.tsx` files out of the
tag, adapt them to current conventions, and author everything else fresh against
`main`, running each component through the full pipeline.

Three consequences of "adapt them":

- **Radius.** `attachment.tsx`, `bubble.tsx`, and `empty.tsx` each shipped a
  `rounded-xl`. All three become `rounded-lg`. Note that
  `check-style-fidelity.mjs` does not scan `src/components/ui/` — these were
  fixed because the convention says so, not because a gate failed.
- **Control heights.** `native-select.tsx` hardcoded `h-8` / `h-7`, which would
  have made it 32px next to a 38px `Input` and `SelectTrigger`. It now reads
  `--control-h` / `--control-h-sm` like every other control.
- **Direction.** `direction.tsx` is a four-line re-export of Base UI's direction
  provider. It gets no `componentMeta` entry, no doc entity, and no gallery
  cluster — there is nothing to document and nothing to demo. It does get a
  ds-bundle prompt file, because the bundle enumerates `src/components/ui/*.tsx`
  rather than the doc entities; that file is a bare export map, which is the
  honest artifact for a re-export.

**Combobox is a migration, not an addition.** There was no `combobox.tsx` on
`main`. The doc entity described a Popover + Command composition, declared
`sourceFiles: ["command.tsx", "popover.tsx"]`, and shared Command's `c-command`
anchor — so `/components/combobox` resolved to nothing and the coverage gate
passed only because an entity file existed. The Base UI primitive replaces all
of that: a real source file, its own `c-combobox` anchor, a doc entity whose
anatomy and API are parity-checked against that source, and the first combobox
gallery cluster. The Command cluster drops the trailing "Combobox" from its
title, and its local demo function — also named `Combobox` — is renamed
`FrameworkPicker` now that the name means something else.

## Consequences

- 53 → 67 primitives, 69 → 81 doc entities, 81 → 93 `componentMeta` entries,
  26 → 39 gallery clusters, 53 → 67 ds-bundle prompt files.
- A tenth gallery group, `"AI & chat"`, in `groupOrder`. A cluster whose group
  isn't in that array renders nowhere, so the group is load-bearing, not
  cosmetic.
- One new dependency: `@shadcn/react`, pinned exact at `0.2.1`, used only by
  `message-scroller.tsx`.
- Lint warnings 56 → 76. All 20 new ones are `react/only-export-components`,
  the existing fast-refresh pattern: the new gallery file exports demos beside
  its cluster list, and `message-scroller`, `marker`, `button-group`,
  `combobox`, and `direction` co-locate a hook or a `cva` with their components,
  exactly as `button.tsx`, `form.tsx`, `sidebar.tsx`, and `carousel.tsx` already
  do. Zero errors throughout. The ceiling in `kernel-portal/AGENTS.md` moves to
  76 with a breakdown, so the next climb is still visible.

## Notes

Two things surfaced during the port that are recorded but not fixed here:

- `scripts/check-prose-quality.mjs` is a zero-byte file. It has been in the gate
  list and in CI since PR #69 and has never checked anything. The prose bar for
  these twelve entities was held by hand.
- The anatomy block in `lib/component-docs/schema.ts` is `z.array(z.string())`.
  `lib/AGENTS.md` advertises that anatomy slots accept the enriched
  `{ name, description }` form the way variant keys do; they do not. Slots here
  are plain strings.

`input-group.tsx` remains on `main` with no `componentMeta` entry, no doc
entity, and no cluster. Documenting it is separate work.
