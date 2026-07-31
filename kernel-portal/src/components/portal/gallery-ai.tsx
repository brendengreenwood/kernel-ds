"use client"

import { CheckIcon, FileText, Trash2, Sparkles } from "@kernel/ui/icon"

import {
  MessageGroup,
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
  MessageFooter,
} from "@kernel/ui"
import {
  BubbleGroup,
  Bubble,
  BubbleContent,
  BubbleReactions,
} from "@kernel/ui"
import {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from "@kernel/ui"
import { Marker, MarkerIcon, MarkerContent } from "@kernel/ui"
import { Spinner } from "@kernel/ui"
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@kernel/ui"
import { Button } from "@kernel/ui"
import { Demo } from "./section"
import type { GalleryCluster } from "@/lib/gallery-types"

function MessageCluster() {
  return (
    <Demo className="flex-col items-stretch">
      <MessageGroup className="w-full max-w-xl">
        <Message>
          <MessageAvatar className="size-8 text-xs font-medium">EM</MessageAvatar>
          <MessageContent>
            <MessageHeader>Ellis Morgan · 09:14</MessageHeader>
            <Bubble variant="muted">
              <BubbleContent>
                Which vessels on the Rotterdam run are still unfixed for August?
              </BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
        <Message align="end">
          <MessageAvatar className="size-8">
            <Sparkles className="size-4" />
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>Agent · 09:14</MessageHeader>
            <Bubble>
              <BubbleContent>
                Three: Northern Trader, Baltic Dawn, and Sea Marten. Baltic Dawn has
                a laycan closing Friday.
              </BubbleContent>
            </Bubble>
            <MessageFooter>Answered from 2 collections</MessageFooter>
          </MessageContent>
        </Message>
      </MessageGroup>
    </Demo>
  )
}

function BubbleCluster() {
  return (
    <Demo className="flex-col items-stretch gap-6">
      <BubbleGroup className="w-full max-w-md">
        <Bubble variant="muted">
          <BubbleContent>Muted — the assistant's voice.</BubbleContent>
        </Bubble>
        <Bubble align="end">
          <BubbleContent>Default — the operator's own turn.</BubbleContent>
        </Bubble>
        <Bubble variant="outline">
          <BubbleContent>Outline — a quoted or draft turn.</BubbleContent>
        </Bubble>
        <Bubble variant="destructive">
          <BubbleContent>Destructive — this turn failed to send.</BubbleContent>
        </Bubble>
        <Bubble variant="tinted" className="mb-4">
          <BubbleContent>Tinted, with reactions attached.</BubbleContent>
          <BubbleReactions>👍 3</BubbleReactions>
        </Bubble>
      </BubbleGroup>
    </Demo>
  )
}

function AttachmentCluster() {
  return (
    <Demo className="flex-col items-stretch gap-6">
      <AttachmentGroup className="w-full">
        <Attachment>
          <AttachmentMedia>
            <FileText />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>charter-party-2026-08.pdf</AttachmentTitle>
            <AttachmentDescription>PDF · 248 KB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Remove attachment">
              <Trash2 />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
        <Attachment state="uploading">
          <AttachmentMedia>
            <Spinner />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>bill-of-lading.pdf</AttachmentTitle>
            <AttachmentDescription>Uploading…</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
        <Attachment state="error">
          <AttachmentMedia>
            <FileText />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>survey.docx</AttachmentTitle>
            <AttachmentDescription>Upload failed — too large</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      </AttachmentGroup>
    </Demo>
  )
}

function MarkerCluster() {
  return (
    <Demo className="flex-col items-stretch gap-4">
      <div className="w-full max-w-md space-y-4">
        <Marker variant="separator">
          <MarkerContent>Today</MarkerContent>
        </Marker>
        <Marker>
          <MarkerIcon>
            <CheckIcon />
          </MarkerIcon>
          <MarkerContent>Context trimmed to the last 20 turns</MarkerContent>
        </Marker>
        <Marker variant="border">
          <MarkerContent>Earlier this week</MarkerContent>
        </Marker>
      </div>
    </Demo>
  )
}

function SpinnerCluster() {
  return (
    <Demo>
      <Spinner className="size-3" />
      <Spinner />
      <Spinner className="size-6" />
      <Spinner className="size-6 text-muted-foreground" />
      <Button disabled>
        <Spinner />
        Saving
      </Button>
    </Demo>
  )
}

const SCROLLER_TURNS = [
  "Pull the August fixtures for the Rotterdam run.",
  "Nine fixtures, six of them confirmed.",
  "Which three aren't?",
  "Northern Trader, Baltic Dawn, Sea Marten.",
  "What's the laycan on Baltic Dawn?",
  "12–16 August. It closes Friday.",
  "Flag it to the chartering desk.",
  "Flagged. Owner notified at 09:20.",
  "Any demurrage exposure on the confirmed six?",
  "Two — Canopy Edge and Leaf Carrier, both at Antwerp.",
]

function MessageScrollerCluster() {
  return (
    <Demo className="flex-col items-stretch">
      <MessageScrollerProvider>
        <MessageScroller className="h-64 w-full max-w-xl rounded-lg border bg-background">
          <MessageScrollerViewport className="p-4">
            <MessageScrollerContent className="gap-3">
              {SCROLLER_TURNS.map((text, i) => (
                <MessageScrollerItem key={text} scrollAnchor={i === SCROLLER_TURNS.length - 1}>
                  <Message align={i % 2 === 0 ? "start" : "end"}>
                    <MessageContent>
                      <Bubble variant={i % 2 === 0 ? "muted" : "default"}>
                        <BubbleContent>{text}</BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
    </Demo>
  )
}

export const aiClusters: GalleryCluster[] = [
  { anchor: "c-message", slug: "message", title: "Message", group: "AI & chat", demo: MessageCluster },
  { anchor: "c-bubble", slug: "bubble", title: "Bubble", group: "AI & chat", demo: BubbleCluster },
  { anchor: "c-attachment", slug: "attachment", title: "Attachment", group: "AI & chat", demo: AttachmentCluster },
  { anchor: "c-marker", slug: "marker", title: "Marker", group: "AI & chat", demo: MarkerCluster },
  { anchor: "c-spinner", slug: "spinner", title: "Spinner", group: "AI & chat", demo: SpinnerCluster },
  { anchor: "c-message-scroller", slug: "message-scroller", title: "Message scroller", group: "AI & chat", demo: MessageScrollerCluster },
]
