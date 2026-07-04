"use client"

import * as React from "react"

import { Section, Subhead } from "@/components/portal/section"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

/* -- sizes ------------------------------------------------------------------ */

const SIZES: { label: string; max: string; use: string }[] = [
  { label: "xs", max: "sm:max-w-xs", use: "confirms — a sentence and two buttons" },
  { label: "sm (default)", max: "sm:max-w-sm", use: "short messages, single-field asks" },
  { label: "md", max: "sm:max-w-md", use: "forms up to ~6 fields" },
  { label: "lg", max: "sm:max-w-lg", use: "review surfaces, two-column content" },
]

function SizeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-lg border bg-card p-6">
      {SIZES.map((s) => (
        <Dialog key={s.label}>
          <DialogTrigger render={<Button variant="outline" size="sm">{s.label}</Button>} />
          <DialogContent className={s.max}>
            <DialogHeader>
              <DialogTitle>A {s.label} dialog</DialogTitle>
              <DialogDescription>
                <span className="font-mono">{s.max}</span> · {s.use}.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              On phones every size becomes the same near-full-width sheet
              (<span className="font-mono">max-w-[calc(100%-2rem)]</span>) — the
              ladder only exists at <span className="font-mono">sm</span> and up.
            </p>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost">Cancel</Button>} />
              <Button>Continue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}

/* -- footer configurations ---------------------------------------------------- */

function FooterDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-lg border bg-card p-6">
      {/* standard */}
      <Dialog>
        <DialogTrigger render={<Button variant="outline" size="sm">Standard</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Standard footer</DialogTitle>
            <DialogDescription>
              Dismiss on the left of the pair, commit on the far right — the
              primary hugs the corner where the eye finishes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost">Cancel</Button>} />
            <Button>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* split: tertiary action anchored left */}
      <Dialog>
        <DialogTrigger render={<Button variant="outline" size="sm">Split</Button>} />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Split footer</DialogTitle>
            <DialogDescription>
              A third, rarer action anchors left — physically separated from
              the commit pair so it can&rsquo;t be hit by momentum. Usually the
              destructive one.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" className="sm:mr-auto">Delete draft</Button>
            <DialogClose render={<Button variant="ghost">Cancel</Button>} />
            <Button>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* stacked: full-width, primary on top */}
      <Dialog>
        <DialogTrigger render={<Button variant="outline" size="sm">Stacked</Button>} />
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Stacked footer</DialogTitle>
            <DialogDescription>
              One clear recommendation: full-width buttons, primary first,
              everything else beneath it. Best in xs confirms.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:flex-col-reverse sm:justify-stretch">
            <DialogClose render={<Button variant="ghost" className="w-full">Not now</Button>} />
            <Button className="w-full">Lock basis at −0.22</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* -- scrolling ---------------------------------------------------------------- */

function ScrollDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-lg border bg-card p-6">
      <Dialog>
        <DialogTrigger render={<Button variant="outline" size="sm">Scrollable body</Button>} />
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Delivery schedule</DialogTitle>
            <DialogDescription>
              Header and footer stay put; only the body scrolls, inside its own
              bordered region so the edge is visible.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto rounded-md border">
            <dl className="px-4 py-1">
              {Array.from({ length: 14 }, (_, i) => (
                <div key={i} className="flex items-baseline justify-between gap-4 border-b py-2.5 last:border-b-0">
                  <dt className="text-xs font-medium text-muted-foreground">Week {i + 1}</dt>
                  <dd className="font-mono text-sm">{(1600 + ((i * 137) % 500)).toLocaleString()} bu</dd>
                </div>
              ))}
            </dl>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost">Close</Button>} />
            <Button>Approve schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <p className="max-w-72 text-xs leading-relaxed text-muted-foreground">
        The dialog itself never exceeds the viewport — cap the body
        (<span className="font-mono">max-h + overflow-y-auto</span>), never the
        whole popup.
      </p>
    </div>
  )
}

/* -- dismissal ---------------------------------------------------------------- */

function DismissalDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-lg border bg-card p-6">
      <Dialog>
        <DialogTrigger render={<Button variant="outline" size="sm">Dismissable (default)</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dismissable</DialogTitle>
            <DialogDescription>
              Three exits, all safe: the ✕, Escape, and clicking the scrim.
              Default for anything that doesn&rsquo;t lose work.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost">Cancel</Button>} />
            <Button>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MustChooseDialog />
    </div>
  )
}

function MustChooseDialog() {
  const [open, setOpen] = React.useState(false)
  return (
    <Dialog
      open={open}
      disablePointerDismissal
      onOpenChange={(next, details) => {
        // the only way out is an explicit choice: refuse Escape, allow Close buttons
        const reason = String(details?.reason ?? "").toLowerCase()
        if (!next && !reason.includes("close") && !reason.includes("imperative")) return
        setOpen(next)
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm">Must choose</Button>} />
      <DialogContent showCloseButton={false} className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Pricing in progress</DialogTitle>
            <DialogDescription>
              No ✕, no outside-click close — leaving would drop the lock on
              ZCZ6. Reserve this for genuinely un-abandonable moments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:flex-col-reverse sm:justify-stretch">
            <DialogClose render={<Button variant="ghost" className="w-full">Release lock &amp; exit</Button>} />
            <Button className="w-full">Keep waiting</Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export function ModalPatternsSection() {
  return (
    <Section
      id="modals"
      eyebrow="Patterns"
      title="Modal patterns"
      lead="One dialog component, four axes of configuration: how wide it is, how the footer arranges its actions, what scrolls when content is long, and which ways out exist. Pick a point on each axis deliberately — the combinations below cover nearly every modal an app needs."
    >
      <Subhead>Size ladder</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Four stops: <b>xs</b> for confirms, <b>sm</b> for messages, <b>md</b>{" "}
        for forms, <b>lg</b> for review surfaces. Size to the content&rsquo;s
        natural width, then stop — past lg the task deserves a page, not a
        bigger modal.
      </p>
      <SizeDemo />

      <Subhead>Footer configurations</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        <b>Standard</b>: dismiss + commit, right-aligned. <b>Split</b>: a
        rarer third action anchored left, away from the commit pair.{" "}
        <b>Stacked</b>: full-width buttons when there&rsquo;s one clear
        recommendation. All collapse to stacked on phones automatically. The
        primary always names its verb — never &ldquo;OK&rdquo;.
      </p>
      <FooterDemo />

      <Subhead>Scrolling</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Long content scrolls in a capped, bordered body region; the title and
        actions never move. If the body wants more than about half the screen,
        that&rsquo;s the signal to leave the modal for a page or sheet.
      </p>
      <ScrollDemo />

      <Subhead>Dismissal</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Default is generous: ✕, Escape, and scrim click all cancel safely.
        A <i>must-choose</i> modal removes them and offers only explicit
        actions — legitimate only when abandoning would lose real work, and
        even then one of the choices must be an exit. Never nest modals.
      </p>
      <DismissalDemo />
    </Section>
  )
}
