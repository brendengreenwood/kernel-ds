import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { manifestSchema } from "../contract/manifest.js";
import { writePrototypeTool } from "../mastra/tools/prototype-tools.js";

const dummyContext = {} as never;
const fixtureDir = path.resolve(fileURLToPath(import.meta.url), "../../../prototypes/fixture-grain-intake");

let tempDir: string | undefined;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "kernel-studio-contract-"));
  process.env.STUDIO_PROTOTYPES_DIR = tempDir;
});

afterEach(async () => {
  delete process.env.STUDIO_PROTOTYPES_DIR;
  if (tempDir) await fs.rm(tempDir, { recursive: true, force: true });
});

function isToolError(value: unknown): value is { error: true; message: string } {
  if (typeof value !== "object" || value === null || !("error" in value) || !("message" in value)) return false;
  const candidate = value as { error?: unknown; message?: unknown };
  return candidate.error === true && typeof candidate.message === "string";
}

async function fixtureManifest(): Promise<Record<string, unknown>> {
  return JSON.parse(await fs.readFile(path.join(fixtureDir, "manifest.json"), "utf8"));
}

describe("prototype manifest contract", () => {
  it("accepts the committed fixture manifest", async () => {
    const parsed = manifestSchema.safeParse(await fixtureManifest());
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.id).toBe("fixture-grain-intake");
      expect(parsed.data.directions[0]!.screens).toHaveLength(3);
    }
  });

  it("fixture screen files referenced by the manifest exist on disk", async () => {
    const manifest = manifestSchema.parse(await fixtureManifest());
    for (const direction of manifest.directions) {
      for (const screen of direction.screens) {
        await expect(fs.access(path.join(fixtureDir, screen.file))).resolves.toBeUndefined();
      }
    }
  });

  it("rejects an edge pointing at a missing screen id", async () => {
    const manifest = manifestSchema.parse(await fixtureManifest());
    const broken = structuredClone(manifest) as Record<string, unknown>;
    (broken.directions as { edges: { to: string }[] }[])[0]!.edges[0]!.to = "no-such-screen";
    const parsed = manifestSchema.safeParse(broken);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(JSON.stringify(parsed.error.issues)).toContain("no-such-screen");
    }
  });

  it("rejects duplicate screen ids within a direction", async () => {
    const manifest = manifestSchema.parse(await fixtureManifest());
    const broken = structuredClone(manifest);
    broken.directions[0]!.screens[1]!.id = broken.directions[0]!.screens[0]!.id;
    // keep edges valid so the duplicate check is what fails
    broken.directions[0]!.edges = [];
    const parsed = manifestSchema.safeParse(broken);
    expect(parsed.success).toBe(false);
  });
});

describe("write-prototype manifest enforcement", () => {
  it("writes a prototype with a contract-valid manifest", async () => {
    const manifest = await fixtureManifest();
    const result = await writePrototypeTool.execute!(
      {
        id: "fixture-grain-intake",
        files: [{ path: "manifest.json", content: JSON.stringify(manifest) }],
      },
      dummyContext,
    );
    expect(isToolError(result)).toBe(false);
    await expect(fs.access(path.join(tempDir!, "fixture-grain-intake", "manifest.json"))).resolves.toBeUndefined();
  });

  it("rejects a manifest that violates the contract", async () => {
    const manifest = (await fixtureManifest()) as { directions: { edges: { to: string }[] }[] };
    manifest.directions[0]!.edges[0]!.to = "missing-screen";
    await expect(
      writePrototypeTool.execute!(
        {
          id: "fixture-grain-intake",
          files: [{ path: "manifest.json", content: JSON.stringify(manifest) }],
        },
        dummyContext,
      ),
    ).rejects.toThrow(/violates the prototype contract/);
    await expect(fs.readdir(tempDir!)).resolves.toEqual([]);
  });

  it("rejects a manifest whose id differs from the prototype id", async () => {
    const manifest = await fixtureManifest();
    await expect(
      writePrototypeTool.execute!(
        {
          id: "some-other-id",
          files: [{ path: "manifest.json", content: JSON.stringify(manifest) }],
        },
        dummyContext,
      ),
    ).rejects.toThrow(/must match the prototype id/);
  });

  it("rejects manifest.json that is not valid JSON", async () => {
    await expect(
      writePrototypeTool.execute!(
        {
          id: "bad-json",
          files: [{ path: "manifest.json", content: "{ not json" }],
        },
        dummyContext,
      ),
    ).rejects.toThrow(/not valid JSON/);
  });
});
