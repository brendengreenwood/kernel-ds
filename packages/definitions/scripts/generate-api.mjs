import { writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const api = {
  package: "@kernel/definitions",
  version: "0.0.0",
  exports: {
    ".": [
      "objectDefinitionSchema", "objectModelSchema", "objectRowsSchema",
      "parseObjectModel", "validateObjectDefinition", "deriveCoord",
      "workspacePresetSchema", "parseWorkspacePreset", "validateWorkspacePreset",
    ],
    "./composition": ["primitives", "regions", "presets", "rules", "compositionContract"],
    "./presets": [
      "contractModel", "contractRows", "settlementModel", "settlementRows",
      "demoDataset", "incidentJson", "incidentWorkspaceJson",
    ],
  },
}

await writeFile(resolve(import.meta.dirname, "../api.json"), `${JSON.stringify(api, null, 2)}\n`)
console.log("DEFINITIONS-API-GENERATED")
