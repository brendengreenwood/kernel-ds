"use client"

import * as React from "react"
import { toast } from "sonner"
import { CheckCircle2, AlertTriangle, Info, XCircle, Plus } from "@kernel/ui/icon"

import { Button } from "@kernel/ui"
import { Input } from "@kernel/ui"
import { Label } from "@kernel/ui"
import { Avatar, AvatarFallback } from "@kernel/ui"
import { Alert, AlertDescription, AlertTitle } from "@kernel/ui"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@kernel/ui"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kernel/ui"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@kernel/ui"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@kernel/ui"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@kernel/ui"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@kernel/ui"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kernel/ui"
import { Demo } from "./section"
import type { GalleryCluster } from "@/lib/gallery-types"

function AlertCluster() {
  return (
    <>
      <div className="space-y-4">
        <Alert variant="success">
          <CheckCircle2 />
          <AlertTitle>Contract settled</AlertTitle>
          <AlertDescription>
            Load #4471 settled at $4.62/bu — payment scheduled for Friday.
          </AlertDescription>
        </Alert>
        <Alert variant="warning">
          <AlertTriangle />
          <AlertTitle>Moisture over spec</AlertTitle>
          <AlertDescription>
            This corn load tested 16.2% — a drying discount will apply at intake.
          </AlertDescription>
        </Alert>
        <Alert variant="info">
          <Info />
          <AlertTitle>Basis updated</AlertTitle>
          <AlertDescription>
            River terminal posted a new corn basis 12 minutes ago.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <XCircle />
          <AlertTitle>Settlement failed</AlertTitle>
          <AlertDescription>
            Bank rejected the ACH transfer. Re-enter routing details to retry.
          </AlertDescription>
        </Alert>
      </div>
    </>
  )
}

function SonnerCluster() {
  return (
    <>
      <Demo className="gap-4">
        <Button
          variant="outline"
          onClick={() =>
            toast.success("Deployment published", {
              description: "orchard-api · production",
              action: { label: "View", onClick: () => {} },
            })
          }
        >
          Show toast
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="outline" size="icon" aria-label="Add to library">
                  <Plus />
                </Button>
              }
            />
            <TooltipContent>Add to library</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Demo>
    </>
  )
}

function DialogCluster() {
  return (
    <>
      <Demo className="gap-4">
        <Dialog>
          <DialogTrigger render={<Button variant="outline">Edit profile</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-2">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" defaultValue="Ellis Morgan" />
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive">Delete project</Button>} />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes the project and all of its deployments.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Demo>
    </>
  )
}

function PopoverCluster() {
  return (
    <>
      <Demo className="gap-4">
        <Popover>
          <PopoverTrigger render={<Button variant="outline">Dimensions</Button>} />
          <PopoverContent className="w-72">
            <div className="space-y-3">
              <div>
                <div className="text-sm font-semibold">Dimensions</div>
                <div className="text-sm text-muted-foreground">
                  Set the width and height for the layer.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="grid flex-1 gap-1.5">
                  <Label htmlFor="w" className="text-xs">Width</Label>
                  <Input id="w" defaultValue="100%" className="h-8" />
                </div>
                <div className="grid flex-1 gap-1.5">
                  <Label htmlFor="h" className="text-xs">Height</Label>
                  <Input id="h" defaultValue="auto" className="h-8" />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <HoverCard>
          <HoverCardTrigger render={<Button variant="link">@sashalin</Button>} />
          <HoverCardContent className="w-80">
            <div className="flex gap-3">
              <Avatar className="size-12"><AvatarFallback>SL</AvatarFallback></Avatar>
              <div>
                <div className="text-sm font-semibold">Sasha Lin</div>
                <div className="text-sm text-muted-foreground">
                  Design systems lead · maintains the Kernel theme.
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </Demo>
    </>
  )
}

function SheetCluster() {
  return (
    <>
      <Demo className="gap-4">
        <Sheet>
          <SheetTrigger render={<Button variant="outline">Open sheet</Button>} />
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Refine results by status and owner.</SheetDescription>
            </SheetHeader>
            <div className="grid gap-2 px-4">
              <Label htmlFor="f-status">Status</Label>
              <Input id="f-status" placeholder="All" />
            </div>
          </SheetContent>
        </Sheet>

        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Open drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>Move to project</DrawerTitle>
                <DrawerDescription>
                  Choose a destination for the selected items.
                </DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <Button>Confirm</Button>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </Demo>
    </>
  )
}

export const overlaysClusters: GalleryCluster[] = [
  { anchor: "c-alert", slug: "alert", title: "Alert", group: "Feedback & overlay", demo: AlertCluster },
  { anchor: "c-sonner", slug: "sonner", title: "Sonner (toast) · Tooltip", group: "Feedback & overlay", demo: SonnerCluster },
  { anchor: "c-dialog", slug: "dialog", title: "Dialog · Alert dialog", group: "Feedback & overlay", demo: DialogCluster },
  { anchor: "c-popover", slug: "popover", title: "Popover · Hover card", group: "Feedback & overlay", demo: PopoverCluster },
  { anchor: "c-sheet", slug: "sheet", title: "Sheet · Drawer", group: "Feedback & overlay", demo: SheetCluster },
]
