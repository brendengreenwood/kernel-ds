/**
 * ds-bundle entry point — re-exports every UI component for the IIFE library build.
 * The built bundle exposes all exports on `window.Kernel`.
 *
 * Generated for: vite.lib.config.ts → ds-bundle/_ds_bundle.js
 */

// Theme + component utility classes. Importing here puts every component
// module in Tailwind's scan graph, so the emitted CSS carries their classes.
import "./index.css"

// Components (alphabetical by file)
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./components/ui/accordion"
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger } from "./components/ui/alert-dialog"
export { Alert, AlertTitle, AlertDescription } from "./components/ui/alert"
export { AnimatedNumber } from "./components/ui/animated-number"
export { AspectRatio } from "./components/ui/aspect-ratio"
export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge } from "./components/ui/avatar"
export { Badge, badgeVariants } from "./components/ui/badge"
export { BeamWrap } from "./components/ui/border-beam"
export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "./components/ui/breadcrumb"
export { Button, buttonVariants } from "./components/ui/button"
export { Calendar, CalendarDayButton } from "./components/ui/calendar"
export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent } from "./components/ui/card"
export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, useCarousel } from "./components/ui/carousel"
export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle } from "./components/ui/chart"
export { Checkbox } from "./components/ui/checkbox"
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./components/ui/collapsible"
export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator } from "./components/ui/command"
export { CommodityBadge, CommodityLabel, commodityBadgeVariants, commodityFromLabel } from "./components/ui/commodity-badge"
export { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup } from "./components/ui/context-menu"
export { Dialog, DialogClose, DialogContent, DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "./components/ui/dialog"
export { Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription } from "./components/ui/drawer"
export { DropdownMenu, DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "./components/ui/dropdown-menu"
export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField } from "./components/ui/form"
export { HoverCard, HoverCardTrigger, HoverCardContent } from "./components/ui/hover-card"
export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea } from "./components/ui/input-group"
export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "./components/ui/input-otp"
export { Input } from "./components/ui/input"
export { Label } from "./components/ui/label"
export { Menubar, MenubarPortal, MenubarMenu, MenubarTrigger, MenubarContent, MenubarGroup, MenubarSeparator, MenubarLabel, MenubarItem, MenubarShortcut, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarSub, MenubarSubTrigger, MenubarSubContent } from "./components/ui/menubar"
export { NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuPositioner } from "./components/ui/navigation-menu"
export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./components/ui/pagination"
export { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "./components/ui/popover"
export { Progress, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue } from "./components/ui/progress"
export { RadioGroup, RadioGroupItem } from "./components/ui/radio-group"
export { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./components/ui/resizable"
export { ScrollArea, ScrollBar } from "./components/ui/scroll-area"
export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue } from "./components/ui/select"
export { Separator } from "./components/ui/separator"
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from "./components/ui/sheet"
export { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar } from "./components/ui/sidebar"
export { Skeleton } from "./components/ui/skeleton"
export { Slider } from "./components/ui/slider"
export { Toaster } from "./components/ui/sonner"
export { StatusBadge, statusBadgeVariants } from "./components/ui/status-badge"
export { Switch } from "./components/ui/switch"
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "./components/ui/table"
export { Tabs, TabsList, TabsTrigger, TabsContent, TabCount, TabDot } from "./components/ui/tabs"
export { Textarea } from "./components/ui/textarea"
export { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group"
export { Toggle, toggleVariants } from "./components/ui/toggle"
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./components/ui/tooltip"

// Icons — re-exported so prototypes can use Kernel.ChevronDown etc.
export * from "./components/ui/icon"

// Utilities
export { cn } from "./lib/utils"
