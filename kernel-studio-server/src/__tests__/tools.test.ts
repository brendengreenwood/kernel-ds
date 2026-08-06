import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listComponentsTool, readComponentDocsTool } from "../mastra/tools/ds-bundle-tools.js";
import { listPrototypesTool, writePrototypeTool } from "../mastra/tools/prototype-tools.js";

const dummyContext = {} as never;
let tempDir: string | undefined;

function isToolError(value: unknown): value is { error: true; message: string } {
  if (typeof value !== "object" || value === null || !("error" in value) || !("message" in value)) return false;
  const candidate = value as { error?: unknown; message?: unknown };
  return candidate.error === true && typeof candidate.message === "string";
}

function toolResult<T>(result: unknown, schema: z.ZodType<T>): T {
  if (!result) throw new Error("Tool returned no result");
  if (isToolError(result)) throw new Error(result.message);
  return schema.parse(result);
}

const listComponentsResultSchema = z.object({
  count: z.number(),
  components: z.array(z.string()),
  exports: z.array(z.string()),
});
const readComponentDocsResultSchema = z.object({ component: z.string(), files: z.record(z.string(), z.string()) });
const writePrototypeResultSchema = z.object({ id: z.string(), filesWritten: z.array(z.string()), directory: z.string() });
const listPrototypesResultSchema = z.object({
  prototypes: z.array(z.object({ id: z.string(), manifestPath: z.string() })),
});

function minimalManifest(id: string): string {
  return JSON.stringify({
    version: 1,
    id,
    title: "Test prototype",
    prompt: "test",
    createdAt: "2026-07-12T12:00:00Z",
    directions: [
      {
        id: "primary",
        title: "Primary",
        screens: [{ id: "intake", title: "Intake", file: "screens/intake.jsx" }],
        edges: [],
      },
    ],
  });
}

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "kernel-studio-tools-"));
  process.env.STUDIO_PROTOTYPES_DIR = tempDir;
});

afterEach(async () => {
  delete process.env.STUDIO_PROTOTYPES_DIR;
  if (tempDir) await fs.rm(tempDir, { recursive: true, force: true });
});

describe("ds-bundle tools", () => {
  it("lists the 69 Kernel general components", async () => {
    const result = toolResult(await listComponentsTool.execute!({}, dummyContext), listComponentsResultSchema);
    expect(result.count).toBe(69);
    expect(result.components).toContain("Button");
    expect(result.components).toContain("Tooltip");
    expect(result.components).toContain("Combobox");
    expect(result.components).toContain("Field");
    expect(result.components).toContain("MessageScroller");
  });

  it("exposes real bundle exports, including subcomponents docs never mention", async () => {
    const result = toolResult(await listComponentsTool.execute!({}, dummyContext), listComponentsResultSchema);
    // shadcn-style subcomponent names ship in the bundle...
    expect(result.exports).toEqual(expect.arrayContaining(["TabsList", "TabsTrigger", "TabsContent", "CardHeader"]));
    // ...Base UI-style names do not (agents guessing these crashed screens at runtime).
    expect(result.exports).not.toContain("TabsTab");
    expect(result.exports).not.toContain("TabsPanel");
    // An overrun past the entry export map would sweep in internal Base UI
    // part maps (Root/Panel/Trigger...) that are undefined on window.Kernel.
    expect(result.exports).not.toContain("Root");
    expect(result.exports).not.toContain("Panel");
    expect(new Set(result.exports).size).toBe(result.exports.length);
    expect(result.exports.length).toBeGreaterThan(100);
  });

  it("reads component knowledge files for Button", async () => {
    const result = toolResult(
      await readComponentDocsTool.execute!({ component: "Button" }, dummyContext),
      readComponentDocsResultSchema,
    );
    expect(result.component).toBe("Button");
    expect(result.files["Button.prompt.md"]).toContain("Button");
    expect(result.files["Button.d.ts"]).toContain("Button");
  });
});

describe("prototype tools", () => {
  it("writes prototype files under the configured prototypes directory", async () => {
    const result = toolResult(
      await writePrototypeTool.execute!(
        {
          id: "test-prototype",
          files: [
            { path: "manifest.json", content: minimalManifest("test-prototype") },
            { path: "screens/intake.jsx", content: "export default function Screen() { return null; }" },
          ],
        },
        dummyContext,
      ),
      writePrototypeResultSchema,
    );

    expect(result.id).toBe("test-prototype");
    expect(result.filesWritten).toEqual(["manifest.json", "screens/intake.jsx"]);
    await expect(fs.readFile(path.join(tempDir!, "test-prototype", "screens", "intake.jsx"), "utf8")).resolves.toContain(
      "Screen",
    );
  });

  it("rejects path traversal attempts", async () => {
    const result = await writePrototypeTool.execute!(
      {
        id: "escape-test",
        files: [{ path: "../owned.txt", content: "bad" }],
      },
      dummyContext,
    );

    expect(isToolError(result)).toBe(true);
    expect(await fs.readdir(tempDir!)).toEqual([]);
  });

  it("lists only prototype directories with manifest files", async () => {
    await writePrototypeTool.execute!(
      { id: "listed-prototype", files: [{ path: "manifest.json", content: minimalManifest("listed-prototype") }] },
      dummyContext,
    );
    await fs.mkdir(path.join(tempDir!, "scratch"), { recursive: true });

    const result = toolResult(await listPrototypesTool.execute!({}, dummyContext), listPrototypesResultSchema);
    expect(result.prototypes).toEqual([
      { id: "listed-prototype", manifestPath: path.join(tempDir!, "listed-prototype", "manifest.json") },
    ]);
  });
});
