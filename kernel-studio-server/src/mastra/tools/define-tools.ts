import { compositionContract } from "@kernel/definitions/composition";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { validateDefinition, writeDefinition } from "../../lib/definitions.js";
import { definitionsDir } from "../../lib/paths.js";

const kindSchema = z.enum(["object", "workspace"]);
const keySchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/, "key must be a lowercase slug (a-z, 0-9, -)");

const verdictSchema = z.object({
  ok: z.boolean(),
  kind: z.string().optional(),
  key: z.string().optional(),
  errors: z.array(z.string()).optional(),
});

export const readCompositionContractTool = createTool({
  id: "read-composition-contract",
  description:
    "Read the canonical composition contract: the primitives, regions, and doctrine rules " +
    "that agent-authored definitions must respect.",
  inputSchema: z.object({}),
  outputSchema: z.object({ contract: z.unknown() }),
  execute: async () => ({ contract: compositionContract }),
});

export const validateDefinitionTool = createTool({
  id: "validate-definition",
  description:
    "Validate a candidate definition document against the canonical @kernel/definitions " +
    "schemas (object model envelope or workspace preset). Returns { ok: true, kind, key } " +
    "or { ok: false, errors }.",
  inputSchema: z.object({
    kind: kindSchema,
    document: z.string().describe("The full JSON document as a string"),
  }),
  outputSchema: verdictSchema,
  execute: async ({ kind, document }) => validateDefinition({ kind, document }),
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
    }),
});

export const defineTools = {
  readCompositionContractTool,
  validateDefinitionTool,
  writeDefinitionTool,
};
