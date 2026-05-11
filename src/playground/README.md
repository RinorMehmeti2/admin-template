# Playground registry

The `/playground` route (`src/pages/playground/PlaygroundPage.tsx`) renders a
searchable list of components on the left and a live preview + auto-generated
prop controls on the right. The registry that drives it lives here:

- `types.ts` — schema types (`PropKind`, `PropSchema`, `PlaygroundEntry`).
- `registry.tsx` — the entries themselves. **This is the file you edit to
  add a component.**
- `PropControls.tsx` — kind → control mapping (uses Input, NumberInput,
  Switch, Combobox, ColorPicker, Textarea).
- `codegen.ts` — generates the JSX string for the "Copy code" button.
- `preview.ts` — translates raw values into live props (resolves JSX presets,
  drops empty strings, etc.).

## Adding a component

Append an entry to `PLAYGROUND_REGISTRY`:

```tsx
{
  name: 'MyComponent',
  category: 'forms',                       // matches its directory bucket
  component: MyComponent,
  keywords: ['search', 'lookup'],          // boosts the left-pane search
  propSchemas: {
    placeholder: { kind: 'string', default: 'Type…' },
    size:        { kind: 'enum', options: ['sm', 'md', 'lg'], default: 'md' },
    disabled:    { kind: 'boolean', default: false },
  },
},
```

### Prop kinds

| kind        | Control rendered          | Notes                                                                                                               |
| ----------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `'string'`  | `Input` or `Textarea`     | Pass `multiline: true` for `Textarea`. `placeholder` optional.                                                      |
| `'number'`  | `NumberInput`             | `min` / `max` / `step` honored.                                                                                     |
| `'boolean'` | `Switch`                  | —                                                                                                                   |
| `'enum'`    | `Combobox` (searchable)   | `options: readonly string[]` required.                                                                              |
| `'color'`   | `ColorPicker`             | Value is the color string (`#RRGGBB`, `rgb(…)`, etc.).                                                              |
| `'jsx'`     | Preset chips + `Textarea` | Provide `presets: [{ label, value, node }]`. The string is what gets copied; `node` is the live preview substitute. |

### `children`

Two ways to render children:

1. **Add a `children` entry to `propSchemas`** with `kind: 'string'` (text) or
   `kind: 'jsx'` (literal JSX with presets). Best for simple labels.
2. **Pass `children` + `childrenCode`** on the entry itself. `children` is the
   live ReactNode; `childrenCode` is the literal source the "Copy code" button
   emits. Best for compound bodies (Card, Stat, etc.).

### Tips

- Prefer `defaultValue` / `defaultChecked` over controlled `value` / `checked`
  — the playground doesn't try to manage state for every entry.
- When a prop change should reset internal component state (e.g. switching
  `defaultValue` on `Input`), the playground bumps a remount token on
  selection-change and "Remount". You can force a remount yourself by toggling
  any prop, but the dedicated button is faster.
- The "Copy code" output only includes props that differ from the schema
  default — this keeps the output minimal.
- Heavy / overlay-style components (Dialog, Drawer, DropdownMenu) aren't in
  the starter set because their useful preview is the open state, which needs
  bespoke wiring. Add them as you need them, gating the preview with a local
  trigger if necessary.

## What the playground is NOT

- Not a Storybook replacement. Stories live in `<Component>.stories.tsx` and
  are still the source of truth for canonical variants + interaction tests.
- Not a sandboxed JS runtime. JSX prop values are literal strings — they are
  copied verbatim into "Copy code" but not eval'd. To render a live JSX prop,
  declare a `presets` array on the schema entry.
