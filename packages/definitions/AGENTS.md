# @kernel/definitions

Canonical framework-free contracts for object models, workspace presets, composition doctrine, deterministic coordinates, and committed definition fixtures.

- Keep serialized JSON shapes and validation semantics backward-compatible.
- Public entries are explicit; never add wildcard exports.
- Portal persistence and runtime registries stay in `kernel-portal`.
- Studio filesystem and authoring behavior stay in `kernel-studio-server`.
- `api.json` is generated from the intentional export surface.

Verify from this directory:

- `npm run check`
- `npm run build`
- `npm test`
- `npm pack --dry-run --json`

<!-- kernel-ds:generated:start -->
## Generated inventory (do not edit — regenerate with `npm run agents:generate`)

- Export `.`: objectDefinitionSchema, objectModelSchema, objectRowsSchema, parseObjectModel, validateObjectDefinition, deriveCoord, workspacePresetSchema, parseWorkspacePreset, validateWorkspacePreset
- Export `./composition`: primitives, regions, presets, rules, compositionContract
- Export `./presets`: contractModel, contractRows, settlementModel, settlementRows, demoDataset, incidentJson, incidentWorkspaceJson
- Catalog entities owned: 7
<!-- kernel-ds:generated:end -->
