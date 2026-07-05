import {
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "kernel-portal"

export function AssignLoadDrawer() {
  return (
    <Drawer open>
      <DrawerTrigger asChild>
        <Button variant="outline">Assign to contract</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div style={{ margin: "0 auto", width: "100%", maxWidth: 384 }}>
          <DrawerHeader>
            <DrawerTitle>Assign load #4471</DrawerTitle>
            <DrawerDescription>
              Choose the contract that receives these 18,400 bu of corn from
              Hartmann Farms.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Assign to HTA-2209</Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
