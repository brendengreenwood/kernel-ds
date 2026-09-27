"use client"

import * as React from "react"
import {
  Sprout,
  Handshake,
  LineChart,
  Truck,
  Banknote,
  Settings,
  Search,
  Plus,
  MessageSquare,
  PanelLeft,
  SendHorizontal,
  MoreVertical,
  X,
  ArrowLeft,
} from "@kernel/ui/icon"

import { cn } from "@kernel/ui/utils"
import {
  Button,
  Input,
  PanelGroup,
  PanelRegion,
  PanelShell,
  StatusBadge,
  type Status,
} from "@kernel/ui"

/* ============================================================================
   Workspace shell experiment — four zones:
   icon rail · context column (menu/list) · workspace canvas · chat assistant
   ========================================================================== */

type Record_ = {
  id: string
  title: string
  sub: string
  price: string
  status: Status
  facts: [string, string][]
}

const AREAS: {
  key: string
  label: string
  icon: React.ElementType
  columnTitle: string
  records: Record_[]
}[] = [
  {
    key: "origination",
    label: "Origination",
    icon: Handshake,
    columnTitle: "Offers",
    records: [
      { id: "OF-3121", title: "Hartmann Farms", sub: "Corn · 10,000 bu", price: "$4.25", status: "pending",
        facts: [["Their offer", "$4.25"], ["Current bid", "$4.16"], ["Board (ZCZ6)", "$4.38"], ["Expires", "2h 10m"]] },
      { id: "OF-3118", title: "Valley Co-op", sub: "Soybean · 8,000 bu", price: "$10.40", status: "pending",
        facts: [["Their offer", "$10.40"], ["Current bid", "$10.25"], ["Board (ZSX6)", "$10.62"], ["Expires", "1d 4h"]] },
      { id: "OF-3110", title: "Miller Bros", sub: "Wheat · 12,000 bu", price: "$5.55", status: "pending",
        facts: [["Their offer", "$5.55"], ["Current bid", "$5.58"], ["Board (ZWU6)", "$5.84"], ["Expires", "5h 40m"]] },
      { id: "OF-3097", title: "Anders Farm", sub: "Corn · 5,000 bu", price: "$4.30", status: "expired",
        facts: [["Their offer", "$4.30"], ["Current bid", "$4.16"], ["Board (ZCZ6)", "$4.38"], ["Expires", "—"]] },
    ],
  },
  {
    key: "pricing",
    label: "Pricing",
    icon: LineChart,
    columnTitle: "Contracts",
    records: [
      { id: "C-2214", title: "Hartmann Farms", sub: "Corn · 40,000 bu", price: "$4.16", status: "booked",
        facts: [["Cash price", "$4.16"], ["Basis", "−0.22"], ["Delivered", "26,300 bu"], ["Remaining", "13,700 bu"]] },
      { id: "C-2231", title: "Hartmann Farms", sub: "Corn · 10,000 bu", price: "$4.22", status: "booked",
        facts: [["Cash price", "$4.22"], ["Basis", "−0.16"], ["Delivered", "0 bu"], ["Remaining", "10,000 bu"]] },
      { id: "C-2189", title: "Prairie Creek", sub: "Soybean · 15,000 bu", price: "$10.18", status: "settled",
        facts: [["Cash price", "$10.18"], ["Basis", "−0.44"], ["Delivered", "15,000 bu"], ["Remaining", "0 bu"]] },
    ],
  },
]

const CANNED_REPLIES = [
  "Hartmann's $4.25 is 9¢ over your posted bid. Basis-equivalent is −0.13 vs ZCZ6 — the last three corn bookings cleared between −0.16 and −0.19. A counter at $4.20 keeps you inside that band.",
  "Miller Bros is offering under your wheat bid — booking as-is nets you 3¢ against the board. No counter needed.",
  "Across open offers you'd add 30,000 bu; that takes Fairmont to 82% of October space. Worth checking freight before booking all three.",
]

function IconRail({ area, setArea }: { area: string; setArea: (k: string) => void }) {
  return (
    <nav aria-label="Workspace areas" className="flex w-14 shrink-0 flex-col items-center gap-1 bg-sidebar py-3">
      <div className="mb-2 grid size-9 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <Sprout className="size-5" />
      </div>
      {AREAS.map((a) => (
        <button
          key={a.key}
          title={a.label}
          onClick={() => setArea(a.key)}
          className={cn(
            "grid size-10 place-items-center rounded-md text-muted-foreground transition-colors",
            area === a.key
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "hover:bg-muted hover:text-foreground"
          )}
        >
          <a.icon className="size-[18px]" />
        </button>
      ))}
      <button title="Loads" className="grid size-10 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
        <Truck className="size-[18px]" />
      </button>
      <button title="Settlements" className="grid size-10 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
        <Banknote className="size-[18px]" />
      </button>
      <div className="flex-1" />
      <button title="Settings" className="grid size-10 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
        <Settings className="size-[18px]" />
      </button>
    </nav>
  )
}

