# Kernel

An **AI-native operations platform** for grain-buying merchants. AI authors
JSON **object + workspace definitions**; the portal **derives a working UI**
from them — no per-screen hand-coding. The design system is the vocabulary the
AI composes with, and a generative studio agent is the author.

The domain is a grain merchant's world: a **strategic pricing tool** (bids,
basis, contracts), an **origination** experience (offers, producers), and a
CRUD core throughout (loads, farms, bushels, settlement).

## How it fits together

```
┌─ kernel-studio-server ─┐        reads         ┌─ ds-bundle ─┐
│  generative agent      │ ───────────────────▶ │  component  │
│  authors JSON defs     │                      │  docs+tokens│
└───────────┬────────────┘                      └──────▲──────┘
            │ writes definitions                       │ built from
            ▼                                           │
┌─ kernel-portal ────────────────────────────────────┴──────────┐
│  design system + object-model runtime → derives the working UI │
│  (the only shipped surface — deploys to Netlify)               │
└────────────────────────────────────────────────────────────────┘
```

Two sibling npm packages, no workspace root, no pnpm. Each installs and builds
on its own — run `npm` commands from inside the package dir.

| Package | What it is |
|---|---|
| **`kernel-portal/`** | React 19 + Vite + shadcn/ui (Base UI) + Tailwind v4 + TypeScript. The design system, the object-model runtime (Shell → Workspace → Collection → Record), and the derived-UI workspace. The **only shipped surface** (Netlify deploys `kernel-portal/dist`). |
| **`kernel-studio-server/`** | A Mastra dev server. The **generative design agent** that reads the design system and authors object + workspace definitions the portal renders. Not shipped to users. |
| **`ds-bundle/`** | A **generated artifact** (built by `kernel-portal/scripts/build-ds-bundle.mjs`) — per-component docs, tokens, and composition rules the studio agents read. Never edit by hand; rebuild it. |

## Principles

- **Build-first, adapt-later** — ship a working surface, then generalize from
  real usage rather than up-front abstraction.
- **Composability doctrine** — a small set of primitives and a composition
  contract; the AI composes UIs from documented parts, not bespoke markup.
- **IDE-like workspace** — the derived workspace mirrors an editor layout
  (activity rail + navigator + canvas + dock), like VS Code.

## Quick start

```bash
# Portal — the design system + workspace surface
cd kernel-portal
npm install
npm run dev            # http://localhost:5173
npm run build          # tsc -b && vite build → dist/

# Studio — the generative agent (Mastra dev server)
cd kernel-studio-server
npm install
npm run dev            # Mastra playground + agent runtime, port 4111
```

The studio reads `ds-bundle/`. If a tool can't find component guidance, rebuild
the bundle from the portal: `cd kernel-portal && node scripts/build-ds-bundle.mjs`.

## Verifying changes

Prefer the **narrowest** relevant check; don't run both packages when one is
enough.

- **Portal** has no vitest suite — its checks are gate scripts run with Node
  (parity, coverage, prose-quality, style-fidelity, status-map, composition,
  and `__check__` assertions). See `kernel-portal/AGENTS.md` for the catalogue.
- **Studio**: `cd kernel-studio-server && npm test` (vitest) and
  `npm run check` (tsc).

CI runs both jobs (portal gates + studio tests) on every PR to `main`.

## Where to look next

| You want… | Go to |
|---|---|
| Product rules, conventions, token/design rationale | `CLAUDE.md` |
| Operational map (commands, gates, file layout) | `AGENTS.md` (+ package-local `AGENTS.md` files) |
| What's true right now / in-flight work | `docs/STATE.md` |
| Why the system is shaped this way | `docs/decisions/` |
| What was done, when, and why | `docs/worklog/` |
| How the docs system itself works | `docs/GUIDE.md` |
| Portal internals (file map, component divergences) | `kernel-portal/README.md` |

## License

Private / unpublished.
