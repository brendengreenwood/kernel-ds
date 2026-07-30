# UI package

`@kernel/ui` is the public Kernel component distribution. Its export map is intentional and its packed payload is the contract consumed by applications.

## Boundaries

- React and React DOM are peer dependencies and must never be bundled.
- Keep package exports explicit; wildcard exports and private source-path imports are forbidden.
- Public primitives are exported from the root entry. Marks, the MDI icon shim, utilities, and CSS have named entries.
- During the first Segment 2 phase, build entrypoints compile the still-canonical portal source. The next phase moves that source here and removes the transitional dependency.
- Preserve the primitive conventions documented in the portal UI AGENTS file: MDI shim icons, tokenized control heights, tokenized motion, CVA variant parity, and literal `data-slot` anatomy.
- `src/index.ts` and `api.json` are generated. Do not edit them directly.

## Verification

```bash
npm run build
npm test
npm run check
npm pack --dry-run --json
```
