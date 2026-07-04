# 0008 — Focus: UI pattern library; domain lineup capped at two worked examples

Date: 2026-07-03 · Status: accepted

## Context

The system serves a **merchant strategic pricing tool** for grain
merchants: a pricing area (bids, basis, contracts), an **origination**
experience (offers, producers), and a CRUD core throughout. The owner's
read on the domain patterns (contract detail, settlement statement): cool,
but nobody will consume them as components — they're examples of what the
system can do. What the product actually needs from the design system is
deeper **UI patterns**, Primer-style: each pattern a first-class rail
entry with guidance, especially flexible/extendable navigation and
advanced table filtering.

## Decision

1. **The domain lineup stops at two.** Contract detail and settlement
   statement stay, reframed as *worked examples* — reference compositions
   that prove the vocabulary, not components to adopt. Load ticket entry
   and basis & bid board are dropped from the backlog.
2. **UI patterns are the buildout focus.** Patterns get individual rail
   entries with maturity pills (the Primer model, extending decision
   0006). First two new patterns, driven by the product:
   - **Navigation** — module switcher for areas (pricing / origination /
     accounting), grouped rail with one level of nested destinations and
     live counts, record-level underline tabs with counts + overflow.
     Extension rule: growing the app means adding an entry or a group,
     never redesigning; nesting never exceeds group → item → child.
   - **Advanced filtering** — condition builder (field / operator / value
     joined with And, operators keyed to field type, live match count),
     column visibility controls (locked identity column), and date-range
     presets that speak the domain calendar (crop year). Chips (existing
     Filtering pattern) stay the default below ~3 conditions; saved views
     persist builder output.

## Consequences

- New patterns land experimental with notes, on both surfaces, like any
  component (decision 0006 lifecycle applies to patterns too).
- Future pattern candidates come from the product's needs (origination
  flows, pricing worksheets), not from a generic checklist.
- The domain examples remain useful as integration tests of the
  vocabulary — they are maintained, but nothing new is added to the group.
