#!/usr/bin/env node
/**
 * Kernel contrast audit — WCAG 2.x contrast ratios for the token pairings the
 * system actually renders (role pairs, Badge/Alert soft fills, StatusBadge
 * variants), in light and dark mode.
 *
 * Reads the packaged stylesheet (packages/ui/src/styles.css — the portal
 * consumes the DS at source), resolves oklch tokens via culori, and emits a
 * markdown report on stdout:
 *
 *   node scripts/contrast-audit.mjs > ../docs/a11y/report.md
 *
 * Alpha fills (e.g. dark `bg-info-900/45`) are composited over their backing
 * color in gamma-encoded sRGB before measuring, matching browser behavior.
 * For failing pairs the script suggests the minimal oklch lightness change to
 * the foreground token that reaches AA 4.5:1.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { converter, parse } from "culori";

const CSS_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "packages", "ui", "src", "styles.css");
const AA_NORMAL = 4.5;
const AA_LARGE = 3;

const toRgb = converter("rgb");

function parseTokens(css) {
  const light = {};
  const darkOverrides = {};
  const ruleRe = /(:root|\.dark)\s*\{([^}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(css)) !== null) {
    const target = m[1] === ".dark" ? darkOverrides : light;
    const declRe = /--([\w-]+)\s*:\s*([^;]+);/g;
    let d;
    while ((d = declRe.exec(m[2])) !== null) target[d[1]] = d[2].trim();
  }
  return { light, dark: { ...light, ...darkOverrides } };
}

function resolve(tokens, name, seen = new Set()) {
  if (seen.has(name)) throw new Error(`circular token: ${name}`);
  seen.add(name);
  const value = tokens[name];
  if (value === undefined) throw new Error(`unknown token: ${name}`);
  const ref = value.match(/^var\(--([\w-]+)\)$/);
  return ref ? resolve(tokens, ref[1], seen) : value;
}

function srgb(cssColor) {
  const c = toRgb(parse(cssColor));
  if (!c) throw new Error(`unparseable color: ${cssColor}`);
  const clamp = (v) => Math.min(1, Math.max(0, v));
  return { r: clamp(c.r), g: clamp(c.g), b: clamp(c.b) };
}

function token(tokens, name) {
  return srgb(resolve(tokens, name));
}

function composite(fg, alpha, bg) {
  const mix = (a, b) => alpha * a + (1 - alpha) * b;
  return { r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b) };
}

function luminance({ r, g, b }) {
  const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Minimal |ΔL| on the fg token's oklch lightness that reaches AA 4.5:1. */
