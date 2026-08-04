import * as React from "react";
import { mdiAccountGroupOutline, mdiAccountOutline, mdiAlertCircleOutline, mdiAlertOutline, mdiApplicationOutline, mdiArchiveArrowDownOutline, mdiStarFourPointsOutline, mdiWheelchairAccessibility, mdiArrowLeft, mdiArrowRight, mdiBellOutline, mdiCalendarBlankOutline, mdiCancel, mdiCash, mdiChartBar, mdiChartLine, mdiCheck, mdiCheckCircleOutline, mdiChevronDown, mdiChevronLeft, mdiChevronRight, mdiChevronUp, mdiClockOutline, mdiClose, mdiCloseCircleOutline, mdiCloseOctagonOutline, mdiCloudUploadOutline, mdiCogOutline, mdiCompassOutline, mdiConsole, mdiContentCopy, mdiCreation, mdiCreditCardOutline, mdiCursorText, mdiDockLeft, mdiDotsHorizontal, mdiDotsVertical, mdiDownload, mdiDragVertical, mdiEyeOffOutline, mdiEyeOutline, mdiFileDocumentOutline, mdiFileSign, mdiFilterVariant, mdiFormatBold, mdiFormatFont, mdiFormatItalic, mdiFormatListChecks, mdiFormatUnderline, mdiGauge, mdiGithub, mdiHandshakeOutline, mdiHomeOutline, mdiInformationOutline, mdiLayersOutline, mdiLoading, mdiLogout, mdiMagnify, mdiMessageOutline, mdiMinus, mdiPaletteOutline, mdiPencilOutline, mdiPlus, mdiReply, mdiRuler, mdiSend, mdiShapeOutline, mdiShareVariantOutline, mdiSitemapOutline, mdiSproutOutline, mdiSwapVertical, mdiTable, mdiTrashCanOutline, mdiTrendingDown, mdiTrendingUp, mdiTruckOutline, mdiTune, mdiUnfoldMoreHorizontal, mdiUpload, mdiViewColumnOutline, mdiViewDashboardOutline, mdiViewListOutline, mdiViewQuiltOutline, mdiViewSplitVertical, mdiWeatherNight, mdiWhiteBalanceSunny } from "@mdi/js";
import { cn } from "@/lib/utils";

/**
 * MDI icon shim (decision 0019). Drop-in for the lucide-react API we used:
 * named glyph components that accept `className`, `size`, and standard SVG
 * props, render `fill="currentColor"` at 24x24 by default, and let Tailwind
 * `size-*` classes override. MDI is a filled set, so we prefer its *Outline
 * variants to stay close to lucide's weight. `strokeWidth`/`absoluteStrokeWidth`
 * are accepted and ignored (MDI is path-filled, not stroked).
 */
export interface IconProps
  extends Omit<React.SVGProps<SVGSVGElement>, "ref"> {
  size?: number | string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
}

function makeIcon(path: string, name: string) {
  const Comp = React.forwardRef<SVGSVGElement, IconProps>(function Icon(
    { className, size = 24, strokeWidth: _s, absoluteStrokeWidth: _a, ...props },
    ref,
  ) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        className={cn(className)}
        {...props}
      >
        <path d={path} />
      </svg>
    );
  });
  Comp.displayName = name;
  return Comp;
}

