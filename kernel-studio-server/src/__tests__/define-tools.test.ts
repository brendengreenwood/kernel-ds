import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveInside, validateDefinition, writeDefinition } from "../lib/definitions.js";

// All paths are passed DIRECTLY as arguments (dependency-injected lib) —
// no reliance on ambient env. KERNEL_STUDIO_REPO_ROOT is still set
// programmatically so any paths.ts-level code touched indirectly resolves
// without the ds-bundle sentinel (absent on this machine).
const repoRootDir = fileURLToPath(new URL("../../../", import.meta.url));
const validateCliPath = path.join(repoRootDir, "kernel-portal", "scripts", "validate-definition.mjs");

// Spawning the strip-types CLI costs ~1s per verdict; give spawn-heavy
// tests explicit headroom over vitest's 5s default.
const SPAWN_TIMEOUT = 30_000;

let tempDir: string;

const validObjectDocument = JSON.stringify({
  model: {
    key: "gadget",
    label: "Gadget",
    plural: "Gadgets",
    fields: [{ key: "name", label: "Name", type: "text", sample: "Widget" }],
    statuses: [
      { key: "new", label: "New", tone: "draft" },
      { key: "live", label: "Live", tone: "success" },
    ],
    associations: [],
  },
  rows: [{ id: "G-1", name: "Widget", status: "new" }],
});

// Same document with statuses[0].tone removed — the canonical invalid case.
const missingToneDocument = (() => {
  const doc = JSON.parse(validObjectDocument);
  delete doc.model.statuses[0].tone;
  return JSON.stringify(doc);
})();

// Workspace preset whose defaultGroupBy is not a member of groupByOptions —
// the per-idiom coherence refinement must reject it.
const incoherentPresetDocument = JSON.stringify({
  key: "gadget-ops",
  label: "Gadget ops",
  modes: [
    {
      key: "gadgets",
      label: "Gadgets",
      icon: "table",
      objectKey: "gadget",
      navigator: { idiom: "grouped", groupByOptions: ["status"], defaultGroupBy: "owner" },
      canvasViews: ["table"],
      dockPanels: [],
    },
  ],
});

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "kernel-studio-definitions-"));
  process.env.KERNEL_STUDIO_REPO_ROOT = repoRootDir;
});

afterEach(async () => {
  delete process.env.KERNEL_STUDIO_REPO_ROOT;
  await fs.rm(tempDir, { recursive: true, force: true });
});

describe("definition write path", () => {
  it(
    "validates a valid object document, writes it, and the manifest gains the entry",
    async () => {
      const verdict = validateDefinition({
        kind: "object",
        document: validObjectDocument,
        validateCliPath,
      });
      expect(verdict).toEqual({ ok: true, kind: "object", key: "gadget" });

      const result = writeDefinition({
        kind: "object",
        key: "gadget",
        document: validObjectDocument,
        definitionsDir: tempDir,
        validateCliPath,
      });
      expect(result.written).toBe("objects/gadget.json");
      expect(result.manifestEntries).toEqual([{ kind: "object", path: "objects/gadget.json" }]);

      const written = await fs.readFile(path.join(tempDir, "objects", "gadget.json"), "utf8");
      expect(JSON.parse(written).model.key).toBe("gadget");
      const manifest = JSON.parse(await fs.readFile(path.join(tempDir, "manifest.json"), "utf8"));
      expect(manifest).toEqual({
        version: 1,
        definitions: [{ kind: "object", path: "objects/gadget.json" }],
      });
    },
    SPAWN_TIMEOUT,
  );

  it(
    "rejects an invalid document (missing tone): validateDefinition says no, writeDefinition throws without writing",
    async () => {
      const verdict = validateDefinition({
        kind: "object",
        document: missingToneDocument,
        validateCliPath,
      });
      expect(verdict.ok).toBe(false);
      expect(verdict.errors?.join("\n")).toContain("model.statuses.0.tone");

      expect(() =>
        writeDefinition({
          kind: "object",
          key: "gadget",
          document: missingToneDocument,
          definitionsDir: tempDir,
          validateCliPath,
        }),
      ).toThrow(/refusing to write invalid object definition "gadget"/);

      // Nothing was written: no objects/, no manifest.
      await expect(fs.readdir(tempDir)).resolves.toEqual([]);
    },
    SPAWN_TIMEOUT,
  );

  it("throws on path escapes: non-slug keys and forged ../ paths", () => {
    // A traversal-shaped key never reaches the filesystem (slug regex).
    expect(() =>
      writeDefinition({
        kind: "object",
        key: "../evil",
        document: validObjectDocument,
        definitionsDir: tempDir,
        validateCliPath,
      }),
    ).toThrow(/lowercase slug/);

    // The inline guard itself: ../ escape and the separator-suffixed
    // sibling case (`definitions-evil` must not pass a bare startsWith).
    expect(() => resolveInside(tempDir, "../owned.json")).toThrow(/escapes/);
    expect(() => resolveInside(tempDir, `..${path.sep}${path.basename(tempDir)}-evil${path.sep}x.json`)).toThrow(
      /escapes/,
    );
    expect(resolveInside(tempDir, "objects/ok.json")).toBe(path.join(tempDir, "objects", "ok.json"));
  });

  it(
    "rejects a workspace preset whose defaultGroupBy is outside groupByOptions",
    () => {
      const verdict = validateDefinition({
        kind: "workspace",
        document: incoherentPresetDocument,
        validateCliPath,
      });
      expect(verdict.ok).toBe(false);
      expect(verdict.errors?.join("\n")).toContain("defaultGroupBy");
    },
    SPAWN_TIMEOUT,
  );

  it(
    "is manifest-idempotent on double-write of the same definition",
    async () => {
      const first = writeDefinition({
        kind: "object",
        key: "gadget",
        document: validObjectDocument,
        definitionsDir: tempDir,
        validateCliPath,
      });
      const second = writeDefinition({
        kind: "object",
        key: "gadget",
        document: validObjectDocument,
        definitionsDir: tempDir,
        validateCliPath,
      });
      expect(first.manifestEntries).toHaveLength(1);
      expect(second.manifestEntries).toHaveLength(1);
      const manifest = JSON.parse(await fs.readFile(path.join(tempDir, "manifest.json"), "utf8"));
      expect(manifest.definitions).toHaveLength(1);
    },
    SPAWN_TIMEOUT,
  );
});
