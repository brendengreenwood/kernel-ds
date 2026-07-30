/**
 * Packed-consumer smoke: run from inside a clean consumer directory that has
 * installed the @kernel/ui and @kernel/definitions tarballs plus peer React.
 * Copy this file into the consumer first so bare specifiers resolve against
 * the consumer's node_modules, then: node pack-smoke.mjs
 */
const failures = []

function check(condition, label) {
  if (!condition) failures.push(label)
}

const definitions = await import("@kernel/definitions")
check(typeof definitions.parseObjectModel === "function", "@kernel/definitions exports parseObjectModel")
check(typeof definitions.parseWorkspacePreset === "function", "@kernel/definitions exports parseWorkspacePreset")

const composition = await import("@kernel/definitions/composition")
check(Array.isArray(composition.compositionContract?.rules), "@kernel/definitions/composition exports compositionContract rules")

const presets = await import("@kernel/definitions/presets")
check(presets.contractModel?.key === "contract", "@kernel/definitions/presets exports contractModel")

const ui = await import("@kernel/ui")
check(typeof ui.Button === "function", "@kernel/ui exports Button")
check(typeof ui.Dialog !== "undefined", "@kernel/ui exports Dialog")

const utils = await import("@kernel/ui/utils")
check(typeof utils.cn === "function", "@kernel/ui/utils exports cn")

// The definitions contract must actually parse a document from the packed payload.
const parsed = definitions.parseObjectModel(
  JSON.stringify({
    model: {
      key: "smoke",
      label: "Smoke",
      plural: "Smokes",
      fields: [{ key: "id", label: "ID", type: "text", sample: "S-1" }],
      statuses: [{ key: "active", label: "Active", tone: "active" }],
      associations: [],
    },
    rows: [{ id: "S-1" }],
  }),
)
check(parsed.model.key === "smoke" && parsed.rows.length === 1, "packed parseObjectModel round-trips a document")

if (failures.length > 0) {
  for (const failure of failures) console.error(`PACK-SMOKE-FAILED: ${failure}`)
  process.exit(1)
}
console.log("PACK-SMOKE-OK: packed entry points import and parse outside the workspace")
