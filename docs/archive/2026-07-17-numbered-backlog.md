# Archived: STATE.md numbered backlog (retired 2026-07-17)

The numbered backlog below lived in `docs/STATE.md` until 2026-07-17, when
tracking consolidated onto the GitHub Project board
(<https://github.com/users/brendengreenwood/projects/1>). Items still open
were already on the board (usage guidance, audit follow-ups) or were carried
into STATE.md as watch items (a11y). Preserved verbatim per the archive
convention; do not edit.

---

## Backlog (in priority order)

1. ~~Sync audit~~ ✓ done 2026-07-03 (see worklog; surfaces verified mirrored)
2. **UI pattern library** → in flight (decision 0008). Domain lineup
   capped at two worked examples (contract detail, settlement statement);
   load ticket entry and basis & bid board dropped.
3. **Accessibility pass** — complete at **68/68 reviewed**. Contrast audit +
   role-token fixes landed 2026-07-03/04. Per-component reviews landed in
   batches 1–6 (2026-07-10/11), with final follow-up fixes on 2026-07-15:
   Drawer focus trap (`docs/a11y/drawer-focus-trap-fix-2026-07.md`) and
   Form elements Field/id plumbing (`docs/a11y/form-field-plumbing-fix-2026-07.md`).
   The final component-completeness sweep also resolved all vague experimental
   notes (`docs/a11y/promotion-sweep-2026-07.md`). Watch items from the
   campaign (disclosed, not blockers): Calendar day-grid buttons are 27×27px
   at 390px — passes WCAG 2.5.8 AA (≥24px) but below the project 44px bar;
   dense grid, decision-0007 extension not applicable. Slider's native range
   input reports h=10px in the mobile audit, while the styled track/thumb
   remain the functional target. Resizable handle keeps its vendored 1px focus
   ring (visible both modes) instead of the 3px control ring.

4. **Usage guidance** — do/don't guidance in the portal (when to use which
   component; StatusBadge vs Alert per decision 0003) so it teaches, not
   just shows.
5. **2026-07-10 audit follow-ups** (details in
   `docs/audit/2026-07-10-project-audit.md`): code-split the portal bundle
   (single 1,862 kB JS chunk); decide on navigation-menu’s vendored 350ms
   duration (the preview-CSS motion-literal migration is moot — file retired,
   decision 0022);
   give the 30px filter chip (`filters.tsx`) a home in the size system;
   ~~resolve the `tabsListVariants` fast-refresh warning~~ ✓ done 2026-07-10 (dead export removed on the tabs-promotion branch);
   backfill worklog entries for `8545649` and `bdd3b1d`; portability pass on
   the kernel-verify / kernel-ship skills (Linux paths, theme storageKey,
   environment rules); scrub stale “static preview” prose inside the portal
   itself (`motion-foundation.tsx:156` rendered copy,
   `kernel-portal/README.md:126`, `component-meta.ts` border-beam note) —
   flagged by the 0022 ship review; portal code was deliberately untouched
   in the retirement branch.
