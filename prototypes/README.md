# prototypes/

Standalone prototype apps that consume the Kernel design system at source
(decision 0081). Each folder is its own Vite + React app with its own
`package.json` and lockfile — none are root workspaces, none ship, and none are
authoritative for product behaviour (same fence as `kernel-app/`, decisions
0058/0068).

| Folder | What it is |
|---|---|
| [`origination-map/`](origination-map/) | Cargill vs ADM buying points on a real MapLibre map with draw-area circles, plus a US crop tonnage ledger. |

## Adding one

1. `prototypes/<name>/` with `package.json`, `vite.config.ts`, `tsconfig.json`
   copied from an existing prototype (the `@` alias points at
   `../../packages/ui/src`).
2. App-local tokens get a short prefix (`--om-*`) in the app's own `index.css`;
   never edit `packages/ui` from a prototype.
3. Add a CI job in `.github/workflows/ci.yml` (root `npm ci` → app `npm ci` →
   `npm run build`).
4. Worklog + STATE entry in the same turn.

## Running

```sh
npm ci                               # repo root — DS workspace deps
cd prototypes/<name> && npm install
npm run dev
```
