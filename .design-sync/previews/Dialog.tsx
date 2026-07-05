import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from "kernel-portal"

export function EditContractDialog() {
  return (
    <Dialog open>
      <DialogTrigger render={<Button variant="outline">Edit contract</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit contract HTA-2209</DialogTitle>
          <DialogDescription>
            Adjust booked bushels and delivery window. Unfilled loads reprice
            against the DEC 26 board.
          </DialogDescription>
        </DialogHeader>
        <div style={{ display: "grid", gap: 8, padding: "8px 0" }}>
          <Label htmlFor="bushels">Booked bushels</Label>
          <Input id="bushels" defaultValue="25,000" />
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
