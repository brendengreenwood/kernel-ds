import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowUp,
  AudioLines,
  ChevronDown,
  ChevronRight,
  ClipboardPaste,
  FileText,
  Folder,
  MessageSquarePlus,
  Moon,
  PanelLeft,
  Palette,
  Pencil,
  Plus,
  RotateCw,
  SendHorizontal,
  Sun,
  Share,
  ThumbsDown,
  ThumbsUp,
  Upload,
  X,
} from "@/components/ui/icon"

/* Layout-only classes in this file. Color, radius, border, and type come from
   Kernel components or semantic utilities; gaps are logged in DRIFT.md. */

export function App() {
  return (
    <div className="flex h-full gap-2 bg-background p-2">
      <ChatColumn />
      <FilesPane />
    </div>
  )
}

/* ---------------- Chat column ---------------- */

function ChatColumn() {
  return (
    <aside className="relative z-10 flex w-80 shrink-0 flex-col gap-3">
      <header className="flex items-center gap-1 px-1">
        <Avatar size="sm">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <Palette className="size-4" />
          </AvatarFallback>
        </Avatar>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="sm" className="min-w-0" />}
          >
            <span className="truncate">Kernel Pricing Terminal</span>
            <ChevronDown />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Rename project</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon-sm" aria-label="Toggle panel" className="ml-auto">
          <PanelLeft />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="New chat">
          <MessageSquarePlus />
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3">
        <Transcript />
        <ContextBanner />
        <CheckBanner />
      </div>

      <Composer />
    </aside>
  )
}

function Transcript() {
  return (
    <article className="flex flex-col gap-3 text-sm leading-relaxed">
      <ul className="flex list-disc flex-col gap-2 pl-5">
        <li>
          <strong>Typography</strong>: 9px tracked labels, theme toggle hit target evened to 40px.
        </li>
        <li>
          <strong>Performance</strong>: stat values up to 24px with tighter tracking, roomier card
          padding, unified 12px radii.
        </li>
        <li>
          <strong>Tables</strong>: feedback + wizard contract tables share the same 12px container
          radius.
        </li>
      </ul>
      <p>Verifier is doing the visual pass now.</p>
      <div className="flex items-center gap-1 font-sans">
        <Button variant="ghost" size="icon-xs" aria-label="Good response">
          <ThumbsUp />
        </Button>
        <Button variant="ghost" size="icon-xs" aria-label="Bad response">
          <ThumbsDown />
        </Button>
        <Button variant="ghost" size="xs" className="text-muted-foreground">
          Edited Kernel Pricing.dc.html
        </Button>
      </div>
    </article>
  )
}

/* DRIFT D3: no banner/callout component with title + body + action footer.
   Built from bordered sections; candidate for an Alert "with actions" variant. */
function ContextBanner() {
  return (
    <section className="flex flex-col overflow-hidden rounded-[var(--radius-surface)] border border-border bg-card text-sm">
      <div className="flex flex-col gap-1 p-3">
        <p className="font-medium text-info">Start a new chat to save 302k tokens of context</p>
        <p className="text-muted-foreground">
          Your project and files stay put. Claude will carry a summary of this chat into the new
          one.
        </p>
      </div>
      <footer className="flex gap-1 border-t border-border p-2">
        <Button variant="outline" size="sm">New chat</Button>
        <Button variant="ghost" size="sm">Continue here</Button>
      </footer>
    </section>
  )
}

function CheckBanner() {
  return (
    <section className="flex flex-col overflow-hidden rounded-[var(--radius-surface)] border border-border bg-card text-sm">
      <p className="p-3 font-medium">
        The background check didn’t finish — the tab it was running in never reported back.
      </p>
      <footer className="flex gap-1 border-t border-border p-2">
        <Button variant="ghost" size="sm">
          <RotateCw /> Re-run check
        </Button>
        <Button variant="ghost" size="sm">
          <X /> Dismiss
        </Button>
      </footer>
    </section>
  )
}

/* DRIFT D4: no composer/prompt-input component. Textarea is a bordered field;
   here the CARD owns the border and the textarea goes chromeless. */
