import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "kernel-portal"

export function DeskMenubar() {
  return (
    <div style={{ display: "flex", padding: "24px 0 0 40px" }}>
      <Menubar>
        <MenubarMenu open>
          <MenubarTrigger>Contracts</MenubarTrigger>
          <MenubarContent style={{ minWidth: 208 }}>
            <MenubarItem>New cash contract</MenubarItem>
            <MenubarItem>New hedge-to-arrive</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Export positions</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Loads</MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Settlement</MenubarTrigger>
        </MenubarMenu>
      </Menubar>
    </div>
  )
}
