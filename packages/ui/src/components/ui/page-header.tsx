import { cn } from "@/lib/utils"

/* Page title row — one definition so every page's header carries the same
   type and rhythm. Pages keep their own outer padding.

   The glyph repeats the rail's icon for the route: arriving on a page, the
   mark you clicked is the mark at the top of what you got.

   Three sizes, because there are three depths at which something gets named.

   `page` heads a route. `panel` heads a surface that is the subject of its own
   box — an opened row's summary is a page in miniature, and it was being built
   by hand out of a chip, a 14px bold line and a muted line under it. `section`
   heads a block INSIDE such a panel: it is the third name down and has to read
   as subordinate to the one above it, or the panel appears to hold two equal
   titles and the reader has to work out which owns which.

   The steps are 44/30, 36/20, 28/16 — chip and title falling together, so each
   size keeps the same relationship between the mark and the words rather than
   shrinking the type against a fixed chip.

   Heading LEVEL does not follow size. `page` is the h1; both smaller sizes are
   h2, because the panels of an opened row are peer sections of that row and a
   level chosen for its type size is how a document grows a heading hierarchy
   that does not match its structure. */

/* The glyph chip is a TILE, not a wash. As a flat 5% fill it had no edge, no
   lip and no relation to the elevation language every other object on the
   plate speaks, so it read as a smudge behind the glyph rather than a thing
   holding it. It takes the same recipe as a frame on a card: fill one step off
   the surface, a hairline for structure (light leans on the edge), a 1px top
   lip (dark leans on the lip, having no light source).

   Radius steps down with the box so the smaller chips do not read rounder than
   the big one — the same concentric arithmetic each time, glyph corner (~4px)
   plus the padding around it. The DS radius ladder already encodes the steps:
   `lg` is `--radius` itself, `md` and `sm` sit 2px and 4px under it.

   The 1px translate is optical: centring puts the chip on the line box's
   centre, but the eye reads the title's CAP centre, which sits 1px lower. */
const CHIP =
  "border border-border bg-foreground/5 text-foreground shadow-[inset_0_1px_0_0_var(--elev-lip)] translate-y-px"

const SIZES = {
  page: {
    chip: "grid size-11 shrink-0 place-items-center rounded-lg",
    glyph: "size-6",
    title: "text-3xl",
    description: "text-sm",
  },
  panel: {
    chip: "grid size-9 shrink-0 place-items-center rounded-md",
    glyph: "size-5",
    title: "text-xl",
    description: "text-sm",
  },
  section: {
    chip: "grid size-7 shrink-0 place-items-center rounded-sm",
    glyph: "size-4",
    title: "text-base",
    description: "text-xs",
  },
} as const

function PageHeader({
  icon: Icon,
  title,
  description,
  action,
  size = "page",
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  size?: "page" | "panel" | "section"
}) {
  const Heading = size === "page" ? "h1" : "h2"
  const s = SIZES[size]
  return (
    <div
      data-slot="page-header"
      data-size={size}
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3"
    >
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <span data-slot="page-header-chip" data-size={size} className={cn(s.chip, CHIP)}>
            <Icon className={s.glyph} />
          </span>
        ) : null}
        <div className="min-w-0">
          <Heading className={cn(s.title, "font-semibold tracking-tight")}>{title}</Heading>
          {description ? (
            <p className={cn("mt-0.5", s.description, "text-muted-foreground")}>{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="flex min-w-0 items-center gap-2">{action}</div> : null}
    </div>
  )
}

export { PageHeader }
