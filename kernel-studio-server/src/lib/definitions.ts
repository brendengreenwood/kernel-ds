import fs from "node:fs";
import path from "node:path";
import {
  parseObjectModel,
  parseWorkspacePreset,
  type DefinitionKind,
} from "@kernel/definitions";

export type { DefinitionKind } from "@kernel/definitions";

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

export function resolveInside(base: string, relative: string): string {
  const resolvedBase = path.resolve(base);
  const resolved = path.resolve(resolvedBase, relative);
  if (resolved !== resolvedBase && !resolved.startsWith(resolvedBase + path.sep)) {
    throw new Error(`Path escapes ${path.basename(resolvedBase)}/: ${relative}`);
  }
  return resolved;
}

function errorStrings(error: unknown): string[] {
  if (
    error &&
    typeof error === "object" &&
    "issues" in error &&
    Array.isArray(error.issues)
  ) {
    return error.issues.map((issue: { path?: PropertyKey[]; message?: string }) => {
      const issuePath = issue.path?.map(String).join(".") ?? "";
      return issuePath ? `${issuePath}: ${issue.message ?? "invalid value"}` : issue.message ?? "invalid value";
    });
  }
  return [error instanceof Error ? error.message : String(error)];
}

export function validateDefinition(options: {
  kind: DefinitionKind;
  document: string;
}): DefinitionVerdict {
  const { kind, document } = options;
  try {
    if (kind === "object") {
      const { model } = parseObjectModel(document);
      return { ok: true, kind, key: model.key };
    }
    const preset = parseWorkspacePreset(document);
    return { ok: true, kind, key: preset.key };
  } catch (error) {
    return { ok: false, errors: errorStrings(error) };
  }
}

export function writeDefinition(options: {
  kind: DefinitionKind;
  key: string;
  document: string;
  definitionsDir: string;
}): { written: string; manifestEntries: ManifestEntry[] } {
  const { kind, key, document, definitionsDir } = options;
  if (!KEY_SLUG.test(key)) {
    throw new Error(`key must be a lowercase slug (a-z, 0-9, -): "${key}"`);
  }
  const verdict = validateDefinition({ kind, document });
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
