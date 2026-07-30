import fs from "node:fs";
import path from "node:path";

/**
 * Resolve the kernel-ds repo root by walking up from cwd until a directory
 * containing `ds-bundle/components/general` is found. Works both when running
 * from `kernel-studio-server/` (vitest, tsc) and from `.mastra/output` (mastra dev).
 * Override with KERNEL_STUDIO_REPO_ROOT.
 */
export function repoRoot(): string {
  const override = process.env.KERNEL_STUDIO_REPO_ROOT;
  if (override) return path.resolve(override);
  let dir = process.cwd();
  for (;;) {
    if (fs.existsSync(path.join(dir, "ds-bundle", "components", "general"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error(
        "Could not locate the kernel-ds repo root (no ds-bundle/components/general found above " +
          process.cwd() +
          "). Set KERNEL_STUDIO_REPO_ROOT.",
      );
    }
    dir = parent;
  }
}

export function dsBundleDir(): string {
  return path.join(repoRoot(), "ds-bundle");
}

export function componentsDir(): string {
  return path.join(dsBundleDir(), "components", "general");
}

export function catalogPackageDir(): string {
  return path.join(repoRoot(), "packages", "catalog");
}

export function definitionsPackageDir(): string {
  return path.join(repoRoot(), "packages", "definitions");
}

/**
 * Directory where generated prototypes are written.
 * Override with STUDIO_PROTOTYPES_DIR (tests use a temp dir).
 */
export function prototypesDir(): string {
  const override = process.env.STUDIO_PROTOTYPES_DIR;
  if (override) return path.resolve(override);
  return path.join(repoRoot(), "kernel-studio-server", "prototypes");
}

/**
 * Portal definitions directory (kernel-portal/public/definitions) — where
 * agent-authored object/workspace JSON documents persist (decision 0033).
 * Override with STUDIO_DEFINITIONS_DIR (tests use a temp dir).
 */
export function definitionsDir(): string {
  const override = process.env.STUDIO_DEFINITIONS_DIR;
  if (override) return path.resolve(override);
  return path.join(repoRoot(), "kernel-portal", "public", "definitions");
}

/**
 * Resolve `relative` inside `base` and throw if the result escapes `base`.
 */
export function resolveInside(base: string, relative: string): string {
  const resolved = path.resolve(base, relative);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    throw new Error(`Path escapes ${path.basename(base)}/: ${relative}`);
  }
  return resolved;
}