function ContextColumn({
  area,
  selected,
  onSelect,
  onClose,
}: {
  area: (typeof AREAS)[number]
  selected: string
  onSelect: (id: string) => void
  onClose?: () => void
}) {
  return (
    <PanelRegion className="flex h-full w-72 shrink-0 flex-col bg-sidebar">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <span className="text-sm font-semibold">{area.columnTitle}</span>
        <span className="rounded-full bg-muted px-1.5 py-px font-mono text-[10.5px] text-muted-foreground">
          {area.records.length}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button size="icon-sm" variant="ghost" aria-label={`New ${area.columnTitle.toLowerCase()}`}><Plus /></Button>
          {onClose && (
            <Button size="icon-sm" variant="ghost" aria-label="Close panel" onClick={onClose}><X /></Button>
          )}
        </div>
      </div>
      <div className="border-b p-2.5">
        <span className="relative block">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={`Search ${area.columnTitle.toLowerCase()}…`} className="h-(--control-h-sm) pl-8" />
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {area.records.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelect(r.id)}
            className={cn(
              "flex w-full flex-col gap-0.5 rounded-md px-2.5 py-2 text-left transition-colors",
              r.id === selected ? "bg-sidebar-accent" : "hover:bg-muted"
            )}
          >
            <span className="flex w-full items-baseline gap-2">
              <span className={cn("min-w-0 truncate text-[13px] font-medium", r.id === selected && "font-semibold text-sidebar-accent-foreground")}>
                {r.title}
              </span>
              <span className="ml-auto font-mono text-xs">{r.price}</span>
            </span>
            <span className="flex w-full items-center gap-2">
              <span className="min-w-0 truncate text-xs text-muted-foreground">{r.sub}</span>
              <span className="ml-auto font-mono text-[10.5px] text-muted-foreground">{r.id}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="border-t px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
        corn $4.16 · beans $10.25 · wheat $5.58
      </div>
    </PanelRegion>
  )
}

function WorkspaceHeader({
  record,
  onOpenList,
  onToggleChat,
  chatOpen,
}: {
  record: Record_
  onOpenList: () => void
  onToggleChat: () => void
  chatOpen: boolean
}) {
  return (
    <div className="flex h-14 shrink-0 items-center gap-2.5 border-b px-4">
      <Button size="icon-sm" variant="ghost" className="lg:hidden" aria-label="Open list" onClick={onOpenList}>
        <PanelLeft />
      </Button>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold">
            {record.id} · {record.title}
          </span>
          <StatusBadge status={record.status} />
        </div>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <Button size="sm" variant="outline" className="max-sm:hidden">Counter</Button>
        <Button size="sm" className="max-sm:hidden">Book</Button>
        <Button
          size="icon-sm"
          variant={chatOpen ? "secondary" : "ghost"}
          aria-label="Toggle assistant"
          onClick={onToggleChat}
          className="xl:hidden"
        >
          <MessageSquare />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="More"><MoreVertical /></Button>
      </div>
    </div>
  )
}

function Workspace({
  record,
  onOpenList,
  onToggleChat,
  chatOpen,
}: {
  record: Record_
  onOpenList: () => void
  onToggleChat: () => void
  chatOpen: boolean
}) {
  return (
    <PanelRegion className="flex h-full min-w-0 flex-1 flex-col">
      <WorkspaceHeader
        record={record}
        onOpenList={onOpenList}
        onToggleChat={onToggleChat}
        chatOpen={chatOpen}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-b bg-foreground/[0.025] px-5 py-4 lg:grid-cols-4">
          {record.facts.map(([k, v]) => (
            <div key={k}>
              <div className="text-xs font-medium text-muted-foreground">{k}</div>
              <div className="mt-0.5 font-mono text-sm">{v}</div>
            </div>
          ))}
        </div>
        <div className="p-5">
          <div className="grid min-h-72 place-items-center rounded-[var(--radius-surface)] border-[1.5px] border-dashed font-mono text-xs text-muted-foreground">
            workspace canvas — {record.title} · {record.sub}
          </div>
        </div>
      </div>
    </PanelRegion>
  )
}

