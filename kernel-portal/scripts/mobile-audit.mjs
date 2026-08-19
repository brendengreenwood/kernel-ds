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
//   5. reachability — whether the page offers any way to leave it at this
//      width (decision 0007's "navigation at every width")
//
// Why (5) exists. For most of the v2 prototype's life this script reported
// 0/0/0/0 on a phone while the app had NO navigation at all below `md`: the
// DS renders the sidebar as an off-canvas Sheet, and the only control that
// opens it lives inside that Sheet. Every check above measures how comfortable
// a control is to hit; none of them asks whether there is a control. A page
// with nothing on it passes 1 through 4 perfectly.
//
// Requires playwright with a chromium (not a package dependency — heavy):
//   npx playwright install chromium   # once
//   node scripts/mobile-audit.mjs http://localhost:5173 [more urls...]
// Env: PW_EXECUTABLE to point at an existing chromium binary.
//
// Exits non-zero if (1), (2) or (5) finds a problem; (3) and (4) print as
// counts.

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
        const style = getComputedStyle(el)
        // skip visually-hidden / sr-only controls, off-canvas chrome, and
        // controls intentionally removed from interaction in their resting state
        return r.width > 3 && r.height > 3 && style.visibility !== 'hidden' && style.opacity !== '0' && style.pointerEvents !== 'none'
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
        // The extension is a pseudo-element, so a point it covers resolves to
        // its originating element — `hit === el` is what a working extension
        // looks like from here.
        if (hit === el || el.contains(hit)) return true
        // `hit.contains(el)` used to pass too, and that was the check's
        // biggest hole: a point just outside a control almost always lands on
        // the control's own container, which contains it, so nearly everything
        // passed. Hitting an ancestor is the definition of dead space — the
        // tap goes to the wrapper, not the control.
        //
        // Contested space is still fine: the point lands on a DIFFERENT
        // tappable control, so the gap is shared between neighbours rather
        // than dead.
        return !!hit.closest('a[href], button, input, [role="button"], [role="switch"], label')
      }
      const pad = (44 - Math.min(b.width, b.height)) / 2
      // Probe just inside the extension's outer edge. The inset has to scale
      // with the gap: it used to be a flat 2px, which for anything 40px or
      // taller pushed the probe back INSIDE the element (pad is 2 at 40px, so
      // `-pad + 2` is the top edge itself) and passed it unconditionally. That
      // blind band sat exactly on the DS's compact-40px tier, which is why
      // select-trigger, tabs-trigger, dialog-close and sidebar-trigger all
      // measured 40px here and were reported as fine.
      const inset = Math.min(2, pad / 2)
      const ok =
        b.height >= 44 ||
        (probe(b.left + b.width / 2, b.top - pad + inset) && probe(b.left + b.width / 2, b.bottom + pad - inset))
      if (!ok) out.smallTaps.push({ tag: el.tagName, cls: cls(el), h: Math.round(b.height) })
    }
    const seen = {}
    out.smallTaps = out.smallTaps.filter((t) => { const k = t.tag + t.cls; if (seen[k]) return false; seen[k] = 1; return true }).slice(0, 20)

    // 5. reachability. An exit is either a link to a DIFFERENT in-app route,
    // or a visible control that opens the navigation chrome. Both count: a
    // hamburger is a legitimate answer, an off-canvas rail with no opener is
    // not.
    const norm = (p) => p.replace(/\/+$/, '') || '/'
    const here = norm(location.pathname)
    const onScreen = (el) => {
      const r = el.getBoundingClientRect()
      if (r.width < 3 || r.height < 3) return false
      const st = getComputedStyle(el)
      if (st.visibility === 'hidden' || st.opacity === '0' || st.pointerEvents === 'none') return false
      // A closed Sheet is the exact failure this check exists for: its links
      // are in the DOM and laid out, just parked off the left edge or marked
      // inert. Horizontal only — a footer link below the fold is reachable by
      // scrolling, an off-canvas rail is not reachable by anything.
      if (r.right <= 0 || r.left >= vw) return false
      return !el.closest('[inert], [aria-hidden="true"]')
    }
    const exits = []
    for (const a of document.querySelectorAll('a[href]')) {
      if (!onScreen(a)) continue
      let u
      try { u = new URL(a.getAttribute('href'), location.href) } catch { continue }
      if (u.origin !== location.origin || norm(u.pathname) === here) continue
      exits.push({ kind: 'link', to: norm(u.pathname), label: (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 24) })
    }
    // The DS's own nav opener. Named explicitly rather than sniffed: a
    // heuristic over "buttons that might open something" would let the next
    // no-navigation page pass by accident, which is the whole failure mode.
    for (const t of document.querySelectorAll('[data-slot="sidebar-trigger"]')) {
      if (onScreen(t)) exits.push({ kind: 'nav-trigger', label: t.getAttribute('aria-label') || 'sidebar trigger' })
    }
    out.exits = exits.slice(0, 8)
    out.exitCount = exits.length
    return out
  })

  console.log(`\n=== ${url} ===`)
  console.log(`horizontal overflow: ${report.overflow}px`)
  console.log(`clipped content: ${report.clipped.length}`)
  report.clipped.forEach((c) => console.log(`  ${c.tag}.${c.cls} +${c.over}px`))
  console.log(`text controls < 16px: ${report.smallFonts}`)
  console.log(`hit areas < 44px (after decision-0007 extensions): ${report.smallTaps.length}`)
  report.smallTaps.forEach((t) => console.log(`  ${t.tag}.${t.cls} h=${t.h}`))
  console.log(`ways off this page: ${report.exitCount}`)
  if (report.exitCount === 0) {
    console.log('  FAIL: no visible link to another route and no nav trigger at 390px')
  } else {
    report.exits.forEach((e) => console.log(`  ${e.kind}${e.to ? ` → ${e.to}` : ''}${e.label ? ` (${e.label})` : ''}`))
  }
  if (report.overflow > 0 || report.clipped.length > 0 || report.exitCount === 0) failures++
  await ctx.close()
}

await browser.close()
process.exit(failures ? 1 : 0)
