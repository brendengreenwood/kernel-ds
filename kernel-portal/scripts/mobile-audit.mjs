// Mobile usability scan — the check CLAUDE.md asks for after layout changes.
//
// Scans one or more URLs at a 390x844 coarse-pointer viewport and reports:
//   1. horizontal page overflow (document wider than the viewport)
//   2. content clipped by an overflow-hidden ancestor (columns/buttons cut
//      off with no way to scroll to them — overflow-x auto/scroll is fine)
//   3. text controls under 16px (iOS Safari zooms the page on focus)
//   4. interactive elements whose *effective* hit area is under 44px —
//      measured via elementFromPoint just outside the box, so the invisible
//      pseudo-element extensions from decision 0007 count
//
// Requires playwright with a chromium (not a package dependency — heavy):
//   npx playwright install chromium   # once
//   node scripts/mobile-audit.mjs http://localhost:5173 [more urls...]
// Env: PW_EXECUTABLE to point at an existing chromium binary.
//
// Exits non-zero if (1) or (2) finds anything; (3) and (4) print as counts.

import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
let chromium
try {
  ;({ chromium } = require('playwright'))
} catch {
  console.error('playwright not found — npm i -D playwright (or run where it is installed globally)')
  process.exit(2)
}

const urls = process.argv.slice(2)
if (urls.length === 0) {
  console.error('usage: node scripts/mobile-audit.mjs <url> [url...]')
  process.exit(2)
}

const browser = await chromium.launch(
  process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : {}
)
let failures = 0

for (const url of urls) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 2,
  })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)

  const report = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const out = { overflow: document.documentElement.scrollWidth - vw, clipped: [], smallFonts: 0, smallTaps: [] }

    const cls = (el) =>
      String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className).slice(0, 60)

    // 2. clipped content
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      if (el.closest('[data-slot="carousel-item"], [data-slot="carousel-content"]')) continue
      let p = el.parentElement
      while (p && p !== document.body) {
        const ox = getComputedStyle(p).overflowX
        if (ox === 'auto' || ox === 'scroll') { p = null; break }
        if (ox === 'hidden' || ox === 'clip') break
        p = p.parentElement
      }
      if (!p || p === document.body) continue
      const pr = p.getBoundingClientRect()
      // right-edge only: left-edge overhang is the InputGroup leading-addon
      // pattern (input starts under the icon) and carousel tracks — by design
      // ≤8px right overhang is deliberate edge-bleed (full-bleed separators)
      if (r.right > pr.right + 8) {
        out.clipped.push({ tag: el.tagName, cls: cls(el), over: Math.round(r.right - pr.right) })
      }
    }
    out.clipped = out.clipped.slice(0, 20)

    // 3. sub-16px text controls. Skip inputs the user can never type in —
    // Base UI form-syncs each Select through a visually-hidden aria-hidden
    // input (tabindex -1), which is not an iOS zoom target and was producing
    // false positives on every default-size select.
    for (const el of document.querySelectorAll(
      'input:not([type=checkbox]):not([type=radio]):not([type=range]), select, textarea'
    )) {
      if (el.getAttribute('aria-hidden') === 'true' || el.tabIndex === -1) continue
      const r = el.getBoundingClientRect()
      if (r.width && r.height && parseFloat(getComputedStyle(el).fontSize) < 16) out.smallFonts++
    }

    // 4. effective hit area (samples up to 200 visible interactive elements)
    const interactive = [...document.querySelectorAll('a[href], button, input, [role="button"], [role="switch"]')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        // skip visually-hidden / sr-only controls and off-canvas chrome
        return r.width > 3 && r.height > 3 && getComputedStyle(el).visibility !== 'hidden'
      })
      .slice(0, 200)
    for (const el of interactive) {
      const r = el.getBoundingClientRect()
      if (Math.min(r.width, r.height) >= 44) continue
      el.scrollIntoView({ block: 'center', behavior: 'instant' })
      const b = el.getBoundingClientRect()
      const probe = (x, y) => {
        const hit = document.elementFromPoint(x, y)
        if (!hit) return false
        if (hit === el || el.contains(hit) || hit.contains(el)) return true
        // contested space: the point lands on another tappable control, so
        // the gap is shared between adjacent targets rather than dead
        return !!hit.closest('a[href], button, input, [role="button"], [role="switch"], label')
      }
      const pad = (44 - Math.min(b.width, b.height)) / 2
      const ok =
        b.height >= 44 || (probe(b.left + b.width / 2, b.top - pad + 2) && probe(b.left + b.width / 2, b.bottom + pad - 2))
      if (!ok) out.smallTaps.push({ tag: el.tagName, cls: cls(el), h: Math.round(b.height) })
    }
    const seen = {}
    out.smallTaps = out.smallTaps.filter((t) => { const k = t.tag + t.cls; if (seen[k]) return false; seen[k] = 1; return true }).slice(0, 20)
    return out
  })

  console.log(`\n=== ${url} ===`)
  console.log(`horizontal overflow: ${report.overflow}px`)
  console.log(`clipped content: ${report.clipped.length}`)
  report.clipped.forEach((c) => console.log(`  ${c.tag}.${c.cls} +${c.over}px`))
  console.log(`text controls < 16px: ${report.smallFonts}`)
  console.log(`hit areas < 44px (after decision-0007 extensions): ${report.smallTaps.length}`)
  report.smallTaps.forEach((t) => console.log(`  ${t.tag}.${t.cls} h=${t.h}`))
  if (report.overflow > 0 || report.clipped.length > 0) failures++
  await ctx.close()
}

await browser.close()
process.exit(failures ? 1 : 0)