function Composer() {
  const [model, setModel] = React.useState("opus-medium")
  return (
    <section className="flex flex-col rounded-[var(--radius-surface)] border border-border bg-[var(--elev-raised-surface)] shadow-md">
      <div className="px-2 pt-2">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="xs" />}>
            Kernel Design System <ChevronDown />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Kernel Design System</DropdownMenuItem>
            <DropdownMenuItem>No project context</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Textarea
        placeholder="Describe what you want to create…"
        className="min-h-20 resize-none border-0 bg-transparent px-3 shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
      <footer className="flex items-center gap-1 p-2">
        <Button variant="outline" size="icon-sm" aria-label="Attach">
          <Plus />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="Voice">
          <AudioLines />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="sm" className="text-muted-foreground" />}
          >
            Opus 5.5 Medium <ChevronDown />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Model</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={model} onValueChange={setModel}>
              <DropdownMenuRadioItem value="opus-high">Opus 5.5 · High</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="opus-medium">Opus 5.5 · Medium</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="sonnet">Sonnet</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="sm" className="ml-auto">
          <SendHorizontal /> Send
        </Button>
      </footer>
    </section>
  )
}

/* ---------------- Files pane ---------------- */

const folders = ["Design system files", "ds", "screens", "uploads"]
const pages = [{ name: "Kernel Pricing.dc.html", type: "HTML page", when: "over a week ago" }]
const scripts = [{ name: "support.js", type: "Script", when: "over a week ago" }]

function FilesPane() {
  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-surface)] border border-border bg-card shadow-panel">
      <header className="flex items-center gap-2 border-b border-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
            All files <ChevronDown />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>All files</DropdownMenuItem>
            <DropdownMenuItem>Pages</DropdownMenuItem>
            <DropdownMenuItem>Scripts</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button variant="inverse" size="sm">
            <Share /> Share
          </Button>
          <Avatar size="sm">
            <AvatarFallback>B</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex items-center gap-2 border-b border-border p-2">
        <Button variant="outline" size="icon-sm" aria-label="Up one level" disabled>
          <ArrowUp />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="Refresh">
          <RotateCw />
        </Button>
        <span className="text-sm font-medium">project</span>
        <div className="ml-auto flex gap-1">
          <Button variant="ghost" size="sm">
            <Pencil /> New sketch
          </Button>
          <Button variant="ghost" size="sm">
            <ClipboardPaste /> Paste
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-[3] overflow-y-auto border-r border-border">
          <FileGroup label="Folders">
            {folders.map((f) => (
              <FileRow key={f} icon={<Folder />} name={f} type="Folder" when="—" expandable />
            ))}
          </FileGroup>
          <FileGroup label="Pages">
            {pages.map((p) => (
              <FileRow key={p.name} icon={<FileText />} {...p} />
            ))}
          </FileGroup>
          <FileGroup label="Scripts">
            {scripts.map((p) => (
              <FileRow key={p.name} icon={<FileText />} {...p} />
            ))}
          </FileGroup>
        </div>
        <div className="flex flex-[2] items-center justify-center text-sm text-muted-foreground">
          Select a file to preview
        </div>
      </div>

      {/* DRIFT D6: no drop-zone component. */}
      <footer className="flex flex-col gap-1 border-t border-border px-6 py-4">
        <p className="flex items-center gap-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase">
          <Upload className="size-3.5" /> Drop files here
        </p>
        <p className="text-sm">
          Images, docs, references, Figma links, or folders — Claude will use them as context.
        </p>
      </footer>
    </main>
  )
}

/* DRIFT D5: no grouped list / file-row primitive. Item exists but is card-ish;
   this is a dense table-like row with a section band. */
function FileGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="border-b border-border bg-[var(--elev-raised-surface)] px-4 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </h2>
      <ul>{children}</ul>
    </section>
  )
}

function FileRow({
  icon,
  name,
  type,
  when,
  expandable,
}: {
  icon: React.ReactNode
  name: string
  type: string
  when: string
  expandable?: boolean
}) {
  return (
    <li className="flex items-center gap-3 border-b border-border px-2 py-2 hover:bg-muted/50">
      <span className="flex size-5 items-center justify-center text-muted-foreground">
        {expandable && <ChevronRight className="size-4" />}
      </span>
      <span className="flex size-8 items-center justify-center rounded-[var(--radius-control)] bg-muted text-muted-foreground [&_svg]:size-5">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{name}</span>
        <span className="text-xs text-muted-foreground">{type}</span>
      </span>
      <span className="pr-10 text-xs text-muted-foreground">{when}</span>
    </li>
  )
}

function ThemeToggle() {
  const [dark, setDark] = React.useState(() => document.documentElement.classList.contains("dark"))
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])
  return (
    <Button variant="ghost" size="icon-sm" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={() => setDark((d) => !d)}>
      {dark ? <Sun /> : <Moon />}
    </Button>
  )
}
