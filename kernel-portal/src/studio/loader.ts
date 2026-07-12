import { transform } from "sucrase"
import { screenUrl } from "./manifest"

/**
 * Runtime loader for Kernel Studio prototypes.
 *
 * Loads the ds-bundle browser runtime once (same order as the ds-bundle
 * harnesses: styles.css, _ds_bundle.css, _vendor/react.js, _vendor/react-dom.js,
 * _ds_bundle.js), then fetches prototype screen .jsx files, transpiles them with
 * sucrase in the browser, and mounts them with the VENDORED ReactDOM into
 * dedicated container nodes.
 *
 * Two Reacts coexist by design: the portal's React 19 renders the studio shell;
 * the ds-bundle's vendored React renders prototype subtrees. Never mount a
 * prototype into the portal's React tree.
 */

interface VendorReact {
  createElement: (type: unknown, props: unknown, ...children: unknown[]) => unknown
}

interface VendorRoot {
  render(node: unknown): void
  unmount(): void
}

interface VendorReactDOM {
  createRoot(container: Element): VendorRoot
}

export interface KernelRuntime {
  Kernel: Record<string, unknown>
  React: VendorReact
  ReactDOM: VendorReactDOM
}

export interface ScreenProps {
  navigate: (screenId: string) => void
  Kernel: Record<string, unknown>
}

export type ScreenComponent = (props: ScreenProps) => unknown

const DS_BUNDLE_BASE = "/ds-bundle"

function vendorWindow(): { Kernel?: Record<string, unknown>; React?: VendorReact; ReactDOM?: VendorReactDOM } {
  return window as unknown as { Kernel?: Record<string, unknown>; React?: VendorReact; ReactDOM?: VendorReactDOM }
}

function injectStylesheet(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`link[href="${href}"]`)
    if (existing) return resolve()
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = href
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to load stylesheet ${href}`))
    document.head.appendChild(link)
  })
}

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) return resolve()
    const script = document.createElement("script")
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script ${src}`))
    document.head.appendChild(script)
  })
}

let runtimePromise: Promise<KernelRuntime> | null = null

export function loadKernelRuntime(): Promise<KernelRuntime> {
  runtimePromise ??= (async () => {
    await Promise.all([
      injectStylesheet(`${DS_BUNDLE_BASE}/styles.css`),
      injectStylesheet(`${DS_BUNDLE_BASE}/_ds_bundle.css`),
    ])
    // Scripts are order-dependent: react -> react-dom -> bundle.
    await injectScript(`${DS_BUNDLE_BASE}/_vendor/react.js`)
    await injectScript(`${DS_BUNDLE_BASE}/_vendor/react-dom.js`)
    await injectScript(`${DS_BUNDLE_BASE}/_ds_bundle.js`)

    const { Kernel, React, ReactDOM } = vendorWindow()
    if (!Kernel || !React || !ReactDOM) {
      throw new Error("ds-bundle runtime did not initialize (window.Kernel / React / ReactDOM missing)")
    }
    return { Kernel, React, ReactDOM }
  })()
  return runtimePromise
}

const moduleCache = new Map<string, ScreenComponent>()

/**
 * Fetch a screen's .jsx source, transpile with sucrase, and evaluate it.
 * The module's default export is the Screen component. `React` in the
 * evaluated scope is the VENDORED React global.
 */
export async function loadScreenComponent(prototypeId: string, screenFile: string): Promise<ScreenComponent> {
  const url = screenUrl(prototypeId, screenFile)
  const cached = moduleCache.get(url)
  if (cached) return cached

  const runtime = await loadKernelRuntime()
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch screen ${url}: ${res.status}`)
  const source = await res.text()

  const compiled = transform(source, { transforms: ["jsx", "imports"], production: true }).code
  const moduleShim: { exports: Record<string, unknown> } = { exports: {} }
  const requireShim = (specifier: string) => {
    throw new Error(`Prototype screens may not import modules (tried to import "${specifier}")`)
  }
  const evaluate = new Function("module", "exports", "require", "React", compiled) as (
    module: unknown,
    exports: unknown,
    require: unknown,
    react: VendorReact,
  ) => void
  evaluate(moduleShim, moduleShim.exports, requireShim, runtime.React)

  const component = moduleShim.exports.default
  if (typeof component !== "function") {
    throw new Error(`Screen module ${screenFile} has no default-exported function component`)
  }
  const screen = component as ScreenComponent
  moduleCache.set(url, screen)
  return screen
}

const roots = new WeakMap<Element, VendorRoot>()

/**
 * Mount (or re-render) a screen component into a dedicated container using the
 * vendored ReactDOM. Re-mounting into the same container reuses its root.
 */
export async function mountScreen(
  container: Element,
  component: ScreenComponent,
  props: ScreenProps,
): Promise<void> {
  const runtime = await loadKernelRuntime()
  let root = roots.get(container)
  if (!root) {
    root = runtime.ReactDOM.createRoot(container)
    roots.set(container, root)
  }
  root.render(runtime.React.createElement(component, props))
}

export function unmountScreen(container: Element): void {
  const root = roots.get(container)
  if (root) {
    root.unmount()
    roots.delete(container)
  }
}
