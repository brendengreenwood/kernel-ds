"use client"

import * as React from "react"
import { toast } from "sonner"
import { Section } from "./section"
import { Input } from "@kernel/ui"
import * as AllIcons from "@kernel/ui/icon"
import { typeStyles } from "@/lib/type-styles"
import { cn } from "@kernel/ui/utils"

/**
 * Icons foundation (decision 0019): the MDI shim is the icon library.
 * The grid enumerates the shim's runtime exports, so this page can't
 * drift from what's actually importable.
 */

type IconComponent = React.ComponentType<AllIcons.IconProps>

// Every runtime export of the shim is a glyph component (IconProps is type-only).
const glyphs = Object.entries(AllIcons) as [string, IconComponent][]

function copyImport(name: string) {
  const line = `import { ${name} } from "@kernel/ui/icon"`
  navigator.clipboard?.writeText(line)
  toast.success("Copied", { description: line })
}

const recipe = `// icon.tsx — one line per glyph; prefer the *Outline variant
export const Wheat = makeIcon(mdiBarley, "Wheat");`

export function IconsSection() {
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()
  const shown = q ? glyphs.filter(([name]) => name.toLowerCase().includes(q)) : glyphs

  return (
    <Section
      id="icons"
      eyebrow="Foundations"
      title="Icons"
      lead="Icons are Material Design Icons (decision 0019), served through a lucide-compatible shim — never import from lucide-react or another icon package. Every glyph below is a named export of @kernel/ui/icon; click one to copy its import."
    >
      <h4 className={cn("mb-4", typeStyles.overline)}>Usage</h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-md border bg-card p-4">
          <div className="text-sm font-semibold">Import from the shim</div>
          <div className="my-2 overflow-x-auto rounded-sm bg-muted px-2.5 py-1.5 font-mono text-xs">
            {'import { Truck } from "@kernel/ui/icon"'}
          </div>
          <div className="text-xs text-muted-foreground">
            Lucide-named components backed by <code className="font-mono">@mdi/js</code> paths
            — same API (<code className="font-mono">className</code>,{" "}
            <code className="font-mono">size</code>), filled at 24×24,{" "}
            <code className="font-mono">currentColor</code>. When a shadcn CLI
            component lands with <code className="font-mono">lucide-react</code>{" "}
            imports, redirect them here.
          </div>
        </div>
        <div className="rounded-md border bg-card p-4">
          <div className="text-sm font-semibold">Adding a glyph</div>
          <div className="my-2 overflow-x-auto rounded-sm bg-muted px-2.5 py-1.5 font-mono text-xs whitespace-pre">
            {recipe}
          </div>
          <div className="text-xs text-muted-foreground">
            One <code className="font-mono">lucide name → mdi*</code> line in the
            shim&apos;s map. Prefer <code className="font-mono">*Outline</code>{" "}
            variants so the filled MDI set stays close to lucide&apos;s weight.
            Some names are aliases of one glyph (Check / CheckIcon) kept for
            shadcn compatibility.
          </div>
        </div>
      </div>

      <h4 className={cn("mb-4 mt-9", typeStyles.overline)}>
        Glyphs — {glyphs.length} exported
      </h4>
      <Input
        aria-label="Search glyphs"
        placeholder="Search glyphs…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 max-w-72"
      />
      <div className="rounded-lg border bg-card p-6">
        {shown.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No glyph matches “{query}” — add it to the shim (recipe above).
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(148px,1fr))] gap-2">
            {shown.map(([name, Icon]) => (
              <button
                key={name}
                onClick={() => copyImport(name)}
                className="flex cursor-copy items-center gap-2.5 rounded-md border border-transparent p-2.5 text-left transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-border hover:bg-muted/50"
              >
                <Icon size={20} className="shrink-0 text-foreground" />
                <span className="truncate font-mono text-[11px] text-muted-foreground">
                  {name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Section>
  )
}
