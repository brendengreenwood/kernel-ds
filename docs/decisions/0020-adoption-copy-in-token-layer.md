# 0020 — Adoption model: copy-in token layer

**Status:** accepted · 2026-07-09
**Supersedes:** the "add via a tweakcn single command" install story on the
Install & usage page (never formally recorded).

## Decision

Kernel is adopted by **copying its token layer into a shadcn/ui project** — not
by installing a package or running a one-shot registry command. The Install &
usage page (both surfaces) says so in five honest steps:

1. Start from a Tailwind v4 + shadcn/ui project (components on Base UI,
   `base-nova`).
2. Drop Kernel's token layer — the full `:root`, `.dark`, and `@theme inline`
   blocks — into `globals.css`. That layer **is** Kernel.
3. Add the shadcn components; redirect their `lucide-react` imports to the MDI
   shim (`@/components/ui/icon`, decision 0019). Native fonts only.
4. Use tokens by semantic name (`--primary`/`--control-h`/`--status-*`/
   `--commodity-*`/`--duration-*`/`--ease-*`).
5. Complete token reference.

In the portal, step 5 renders **live from `src/index.css` via `?raw`**, so the
reference can never drift from the real tokens.

## Why

- The old step 1 (`npx shadcn add https://tweakcn.com/r/themes/…`) installed a
  theme that only carried the **base role tokens**. Everything that makes Kernel
  itself — the status scales, the four commodity ramps, the viz series, the
  motion tokens, the control-height tokens — was added afterward and is absent
  from that URL. Running it produced a generic green shadcn theme, not Kernel.
  (`tweakcn.com` is also outside the allowed network here, like `ui.shadcn.com`.)
- Regenerating a hosted registry that captures Kernel's bespoke families isn't
  something tweakcn's generator supports, and standing up our own registry is
  infra we don't have. The token layer in this repo already **is** the
  distributable artifact — the honest story is "copy it in."

## Consequences

- No external hosting or registry to maintain.
- The portal's token reference is generated from the file it documents, so the
  "complete reference" is always exact (self-syncing).
- If a real hosted shadcn registry is ever wanted, it becomes a superseding
  decision — step 1/2 would collapse into one `shadcn add @kernel/theme`.

## Cleanups made in the same pass

- Fixed pre-existing mojibake em-dashes (`â€"` → `—`) in `index.css` / `theme.css`
  comments, surfaced by rendering `index.css` verbatim in step 5.
- Removed bogus `width="…"` attributes (2/2.5/3, captured from `stroke-width`)
  that the MDI preview conversion (decision 0019) had left on ~149 static-preview
  `<svg>`s; they were inert wherever CSS sized the icon, but wrong.
