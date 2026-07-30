import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "@/components/ui/icon"

/**
 * CodeBlock — the portal's canonical surface for a copy-pasteable code
 * snippet: a header bar carrying the language label and a Copy/Copied
 * button, over a monospace `<pre>`. Lifted verbatim from the Install page's
 * long-standing local block so component docs and install share one
 * treatment instead of drifting apart (project rule: reuse conventions).
 */
function CodeBlock({
  lang,
  code,
  scroll,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  lang: string
  code: string
  scroll?: boolean
}) {
  const [copied, setCopied] = React.useState(false)
  return (
    <div
      data-slot="code-block"
      className={cn("overflow-hidden rounded-md border bg-card", className)}
      {...props}
    >
      <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2">
        <span className="font-mono text-xs text-muted-foreground">{lang}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 font-mono text-xs"
          onClick={() => {
            navigator.clipboard?.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 1400)
          }}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre
        className={cn(
          "overflow-x-auto p-4 font-mono text-[13px] leading-relaxed",
          scroll && "max-h-[420px] overflow-y-auto",
        )}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}

export { CodeBlock }
