# Vendored DSDS schema

Kernel validates generated interoperability artifacts offline against the official Design System Documentation Specification bundle pinned here.

- Version: `0.15.2`
- Upstream: `somerandomdude/design-system-documentation-schema`
- License: Apache-2.0; the upstream license is preserved in `LICENSE`.
- Integrity and source details: `provenance.json`
- Upstream migration guidance captured for review: `MIGRATION.md`

Do not edit the schema or generated `.dsds.json` artifacts by hand. Use `npm run dsds:status` to check upstream and `npm run dsds:update -- --source <descriptor>` to stage an explicit reviewable update.