export const Accessibility = makeIcon(mdiWheelchairAccessibility, "Accessibility");
export const AlertCircle = makeIcon(mdiAlertCircleOutline, "AlertCircle");
export const AlertTriangle = makeIcon(mdiAlertOutline, "AlertTriangle");
export const AppWindow = makeIcon(mdiApplicationOutline, "AppWindow");
export const ArrowLeft = makeIcon(mdiArrowLeft, "ArrowLeft");
export const ArrowRight = makeIcon(mdiArrowRight, "ArrowRight");
export const ArrowUpDown = makeIcon(mdiSwapVertical, "ArrowUpDown");
export const Ban = makeIcon(mdiCancel, "Ban");
export const Banknote = makeIcon(mdiCash, "Banknote");
export const BarChart3 = makeIcon(mdiChartBar, "BarChart3");
export const Bell = makeIcon(mdiBellOutline, "Bell");
export const Bold = makeIcon(mdiFormatBold, "Bold");
export const Calendar = makeIcon(mdiCalendarBlankOutline, "Calendar");
export const Check = makeIcon(mdiCheck, "Check");
export const CheckCircle2 = makeIcon(mdiCheckCircleOutline, "CheckCircle2");
export const CheckIcon = makeIcon(mdiCheck, "CheckIcon");
export const ChevronDown = makeIcon(mdiChevronDown, "ChevronDown");
export const ChevronDownIcon = makeIcon(mdiChevronDown, "ChevronDownIcon");
export const ChevronLeft = makeIcon(mdiChevronLeft, "ChevronLeft");
export const ChevronLeftIcon = makeIcon(mdiChevronLeft, "ChevronLeftIcon");
export const ChevronRight = makeIcon(mdiChevronRight, "ChevronRight");
export const ChevronRightIcon = makeIcon(mdiChevronRight, "ChevronRightIcon");
export const ChevronUp = makeIcon(mdiChevronUp, "ChevronUp");
export const ChevronUpIcon = makeIcon(mdiChevronUp, "ChevronUpIcon");
export const ChevronsUpDown = makeIcon(mdiUnfoldMoreHorizontal, "ChevronsUpDown");
export const CircleCheckIcon = makeIcon(mdiCheckCircleOutline, "CircleCheckIcon");
export const Clock = makeIcon(mdiClockOutline, "Clock");
export const Columns3 = makeIcon(mdiViewColumnOutline, "Columns3");
export const Compass = makeIcon(mdiCompassOutline, "Compass");
export const Copy = makeIcon(mdiContentCopy, "Copy");
export const CreditCard = makeIcon(mdiCreditCardOutline, "CreditCard");
export const Archive = makeIcon(mdiArchiveArrowDownOutline, "Archive");
export const Download = makeIcon(mdiDownload, "Download");
export const Eye = makeIcon(mdiEyeOutline, "Eye");
export const EyeOff = makeIcon(mdiEyeOffOutline, "EyeOff");
export const FileSignature = makeIcon(mdiFileSign, "FileSignature");
export const FileText = makeIcon(mdiFileDocumentOutline, "FileText");
export const Filter = makeIcon(mdiFilterVariant, "Filter");
export const Gauge = makeIcon(mdiGauge, "Gauge");
export const Github = makeIcon(mdiGithub, "Github");
export const GripVertical = makeIcon(mdiDragVertical, "GripVertical");
export const Handshake = makeIcon(mdiHandshakeOutline, "Handshake");
export const Home = makeIcon(mdiHomeOutline, "Home");
export const Info = makeIcon(mdiInformationOutline, "Info");
export const InfoIcon = makeIcon(mdiInformationOutline, "InfoIcon");
export const Italic = makeIcon(mdiFormatItalic, "Italic");
export const Layers = makeIcon(mdiLayersOutline, "Layers");
export const LayoutDashboard = makeIcon(mdiViewDashboardOutline, "LayoutDashboard");
export const LayoutList = makeIcon(mdiViewListOutline, "LayoutList");
export const LineChart = makeIcon(mdiChartLine, "LineChart");
export const ListChecks = makeIcon(mdiFormatListChecks, "ListChecks");
export const Loader2Icon = makeIcon(mdiLoading, "Loader2Icon");
export const LogOut = makeIcon(mdiLogout, "LogOut");
export const MessageSquare = makeIcon(mdiMessageOutline, "MessageSquare");
export const Minus = makeIcon(mdiMinus, "Minus");
export const MinusIcon = makeIcon(mdiMinus, "MinusIcon");
export const Moon = makeIcon(mdiWeatherNight, "Moon");
export const MoreHorizontal = makeIcon(mdiDotsHorizontal, "MoreHorizontal");
export const MoreHorizontalIcon = makeIcon(mdiDotsHorizontal, "MoreHorizontalIcon");
export const MoreVertical = makeIcon(mdiDotsVertical, "MoreVertical");
export const OctagonXIcon = makeIcon(mdiCloseOctagonOutline, "OctagonXIcon");
export const Palette = makeIcon(mdiPaletteOutline, "Palette");
export const PanelLeft = makeIcon(mdiDockLeft, "PanelLeft");
export const PanelLeftIcon = makeIcon(mdiDockLeft, "PanelLeftIcon");
export const PanelsLeftRight = makeIcon(mdiViewSplitVertical, "PanelsLeftRight");
export const PanelsTopLeft = makeIcon(mdiViewQuiltOutline, "PanelsTopLeft");
export const Pencil = makeIcon(mdiPencilOutline, "Pencil");
export const Plus = makeIcon(mdiPlus, "Plus");
export const Reply = makeIcon(mdiReply, "Reply");
export const Route = makeIcon(mdiSitemapOutline, "Route");
export const Ruler = makeIcon(mdiRuler, "Ruler");
export const Search = makeIcon(mdiMagnify, "Search");
export const SearchIcon = makeIcon(mdiMagnify, "SearchIcon");
export const SendHorizontal = makeIcon(mdiSend, "SendHorizontal");
export const Settings = makeIcon(mdiCogOutline, "Settings");
export const Shapes = makeIcon(mdiShapeOutline, "Shapes");
export const Share = makeIcon(mdiShareVariantOutline, "Share");
export const SlidersHorizontal = makeIcon(mdiTune, "SlidersHorizontal");
export const Sparkle = makeIcon(mdiStarFourPointsOutline, "Sparkle");
export const Sparkles = makeIcon(mdiCreation, "Sparkles");
export const Sprout = makeIcon(mdiSproutOutline, "Sprout");
export const Sun = makeIcon(mdiWhiteBalanceSunny, "Sun");
export const Table2 = makeIcon(mdiTable, "Table2");
export const Terminal = makeIcon(mdiConsole, "Terminal");
export const TextCursorInput = makeIcon(mdiCursorText, "TextCursorInput");
export const Trash2 = makeIcon(mdiTrashCanOutline, "Trash2");
export const TrendingDown = makeIcon(mdiTrendingDown, "TrendingDown");
export const TrendingUp = makeIcon(mdiTrendingUp, "TrendingUp");
export const TriangleAlertIcon = makeIcon(mdiAlertOutline, "TriangleAlertIcon");
export const Truck = makeIcon(mdiTruckOutline, "Truck");
export const Type = makeIcon(mdiFormatFont, "Type");
export const Underline = makeIcon(mdiFormatUnderline, "Underline");
export const Upload = makeIcon(mdiUpload, "Upload");
export const UploadCloud = makeIcon(mdiCloudUploadOutline, "UploadCloud");
export const User = makeIcon(mdiAccountOutline, "User");
export const Users = makeIcon(mdiAccountGroupOutline, "Users");
export const X = makeIcon(mdiClose, "X");
export const XCircle = makeIcon(mdiCloseCircleOutline, "XCircle");
export const XIcon = makeIcon(mdiClose, "XIcon");
