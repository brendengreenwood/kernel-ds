---
name: kernel-studio
description: Run and extend Kernel Studio — the generative design-prototyping surface at /studio where a Mastra design agent turns prompts (text + images) into multi-screen Kernel prototypes rendered live on an HTML-in-Canvas flow map with a click-in interactive player. Use when starting the studio, generating or debugging prototypes, or working on the studio/server code.
user-invocable: true
---

# Kernel — studio (generative prototyping)

Kernel Studio is **dev-server-only**: the ds-bundle/prototypes middleware exists
only under `vite dev`. The built site has no working studio. Always "run via
`npm run dev`", never the Netlify deploy.

## 1. Prerequisites

- **Flagged Chrome 150** — `drawElementImage` is behind a flag:
  ```
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --enable-features=CanvasDrawElement --user-data-dir=%TEMP%\kernel-studio-chrome
  ```
  (PowerShell: `--user-data-dir=$env:TEMP\kernel-studio-chrome`.) In an
  unflagged browser, /studio shows an instructions panel instead of the canvas.
- **`ANTHROPIC_API_KEY`** in `kernel-studio-server/.env` (see `.env.example`;
  `.env` is gitignored — never commit a key).
- `ds-bundle/` present at the repo root (untracked synced artifact; the studio
  reads it read-only at runtime).

## 2. Start both servers

```bash
cd kernel-studio-server && npx mastra dev      # agent API on http://localhost:4111
cd kernel-portal && npm run dev                # portal — use the URL Vite prints (ports auto-increment)
```

Open `<vite-url>/studio` in the flagged Chrome. Prompt the chat panel (text +
optional image); the generated prototype lands on the flow map without a
reload. Click a screen card to enter the player (fully interactive real DOM);
navigate along manifest edges; "Back to map" preserves pan/zoom.

## 3. The prototype contract (version 1)

Full spec: `kernel-studio-server/PROTOTYPE-CONTRACT.md`; zod schema:
`kernel-studio-server/src/contract/manifest.ts`. Summary:

- `prototypes/<id>/manifest.json` — `{ version: 1, id, title, prompt, createdAt, directions: [{ id, title, note?, screens: [{ id, title, file, description? }], edges: [{ from, to, label? }] }] }`. Multiple directions = alternative design ideas laid out as lanes on the map.
- `prototypes/<id>/screens/<name>.jsx` — default-exports `Screen({ navigate, Kernel })`; consumes `window.Kernel` + Kernel CSS tokens; transpiled at runtime with sucrase; **never imports anything** (React is a global).
- `prototypes/<id>/README.md` — agent-written auto-doc (title, prompt, per-direction screen inventory).
- Only the hand-written fixture `fixture-grain-intake` is committed; generated prototypes are gitignored scratch.

## 4. The agent's tool surface

`kernel-studio-server/src/mastra/` — agent `kernel-design-agent` (model pinned
in `agents/design-agent.ts`) with tools: `list-components`,
`read-component-docs`, `read-design-docs` (all read the real ds-bundle),
`write-prototype` (contract-validated, traversal-safe), `list-prototypes`.
Endpoint: `POST http://localhost:4111/api/agents/kernel-design-agent/stream`.

## 5. Architecture notes (the sharp edges)

- **Two Reacts coexist by design**: portal React 19 renders the shell; the
  ds-bundle's vendored React renders prototype subtrees into dedicated child
  nodes via `window.ReactDOM`. Never cross them.
- **Canvas contract**: `layoutsubtree` goes on the `<canvas>`; only immediate
  children of that canvas are drawable. Pool containers are offscreen-positioned
  (`position:fixed; left:-10000px`) — `visibility:hidden`/`display:none` break
  drawing ("No cached paint record"). Player mode reparents a container into an
  overlay and back; state survives.
- Key files: `kernel-portal/src/studio/loader.ts` (runtime load + sucrase eval),
  `flow-map-controller.ts` (render loop, pool, borrow/return),
  `player.tsx`, `chat.ts`/`chat-panel.tsx`, `pages/studio.tsx`.

## 6. Troubleshooting

- **Instructions panel instead of canvas** → browser lacks the flag; use the
  Chrome 150 launch line above.
- **Chat panel "server unreachable"** → start `npx mastra dev` in
  `kernel-studio-server/`; check the key is in `.env`.
- **EADDRINUSE :4111 after editing server code** (Windows) → mastra dev's
  hot-restart doesn't release the port; kill the listener and cold-start:
  `netstat -ano | findstr :4111` → `taskkill /F /PID <pid>` → `npx mastra dev`.
- **Generation streams but writes nothing** → check the server log for
  `finishReason: "length"`; the agent's `defaultOptions` (maxSteps,
  maxOutputTokens) in `design-agent.ts` exist precisely for this.
- **Port isn't 5173** → Vite auto-increments; always use the printed URL.

## 7. Proof drivers

`~/.mastracode/plans/kernel-studio.proof/` (outside the repo, never
committed): `driver.mjs`
(flow-map/player/E2E assertions in flagged Chrome), `demo.ps1` (one-paste full
loop), `mount-check.mjs`, `without-check.mjs`.
