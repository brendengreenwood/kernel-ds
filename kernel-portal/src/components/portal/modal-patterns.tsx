"use client"

import * as React from "react"

import { Section, Subhead } from "@/components/portal/section"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

/* -- sizes ------------------------------------------------------------------ */

const SIZES: { w: "xs" | "sm" | "md" | "lg" | "xl"; label: string; use: string }[] = [
  { w: "xs", label: "xs", use: "confirms — a sentence and two buttons" },
  { w: "sm", label: "sm (default)", use: "short messages, single-field asks" },
  { w: "md", label: "md", use: "forms up to ~6 fields" },
  { w: "lg", label: "lg", use: "review surfaces, two-column content" },
  { w: "xl", label: "xl", use: "flows and workspaces — pair with height" },
]

function SizeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-lg border bg-card p-6">
      {SIZES.map((s) => (
        <Dialog key={s.label}>
          <DialogTrigger render={<Button variant="outline" size="sm">{s.label}</Button>} />
          <DialogContent width={s.w}>
            <DialogHeader>
              <DialogTitle>A {s.label} dialog</DialogTitle>
              <DialogDescription>
                <span className="font-mono">width=&quot;{s.w}&quot;</span> · {s.use}.
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
        <DialogContent width="md">
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
        <DialogContent width="xs">
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
        <DialogContent width="lg">
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

/* -- height & flows ------------------------------------------------------------ */

function TallDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm">Tall (fixed height)</Button>} />
      <DialogContent width="md" height="tall">
        <DialogHeader>
          <DialogTitle>Producer history</DialogTitle>
          <DialogDescription>
            <span className="font-mono">height=&quot;tall&quot;</span> — the frame is
            fixed; <span className="font-mono">&lt;DialogBody&gt;</span> flexes and scrolls.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <dl>
            {Array.from({ length: 18 }, (_, i) => (
              <div key={i} className="flex items-baseline justify-between gap-4 border-b py-2.5 last:border-b-0">
                <dt className="text-xs font-medium text-muted-foreground">Delivery {18 - i}</dt>
                <dd className="font-mono text-sm">{(2200 + ((i * 311) % 900)).toLocaleString()} bu</dd>
              </div>
            ))}
          </dl>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const FLOW_STEPS = ["Terms", "Delivery schedule", "Review & book"] as const

function FlowModal() {
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState(0)
  const last = step === FLOW_STEPS.length - 1
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setStep(0) }}>
      <DialogTrigger render={<Button size="sm">Full-height flow</Button>} />
      <DialogContent width="xl" height="full">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <DialogTitle>New contract</DialogTitle>
            <span className="font-mono text-xs text-muted-foreground">
              step {step + 1} of {FLOW_STEPS.length} · {FLOW_STEPS[step]}
            </span>
          </div>
          <DialogDescription>
            An entire flow in one modal: bar header carries the progress, the
            body is the step, the footer navigates.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="grid h-full min-h-40 place-items-center rounded-md border-[1.5px] border-dashed font-mono text-xs text-muted-foreground">
            {FLOW_STEPS[step]} — step content region
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((v) => Math.max(0, v - 1))}
            className="sm:mr-auto"
          >
            Back
          </Button>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          {last ? (
            <Button onClick={() => setOpen(false)}>Book contract</Button>
          ) : (
            <Button onClick={() => setStep((v) => v + 1)}>Next</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function HeightDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-lg border bg-card p-6">
      <TallDialog />
      <FlowModal />
      <p className="max-w-72 text-xs leading-relaxed text-muted-foreground">
        <span className="font-mono">auto</span> hugs content ·{" "}
        <span className="font-mono">tall</span> fixes ~75dvh ·{" "}
        <span className="font-mono">full</span> is the flow canvas. Fixed
        heights need a <span className="font-mono">&lt;DialogBody&gt;</span>.
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
      <DialogContent showCloseButton={false} width="xs">
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

      <Subhead>Header &amp; footer bars</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        The header is its own bar — title, context, and the ✕ live there,
        visually separated from the work. Footers come in three arrangements:{" "}
        <b>standard</b> (dismiss + commit, right-aligned), <b>split</b> (a
        rarer third action anchored left, away from the commit pair), and{" "}
        <b>stacked</b> (full-width buttons for one clear recommendation). All
        collapse to stacked on phones. The primary always names its verb —
        never &ldquo;OK&rdquo;.
      </p>
      <FooterDemo />

      <Subhead>Height &amp; flows</Subhead>
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-muted-foreground">
        Width is only half the frame. <b>auto</b> height hugs the content;{" "}
        <b>tall</b> fixes the frame for feeds and histories; <b>full</b> turns
        the modal into a canvas — entire flows run inside it, with the header
        bar carrying progress and the footer navigating steps. If a flow
        outgrows even that, it&rsquo;s a page.
      </p>
      <HeightDemo />

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
