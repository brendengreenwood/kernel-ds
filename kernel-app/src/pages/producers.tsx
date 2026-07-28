import * as React from "react"
import { Archive, Pencil, Plus } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { CommodityLabel } from "@/components/ui/commodity-badge"
import { StatusBadge, type Status } from "@/components/ui/status-badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { producers, type ProducerStatus } from "@app/data/producers"

/** Producer relationship → DS StatusBadge hue + label. */
const statusMap: Record<ProducerStatus, { hue: Status; label: string }> = {
  active: { hue: "settled", label: "Active" },
  prospect: { hue: "pending", label: "Prospect" },
  inactive: { hue: "draft", label: "Inactive" },
}

const tabs: { value: string; label: string; match?: ProducerStatus }[] = [
  { value: "all", label: "All producers" },
  { value: "active", label: "Active", match: "active" },
  { value: "prospect", label: "Prospects", match: "prospect" },
  { value: "inactive", label: "Inactive", match: "inactive" },
]

const fmtBu = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 })

export default function ProducersPage() {
  const [tab, setTab] = React.useState("all")
  const rows = producers.filter((p) => tab === "all" || p.status === tab)

  return (
    <div className="flex w-full flex-col">
      {/* page header */}
      <div className="flex flex-wrap items-center gap-3 px-6 pt-6 md:px-8 md:pt-8">
        <h1 className="text-2xl font-semibold tracking-tight">Producers</h1>
        <Button size="sm" className="ml-auto">
          <Plus /> New producer
        </Button>
      </div>

      {/* relationship folder tabs, full-width baseline */}
      <div className="mt-4 px-6 md:px-8">
        <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
          <div className="max-w-full overflow-x-auto">
            <TabsList variant="folder" className="w-full">
              {tabs.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* object table */}
      <div className="px-6 py-6 md:px-8">
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table striped>
            <TableHeader>
              <TableRow>
                <TableHead>Producer</TableHead>
                <TableHead>Primary contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Commodities</TableHead>
                <TableHead className="text-right">Active contracts</TableHead>
                <TableHead className="text-right">Open position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium whitespace-nowrap">{p.name}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{p.contact}</TableCell>
                  <TableCell className="whitespace-nowrap">{p.location}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {p.commodities.map((c) => (
                        <CommodityLabel key={c} commodity={c} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.activeContracts}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.openBushels > 0 ? `${fmtBu(p.openBushels)} bu` : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={statusMap[p.status].hue}>{statusMap[p.status].label}</StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="default" size="icon-sm" aria-label={`Edit ${p.name}`}>
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Archive ${p.name}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Archive />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    No producers in this view.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
