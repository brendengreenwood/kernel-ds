import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kernel/ui";
import { Link } from "react-router-dom";

import { typeStyles } from "@/lib/type-styles";

import { Section, Subhead } from "./section";

/** One claimed hue in the ledger. Chip classes flip with the theme. */
type LedgerRow = {
  name: string;
  chip: string;
  token: string;
  light: string;
  dark: string;
  means: string;
};

const LEDGER: LedgerRow[] = [
  {
    name: "Cargill",
    chip: "bg-map-cargill",
    token: "--map-cargill",
    light: "--brand-500",
    dark: "--viz-crop-400",
    means: "Buying points we run. The only green on the map.",
  },
  {
    name: "ADM",
    chip: "bg-map-adm",
    token: "--map-adm",
    light: "--viz-plum-500",
    dark: "--viz-plum-400",
    means: "Competitor buying points.",
  },
  {
    name: "Water",
    chip: "bg-map-barge",
    token: "--map-barge",
    light: "--viz-sky-600",
    dark: "--viz-sky-400",
    means: "Barge corridors only — rivers a boat can move grain on.",
  },
  {
    name: "Rail",
    chip: "bg-map-rail",
    token: "--map-rail",
    light: "--viz-rust-500",
    dark: "--viz-rust-500",
    means: "Rail corridors and flow. Ramps 600 to 400 by volume.",
  },
  {
    name: "Ports",
    chip: "bg-map-port",
    token: "--map-port",
    light: "--viz-teal-600",
    dark: "--viz-teal-400",
    means: "Export terminals at the end of a corridor.",
  },
  {
    name: "Ethanol",
    chip: "bg-map-refinery",
    token: "--map-refinery",
    light: "--viz-wheat-600",
    dark: "--viz-wheat-400",
    means: "Ethanol plants.",
  },
  {
    name: "Feedyards",
    chip: "bg-map-feed",
    token: "--map-feed",
    light: "--viz-slate-600",
    dark: "--viz-slate-200",
    means: "Feedyards and feed mills.",
  },
  {
    name: "LDC (reserved)",
    chip: "bg-map-ldc",
    token: "--map-ldc",
    light: "--viz-clay-600",
    dark: "--viz-clay-400",
    means: "Claimed for Louis Dreyfus before any LDC data exists.",
  },
];

const CHANNELS = [
  {
    channel: "Fill vs hollow",
    means: "Who buys. Filled marks are buying points; hollow marks are destinations.",
    never: "Facility kind",
  },
  {
    channel: "Shape",
    means:
      "Facility kind. Triangle river terminal, circle elevator or ethanol plant, square processing plant or feedyard, diamond export terminal.",
    never: "Owner",
  },
  {
    channel: "Hue",
    means: "Owner or category, claimed in the hue ledger below.",
    never: "Importance",
  },
  {
    channel: "Size",
    means: "Capacity, capped so the biggest mark stays readable.",
    never: "Ownership",
  },
  {
    channel: "Lightness",
    means: "Closeness — nearer things read stronger, far things recede.",
    never: "Category",
  },
  {
    channel: "Outline + beam",
    means: "Interaction state. Hover adds half a weight, selected adds one.",
    never: "Data",
  },
];

const ZOOMS = [
  { name: "country", z: "3", shows: "Corridors and the shape of the network" },
  { name: "region", z: "5", shows: "Buying points appear, grouped by owner" },
  { name: "state", z: "7", shows: "Full mark detail, draw areas" },
  { name: "county", z: "9", shows: "Labels, individual facilities" },
  { name: "town", z: "12", shows: "Everything, fanned-out co-located points" },
];

