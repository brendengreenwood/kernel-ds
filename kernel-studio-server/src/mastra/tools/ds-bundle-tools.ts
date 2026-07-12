import fs from "node:fs/promises";
import path from "node:path";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { componentsDir, dsBundleDir } from "../../lib/paths.js";

const componentNameSchema = z.string().regex(/^[A-Z][A-Za-z0-9]*$/);

async function readIfExists(filePath: string): Promise<string | undefined> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

async function markdownFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && /\.(md|mdx|prompt\.md|txt)$/i.test(entry.name))
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export const listComponentsTool = createTool({
  id: "list-components",
  description: "List Kernel ds-bundle component names available under ds-bundle/components/general.",
  inputSchema: z.object({}),
  outputSchema: z.object({ count: z.number(), components: z.array(z.string()) }),
  execute: async () => {
    const entries = await fs.readdir(componentsDir(), { withFileTypes: true });
    const components = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
    return { count: components.length, components };
  },
});

export const readComponentDocsTool = createTool({
  id: "read-component-docs",
  description: "Read prompt guidance, TypeScript declarations, and usage harness snippets for a Kernel component.",
  inputSchema: z.object({ component: componentNameSchema }),
  outputSchema: z.object({
    component: z.string(),
    files: z.record(z.string(), z.string()),
  }),
  execute: async ({ component }) => {
    const dir = path.join(componentsDir(), component);
    const stat = await fs.stat(dir).catch(() => undefined);
    if (!stat?.isDirectory()) throw new Error(`Unknown Kernel component: ${component}`);

    const candidateNames = [`${component}.prompt.md`, `${component}.d.ts`, `${component}.jsx`, `${component}.html`];
    const files: Record<string, string> = {};
    for (const name of candidateNames) {
      const content = await readIfExists(path.join(dir, name));
      if (content) files[name] = content;
    }
    return { component, files };
  },
});

export const readDesignDocsTool = createTool({
  id: "read-design-docs",
  description: "Read ds-bundle design docs from README, guidelines, and tokens directories.",
  inputSchema: z.object({
    section: z.enum(["all", "readme", "guidelines", "tokens"]).default("all"),
  }),
  outputSchema: z.object({ files: z.record(z.string(), z.string()) }),
  execute: async ({ section }) => {
    const root = dsBundleDir();
    const files: Record<string, string> = {};

    if (section === "all" || section === "readme") {
      const readme = await readIfExists(path.join(root, "README.md"));
      if (readme) files["README.md"] = readme;
    }

    for (const subdir of ["guidelines", "tokens"] as const) {
      if (section !== "all" && section !== subdir) continue;
      for (const fileName of await markdownFiles(path.join(root, subdir))) {
        const content = await readIfExists(path.join(root, subdir, fileName));
        if (content) files[`${subdir}/${fileName}`] = content;
      }
    }

    return { files };
  },
});

export const dsBundleTools = {
  listComponentsTool,
  readComponentDocsTool,
  readDesignDocsTool,
};
