Verification gates. Run with node from kernel-portal/. Each exits non-zero on violation

check-component-docs.mjs — doc-entity ↔ source parity (variants/slots/props); --coverage flag asserts every ready component has an entity
check-prose-quality.mjs — flags placeholder/mad-lib prose in doc entities (self-re-execs with --experimental-strip-types)
check-style-fidelity.mjs — overlines must route through typeStyles.overline; no rounded-xl/2xl/[ radius hardcodes; has an allowlist for deliberate one-offs
check-status-map.mjs — status→tone map integrity (Amendment A4: active never maps to pending under objects/)
emit-composition.mjs — validates the composition contract rules, prints EMIT-OK
contrast-audit.mjs <url> — WCAG AA contrast against a running dev server
mobile-audit.mjs <url> — 390px scan: overflow, clipped content, sub-16px inputs, effective hit areas
build-ds-bundle.mjs — regenerates the repo-root ds-bundle/ (the studio agents read it); the bundle is a generated artifact, never hand-edit it
validate-definition.mjs — validates an object/workspace definition against the schema (called by the studio too)
contrast/mobile audits need a running server (npm run dev) and a URL argument

Adding a gate: make it exit 1 on violation, print a one-line OK on success, and prove it red/green (inject a violation → exit 1, revert → exit 0). Add it to the gate list in ../AGENTS.md
