# 0097 — The portal is behind a password

Status: accepted
Date: 2026-11-10

## Decision

The deployed portal asks for a shared password before it serves anything. `kernel-portal/netlify/edge-functions/password.ts` runs on every path, on production and on deploy previews.

- The password lives in the Netlify `SITE_PASSWORD` environment variable on the portal site. It is never in the repo.
- If the variable is unset, the gate fails closed: nobody gets in.
- A correct password sets an HttpOnly cookie that holds a hash of the password and lasts 30 days. Changing the variable signs everyone out.
- Local `npm run dev` and `vite preview` are not gated; the edge function only runs on Netlify.

This is the same gate the two origination-map prototypes use. Each site keeps its own copy of the function and its own variable.

## Why

The portal now carries Cargill domain material: the pricing scenario model, the status lifecycles, the map grammar and the handoff pages. It was readable by anyone with the URL.

## Not covered

- It is one shared password, not per-person access. There is no record of who opened the portal.
- The GitHub repo is a separate question; this gate does nothing for it.
- A new Netlify site does not inherit `SITE_PASSWORD`. A site that deploys the portal without it shows the password form and accepts nothing.

## Changing the password

Set `SITE_PASSWORD` on the Netlify site and redeploy. No code change.
