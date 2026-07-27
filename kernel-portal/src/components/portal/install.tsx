"use client"

import indexCss from "@/index.css?raw"
import { CodeBlock } from "@/components/ui/code-block"
import { Section } from "./section"
import { typeStyles } from "@/lib/type-styles"
import { cn } from "@/lib/utils"

const setup = `# a Tailwind v4 + shadcn/ui project (components on Base UI, base-nova style)
npm create vite@latest my-app -- --template react-ts
npx shadcn@latest init`

const tokens = `/* globals.css / index.css */
@import "tailwindcss";

/* Paste Kernel's token layer here — the full :root, .dark, and
   @theme inline blocks from step 4. That layer IS Kernel; every
   shadcn component re-themes off it. Native system fonts only. */`

const add = `npx shadcn@latest add accordion alert alert-dialog aspect-ratio avatar \\
  badge breadcrumb button calendar card carousel chart checkbox collapsible \\
  command context-menu dialog drawer dropdown-menu form hover-card input \\
  input-otp label menubar navigation-menu pagination popover progress \\
  radio-group resizable scroll-area select separator sheet sidebar skeleton \\
  slider sonner switch table tabs textarea toggle toggle-group tooltip`

const icons = `// Kernel icons are MDI, not lucide (decision 0019).
// shadcn generates components that import from "lucide-react" —
// redirect those to the shim; it exports the same glyph names.
import { Search, ChevronRight } from "@/components/ui/icon"`

const usage = `<Button>Book load</Button>                        {/* --primary + --control-h */}

<div className="bg-card text-card-foreground border rounded-lg" />

<span className="text-[color:var(--status-settled)]">Settled</span>
<span className="text-[color:var(--commodity-corn)]">Corn</span>

<div className="transition-colors duration-[var(--duration-base)] ease-[var(--ease-out)]" />`

export function InstallSection() {
  return (
    <Section
      id="install"
      eyebrow="Get started"
      title="Install & usage"
      lead="Kernel is a Tailwind v4 token layer for shadcn/ui — components on Base UI (base-nova), icons from MDI, native fonts only. There's no package to add: the token layer in this repo is the source of truth. Drop it into a shadcn project and every component re-themes."
    >
      <div className="space-y-6">
        <div>
          <h4 className={cn("mb-3", typeStyles.overline)}>
            1 · Start from a shadcn/ui project
          </h4>
          <CodeBlock lang="terminal" code={setup} />
        </div>
        <div>
          <h4 className={cn("mb-3", typeStyles.overline)}>
            2 · Drop in the Kernel token layer
          </h4>
          <CodeBlock lang="globals.css" code={tokens} />
        </div>
        <div>
          <h4 className={cn("mb-3", typeStyles.overline)}>
            3 · Add the components
          </h4>
          <CodeBlock lang="terminal" code={add} />
          <p className="mt-3 max-w-[68ch] text-[13.5px] leading-relaxed text-muted-foreground">
            Components resolve to <span className="font-mono text-foreground">base-nova</span> (Base UI),
            not Radix. Generated files import <span className="font-mono text-foreground">lucide-react</span> —
            redirect those to the MDI shim:
          </p>
          <div className="mt-3">
            <CodeBlock lang="tsx" code={icons} />
          </div>
        </div>
        <div>
          <h4 className={cn("mb-3", typeStyles.overline)}>
            4 · Use tokens by semantic name
          </h4>
          <CodeBlock lang="tsx" code={usage} />
        </div>
        <div>
          <h4 className={cn("mb-3", typeStyles.overline)}>
            5 · Complete token reference
          </h4>
          <p className="mb-3 max-w-[68ch] text-[13.5px] leading-relaxed text-muted-foreground">
            The entire Kernel token layer, rendered live from the portal's own{" "}
            <span className="font-mono text-foreground">src/index.css</span> — scales, role tokens,
            statuses, commodities, viz series, control heights, motion, and the{" "}
            <span className="font-mono text-foreground">@theme inline</span> maps that expose every
            token as a Tailwind utility. Copy it whole; the <span className="font-mono text-foreground">.dark</span>{" "}
            block carries the mode overrides.
          </p>
          <CodeBlock lang="src/index.css" code={indexCss.trim()} scroll />
        </div>
      </div>
    </Section>
  )
}
