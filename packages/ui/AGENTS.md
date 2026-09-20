# UI package

`@kernel/ui` is the public Kernel component distribution. Its export map is intentional and its packed payload is the contract consumed by applications.

## Boundaries

- React and React DOM are peer dependencies and must never be bundled.
- Keep package exports explicit; wildcard exports and private source-path imports are forbidden.
- Public primitives are exported from the root entry. Marks, the MDI icon shim, utilities, and CSS have named entries.
- Canonical UI implementations live in `src/components/ui/`; the portal consumes only the package's explicit public entries.
- Preserve the primitive conventions documented in the portal UI AGENTS file: MDI shim icons, tokenized control heights, tokenized motion, CVA variant parity, and literal `data-slot` anatomy.
- `src/index.ts` and `api.json` are generated. Do not edit them directly.
- `src/styles.css` must keep its `@source "./";` directive (decision 0052) — it is what makes Tailwind scan the packaged component code from inside a consumer's `node_modules`. Removing it silently unstyles every consumer.

## Verification

```bash
npm run build
npm test
npm run check
npm pack --dry-run --json
```

<!-- kernel-ds:generated:start -->
## Generated inventory (do not edit — regenerate with `npm run agents:generate`)

- Export entries: ., ./api.json, ./icon, ./marks, ./package.json, ./styles.css, ./utils
- Root-entry modules: 68 (65 catalog-backed)
- Catalog entities owned: 62
<!-- kernel-ds:generated:end -->
