import fs from "node:fs/promises";
import path from "node:path";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { validateDefinition, writeDefinition } from "../../lib/definitions.js";
import { definitionsDir, portalPublicDir, portalScriptsDir } from "../../lib/paths.js";

const kindSchema = z.enum(["object", "workspace"]);
const keySchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/, "key must be a lowercase slug (a-z, 0-9, -)");

function validateCliPath(): string {
  return path.join(portalScriptsDir(), "validate-definition.mjs");
}

const verdictSchema = z.object({
  ok: z.boolean(),
  kind: z.string().optional(),
  key: z.string().optional(),
  errors: z.array(z.string()).optional(),
});

export const readCompositionContractTool = createTool({
  id: "read-composition-contract",
  description:
    "Read the portal's composition contract (public/composition.json): the primitives, " +
    "regions, and doctrine rules that agent-authored definitions must respect.",
  inputSchema: z.object({}),
  outputSchema: z.object({ contract: z.unknown() }),
  execute: async () => {
    const raw = await fs.readFile(path.join(portalPublicDir(), "composition.json"), "utf8");
    return { contract: JSON.parse(raw) as unknown };
  },
});

export const validateDefinitionTool = createTool({
  id: "validate-definition",
  description:
    "Validate a candidate definition document against the portal's own zod schemas " +
    "(object model envelope or workspace preset). Returns { ok: true, kind, key } or " +
    "{ ok: false, errors }. Validation runs the portal's validate-definition CLI — " +
    "the portal schemas are the single source of truth.",
  inputSchema: z.object({
    kind: kindSchema,
    document: z.string().describe("The full JSON document as a string"),
  }),
  outputSchema: verdictSchema,
  execute: async ({ kind, document }) =>
    validateDefinition({ kind, document, validateCliPath: validateCliPath() }),
});

export const writeDefinitionTool = createTool({
  id: "write-definition",
  description:
    "Validate then persist a definition document under kernel-portal/public/definitions/ " +
    "(objects/<key>.json or workspaces/<key>.json) and list it in manifest.json so the " +
    "portal registers it at boot. Invalid documents are refused — nothing is written.",
  inputSchema: z.object({
    kind: kindSchema,
    key: keySchema,
    document: z.string().describe("The full JSON document as a string"),
  }),
  outputSchema: z.object({
    written: z.string(),
    manifestEntries: z.array(z.object({ kind: z.string(), path: z.string() })),
  }),
  execute: async ({ kind, key, document }) =>
    writeDefinition({
      kind,
      key,
      document,
      definitionsDir: definitionsDir(),
      validateCliPath: validateCliPath(),
    }),
});

export const defineTools = {
  readCompositionContractTool,
  validateDefinitionTool,
  writeDefinitionTool,
};
