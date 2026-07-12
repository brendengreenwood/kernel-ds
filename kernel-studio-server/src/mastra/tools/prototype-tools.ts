import fs from "node:fs/promises";
import path from "node:path";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { manifestSchema } from "../../contract/manifest.js";
import { prototypesDir, resolveInside } from "../../lib/paths.js";

const prototypeIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{1,80}$/);
const relativeFileSchema = z.string().regex(/^[A-Za-z0-9._/-]+$/).refine((value) => !value.includes(".."), {
  message: "Paths may not contain '..'",
});

const prototypeFileSchema = z.object({
  path: relativeFileSchema.describe("Path relative to the prototype directory, e.g. manifest.json or screens/intake.jsx"),
  content: z.string(),
});

export const writePrototypeTool = createTool({
  id: "write-prototype",
  description:
    "Write a prototype's manifest and screen files under kernel-studio-server/prototypes/<id>/. " +
    "manifest.json must satisfy the version-1 contract (see PROTOTYPE-CONTRACT.md); invalid manifests are rejected.",
  inputSchema: z.object({
    id: prototypeIdSchema,
    files: z.array(prototypeFileSchema).min(1),
  }),
  outputSchema: z.object({ id: z.string(), filesWritten: z.array(z.string()), directory: z.string() }),
  execute: async ({ id, files }) => {
    const manifestFile = files.find((file) => file.path.replaceAll("\\", "/") === "manifest.json");
    if (manifestFile) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(manifestFile.content);
      } catch (error) {
        throw new Error(`manifest.json is not valid JSON: ${(error as Error).message}`);
      }
      const check = manifestSchema.safeParse(parsed);
      if (!check.success) {
        throw new Error(`manifest.json violates the prototype contract: ${z.prettifyError(check.error)}`);
      }
      if (check.data.id !== id) {
        throw new Error(`manifest id "${check.data.id}" must match the prototype id "${id}"`);
      }
    }

    const base = prototypesDir();
    const prototypeRoot = resolveInside(base, id);
    await fs.mkdir(prototypeRoot, { recursive: true });

    const filesWritten: string[] = [];
    for (const file of files) {
      const target = resolveInside(prototypeRoot, file.path);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, file.content, "utf8");
      filesWritten.push(file.path.replaceAll("\\", "/"));
    }

    return { id, filesWritten, directory: prototypeRoot };
  },
});

export const listPrototypesTool = createTool({
  id: "list-prototypes",
  description: "List prototype directories with manifest.json files.",
  inputSchema: z.object({}),
  outputSchema: z.object({ prototypes: z.array(z.object({ id: z.string(), manifestPath: z.string() })) }),
  execute: async () => {
    const base = prototypesDir();
    await fs.mkdir(base, { recursive: true });
    const entries = await fs.readdir(base, { withFileTypes: true });
    const prototypes = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const manifest = path.join(base, entry.name, "manifest.json");
      try {
        await fs.access(manifest);
        prototypes.push({ id: entry.name, manifestPath: manifest });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }
    prototypes.sort((a, b) => a.id.localeCompare(b.id));
    return { prototypes };
  },
});

export const prototypeTools = {
  writePrototypeTool,
  listPrototypesTool,
};
