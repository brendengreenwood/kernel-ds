import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "kernel-portal"
import { Copy, Share } from "lucide-react"

export function LoadRowContextMenu() {
  return (
    <div style={{ display: "flex", paddingTop: 24, paddingLeft: 40 }}>
      <ContextMenu defaultOpen>
        <ContextMenuTrigger
          style={{
            display: "grid",
            placeItems: "center",
            height: 80,
            width: 224,
            borderRadius: 8,
            border: "1px dashed var(--border)",
            fontSize: 14,
            color: "var(--muted-foreground)",
          }}
        >
          Right-click load #4468
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>
            <Copy /> Copy load ID
          </ContextMenuItem>
          <ContextMenuItem>
            <Share /> Share settlement
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Refresh basis</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}
