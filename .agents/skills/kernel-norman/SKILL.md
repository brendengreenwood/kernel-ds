---
name: kernel-norman
description: Don Norman's product & interaction design principles (The Design of Everyday Things) — affordances, signifiers, mapping, feedback, constraints, conceptual/mental models, discoverability, the gulfs of execution and evaluation, and designing for error (slips vs mistakes). Use when designing or reviewing any flow, control, form, state, or error path for usability — "is this usable / discoverable / confusing", destructive actions, empty/loading/error states, validation, defaults. Applied to the Kernel grain-merchant product.
user-invocable: true
---

# Norman's principles — usable product design

Norman's test: can a user (1) figure out **what to do** and (2) tell **what
happened**? Everything below serves those two questions. Apply them to Kernel's
flows, forms, tables, statuses, modals — not just individual controls.

## The six fundamentals

1. **Affordance** — what an element *lets you do* (a button affords pressing, a row affords selecting). Make real affordances match apparent ones.
2. **Signifier** — the perceptible cue that *announces* the affordance. This is the designer's real lever: a control must *look* like what it does. A clickable thing gets button/link styling and a pointer cursor; a draggable thing looks grabbable. **A signifier must never lie** (the "Norman door": a handle that must be pushed). Don't style non-interactive text like a link, or hide the primary action.
3. **Mapping** — the relationship between a control and its effect should be *natural*: spatial and cultural analogies (toggle right = on, a slider that moves the way the value moves, layout that follows the real workflow). Put controls next to what they change.
4. **Feedback** — every action gets an immediate, informative response. Timely (perceived instant < 100ms; show progress beyond ~1s), specific ("Contract booked", not "Done"), and proportional (don't toast every keystroke). Silence reads as "broken".
5. **Constraints** — prevent error by limiting the possible: disable invalid actions, mask/validate inputs, require the fields that must exist, offer only legal choices. Physical, logical, semantic, cultural.
6. **Conceptual model** — the system should project a clear *system image* so the user's **mental model** matches how it actually works. Consistency, honest metaphors, and predictable behavior build it; surprises break it.

Discoverability is the emergent result of these six done well.

## The two gulfs (where usability fails)

- **Gulf of Execution** — "How do I do this? Will this control get me there?" Bridge it with signifiers, natural mapping, constraints, sensible defaults, and *feedforward* (show what an action will do before it's taken).
- **Gulf of Evaluation** — "Did it work? What state am I in now?" Bridge it with feedback and a visible system state. Kernel's `<StatusBadge>` is exactly this — persistent lifecycle state made visible so the user never guesses whether a load is booked, in transit, or settled.

When something "feels confusing," name which gulf it's on — the fix differs.

## Design for error (don't blame the user)

- **Slips** (right intent, wrong action — autopilot errors): prevent with constraints, generous targets, and confirmation only where it matters. Undo beats a confirm dialog.
- **Mistakes** (wrong intent — bad mental model): fix with a clearer conceptual model, better signifiers, and good defaults.
- **Prevent → detect → recover.** Prefer prevention (disable, validate inline, sane defaults). Make errors *reversible* (undo, drafts). For irreversible/destructive actions use a **forcing function** — the must-choose confirm dialog — and say plainly what will happen. Error messages are specific, blameless, and tell the user how to fix it.

## Supporting principles

- **Knowledge in the world > knowledge in the head.** Don't make users remember; show the options. Prefer recognition over recall (visible actions, labeled fields, a command palette that lists, not a syntax to memorize).
- **Defaults do the work.** A good default is the most-common correct choice; it turns a decision into a confirmation.
- **Progressive disclosure.** Reveal complexity on demand (advanced filters, expandable rows) so the common path stays simple without hiding power.
- **Consistency lowers the learning cost.** One vocabulary of components and behaviors across the whole product means learning it once. Internal consistency > novelty.
- **Human-centered:** design for the real task and the real merchant; observe, prototype, iterate. Solve the right problem before polishing the wrong one.

## Applying it in Kernel

- Primary action per screen is unmistakable (signifier + placement + weight); destructive actions are demoted and guarded.
- Every mutation gives feedback: a toast (sonner), inline validation, optimistic update, or a state change on a `StatusBadge`.
- Loading, empty, and error are first-class states, not afterthoughts (the CRUD patterns model them).
- Forms constrain: typed inputs, masks, required markers, disabled-until-valid submits, in-domain defaults (a corn contract at the river terminal).
- State is always visible — status column, counters, "updated N min ago" — so the gulf of evaluation stays closed.
- Keep the conceptual model honest across the whole portal: the same control must behave the same everywhere, or the user's model fractures.

## Reviewing a flow

Ask, in order: (1) Can I tell what's actionable, and does each control *look* like what it does? (2) When I act, do I get clear, timely feedback? (3) Can I see the current state at any moment? (4) What happens when I'm wrong — is it prevented, reversible, or at least explained without blame? (5) Would a first-time merchant form the right mental model from the screen alone? A "no" names the exact principle to fix.
