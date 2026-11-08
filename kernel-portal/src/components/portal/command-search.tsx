import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Kbd,
  KbdGroup,
} from "@kernel/ui"
import { Search } from "@kernel/ui/icon"
import { galleryClusters } from "@/lib/gallery-registry"
import { nav } from "./app-sidebar"
import { MaturityPill } from "./section"

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)

/**
 * Global portal search: a Command palette over every rail page and every
 * component page. Opened from the header trigger or Ctrl/Cmd-K.
 */
export function CommandSearch() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const go = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-2 rounded-[var(--radius-control)] border border-input bg-muted/40 px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted sm:w-56"
      >
        <Search className="size-4 shrink-0 opacity-60" />
        <span className="hidden flex-1 text-left sm:inline">Search…</span>
        <KbdGroup className="hidden sm:inline-flex">
          <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        <span className="sr-only">Search pages and components</span>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search pages and components"
      >
        <CommandInput placeholder="Search pages and components…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {nav.map((group) => (
            <CommandGroup key={group.label} heading={group.label}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.to}
                  value={`${group.label} ${item.title}`}
                  onSelect={() => go(item.to)}
                >
                  <item.icon />
                  <span>{item.title}</span>
                  {item.maturity ? <MaturityPill maturity={item.maturity} /> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandGroup heading="Component pages">
            {galleryClusters.map((c) => (
              <CommandItem
                key={c.slug}
                value={`${c.group} ${c.title}`}
                onSelect={() => go(`/components/${c.slug}`)}
              >
                <span className="flex size-4 items-center justify-center" aria-hidden>
                  <span className="size-1.5 rounded-full bg-current opacity-40" />
                </span>
                <span>{c.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">{c.group}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