function ChatPanel({ record, onClose }: { record: Record_; onClose?: () => void }) {
  const [messages, setMessages] = React.useState<{ role: "assistant" | "user"; text: string }[]>([
    { role: "assistant", text: `Watching ${record.id} — ask me about pricing, space, or history.` },
  ])
  const [draft, setDraft] = React.useState("")
  const replyIdx = React.useRef(0)
  const scroller = React.useRef<HTMLDivElement>(null)

  const send = () => {
    const text = draft.trim()
    if (!text) return
    const reply = CANNED_REPLIES[replyIdx.current++ % CANNED_REPLIES.length]
    setMessages((m) => [...m, { role: "user", text }, { role: "assistant", text: reply }])
    setDraft("")
    requestAnimationFrame(() => scroller.current?.scrollTo({ top: 1e6 }))
  }

  return (
    <PanelRegion className="flex h-full w-80 shrink-0 flex-col bg-sidebar">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <span className="grid size-6 place-items-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
          <Sprout className="size-3.5" />
        </span>
        <span className="text-sm font-semibold">Assistant</span>
        <span className="ml-auto flex items-center gap-1">
          {onClose && (
            <Button size="icon-sm" variant="ghost" aria-label="Close assistant" onClick={onClose}><X /></Button>
          )}
        </span>
      </div>
      <div ref={scroller} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3.5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[90%] rounded-[var(--radius-surface)] px-3 py-2 text-[13px] leading-relaxed",
              m.role === "assistant"
                ? "bg-card ring-1 ring-border"
                : "ml-auto bg-primary text-primary-foreground"
            )}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="border-t p-3">
        <span className="relative block">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about this offer…"
            className="pr-10"
          />
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Send"
            onClick={send}
            className="absolute top-1/2 right-1 -translate-y-1/2"
          >
            <SendHorizontal />
          </Button>
        </span>
      </div>
    </PanelRegion>
  )
}

export default function WorkspacePage() {
  const [areaKey, setAreaKey] = React.useState("origination")
  const area = AREAS.find((a) => a.key === areaKey)!
  const [selectedId, setSelectedId] = React.useState(area.records[0].id)
  const [listOpen, setListOpen] = React.useState(false)   // < lg overlay
  const [chatOpen, setChatOpen] = React.useState(false)   // < xl overlay
  const record = area.records.find((r) => r.id === selectedId) ?? area.records[0]

  const switchArea = (k: string) => {
    setAreaKey(k)
    const next = AREAS.find((a) => a.key === k)!
    setSelectedId(next.records[0].id)
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-sidebar text-foreground">
      <IconRail area={areaKey} setArea={switchArea} />

      <PanelShell className="m-4 ml-0 flex min-w-0 flex-1 flex-col shadow-[var(--shadow-2xl)]">
        <PanelGroup className="min-h-0 flex-1">
          <div className="hidden lg:block">
            <ContextColumn area={area} selected={selectedId} onSelect={setSelectedId} />
          </div>
          <Workspace
            record={record}
            onOpenList={() => setListOpen(true)}
            onToggleChat={() => setChatOpen((v) => !v)}
            chatOpen={chatOpen}
          />
          <div className="hidden xl:block">
            <ChatPanel key={record.id} record={record} />
          </div>
        </PanelGroup>
      </PanelShell>

      {listOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Close panel" className="absolute inset-0 bg-foreground/30" onClick={() => setListOpen(false)} />
          <div className="absolute top-4 bottom-4 left-14 overflow-hidden rounded-[var(--radius-floating)] border border-border shadow-[var(--shadow-2xl)]">
            <ContextColumn
              area={area}
              selected={selectedId}
              onSelect={(id) => { setSelectedId(id); setListOpen(false) }}
              onClose={() => setListOpen(false)}
            />
          </div>
        </div>
      )}

      {chatOpen && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <button aria-label="Close assistant" className="absolute inset-0 bg-foreground/30" onClick={() => setChatOpen(false)} />
          <div className="absolute top-4 right-4 bottom-4 overflow-hidden rounded-[var(--radius-floating)] border border-border shadow-[var(--shadow-2xl)]">
            <ChatPanel key={record.id} record={record} onClose={() => setChatOpen(false)} />
          </div>
        </div>
      )}

      <a
        href="/"
        className="fixed bottom-3 left-1.5 z-50 grid size-11 place-items-center rounded-[var(--radius-control)] text-muted-foreground hover:bg-muted hover:text-foreground"
        title="Back to design system"
      >
        <ArrowLeft className="size-[18px]" />
      </a>
    </div>
  )
}
