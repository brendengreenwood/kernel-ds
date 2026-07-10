# 0023 — Tabs: automatic activation on arrow focus

**Status:** accepted · 2026-07-10

## Decision

The Tabs component (`kernel-portal/src/components/ui/tabs.tsx`) activates tabs
**automatically** on arrow-key focus: `TabsList` defaults Base UI's
`activateOnFocus` prop to `true`, so ArrowLeft/ArrowRight (and Up/Down when
vertical) select the newly focused tab immediately. The prop stays overridable —
a call site can pass `activateOnFocus={false}` to get manual activation
(arrows move focus; Enter/Space activates) when a panel is expensive to render.

**Scope: Tabs only.** This does not create a blanket composite-focus convention.

## Why

- **shadcn/Radix parity.** Kernel's tabs are the shadcn recipe restyled; the
  shadcn/Radix default is automatic activation. Base UI flipped that default to
  manual (`activateOnFocus?: boolean` = `false`), and the delta was flagged as
  the promotion blocker in `component-meta.ts` ("Base UI delta pending
  sign-off") and in decision 0021's notes.
- **WAI-ARIA APG guidance.** Automatic activation is recommended for tabs whose
  panels render instantly. Every Kernel tab panel is local content — no fetch,
  no expensive mount — so automatic is the right default here.
- **Verified end-to-end.** Red/green Playwright transcripts on the built portal
  show the flip (manual before, automatic after), plus Home/End activation and
  focus loop-around. See `docs/a11y/tabs-review-2026-07.md` for the full
  keyboard matrix.

## Closes decision 0021's open item

Decision 0021 ("Tabs: variants, sizes, and anatomy") ends with:

> Base UI activation semantics (manual: arrows move focus, Enter/Space
> activates) are unchanged and still pending a11y sign-off.

This decision **is** that sign-off. The a11y review
(`docs/a11y/tabs-review-2026-07.md`, 20/20 checks pass) ratified automatic
activation as the default. 0021 itself is untouched (decision records are
immutable); everything else in 0021 — variants, sizes, anatomy, mobile
behavior — stands as written.

## Reconciliation with the menu-delta ratification (2026-07-09)

The menu promotion ratified those components' **Base UI defaults as intended**
(documented deltas, no code change). Tabs goes the other way — we override the
Base UI default to restore shadcn/Radix behavior — because tabs are a selection
control where arrow-follows-activation is the platform-familiar contract, while
the menus' documented behaviors have no equivalent user-facing expectation gap.
Menus keep their documented Base UI behaviors; nothing in this decision reopens
them.

## How it works

`TabsList` destructures `activateOnFocus = true` from its props and passes it
through to `TabsPrimitive.List`. The wrapper is typed
`TabsPrimitive.List.Props & VariantProps<…>`, so the override-by-prop contract
is inherent to the type — no new API surface.
