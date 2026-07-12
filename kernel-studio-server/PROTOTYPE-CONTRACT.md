# Kernel Studio prototype contract — version 1

A prototype is a directory under `kernel-studio-server/prototypes/<id>/` containing a
manifest and one JSX file per screen. The portal's studio surface loads prototypes at
runtime through the Vite dev-server middleware (`/studio/prototypes/*`) — nothing is
built or bundled per prototype.

## Directory layout

```
prototypes/<id>/
  manifest.json
  screens/<file>.jsx     one per screen
  README.md              agent-written summary (title, prompt, directions, screens)
```

## manifest.json

Validated by the zod schema in `src/contract/manifest.ts` (the `write-prototype` tool
rejects invalid manifests).

```jsonc
{
  "version": 1,                    // literal 1
  "id": "fixture-grain-intake",    // lowercase kebab-case, matches the directory name
  "title": "Grain load intake",
  "prompt": "the user prompt that produced this prototype",
  "createdAt": "2026-07-12T12:00:00Z",  // ISO-8601
  "directions": [                  // >= 1; alternative design ideas for the same prompt
    {
      "id": "direction-a",
      "title": "Form-first intake",
      "note": "optional rationale for this direction",
      "screens": [                 // >= 1
        {
          "id": "intake",          // unique within the direction
          "title": "New load intake",
          "file": "screens/intake.jsx",  // must live under screens/ and end in .jsx
          "description": "optional"
        }
      ],
      "edges": [                   // from/to must reference screen ids in this direction
        { "from": "intake", "to": "review", "label": "Continue" }
      ]
    }
  ]
}
```

Rules enforced by the schema:

- `version` is the literal `1`.
- All ids (`id`, direction ids, screen ids) are lowercase kebab-case (`^[a-z0-9][a-z0-9-]{0,80}$`).
- Screen `file` paths match `screens/<name>.jsx`.
- Screen ids are unique within a direction; direction ids are unique within the manifest.
- Every edge's `from`/`to` must name a screen id in the same direction.

## Screen modules (`screens/*.jsx`)

Each screen is a JSX module transpiled in the browser with sucrase (`transforms: ["jsx"]`,
pragma `React.createElement`) and evaluated against the ds-bundle globals. The runtime
supplies `React` in scope; **do not** `import` anything.

The module's **default export** is a function component:

```jsx
export default function Screen({ navigate, Kernel }) {
  const [farm, setFarm] = React.useState("");
  return (
    <div style={{ background: "var(--background)", color: "var(--foreground)", padding: 24 }}>
      <Kernel.Card>
        <Kernel.CardHeader>
          <Kernel.CardTitle>New load</Kernel.CardTitle>
        </Kernel.CardHeader>
        <Kernel.CardContent>
          <Kernel.Input value={farm} onChange={(e) => setFarm(e.target.value)} />
          <Kernel.Button onClick={() => navigate("review")}>Continue</Kernel.Button>
        </Kernel.CardContent>
      </Kernel.Card>
    </div>
  );
}
```

- `Kernel` is the ds-bundle browser global (`window.Kernel`) — 48 components plus
  subcomponents (CardHeader, TableRow, SelectTrigger, …).
- `navigate(screenId)` follows an edge of the current direction to another screen.
- Style with Kernel CSS custom properties in inline styles (`--background`, `--card`,
  `--border`, `--muted-foreground`, `--status-*`, `--font-mono`, `--radius`, …).
- Numeric agricultural values: `fontFamily: "var(--font-mono)"`,
  `fontVariantNumeric: "tabular-nums"`, right-aligned in tables.
- Persistent lifecycle state uses `<Kernel.StatusBadge status="…" />`; momentary outcomes
  use `Kernel.Alert` / `Kernel.Badge` variants.
- The runtime mounts the component into a dedicated container with the **vendored**
  `window.ReactDOM` — never create another root and never touch the portal's React.
- Give key interactive elements `data-testid` attributes so proof drivers can assert on them.

## Loading (portal side)

`kernel-portal/src/studio/loader.ts` loads the ds-bundle runtime once (styles.css,
_ds_bundle.css, _vendor/react.js, _vendor/react-dom.js, _ds_bundle.js — same order as the
ds-bundle harnesses), fetches a screen's `.jsx`, transpiles with sucrase, evaluates it,
and mounts the default export into a supplied container node.
