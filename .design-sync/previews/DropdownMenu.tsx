import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "kernel-portal"
import { FileText, Trash2, Truck } from "lucide-react"

export function LoadActionsMenu() {
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 24 }}>
      <DropdownMenu open>
        <DropdownMenuTrigger render={<Button variant="outline">Load #4471</Button>} />
        <DropdownMenuContent style={{ width: 224 }} align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Load actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Truck /> Reassign hauler <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText /> View scale ticket <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Trash2 /> Reject load
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