function suggestLightness(tokens, fgName, bg) {
  const raw = resolve(tokens, fgName);
  const oklchMatch = raw.match(/^oklch\(([\d.]+)\s/);
  if (!oklchMatch) return null;
  const currentL = Number(oklchMatch[1]);
  const withL = (L) => srgb(raw.replace(/^oklch\([\d.]+/, `oklch(${L.toFixed(4)}`));
  const darken = luminance(withL(currentL)) < luminance(bg);
  const limit = darken ? 0 : 1;
  if (contrast(withL(limit), bg) < AA_NORMAL) return null;
  let lo = darken ? limit : currentL;
  let hi = darken ? currentL : limit;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const passes = contrast(withL(mid), bg) >= AA_NORMAL;
    if (darken) passes ? (lo = mid) : (hi = mid);
    else passes ? (hi = mid) : (lo = mid);
  }
  const L = darken ? lo : hi;
  return { from: currentL, to: L, direction: darken ? "darken" : "lighten" };
}

const css = readFileSync(CSS_PATH, "utf8");
const { light, dark } = parseTokens(css);

const rows = [];
function check({ group, label, mode, fgToken, bg, bgLabel }) {
  const tokens = mode === "dark" ? dark : light;
  const fg = token(tokens, fgToken);
  const ratio = contrast(fg, bg);
  const suggestion = ratio < AA_NORMAL ? suggestLightness(tokens, fgToken, bg) : null;
  rows.push({ group, label, mode, bgLabel, ratio, suggestion, fgToken });
}

function bgOf(mode, name) {
  return token(mode === "dark" ? dark : light, name);
}

function softFill(mode, family, step, alpha, backing) {
  const tokens = mode === "dark" ? dark : light;
  const fill = token(tokens, `${family}-${step}`);
  return alpha === 1 ? fill : composite(fill, alpha, bgOf(mode, backing));
}

/* ---- (a) role pairs ---- */
const rolePairs = [
  ["primary-foreground", "primary"],
  ["secondary-foreground", "secondary"],
  ["accent-foreground", "accent"],
  ["destructive-foreground", "destructive"],
  ["muted-foreground", "muted"],
  ["muted-foreground", "background"],
  ["muted-foreground", "card"],
  ["foreground", "background"],
  ["foreground", "card"],
];
for (const mode of ["light", "dark"]) {
  for (const [fg, bg] of rolePairs) {
    check({
      group: "Role pairs",
      label: `--${fg} on --${bg}`,
      mode,
      fgToken: fg,
      bg: bgOf(mode, bg),
      bgLabel: `--${bg}`,
    });
  }
}

/* ---- (b) Badge + Alert soft fills (actual component classes) ---- */
const families = ["success", "warning", "error", "info"];
for (const family of families) {
  const lightText = family === "warning" ? "900" : "800";
  check({
    group: "Badge soft fills",
    label: `${family}: text-${family}-${lightText} on bg-${family}-100`,
    mode: "light",
    fgToken: `${family}-${lightText}`,
    bg: softFill("light", family, "100", 1),
    bgLabel: `${family}-100`,
  });
  check({
    group: "Badge soft fills",
    label: `${family}: text-${family}-100 on bg-${family}-900/45 over --card`,
    mode: "dark",
    fgToken: `${family}-100`,
    bg: softFill("dark", family, "900", 0.45, "card"),
    bgLabel: `${family}-900/45 ⊕ card`,
  });
  check({
    group: "Alert soft fills",
    label: `${family}: text-${family}-${lightText} on bg-${family}-50`,
    mode: "light",
    fgToken: `${family}-${lightText}`,
    bg: softFill("light", family, "50", 1),
    bgLabel: `${family}-50`,
  });
  const lightDesc = family === "warning" ? "800" : "700";
  check({
    group: "Alert soft fills",
    label: `${family}: description text-${family}-${lightDesc} on bg-${family}-50`,
    mode: "light",
    fgToken: `${family}-${lightDesc}`,
    bg: softFill("light", family, "50", 1),
    bgLabel: `${family}-50`,
  });
  check({
    group: "Alert soft fills",
    label: `${family}: text-${family}-100 on bg-${family}-900/30 over --card`,
    mode: "dark",
    fgToken: `${family}-100`,
    bg: softFill("dark", family, "900", 0.3, "card"),
    bgLabel: `${family}-900/30 ⊕ card`,
  });
  check({
    group: "Alert soft fills",
    label: `${family}: description text-${family}-200 on bg-${family}-900/30 over --card`,
    mode: "dark",
    fgToken: `${family}-200`,
    bg: softFill("dark", family, "900", 0.3, "card"),
    bgLabel: `${family}-900/30 ⊕ card`,
  });
}

/* ---- (c) StatusBadge variants (from status-badge.tsx) ---- */
const statusVariants = [
  { status: "draft", family: "neutral", lightText: "800", darkBg: ["800", 0.5] },
  { status: "pending", family: "info", lightText: "800", darkBg: ["900", 0.45] },
  { status: "booked", family: "viz-plum", lightText: "800", darkBg: ["900", 0.45] },
  { status: "in_transit", family: "warning", lightText: "900", darkBg: ["900", 0.45] },
  { status: "delivered", family: "viz-teal", lightText: "800", darkBg: ["900", 0.45] },
  { status: "settled", family: "success", lightText: "800", darkBg: ["900", 0.45] },
  { status: "on_hold", family: "viz-clay", lightText: "900", darkBg: ["900", 0.45] },
  { status: "rejected", family: "error", lightText: "800", darkBg: ["900", 0.45] },
  { status: "cancelled", family: "viz-slate", lightText: "800", darkBg: ["900", 0.45] },
  { status: "expired", family: "viz-rust", lightText: "800", darkBg: ["900", 0.45] },
];
for (const { status, family, lightText, darkBg } of statusVariants) {
  check({
    group: "StatusBadge",
    label: `${status}: text-${family}-${lightText} on bg-${family}-100`,
    mode: "light",
    fgToken: `${family}-${lightText}`,
    bg: softFill("light", family, "100", 1),
    bgLabel: `${family}-100`,
  });
  const [step, alpha] = darkBg;
  check({
    group: "StatusBadge",
    label: `${status}: text-${family}-100 on bg-${family}-${step}/${alpha * 100} over --card`,
    mode: "dark",
    fgToken: `${family}-100`,
    bg: softFill("dark", family, step, alpha, "card"),
    bgLabel: `${family}-${step}/${alpha * 100} ⊕ card`,
  });
}

/* ---- (d) CommodityBadge variants (from commodity-badge.tsx, decision 0013) ---- */
const commodityVariants = [
  { commodity: "corn", family: "commodity-corn" },
  { commodity: "canola", family: "commodity-canola" },
  { commodity: "soybeans", family: "commodity-soy" },
  { commodity: "wheat", family: "commodity-wheat" },
];
for (const { commodity, family } of commodityVariants) {
  check({
    group: "CommodityBadge",
    label: `${commodity}: text-${family}-900 on bg-${family}-100`,
    mode: "light",
    fgToken: `${family}-900`,
    bg: softFill("light", family, "100", 1),
    bgLabel: `${family}-100`,
  });
  check({
    group: "CommodityBadge",
    label: `${commodity}: text-${family}-100 on bg-${family}-900/45 over --card`,
    mode: "dark",
    fgToken: `${family}-100`,
    bg: softFill("dark", family, "900", 0.45, "card"),
    bgLabel: `${family}-900/45 ⊕ card`,
  });
}

/* ---- report ---- */
const fmt = (r) => r.toFixed(2) + ":1";
const mark = (ok) => (ok ? "pass" : "**FAIL**");
const failures = rows.filter((r) => r.ratio < AA_NORMAL);

console.log(`# Kernel contrast audit`);
console.log(`\nSource: \`packages/ui/src/styles.css\` · thresholds: AA normal ${AA_NORMAL}:1, AA large/UI ${AA_LARGE}:1`);
console.log(`\n${rows.length} pairs checked · ${failures.length} below AA ${AA_NORMAL}:1 · ${rows.filter((r) => r.ratio < AA_LARGE).length} below AA ${AA_LARGE}:1\n`);

let currentGroup = null;
for (const row of rows.slice().sort((a, b) => a.group.localeCompare(b.group))) {
  if (row.group !== currentGroup) {
    currentGroup = row.group;
    console.log(`\n## ${currentGroup}\n`);
    console.log(`| Pair | Mode | Ratio | AA 4.5:1 | AA 3:1 |`);
    console.log(`| --- | --- | ---: | :---: | :---: |`);
  }
  console.log(
    `| ${row.label} | ${row.mode} | ${fmt(row.ratio)} | ${mark(row.ratio >= AA_NORMAL)} | ${mark(row.ratio >= AA_LARGE)} |`
  );
}

if (failures.length) {
  console.log(`\n## Suggested foreground lightness fixes (to reach ${AA_NORMAL}:1)\n`);
  console.log(`| Pair | Mode | Ratio | Suggestion |`);
  console.log(`| --- | --- | ---: | --- |`);
  for (const row of failures) {
    const s = row.suggestion;
    const text = s
      ? `${s.direction} \`--${row.fgToken}\` L ${s.from.toFixed(3)} → ${s.to.toFixed(3)} (ΔL ${(s.to - s.from >= 0 ? "+" : "")}${(s.to - s.from).toFixed(3)})`
      : "not reachable by L alone — change the pairing";
    console.log(`| ${row.label} | ${row.mode} | ${fmt(row.ratio)} | ${text} |`);
  }
}
