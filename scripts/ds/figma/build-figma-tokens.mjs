// Parse packages/ui/src/styles.css design tokens into a Figma-ready payload.
// Output: docs/figma/tokens-build.json
//   { semantic: [{name, light, dark}], primitives: [{name, value|alias}], metrics: [{name, value}] }
// Colors are converted OKLCH -> sRGB hex (gamut-clamped). Aliases (var(--x)) are
// kept as {path} references resolved against primitive names.
// Skipped: @theme mirrors (--color-*), font stacks, shadows, easing curves.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const css = readFileSync("packages/ui/src/styles.css", "utf8");

// --- extract top-level :root / .dark blocks (not inside @theme/@media) ---
function topLevelBlocks(selector) {
  const blocks = [];
  let depth = 0;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    if (depth === 0 && css.startsWith(selector, i)) {
      const rest = css.slice(i + selector.length);
      const m = rest.match(/^\s*\{/);
      if (m) {
        const start = i + selector.length + m[0].length;
        let d = 1, j = start;
        while (d > 0 && j < css.length) {
          if (css[j] === "{") d++;
          else if (css[j] === "}") d--;
          j++;
        }
        blocks.push(css.slice(start, j - 1));
        i = j;
      }
    }
  }
  return blocks;
}

function parseVars(block) {
  const out = {};
  for (const m of block.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    out[m[1]] = m[2].trim();
  }
  return out;
}

const rootVars = Object.assign({}, ...topLevelBlocks(":root").map(parseVars));
const darkVars = Object.assign({}, ...topLevelBlocks(".dark").map(parseVars));

// --- oklch -> hex ---
function oklchToHex(str) {
  const m = str.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!m) return null;
  const [L, C, H] = [+m[1], +m[2], +m[3]];
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr), b = C * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l3 = l_ ** 3, m3 = m_ ** 3, s3 = s_ ** 3;
  let r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;
  const toSrgb = (c) => {
    c = Math.min(1, Math.max(0, c));
    return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  };
  const hex = (c) =>
    Math.round(toSrgb(c) * 255).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(bl)}`.toUpperCase();
}

const SKIP = /^(color-|font-|shadow|ease-|elev-|letter-spacing|tracking)/;
const SEMANTIC = new Set([
  "background","foreground","card","card-foreground","popover","popover-foreground",
  "primary","primary-foreground","secondary","secondary-foreground","muted",
  "muted-foreground","accent","accent-foreground","destructive",
  "destructive-foreground","border","input","ring",
  "chart-1","chart-2","chart-3","chart-4","chart-5",
  "sidebar","sidebar-foreground","sidebar-primary","sidebar-primary-foreground",
  "sidebar-accent","sidebar-accent-foreground","sidebar-border","sidebar-ring",
]);
const METRIC = /^(radius$|panel-radius$|panel-inset$|control-h|duration-|spacing$)/;

function toPath(name) {
  let m = name.match(/^(brand|lime|neutral|success|warning|error|info)-(\d+)$/);
  if (m) return `${m[1]}/${m[2]}`;
  m = name.match(/^(viz|commodity)-([a-z]+)(?:-(\w+))?$/);
  if (m) return `${m[1]}/${m[2]}/${m[3] ?? "base"}`;
  return name;
}

function toFloat(v) {
  let m = v.match(/^([\d.]+)rem$/);
  if (m) return +m[1] * 16;
  m = v.match(/^([\d.]+)(px|ms)$/);
  if (m) return +m[1];
  return null;
}

function resolveValue(name, vars, seen = new Set()) {
  if (seen.has(name)) return null;
  seen.add(name);
  const value = vars[name];
  if (!value) return null;
  const alias = value.match(/^var\(--([\w-]+)\)$/);
  return alias ? resolveValue(alias[1], vars, seen) : value;
}

function aliasPath(value) {
  const match = value?.match(/^var\(--([\w-]+)\)$/);
  return match ? toPath(match[1]) : null;
}

function metricValue(name, value) {
  const literal = toFloat(value);
  if (literal !== null) return literal;
  if (name === "panel-radius") {
    return toFloat(rootVars.radius) + toFloat(rootVars.spacing) * 1.5;
  }
  if (name === "panel-inset") return toFloat(rootVars.spacing) * 3;
  return null;
}

const semantic = [], primitives = [], metrics = [], skipped = [];
for (const [name, value] of Object.entries(rootVars)) {
  if (SKIP.test(name)) continue;
  if (SEMANTIC.has(name)) {
    const darkSource = darkVars[name] ?? value;
    const light = oklchToHex(resolveValue(name, rootVars));
    const dark = oklchToHex(resolveValue(name, { ...rootVars, ...darkVars }));
    if (light && dark) {
      semantic.push({
        name,
        light,
        dark,
        ...(aliasPath(value) ? { lightAlias: aliasPath(value) } : {}),
        ...(aliasPath(darkSource) ? { darkAlias: aliasPath(darkSource) } : {}),
      });
    } else skipped.push(name);
  } else if (METRIC.test(name)) {
    const v = metricValue(name, value);
    if (v !== null) metrics.push({ name, value: v });
    else skipped.push(name);
  } else {
    const aliasM = value.match(/^var\(--([\w-]+)\)$/);
    if (aliasM) primitives.push({ name: toPath(name), alias: toPath(aliasM[1]) });
    else {
      const hex = oklchToHex(value);
      if (hex) primitives.push({ name: toPath(name), value: hex });
      else skipped.push(name);
    }
  }
}

mkdirSync("docs/figma", { recursive: true });
writeFileSync(
  "docs/figma/tokens-build.json",
  JSON.stringify({ semantic, primitives, metrics, skipped }, null, 2)
);
console.log(
  `semantic=${semantic.length} primitives=${primitives.length} metrics=${metrics.length} skipped=${skipped.length}`
);
console.log("skipped:", skipped.join(", ") || "(none)");
