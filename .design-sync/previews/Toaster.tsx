import * as React from "react"
// kernel-portal exports <Toaster> but NOT `toast`; the preview compiles its
// own sonner instance, so the pair must come from the same module or the
// visible toaster never receives the toast. Wrapper props below mirror
// kernel-portal/src/components/ui/sonner.tsx so Kernel token styling applies.
import { Toaster, toast } from "sonner"

export function SettlementToast() {
  React.useEffect(() => {
    toast.success("Settlement posted", {
      description: "SET-0143 · $98,382.90",
      duration: 600000,
    })
  }, [])
  return (
    <div style={{ position: "relative", height: 200, width: "100%", minWidth: 420 }}>
      <Toaster
        position="bottom-right"
        offset={16}
        className="toaster group"
        style={
          {
            position: "absolute",
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
            "--border-radius": "var(--radius)",
          } as React.CSSProperties
        }
        toastOptions={{ classNames: { toast: "cn-toast" } }}
      />
    </div>
  )
}
