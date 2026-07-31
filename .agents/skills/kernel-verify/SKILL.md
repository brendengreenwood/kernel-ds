---
name: kernel-verify
description: Verify a Kernel change end-to-end — type-check, build, run the mobile + contrast audits, and screenshot the portal in light and dark. Use after any component/token/pattern change and before shipping. Bakes in the Playwright/chromium invocation so you don't re-derive it.
user-invocable: true
---

# Kernel — verify a change

Drive the actual UI; don't trust tsc alone. Run these before `/kernel-ship`.

## 0. DS gates (repository root)

```bash
npm run ds:verify   # focused gates selected from changed paths (--all for the full matrix)
npm run ds:doctor   # catalog/generated/API/a11y health — 0 violations expected
```

The `kernel-ds-verify` skill documents the gate layer in detail.

## 1. Type-check + build (portal)

```bash
cd kernel-portal && npx tsc -b && npm run build   # → dist/
```
Fix all TS errors and console errors before moving on.

## 2. Serve the built output

```bash
cd kernel-portal && (npx serve -s -l 4600 dist >/dev/null 2>&1 &)   # portal (SPA fallback: -s)
```

## 3. Mobile audit (390px)

```bash
cd kernel-portal
export NODE_PATH=/opt/node22/lib/node_modules
PW_EXECUTABLE=/opt/pw-browsers/chromium node scripts/mobile-audit.mjs http://localhost:4600/<route>
```
Target **0/0/0/0** (horizontal overflow / clipped content / sub-16px text controls / <44px effective hit areas). Known by-design exceptions: the form-elements compact-size demo input and a switch demo.

## 4. Contrast audit (token changes)

```bash
cd kernel-portal && node scripts/contrast-audit.mjs   # 0 AA failures expected
```

## 5. Screenshot the portal, light + dark

Playwright is ESM-only here — import from the absolute path; chromium is a symlink:

```js
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
// dark: addInitScript(()=>localStorage.setItem('vite-ui-theme','dark')) then
//       page.evaluate(()=>document.documentElement.classList.add('dark'))
// wait ~300ms after opening a dialog/animation before measuring (zoom-in-95 gives false positions)
// scope locators to `.fixed` / dialog-content to dodge strict-mode collisions with inline panels
```
Save to the scratchpad and eyeball; for color changes, `SendUserFile` the light+dark shots so the owner can approve hues before shipping.

## Gotchas (learned the hard way)

- Sandbox proxy blocks direct `curl` to `*.netlify.app` (403) — verify deploys via the Netlify MCP, not curl.
- Don't `pkill -f <pattern>` that matches your own shell (exit 144). Use fixed ports and let them be.
- No foreground `sleep` to wait on builds — use `run_in_background` or a Monitor until-loop.
