/**
 * Runtime assertions for the component-doc schema. Run with:
 *   node --experimental-strip-types src/lib/component-docs/__check__.mts
 * Prints `... ok` per assertion; exits 1 on first failure.
 */

import { parseComponentDoc, conformance, componentDocSchema } from "./schema.ts"

function ok(msg: string): void {
  console.log(`${msg} ok`)
}

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`)
  process.exit(1)
}

// 1. Minimal entity parses and classifies as "minimal".
{
  const minimal = parseComponentDoc({
    id: "input",
    name: "Input",
    slug: "input",
    summary: "A single-line text field.",
  })
  if (conformance(minimal) !== "minimal") {
    fail(`expected minimal conformance, got ${conformance(minimal)}`)
  }
  ok("schema (minimal entity parses, conformance=minimal)")
}

// 2. Complete entity parses and classifies as "complete".
{
  const complete = parseComponentDoc({
    id: "button",
    name: "Button",
    slug: "button",
    summary: "A clickable action trigger.",
    status: "ready",
    metadata: { owner: "ds" },
    docs: [
      { kind: "guidelines", dos: ["Use for actions"], donts: ["Don't use for navigation"] },
      { kind: "api", props: [{ name: "variant", type: "string" }] },
      { kind: "variants", groups: [{ axis: "variant", keys: ["default", "outline"] }] },
      { kind: "anatomy", slots: ["button"] },
      { kind: "accessibility", role: "button", keyboardInteractions: [{ key: "Enter", action: "activates" }] },
    ],
  })
  if (conformance(complete) !== "complete") {
    fail(`expected complete conformance, got ${conformance(complete)}`)
  }
  ok("schema (complete entity parses, conformance=complete)")
}

// 3. Documented (has status + a block, but not the Complete set).
{
  const documented = parseComponentDoc({
    id: "status-badge",
    name: "StatusBadge",
    slug: "status-badge",
    summary: "A tone-driven status pill.",
    status: "ready",
    docs: [{ kind: "variants", groups: [{ axis: "status", keys: ["active", "draft"] }] }],
  })
  if (conformance(documented) !== "documented") {
    fail(`expected documented conformance, got ${conformance(documented)}`)
  }
  ok("schema (documented entity parses, conformance=documented)")
}

// 4. Unknown block kind is rejected.
{
  const bad = componentDocSchema.safeParse({
    id: "x",
    name: "X",
    slug: "x",
    summary: "s",
    docs: [{ kind: "totally-not-a-real-kind", foo: 1 }],
  })
  if (bad.success) {
    fail("expected unknown block kind to be rejected, but parse succeeded")
  }
  ok("schema (unknown block kind rejected)")
}

console.log("component-docs checks passed")
