/**
 * ds-bundle entry point — re-exports every UI component for the IIFE library build.
 * The built bundle exposes all exports on `window.Kernel`.
 *
 * Generated for: vite.lib.config.ts → ds-bundle/_ds_bundle.js
 */

// Theme + component utility classes. Importing here puts every component
// module in Tailwind's scan graph, so the emitted CSS carries their classes.
import "@kernel/ui/styles.css"

// Components (alphabetical by file)
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@kernel/ui"
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger } from "@kernel/ui"
export { Alert, AlertTitle, AlertDescription } from "@kernel/ui"
export { AnimatedNumber } from "@kernel/ui"
export { AspectRatio } from "@kernel/ui"
export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge } from "@kernel/ui"
export { Badge, badgeVariants } from "@kernel/ui"
export { BeamWrap } from "@kernel/ui"
export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@kernel/ui"
export { Button, buttonVariants } from "@kernel/ui"
export { Calendar, CalendarDayButton } from "@kernel/ui"
export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent } from "@kernel/ui"
export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, useCarousel } from "@kernel/ui"
export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle } from "@kernel/ui"
export { Checkbox } from "@kernel/ui"
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@kernel/ui"
export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator } from "@kernel/ui"
export { CommodityBadge, CommodityLabel, commodityBadgeVariants, commodityFromLabel } from "@kernel/ui"
export { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup } from "@kernel/ui"
export { Dialog, DialogClose, DialogContent, DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "@kernel/ui"
export { Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription } from "@kernel/ui"
export { DropdownMenu, DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@kernel/ui"
export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField } from "@kernel/ui"
export { HoverCard, HoverCardTrigger, HoverCardContent } from "@kernel/ui"
export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea } from "@kernel/ui"
export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@kernel/ui"
export { Input } from "@kernel/ui"
export { Label } from "@kernel/ui"
export { Menubar, MenubarPortal, MenubarMenu, MenubarTrigger, MenubarContent, MenubarGroup, MenubarSeparator, MenubarLabel, MenubarItem, MenubarShortcut, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarSub, MenubarSubTrigger, MenubarSubContent } from "@kernel/ui"
export { NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuPositioner } from "@kernel/ui"
export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@kernel/ui"
export { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@kernel/ui"
export { Progress, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue } from "@kernel/ui"
export { RadioGroup, RadioGroupItem } from "@kernel/ui"
export { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@kernel/ui"
export { ScrollArea, ScrollBar } from "@kernel/ui"
export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue } from "@kernel/ui"
export { Separator } from "@kernel/ui"
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from "@kernel/ui"
export { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar } from "@kernel/ui"
export { Skeleton } from "@kernel/ui"
export { Slider } from "@kernel/ui"
export { Toaster } from "@kernel/ui"
export { StatusBadge, statusBadgeVariants } from "@kernel/ui"
export { Switch } from "@kernel/ui"
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@kernel/ui"
export { Tabs, TabsList, TabsTrigger, TabsContent, TabCount, TabDot } from "@kernel/ui"
export { Textarea } from "@kernel/ui"
export { ToggleGroup, ToggleGroupItem } from "@kernel/ui"
export { Toggle, toggleVariants } from "@kernel/ui"
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@kernel/ui"

// Icons — re-exported so prototypes can use Kernel.ChevronDown etc.
export * from "@kernel/ui/icon"

// Utilities
export { cn } from "@kernel/ui/utils"
