# 0056 — The v2 prototype is the design system's forward track, and its drift is a promotion queue

Date: 2026-08-02
Status: accepted
Amends: 0040 (`kernel-app/` is the Kernel v2 prototype)

## Context

Decision 0040 framed `kernel-app/` defensively. It was a pressure test: build a
second real consumer of the DS, see what breaks, fix the breakage upstream, and
keep a register so the branch could be **abandoned without losing anything**.
Its operative rule was:

> Fixes flow upstream, styling does not.

That rule was right for a sandbox whose purpose was finding bugs. It is the
wrong rule now, and it has been quietly costing us. Under 0040, everything the
prototype learned about *the system itself* — that dark needed an inverted
elevation model, that the radius wanted 3.5×, that panels want a figure cluster
at the header's trailing edge — was classified as "styling," which meant "stays
here, never leaves." The register recorded 27 remapped tokens and 13 rule
groups and then labelled all of them **"no — that *is* the look."** The only
things allowed upstream were the six Part 4 items, four of which were plain
bugs.

So the prototype was permitted to discover design direction but forbidden from
returning any of it. Meanwhile the actual work has been exactly that: pushing
tokens, components and patterns past what the portal currently expresses.

## Decision

**`kernel-app/` is where the next version of the design system is designed. Its
drift is deliberate output, and `docs/v2-prototype-drift.md` is the queue for
promoting that output into the parent DS.**

Consequences:

- **Drift is intentional, not damage.** Pushing tokens, components and patterns
  beyond the current DS is the point of the prototype, not a cost it incurs.
  Divergence no longer needs justifying; only *un*documented divergence does.
- **Every drift entry carries a promotion status**, not a merge-worthiness
  verdict: `promote` (belongs in the DS), `prototype-only` (real, but specific
  to this app or its build wiring), or `undecided` (needs a call). "Undecided"
  is a legitimate resting state — the register's job is to make the decision
  *available*, not to force it early.
- **The three-layer discipline stays, and is now load-bearing.** L1 token
  override, L2 `data-slot` modification layer, L3 DS source edits (decision
  0040's mechanism table). Under 0040 the layers were about *reversibility* —
  delete them and get stock Kernel back. They now serve a second purpose: they
  are what makes drift **consumable**, because each layer is already expressed
  in the DS's own vocabulary. A token override names a role token. A `data-slot`
  rule names a component part. Promotion is largely a matter of moving an entry
  down a layer, not translating it.
- **Promotion is a real change, subject to the real gates.** Moving an entry
  into the DS means naming the affected consumers and running their gates
  (`contrast-audit` for token work, the parity gate and `mobile-audit` for
  component work). Nothing is promoted by editing the register.
- **The prototype's screens are still not authoritative.** Unchanged from 0040:
  filter dropdowns are presentational, `/settings` is unbuilt, the sample book
  is invented. Nothing here is a product spec. *Design* direction promotes;
  *product* behaviour does not.
- **Decision 0022 still holds.** `kernel-portal/` remains the DS's only
  surface. The prototype is a consumer, not a second surface.

## What this does not change

- The naming freezes in 0040 (`kernel-app/` directory, the
  `claude/kernel-insider-portal-fvqfq2` branch) stand, for the same mechanical
  Netlify reasons.
- Bug fixes still flow upstream immediately rather than waiting on a promotion
  decision. That path was already working; 0040's Part 4 is the evidence.

## Cost

The prototype stops being disposable. Under 0040 its worst case was a clean
delete; now the register is a real dependency of the DS's roadmap and goes
stale if drift lands without being recorded. The mitigation is the existing
ritual — the register is updated in the same change as the drift, exactly as
the worklog is.

This also lengthens the branch's life, and it is already 51 commits ahead with
three duplicate decision numbers (0040/0041/0042 collide with main's). Longer
divergence means more of that. Rebasing or promoting in slices is now
worth more than it was.
