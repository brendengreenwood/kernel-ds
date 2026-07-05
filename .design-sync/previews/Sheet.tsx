import {
  Button,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "kernel-portal"

export function LoadFiltersSheet() {
  return (
    <Sheet open>
      <SheetTrigger render={<Button variant="outline">Filter loads</Button>} />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter loads</SheetTitle>
          <SheetDescription>
            Refine the load board by grain, farm, and status.
          </SheetDescription>
        </SheetHeader>
        <div style={{ display: "grid", gap: 8, padding: "0 16px" }}>
          <Label htmlFor="f-grain">Grain</Label>
          <Input id="f-grain" placeholder="Corn" />
          <Label htmlFor="f-farm">Farm</Label>
          <Input id="f-farm" placeholder="Hartmann Farms" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
