// Touch-target slot coverage (decisions 0007 + 0009).
//
// The coarse-pointer block in packages/ui/src/styles.css is a hand-maintained
// list of `data-slot` names. Nothing checked that list against the slots the
// DS actually ships, and three controls were found missing from it by hand,
// one at a time, each after it had already shipped:
//
//   select-trigger  (register 4.7)   compact select stuck at a 40px target
//   tabs-trigger    (register 4.11)  every compact tab strip at 40px
//   dialog-close    (register 4.12)  40x40, no growth AND no extension
//
// All three share one cause. A control is rendered as a `Button`, but the
// element in the document does not carry `data-slot="button"`:
//
//   <DialogPrimitive.Close data-slot="dialog-close" render={<Button size="icon-sm" />} />
//
// Base UI's `render` merges the two, and `Button` writes its own
// `data-slot="button"` BEFORE spreading `{...props}` — so the caller's slot
// wins. Every rule keyed on `[data-slot="button"]` silently misses the
// element. It is a button by every measure except the one the stylesheet uses.
//
// This gate finds those elements statically and asserts each one is either
// named in the coarse-pointer block or exempted here with a reason. It does
// not measure anything — `mobile-audit` does that, at runtime, on whatever
// happens to be on screen. The two are complementary, and this one catches
// what the other structurally cannot: `sheet-close` was found by this script
// while being `display: none` on every page in both surfaces.
//
//   node scripts/ds/check-touch-slots.mjs

import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const COMPONENTS = join(ROOT, 'packages/ui/src/components/ui')
const STYLES = join(ROOT, 'packages/ui/src/styles.css')

/** Slots that render a button and are deliberately NOT in the coarse block.
    Each needs a reason that says how the 44px floor is met, or why it does
    not apply. "It looked fine" is not one. */
const EXEMPT = {
  'sidebar-rail':
    'Pointer-only resize strip: `hidden` until `sm:flex`, so it does not exist ' +
    'at phone widths, and `tabIndex={-1}` keeps it out of the tab order. It is ' +
    'an affordance for a mouse edge-drag, not a tap target.',
  'alert-dialog-action':
    'Reaches the floor through the control-height token rather than a rule — ' +
    '--control-h itself grows to 44px on coarse pointers (decision 0010). ' +
    'Measured 44px at 390px in /components/dialog. Revisit if it is ever ' +
    'shipped at size="sm", which lands at 40px.',
  'alert-dialog-cancel':
    'Same as alert-dialog-action: 44px at 390px by the token, measured, not ' +
    'assumed. Same caveat at size="sm".',
}

/** The opening tag carrying this data-slot: back to its `<`, forward to the
    `>` that ends the attribute list. Brace depth is tracked so a nested
    `render={<Button/>}` does not terminate the scan early — that nesting is
    the whole point of the check. */
function openingTag(src, at) {
  const start = src.lastIndexOf('<', at)
  let depth = 0
  let i = start + 1
  for (; i < src.length; i++) {
    const c = src[i]
    if (c === '{') depth++
    else if (c === '}') depth--
    else if (c === '>' && depth === 0) break
  }
  return src.slice(start, i + 1)
}

const found = []
for (const file of readdirSync(COMPONENTS).filter((f) => f.endsWith('.tsx'))) {
  const src = readFileSync(join(COMPONENTS, file), 'utf8')
  const re = /data-slot="([a-z0-9-]+)"/g
  let m
  while ((m = re.exec(src))) {
    const slot = m[1]
    if (slot === 'button') continue
    const tag = openingTag(src, m.index)
    // Three ways a button ends up wearing another slot name, all of them
    // real in this codebase:
    //   render={<Button/>}  Base UI merges and the outer slot wins
    //   <Button data-slot>  Button writes its slot before spreading props
    //   <button>            a native element that simply was not named `button`
    const via = /render=\{\s*<Button\b/.test(tag)
      ? 'render={<Button'
      : /^<Button[\s>]/.test(tag)
        ? '<Button'
        : /^<button[\s>]/.test(tag)
          ? '<button'
          : null
    if (!via) continue
    found.push({ slot, file, via })
  }
}

// Slot names anywhere inside the `@media (pointer: coarse)` block. Deliberately
// coarse itself: growth and the ::after extension are both valid answers, and
// which one a control should take is a judgment the block's comments carry.
const styles = readFileSync(STYLES, 'utf8')
const at = styles.indexOf('@media (pointer: coarse)')
if (at === -1) {
  console.error('FAIL: no `@media (pointer: coarse)` block in packages/ui/src/styles.css')
  process.exit(1)
}
let depth = 0
let end = at
for (let i = styles.indexOf('{', at); i < styles.length; i++) {
  if (styles[i] === '{') depth++
  else if (styles[i] === '}' && --depth === 0) { end = i; break }
}
const block = styles.slice(at, end)
const covered = new Set([...block.matchAll(/data-slot="([a-z0-9-]+)"/g)].map((m) => m[1]))

const uncovered = found.filter((f) => !covered.has(f.slot) && !(f.slot in EXEMPT))
const exempted = found.filter((f) => f.slot in EXEMPT)

console.log(`touch-slot coverage — ${found.length} button-rendering slots that are not \`button\``)
for (const f of found) {
  const state = covered.has(f.slot) ? 'in coarse block' : f.slot in EXEMPT ? 'exempt' : 'UNCOVERED'
  console.log(`  ${f.slot.padEnd(22)} ${f.via.padEnd(16)} ${state}`)
}

// An exemption for a slot that no longer exists is stale documentation that
// reads as coverage — it should fail as loudly as a missing rule.
const stale = Object.keys(EXEMPT).filter((s) => !found.some((f) => f.slot === s))
if (stale.length) {
  console.error(`\nFAIL: EXEMPT names ${stale.length} slot(s) that no longer render a button: ${stale.join(', ')}`)
  console.error('Remove them — an exemption nobody can trace reads as coverage.')
  process.exit(1)
}

if (uncovered.length) {
  console.error(`\nFAIL: ${uncovered.length} slot(s) render a button and are neither covered nor exempt:\n`)
  for (const f of uncovered) {
    console.error(`  [data-slot="${f.slot}"]  (${f.file}, via ${f.via})`)
  }
  console.error(
    '\nEach one is a control that every `[data-slot="button"]` rule misses.\n' +
      'Either add it to the coarse-pointer block in packages/ui/src/styles.css\n' +
      '(growth for primary controls, the ::after extension for ones that stay\n' +
      'small by design), or add it to EXEMPT in this file with a reason that\n' +
      'says how it meets the 44px floor.'
  )
  process.exit(1)
}

console.log(
  `\nTOUCH-SLOTS-OK: ${found.length - exempted.length} covered, ${exempted.length} exempt, 0 uncovered`
)
