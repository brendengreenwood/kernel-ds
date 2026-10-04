import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

import { BUYERS, REASONING, TONNAGE, type Buyer } from "@app/data/tonnage"

const BAR: Record<Buyer, string> = {
  cargill: "bg-om-cargill",
  adm: "bg-om-adm",
  bunge: "bg-om-bunge",
  ldc: "bg-om-ldc",
}

const MAX = TONNAGE[0].production
const LO = Math.log10(0.05)
const HI = Math.log10(MAX)
const width = (v: number, log: boolean) => (v <= 0 ? 0 : (log ? (Math.log10(v) - LO) / (HI - LO) : v / MAX) * 100)

const fmtProd = (v: number) => (v >= 10 ? v.toFixed(1) : v >= 1 ? v.toFixed(2) : v.toFixed(3))
const fmtBuy = (v: number) => (v === 0 ? "~0" : `~${v >= 10 ? v.toFixed(0) : v.toFixed(1)}`)

const GRAIN_OILSEED = 612.7 // corn + soybeans + wheat + sorghum + rice + barley + oats, M t
const combined = TONNAGE.reduce((t, r) => t + r.buys.cargill + r.buys.adm + r.buys.bunge + r.buys.ldc, 0)

export default function CropTonnagePage() {
  const [scale, setScale] = React.useState<"linear" | "log">("linear")
  const log = scale === "log"

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:px-6">
        <header className="grid gap-2">
          <h1 className="max-w-[40ch] text-2xl font-semibold leading-8 text-balance">
            US crop production by tonnage, and what the ABCDs likely buy
          </h1>
          <p className="max-w-[70ch] text-sm leading-5 text-muted-foreground">
            Sixteen US crops ranked by annual production in million metric tons, with estimates of Cargill, ADM, Bunge
            and Louis Dreyfus purchases laid over the top. Company figures are market-share estimates, not reported
            volumes — Cargill and LDC are private, and ADM and Bunge report global volumes, not US purchases by crop.
          </p>
        </header>

        <section aria-label="Summary" className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-4 sm:grid-cols-3 lg:grid-cols-5">
          {BUYERS.map((b) => (
            <div key={b.key} className="grid gap-0.5">
              <span className="text-2xl font-semibold leading-8 tabular-nums">{b.total}</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn("size-2.5 rounded-sm", BAR[b.key])} />
                {b.label}, estimated
              </span>
            </div>
          ))}
          <div className="grid gap-0.5">
            <span className="text-2xl font-semibold leading-8 tabular-nums">~{Math.round((combined / GRAIN_OILSEED) * 100)}%</span>
            <span className="text-xs text-muted-foreground">combined share of grains and oilseeds ({GRAIN_OILSEED}M t)</span>
          </div>
        </section>

        <section className="grid gap-3" aria-labelledby="ledger-h">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="ledger-h" className="text-base font-semibold">
              Production and estimated purchases
            </h2>
            <ToggleGroup
              variant="outline"
              size="sm"
              spacing={0}
              value={[scale]}
              onValueChange={(v) => v[0] && setScale(v[0] as "linear" | "log")}
              aria-label="Bar scale"
            >
              <ToggleGroupItem value="linear">Linear</ToggleGroupItem>
              <ToggleGroupItem value="log">Log</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-4 rounded-sm bg-om-production" />
              US production
            </span>
            {BUYERS.map((b) => (
              <span key={b.key} className="flex items-center gap-1.5">
                <span className={cn("h-1 w-4 rounded-full", BAR[b.key])} />
                {b.label}
              </span>
            ))}
            <span>(estimate bars top to bottom in that order)</span>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-[44rem]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-44">Crop</TableHead>
                  <TableHead>
                    <span className="sr-only">Bars</span>
                  </TableHead>
                  <TableHead className="text-right">US, M t</TableHead>
                  {BUYERS.map((b) => (
                    <TableHead key={b.key} className="text-right">
                      {b.key === "ldc" ? "LDC" : b.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {TONNAGE.map((r) => (
                  <TableRow key={r.crop}>
                    <TableCell className="font-medium">{r.crop}</TableCell>
                    <TableCell className="w-[38%] min-w-48">
                      <div className="relative h-7 overflow-hidden rounded-sm" aria-hidden>
                        <div
                          className="absolute inset-y-0 left-0 rounded-sm bg-om-production transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out)]"
                          style={{ width: `${width(r.production, log)}%` }}
                        />
                        <div className="absolute inset-x-0 inset-y-1 grid grid-rows-4 gap-px">
                          {BUYERS.map((b) => (
                            <div
                              key={b.key}
                              className={cn(
                                "h-full rounded-full transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out)]",
                                BAR[b.key],
                              )}
                              style={{ width: `${width(r.buys[b.key], log)}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{fmtProd(r.production)}</TableCell>
                    {BUYERS.map((b) => {
                      const v = r.buys[b.key]
                      return (
                        <TableCell
                          key={b.key}
                          className={cn("text-right font-mono tabular-nums", !v && "text-muted-foreground")}
                          title={v ? `${Math.round((v / r.production) * 100)}% of US production` : undefined}
                        >
                          {fmtBuy(v)}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs leading-4 text-muted-foreground">
            Linear shows how far corn outweighs everything else; log makes the bottom ten crops comparable. Tonnage is
            not like-for-like: sugar crops, potatoes and apples are wet weight, hay is air-dry, grains are at standard
            moisture.
          </p>
        </section>

        <section className="grid gap-3" aria-labelledby="why-h">
          <h2 id="why-h" className="text-base font-semibold">
            How each estimate was built
          </h2>
          <div className="overflow-x-auto">
            <Table className="min-w-[48rem]">
              <TableHeader>
                <TableRow>
                  <TableHead>Crop</TableHead>
                  {BUYERS.map((b) => (
                    <TableHead key={b.key} className="text-right">
                      {b.key === "ldc" ? "LDC" : b.label}
                    </TableHead>
                  ))}
                  <TableHead>Reasoning</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {REASONING.map((r) => (
                  <TableRow key={r.crop} className="align-top">
                    <TableCell className="font-medium whitespace-normal">{r.crop}</TableCell>
                    {r.est.map((e, i) => (
                      <TableCell key={i} className="text-right font-mono tabular-nums">
                        {e}
                      </TableCell>
                    ))}
                    <TableCell className="max-w-[60ch] min-w-80 whitespace-normal text-muted-foreground">{r.why}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="max-w-[70ch] text-xs leading-4 text-muted-foreground">
            In bushels, at 39.37 bu/t for corn and 36.74 bu/t for soybeans: Cargill about 1.57 billion of corn and 661
            million of soybeans, ADM about 1.26 billion and 735 million, Bunge about 551 million and 478 million, LDC
            about 197 million and 184 million.
          </p>
        </section>

        <section className="grid gap-3" aria-labelledby="careful-h">
          <h2 id="careful-h" className="text-base font-semibold">
            Reading this carefully
          </h2>
          <ul className="grid max-w-[70ch] list-disc gap-1.5 pl-5 text-sm leading-5 text-muted-foreground">
            <li>
              Corn and soybeans could each be off by 30% or more in either direction, for every company. The gap between
              Cargill and ADM on any one crop is smaller than that error, so their ranking is not reliable.
            </li>
            <li>Bunge's US footprint changed with the Viterra merger; its corn and wheat figures depend on how much of that interior network is counted.</li>
            <li>LDC's export volumes are the weakest part of its estimate. No source gave throughput for Port Allen or Seattle.</li>
            <li>ADM's wheat figure depends most on how much wheat its flour mills grind.</li>
            <li>The supplied corn range of 15.8–17.0 billion bushels is wide; 432.3M t converts to about 17.0 billion, so the low end does not match.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
