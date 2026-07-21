/**
 * Definition write path — validate-then-write for agent-authored portal
 * definitions (object models and workspace presets).
 *
 * This module imports ONLY node: builtins and takes every path as an
 * argument ({ definitionsDir, validateCliPath }) so the e2e proof can
 * load this exact module under `node --experimental-strip-types` with
 * no local-import resolution and no repoRoot()/env dependency. The
 * Mastra tools in mastra/tools/define-tools.ts are thin wrappers that
 * supply the paths from lib/paths.ts — the same code runs either way.
 *
 * Validation crosses the package boundary via the portal's own CLI
 * (kernel-portal/scripts/validate-definition.mjs) spawned as a
 * subprocess — the portal's zod schemas stay the single source of
 * truth; nothing is duplicated here.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export type DefinitionKind = "object" | "workspace";

export interface DefinitionVerdict {
  ok: boolean;
  kind?: string;
  key?: string;
  errors?: string[];
}

export interface ManifestEntry {
  kind: DefinitionKind;
  path: string;
}

const KEY_SLUG = /^[a-z][a-z0-9-]*$/;

/**
 * Same semantics as paths.ts `resolveInside`, including the
 * separator-suffixed prefix check (a bare startsWith(base) would pass
 * a `definitions-evil` sibling). Reimplemented inline because this
 * module may not take local imports (see module doc).
 */
export function resolveInside(base: string, relative: string): string {
  const resolvedBase = path.resolve(base);
  const resolved = path.resolve(resolvedBase, relative);
  if (resolved !== resolvedBase && !resolved.startsWith(resolvedBase + path.sep)) {
    throw new Error(`Path escapes ${path.basename(resolvedBase)}/: ${relative}`);
  }
  return resolved;
}

/**
 * Spawn the portal's validate-definition CLI (always via
 * process.execPath — bare "node" is PATH-ambiguous on Windows under
 * mastra dev) and return its one-line JSON verdict. The document
 * travels over stdin. Exit 0 (valid) and 1 (invalid) both yield a
 * verdict; anything else is a CLI failure and throws.
 */
export function validateDefinition(options: {
  kind: DefinitionKind;
  document: string;
  validateCliPath: string;
}): DefinitionVerdict {
  const { kind, document, validateCliPath } = options;
  const result = spawnSync(
    process.execPath,
    ["--experimental-strip-types", validateCliPath, "--kind", kind, "-"],
    { input: document, encoding: "utf8" },
  );
  if (result.error) throw result.error;
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(
      `validate-definition CLI failed (exit ${result.status}): ${(result.stderr ?? "").trim()}`,
    );
  }
  const line = (result.stdout ?? "").trim().split(/\r?\n/).pop() ?? "";
  try {
    return JSON.parse(line) as DefinitionVerdict;
  } catch {
    throw new Error(
      `validate-definition CLI printed no JSON verdict (exit ${result.status}): "${line}"`,
    );
  }
}

/**
 * Validate then persist a definition document. Refuses invalid
 * documents — throws with the verdict errors and writes NOTHING.
 * On success writes objects/<key>.json or workspaces/<key>.json under
 * definitionsDir, then rewrites manifest.json (read-merge-write,
 * idempotent by path; manifest last = atomic publish — the portal only
 * loads what the manifest lists). A missing or unparsable manifest is
 * treated as empty and created.
 */
export function writeDefinition(options: {
  kind: DefinitionKind;
  key: string;
  document: string;
  definitionsDir: string;
  validateCliPath: string;
}): { written: string; manifestEntries: ManifestEntry[] } {
  const { kind, key, document, definitionsDir, validateCliPath } = options;
  if (!KEY_SLUG.test(key)) {
    throw new Error(`key must be a lowercase slug (a-z, 0-9, -): "${key}"`);
  }
  const verdict = validateDefinition({ kind, document, validateCliPath });
  if (!verdict.ok) {
    throw new Error(
      `refusing to write invalid ${kind} definition "${key}": ` +
        (verdict.errors ?? ["unknown validation error"]).join("; "),
    );
  }

  const base = path.resolve(definitionsDir);
  const relPath = `${kind === "object" ? "objects" : "workspaces"}/${key}.json`;
  const target = resolveInside(base, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, document, "utf8");

  const manifestPath = path.join(base, "manifest.json");
  let entries: ManifestEntry[] = [];
  if (fs.existsSync(manifestPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
        definitions?: unknown;
      };
      if (Array.isArray(parsed?.definitions)) {
        entries = parsed.definitions as ManifestEntry[];
      }
    } catch {
      // Specified behavior: an unparsable manifest is treated as empty
      // and rebuilt by this write.
      entries = [];
    }
  }
  if (!entries.some((entry) => entry.path === relPath)) {
    entries.push({ kind, path: relPath });
  }
  fs.writeFileSync(
    manifestPath,
    JSON.stringify({ version: 1, definitions: entries }, null, 2) + "\n",
    "utf8",
  );

  return { written: relPath, manifestEntries: entries };
}