export function MapGrammarSection() {
  return (
    <Section
      id="map-grammar"
      eyebrow="Patterns"
      title="Map grammar"
      lead="The visual language for maps of buying points, destinations and corridors. Three layers, one job per visual channel, a hue ledger that claims colors before use, and named zoom stops — written so the same grammar restyles any MapLibre basemap."
    >
      <Subhead id="map-grammar-layers">Three layers</Subhead>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            name: "Ground",
            body: "The basemap, recessed and re-tinted from the --map-ground, --map-roads and --map-water tokens (neutral-warm in light, neutral-950 in dark). The ground is context, never content.",
          },
          {
            name: "Marks",
            body: "Our data: buying points, destinations, draw areas, corridors. Marks read Kernel tokens directly — never the basemap palette — so light and dark hold without retuning.",
          },
          {
            name: "Chrome",
            body: "Floating controls, legends and panels over the map. Chrome is the floating-pane pattern; the map page composes it, it does not own it.",
          },
        ].map((layer) => (
          <div
            key={layer.name}
            className="rounded-[var(--radius-surface)] border bg-card p-4"
          >
            <h5 className={typeStyles.overline}>{layer.name}</h5>
            <p className="mt-2 text-sm text-muted-foreground">{layer.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Chrome is documented at{" "}
        <Link to="/panes" className="text-primary underline underline-offset-4">
          Floating panes
        </Link>
        .
      </p>

      <Subhead id="map-grammar-channels">One job per visual channel</Subhead>
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
        Every channel carries exactly one meaning, and the “never means” column
        is as binding as the first. When two meanings compete for a channel,
        one of them gets a different channel — not a louder version of the
        same one.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Channel</TableHead>
            <TableHead>Means</TableHead>
            <TableHead>Never means</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {CHANNELS.map((c) => (
            <TableRow key={c.channel}>
              <TableCell className="font-medium">{c.channel}</TableCell>
              <TableCell className="whitespace-normal text-muted-foreground">
                {c.means}
              </TableCell>
              <TableCell className="text-muted-foreground">{c.never}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Subhead id="map-grammar-ledger">Hue ledger</Subhead>
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
        Hue is the scarcest channel, so a color must be claimed here before it
        is painted. The ledger is full: a new category gets a second channel
        (shape, fill, grouping), not a new hue. Each claim ships as a semantic token in
        <code> @kernel/ui</code> (<code>--map-*</code>), aliased onto the Kernel
        ramps shown beside it — swatches read the tokens and flip with the
        theme.
      </p>
      <div className="overflow-hidden rounded-[var(--radius-surface)] border">
        {LEDGER.map((row) => (
          <div
            key={row.name}
            className="flex items-center gap-4 border-b bg-card px-4 py-3 last:border-b-0"
          >
            <span
              aria-hidden
              className={`h-9 w-16 shrink-0 rounded-[var(--radius-control)] ${row.chip}`}
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{row.name}</div>
              <div className="truncate text-sm text-muted-foreground">
                {row.means}
              </div>
            </div>
            <code className="hidden shrink-0 text-xs text-muted-foreground sm:block">
              {row.token} · {row.light} · dark {row.dark}
            </code>
          </div>
        ))}
      </div>

      <Subhead id="map-grammar-zoom">Zoom vocabulary</Subhead>
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
        Zoom levels get names, and layers style against the names — never raw
        numbers scattered through layer definitions. Mark size follows one
        curve against the same stops (0.3 → 0.45 → 0.75 → 1.1 across country
        to county).
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Zoom</TableHead>
            <TableHead>What appears</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ZOOMS.map((z) => (
            <TableRow key={z.name}>
              <TableCell className="font-medium">{z.name}</TableCell>
              <TableCell className="tabular-nums">{z.z}</TableCell>
              <TableCell className="whitespace-normal text-muted-foreground">
                {z.shows}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Subhead id="map-grammar-binding">Tile-source binding</Subhead>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[var(--radius-surface)] border bg-card p-4">
          <h5 className={typeStyles.overline}>
            Travels to any basemap
          </h5>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            <li>The grammar: channels, hue ledger, layers, lenses</li>
            <li>Palette and mark roles read from Kernel tokens</li>
            <li>Marker recipe, SDF glyphs, zoom size curve</li>
            <li>Self-drawn corridors from our own sources</li>
          </ul>
        </div>
        <div className="rounded-[var(--radius-surface)] border bg-card p-4">
          <h5 className={typeStyles.overline}>
            Re-bound per tile source
          </h5>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            <li>Basemap layer ids for the ground re-tint (water, roads, rail)</li>
            <li>Handoff zooms where basemap lines yield to our corridors</li>
            <li>Label layers to mute or keep</li>
          </ul>
        </div>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        The prototype binds to OpenFreeMap (OpenMapTiles schema); the product
        binds to CARTO (Voyager schema). Different source-layer names, same
        grammar — all per-source bindings live in one file so a basemap swap
        touches exactly one place.
      </p>

      <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
        The map kit itself (palette, marker recipe, glyphs, zoom curves) lives
        in the origination-map prototypes, not in <code>@kernel/ui</code> — the
        library takes no MapLibre dependency for one consumer. This page is the
        canonical statement of the grammar; prototype docs point here.
      </p>
    </Section>
  );
}
