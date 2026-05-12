# CLAUDE.md — Admin UI Template

Source of truth for this codebase. Read fully before changes. If a rule here conflicts with a user request, surface the conflict — don't silently break it.

## Mission

In-house admin UI template: React + TypeScript + Tailwind. **No** prebuilt UI kit or headless lib — no MUI, Chakra, Mantine, shadcn, Radix, Headless UI, React Aria, NextUI. Every component (focus traps, popovers, dialogs, menus) written from scratch. One owned component library across all internal admin tools.

## Tech stack (locked — no alternatives without approval)

- **React 19.x** + **TypeScript 6.x** strict, `erasableSyntaxOnly` (no enums, namespaces, parameter properties)
- **Vite 8** build tool
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **class-variance-authority (cva)** for variants
- **clsx + tailwind-merge** → single `cn()` helper
- **lucide-react** icons (only icon set)
- **react-router-dom v7**
- **react-hook-form + zod + @hookform/resolvers**
- **@tanstack/react-table v8** (headless, DataTable only)
- **@tanstack/react-query v5** wrapped in `src/data/` (`useApiQuery`, `useApiSuspenseQuery`, `useApiMutation`, `useInvalidate`)
- **MSW** for fetch mocking (dev `VITE_USE_MSW=true`, tests in `src/mocks/`)
- **date-fns** (no Moment, no Day.js)
- **recharts 3** — carve-out, behind `ChartContainer`
- **@tiptap/\* + ProseMirror** — carve-out, only in `RichTextEditor`
- **i18next + react-i18next + i18next-browser-languagedetector** (behavior only)
- **Vitest 4 + @testing-library/react + vitest-axe** (axe assertions every test)
- **Playwright** for E2E (`e2e/`, runs `pnpm dev` with MSW)
- **Storybook 10** (Vite 8 needs Storybook 10+)
- **pnpm**

All behavior/utility libs — none ship visual components except Recharts + TipTap carve-outs. Do not install any UI/headless/CSS/animation/icon lib without checking first.

## Directory structure

```
src/
  components/
    primitives/     # Avatar, AvatarGroup, Badge, Button, IconButton, Kbd, Separator, Skeleton, Spinner
    layout/         # AppLayout, Container, FocusMode, FullscreenWorkspace, LocaleSwitcher, PageHeader,
                    # PageShell, Sidebar, SplitLayout, ThemePicker, ThemeToggle, Topbar, TypographyPicker
    feedback/       # Alert, BottomSheet, ConfirmDialog, Dialog, Drawer, ErrorBoundary, LoadingBoundary,
                    # NotificationsCenter, Progress, Toast, Tooltip
    navigation/     # Breadcrumbs, ContextMenu, DropdownMenu, Menu, Pagination, Stepper, Tabs
    data-display/   # Card, DataTable, EmptyState, FileExplorer, FilterableSearch, ImageGallery,
                    # Kanban, List, Stat, Table, Timeline, TreeView
      charts/       # AreaChart, BarChart, ChartContainer, ComposedChart, DonutChart, LineChart,
                    # PieChart, RadialChart, StackedBarChart (Recharts-backed)
    forms/          # Calendar, Checkbox, ColorPicker, Combobox, DatePicker, DateRangePicker,
                    # DateTimePicker, Form, FormField, FormWizard, Input, Label, NumberInput,
                    # OtpInput, PhoneInput, Radio, RadioGroup, RangeSlider, Rating, RichTextEditor,
                    # Select, Slider, Switch, TagInput, Textarea, TimePicker
    overlays/       # CommandPalette, Portal
  hooks/            # Behavioral primitives (see below)
  context/          # ThemeProvider, ToastProvider, LocaleProvider
  auth/             # AuthClient, AuthProvider, useAuth, ProtectedRoute, PublicOnlyRoute, RoleGate, mockAuthClient
  notifications/    # NotificationsClient + mockNotificationsClient + NotificationsProvider + useNotifications
  data/             # api, queryClient, QueryProvider, ApiAuthBridge, ErrorBridge, errorHandler,
                    # keys, useApiQuery, useApiSuspenseQuery, useApiMutation, useApiFormSubmit, useInvalidate
  mocks/            # MSW handlers + browser/node servers + fixtures
  i18n/             # i18next init + locales/<lng>.json
  lib/              # cn, date, errorReporter, themeTokens, typography, formatters, validators, constants
  styles/           # globals.css, tokens.css, print.css
  pages/            # Product pages: auth/, admin/, file-explorer/, playground/, settings/theme,
                    # settings/typography. Per-feature: FeaturePage.tsx, index.ts, model.ts,
                    # data.ts (opt), components/, hooks/ (opt). Example: pages/demos/charts/.
  pages/demos/      # Library showcase pages. NOT product surface. Delete on fork + strip routes from App.tsx.
  playground/       # Registry for /playground route (see src/playground/README.md)
  test-utils/       # a11y.ts (runAxe + toHaveNoViolations)
  types/
  App.tsx
  main.tsx
  setupTests.ts     # jsdom polyfills for ProseMirror + axe matcher
e2e/                # Playwright specs + fixtures (loginAs, gotoSignedIn)
```

Path alias `@/*` → `src/*`. Always use for non-relative imports.

## Behavioral hooks (in `src/hooks/`)

No headless lib, so we own these. Build once, reuse everywhere — never inline focus-trap / click-outside / scroll-lock / keyboard-nav in component files.

- `useDisclosure(initial?)` → `{ isOpen, open, close, toggle, setOpen }`
- `useControllableState({ value, defaultValue, onChange })` → controlled + uncontrolled support
- `useFocusTrap(ref, { active, initialFocus?, returnFocus? })` — Dialog, Drawer, Popover, DropdownMenu, CommandPalette
- `useFocusReturn(active)` — captures + restores active element
- `useClickOutside(ref, handler, { enabled? })`
- `useEscapeKey(handler, { enabled? })`
- `useScrollLock(active)` — locks body scroll, preserves position. Dialog/Drawer
- `useMergedRefs(...refs)`
- `useRovingFocus({ items, orientation, loop })` — Menu, Tabs, DropdownMenu, RadioGroup
- `useRovingFocusGrid(...)` — 2-D variant. Calendar, DataTable cells
- `useTypeahead(...)` — ARIA APG typeahead, 500ms reset. DropdownMenu, Menu, Combobox
- `useListbox(...)` — ARIA listbox keyboard (Up/Down/Home/End/PageUp/PageDown, typeahead, single+multi). Combobox, Select
- `useDrag({ onDragStart, onDrag, onDragEnd })` — pointer-event + `setPointerCapture` + axis lock + Esc cancel. SplitLayout
- `useId(prefix?)` — wraps React 18 `useId`
- `useMediaQuery(query)` — SSR-safe. Sidebar
- `usePosition(triggerRef, contentRef, { placement, offset, boundary })` → `{ x, y, ready, placement }` doc-absolute. Viewport flip + perpendicular shift. Companion `usePositionAtPoint` for ContextMenu. Limits at bottom of file.
- `useDebouncedValue(value, delay)`
- `usePrintMode()` — `true` during `beforeprint`/`afterprint` + print media. DataTable, Tabs. Compose for any state-collapsed component that should print in full.
- `useErrorHandler()` → `(err) => void` re-throws next render so nearest `<ErrorBoundary>` catches. Use for async/event-handler errors.
- `useIntersectionObserver(ref, onIntersect, opts?)` — SSR-safe. NotificationsPanel infinite-scroll sentinel.

Plus: `<Portal>` in `src/components/overlays/Portal/` — wraps `createPortal`, default `document.body`, SSR-safe, accepts `container` override.

## Component anatomy

Every component = 5-file folder:

```
components/primitives/Button/
  Button.tsx           # Implementation
  Button.types.ts      # Props/variant types (only if non-trivial)
  Button.test.tsx      # Vitest tests
  Button.stories.tsx   # Storybook
  index.ts             # Public re-export
```

Every component file MUST:

- Use **named exports only** — never `export default`
- **Accept `ref` as a regular prop** (React 19 — do NOT use `forwardRef`, do NOT set `displayName`)
- Accept + merge `className` via `cn()`
- Spread `...rest` to root element
- Define variants with **`cva`** when >1 visual variant
- Fully typed — no `any`, no `as unknown as`, no implicit returns

Reference skeleton:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonStyles = cva('base classes', {
  variants: {
    variant: { primary: '…', secondary: '…', ghost: '…', outline: '…', danger: '…', link: '…' },
    size: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonStyles> {
  ref?: React.Ref<HTMLButtonElement>;
  isLoading?: boolean;
}

export function Button({
  ref,
  className,
  variant,
  size,
  isLoading,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      className={cn(buttonStyles({ variant, size }), className)}
      disabled={disabled || isLoading}
      {...rest}
    >
      {children}
    </button>
  );
}
```

## Styling rules

- Tailwind utilities only. No CSS modules, styled-components, Emotion, inline `style={{}}` — except dynamic numeric values (progress width, `usePosition` coords).
- Colors/spacing/radii/typography come from **design tokens** in `src/styles/tokens.css` exposed via Tailwind v4 `@theme`.
- Never hardcode hex. Use semantic tokens: `bg-surface`, `text-foreground`, `border-border`, `bg-primary`, `text-danger-foreground`, etc.
- Dark mode = `class` strategy on `<html>`. Tokens cover both modes — no per-component `dark:` variants needed.
- Use `cn()` for class composition. Never concatenate class strings.

## Design tokens (semantic)

In `src/styles/tokens.css`. Always reference, never raw palette.

- **Backgrounds:** `--color-background`, `--color-surface`, `--color-surface-muted`, `--color-surface-elevated`
- **Foregrounds:** `--color-foreground`, `--color-foreground-muted`, `--color-foreground-subtle`
- **Borders:** `--color-border`, `--color-border-strong`
- **Ring:** `--color-ring`
- **Accents (each with `-foreground` pair):** `--color-primary`, `--color-secondary`, `--color-success`, `--color-warning`, `--color-danger`, `--color-info`
- **Radii:** `--radius-sm/md/lg/xl`
- **Shadows:** `--shadow-sm/md/lg`
- **Fonts:** `--font-sans`, `--font-serif`, `--font-mono`, `--font-heading` (defaults to sans; `h1–h6` consume via `globals.css`)

## Theming (palette + typography)

22 color tokens + 4 font tokens are runtime-swappable. Two orthogonal subsystems on `ThemeProvider`, applied inline on `<html>`.

### Palette — colors only

- `src/lib/themeTokens.ts`. `Palette = { id, name, builtIn, light: TokenMap, dark: TokenMap }`
- Built-ins: `default`, `teal`, `rose`, `claude`. Full-tint (every surface + accent flipped).
- Custom palettes via `/settings/theme`, persisted to `localStorage` (`admin-template-theme-palettes`, active id `admin-template-theme-palette`).
- `applyPalette(palette, mode)` writes color custom props inline on `documentElement`. Palette code MUST NOT touch font tokens.
- UI: `<ThemePicker>` (dropdown), separate from `<ThemeToggle>` (light/dark).

### Typography — fonts + size scale

- `src/lib/typography.ts`. `TypographyConfig = { id, name, builtIn, fonts: FontMap, scale: number }`. Scale clamped 0.85–1.20.
- Built-ins: `system`, `compact`, `comfortable`, `serif-heading`, `editorial`, `humanist`, `screen`, `mono`. **OS-available fonts only** (system stacks, Georgia, Trebuchet MS, Verdana, Consolas/Menlo) — no font install, no Google Fonts.
- Persist `admin-template-typographies` + `admin-template-typography`.
- `applyTypography(config)` writes 4 font props + sets `html.style.fontSize = scale*100 + '%'`. Tailwind sizes are rem-based → text + spacing scale together.
- UI: `<TypographyPicker>`. Editor `/settings/typography`.

### Rules

- Built-ins are read-only. Duplicate to edit.
- Palette + typography orthogonal — picking one must NEVER reset the other. Each subsystem owns its keys + its `clear*` cleanup.
- Extending: color tokens → `COLOR_TOKEN_KEYS` + `TOKEN_GROUPS` in `themeTokens.ts`; font tokens → `FONT_TOKEN_KEYS`. New top-level token kinds (radii, shadows) need a new owner module.

## Accessibility (non-negotiable)

Every interactive component MUST:

- Visible focus: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Keyboard nav: Tab, Enter, Space, Escape, Arrow keys
- Correct ARIA (`aria-disabled`, `aria-invalid`, `aria-expanded`, `aria-current`, `aria-controls`, `aria-haspopup`, …)
- Compose behavioral hooks (`useFocusTrap` for overlays, `useRovingFocus` for menus/tablists, `useEscapeKey` + `useClickOutside` for dismissable, `useScrollLock` for full-screen)
- WCAG AA contrast (4.5:1 text, 3:1 large/UI)
- Trap + restore focus on overlays. Esc closes.

Form controls (Checkbox, Radio, Switch): style native input with `peer` + `peer-checked:` / `peer-focus-visible:` siblings. Simpler, smaller, accessible by default.

Composite widgets (Combobox, Listbox, Tree): follow [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/) + compose our hooks. Don't reach for external lib — extend hooks instead.

## State management

- Local: `useState`, `useReducer`
- Cross-component UI (theme, locale, sidebar, toasts): React Context in `src/context/`
- Server state: `@tanstack/react-query` v5 via `src/data/`. Use `useApiQuery` / `useApiSuspenseQuery` / `useApiMutation` (typed `ApiError`), `keys` factory, `useInvalidate()`. No Redux, no Zustand. See CONTRIBUTING.md § "Data fetching".
- Forms: react-hook-form + zod schemas. `useApiFormSubmit(form, mutation)` for RHF ↔ mutation glue. Opt out of global error dispatcher with `meta: { handlesErrors: true }`.

## Testing

Every primitive/form/feedback has `*.test.tsx` covering:

1. Default render
2. Each variant
3. User interactions (click, type, keyboard)
4. ARIA attributes
5. Disabled/loading/error states

Hooks have tests in `src/hooks/__tests__/`.

Rules:

- Query order: **role → label → text**. Never by class name.
- `userEvent`, not `fireEvent`
- Overlays: test focus trap, Esc closes, click-outside closes, focus returns to trigger
- No snapshot tests
- `vi.fn()` for callbacks; assert call count + args
- Every test file ships ≥1 `runAxe` assertion (`@/test-utils/a11y`). Overlays add second one open-state via `runAxe(document.body)`. Two rules globally off (`color-contrast`, `region`).
- **E2E:** top-level flows (auth, forms, tables, overlays, keyboard nav, theme/locale persistence) under `e2e/`. Use `loginAs(role)` / `gotoSignedIn(path, role?)` from `e2e/fixtures.ts`. Not for variant/hook coverage.

## Commands

```bash
pnpm dev           # Vite dev
pnpm build         # Prod build
pnpm preview       # Preview build
pnpm typecheck     # tsc --noEmit
pnpm lint
pnpm format        # prettier --write .
pnpm test          # vitest run
pnpm test:watch
pnpm storybook
pnpm build-storybook
pnpm analyze       # build + bundle-analyzer → dist/stats.html
pnpm e2e           # Playwright headless
pnpm e2e:ui
pnpm e2e:install   # one-time browser download

VITE_USE_MSW=true pnpm dev    # dev with MSW
```

## Definition of done

A component is complete when ALL true:

1. Implementation with proper types, `ref` as regular prop, `cn()` for className
2. All variants via `cva` and reflected in props
3. Composes behavioral hooks (no inline focus-trap / click-outside / scroll-lock / keyboard-nav)
4. `*.test.tsx` covers default + variants + interactions + a11y attrs + edge states + (overlays) focus management + ≥1 `runAxe` (2 for overlays)
5. `*.stories.tsx` shows every variant + 1 realistic composition
6. Exported from category `index.ts`
7. Semantic tokens — zero raw colors
8. Light + dark both correct without per-component `dark:` variants
9. Keyboard nav tested manually
10. New top-level user flow → add `e2e/<name>.spec.ts`. Not for variants.
11. No new deps without approval (carve-out entry required)

## Anti-patterns

- ❌ Install any UI/headless lib (MUI, Chakra, Mantine, Headless UI, Radix, shadcn-cli, NextUI, React Aria)
- ❌ Copy-paste shadcn/Radix/template code
- ❌ Inline focus-trap/click-outside/scroll-lock/keyboard-nav — use hooks
- ❌ `any`, `unknown` casts, `@ts-ignore`/`@ts-expect-error` (without justifying comment)
- ❌ `useEffect` to derive state from props — derive during render or `useMemo`
- ❌ Default exports
- ❌ Hardcoded colors/spacing/radii — use tokens
- ❌ Data-fetching/business logic in primitives — keep presentational
- ❌ Barrel files for entire `src/` (only component-folder level)
- ❌ Inline `style={{}}` except dynamic numeric values
- ❌ `dark:` variants when semantic tokens handle dark mode
- ❌ `react-i18next` date/number formatter — use `Intl.*` or `src/lib/date.ts`
- ❌ Hardcoded English literals or hand-rolled string maps — use `t('feature.sub.key')`
- ❌ Per-component `@media print` rules — use `data-print` attributes (see Print)

Note: `useListbox` (Combobox, Select) and `ChartContainer` (Recharts) already exist. Extend them, don't build parallel.

## Workflow

1. Identify **category** (primitives/forms/feedback/navigation/layout/data-display/overlays)
2. Check existing components/hooks to reuse
3. If hook missing: build hook first (+ tests), then component
4. Create 5-file folder
5. Implement per skeleton
6. Tests + stories
7. Export from category `index.ts`
8. Add usage example to relevant demo page
9. Ambiguity (variant set, prop names, design): ASK, don't guess

## Communication style

- Plan before coding for non-trivial work — list components/hooks/files
- Surface design decisions you had to make
- Conflict with rules: call it out first
- Banned-lib temptation: mention as info, build from scratch unless approved
- Terse PR-style summaries — what changed, why, what to verify

## Pragmatic carve-outs

Three explicit exceptions to "no UI library", each contained behind one integration point.

### Recharts (charts)

- Every `src/components/data-display/charts/` component composes `ChartContainer` (colors via tokens, legend, tooltip, SSR-safe sizing).
- Never import `recharts` outside `data-display/charts/`.

### TipTap / ProseMirror (rich text)

- Single component: `src/components/forms/RichTextEditor/`. TipTap = engine; toolbar/bubble menu/styling = ours.
- ProseMirror `Range`/`getClientRects` + `elementFromPoint` polyfilled in `src/setupTests.ts` for jsdom — don't remove.
- Proposal: `docs/proposals/rich-text-editor.md`.

### TanStack Table (DataTable)

- Headless — zero visuals. Used only in `src/components/data-display/DataTable/`. State from TanStack; every cell/row/header/pagination rendered by us.

New carve-outs require explicit approval + entry here.

## Data fetching & error boundaries

- `src/data/` wraps `@tanstack/react-query` v5. Read: `useApiQuery` (classic, `enabled`/`keepPreviousData`/inline error) + `useApiSuspenseQuery` (suspends, pair with `<LoadingBoundary>`). Write: `useApiMutation` + `useInvalidate()`. Errors typed `ApiError` (`status`, `code`, `message`, `payload`).
- **Rule of thumb:** route segments suspense, leaf widgets `useApiQuery`. See CONTRIBUTING.md decision tree.
- `mapApiError` in `src/data/errorHandler.ts` classifies every failure → `toast` | `redirect` (401→`/login`) | `inline` (422→per-field `setError`) | `fatal` (re-throw). `<ErrorBridge>` in `RootShell` hands `navigate` + `toast` to dispatcher. Opt out per-form: `meta: { handlesErrors: true }` + `useApiFormSubmit`.
- **Boundaries:** `feedback/ErrorBoundary/` — class boundary + 2 fallbacks + router adapter. Catch at app root (`main.tsx`), router root + per-route (`errorElement: <RouterErrorElement />`), per-feature subtrees. Don't catch event handlers/async/SSR/errors-in-themselves — bridge via `useErrorHandler()`.
- **Reporting:** every boundary calls `reportError(error, context)` from `src/lib/errorReporter.ts`. Prod swaps body for Sentry/Bugsnag/Datadog. Keep payload shape (`{ name, message, stack, componentStack, source, extra, timestamp }`).
- **Mocking:** MSW handlers in `src/mocks/handlers.ts`; `browser.ts` (dev opt-in via `VITE_USE_MSW=true`), `node.ts` (tests). Data-layer unit tests stub `fetch` directly via `createApiClient({ fetchImpl })`.

## Auth

`src/auth/` — provider + guards + `useAuth` depend on single `AuthClient` interface. Mock client reads/writes `localStorage`. Real backend: implement interface, pass via `<AuthProvider client={...}>`.

```ts
export interface AuthClient {
  login(credentials: LoginCredentials): Promise<User>;
  logout(): Promise<void>;
  refresh(): Promise<User | null>;
  getCurrentUser(): Promise<User | null>;
}
```

State: `idle → authenticating → authenticated | unauthenticated`. Guards: `<ProtectedRoute>`, `<PublicOnlyRoute>`, `<RoleGate roles={['admin']}>`. `Role = 'admin' | 'editor' | 'viewer' | (string & {})` — extend at call site or replace via `.d.ts` redeclaration. Recipe: CONTRIBUTING.md § "Auth: swap the client".

## Notifications

`src/notifications/` + Topbar `src/components/feedback/NotificationsCenter/`. Different from `<Toast>` (transient) — Notification is server-side record surfaced via bell + unread badge + panel (read/dismiss/mark-all-read).

`<NotificationsProvider client={...}>` depends on single `NotificationsClient` interface. Mock: localStorage-backed + dev-only 30s fake-emitter. Real backend (REST + SSE/WebSocket) = one-file swap. Recipe: CONTRIBUTING.md § "Notifications: swap the client".

`useNotifications()` → `{ notifications, unreadCount, isLoading, hasMore, filter, setFilter, fetchMore, markRead, markAllRead, remove, refresh }`. Optimistic mutations with rollback. Provider also subscribes to `client.subscribe(onNew)`.

Mounted in `App.tsx` inside `<AuthProvider>`. Tests mounting `AppLayout` / `Topbar` need `<NotificationsProvider client={createMockNotificationsClient({ persist: false, emitEveryMs: null, latencyMs: 0 })}>`.

## i18n

- Init `src/i18n/index.ts` (top of `main.tsx` before `<App />`).
- `react-i18next` + `i18next-browser-languagedetector`. Detector: **querystring → localStorage → navigator**, fallback `en`. Persist `admin-template-locale`.
- Resources: flat JSON `src/i18n/locales/<lng>.json`. Dot-separated keys by feature (`auth.login.title`, `common.save`). Add same key to **every** locale file. Missing → fallback `en`; dev shows key string (bug).
- `LocaleProvider` (`src/context/LocaleProvider.tsx`) → `useLocale()` returns `{ locale, setLocale, availableLocales, dir }`. Sets `<html lang>` + `<html dir>` from `RTL_LOCALES`.
- `LocaleSwitcher` mounted in `AppLayout` topbar next to `ThemeToggle`.
- Read via `useTranslation()`: `t('greeting', { name })`. Interp `{{name}}`; `escapeValue: false` (React escapes). Plural: pass `count`, use `key_one`/`key_other`.
- **Translated zod schemas:** build inside component via `useMemo([t])` so messages re-translate. Canonical: `src/pages/auth/login/LoginPage.tsx`.
- **Dates/numbers DO NOT use i18next.** Use `Intl.*` or `src/lib/date.ts`.
- Add locale: create `<code>.json` with every key from `en.json`, append code to `SUPPORTED_LOCALES` + options list, add to `RTL_LOCALES` if RTL.
- New global Provider = update every render harness (tests, `.storybook/preview.tsx` decorator, page-level mounts).

## Bundle size

- Soft budgets (not CI-gated): first-paint < 200 KB gz, per-route < 100 KB gz, total < 1 MB gz.
- Heavy routes lazy via react-router v7 `lazy`: `/charts`, `/tables`, `/workspace`, `/admin`. CONTRIBUTING.md § "Adding a new lazy route".
- `RichTextEditor` split mid-component via `LazyRichTextEditor` (`forms/RichTextEditor/lazy.tsx`). Barrel does NOT re-export eager — re-export puts TipTap back on static graph, Rollup refuses split (`INEFFECTIVE_DYNAMIC_IMPORT`). Tests/stories import eager via `./RichTextEditor`.
- Inspect: `pnpm analyze` → `dist/stats.html`.

## Playground

`/playground` = dev tool for live prop tweaking. Searchable list + live preview + auto-generated controls + "Copy code". Theme + locale switchers on top.

Explicit registry `src/playground/registry.tsx` — not auto-introspected. One-file change per component. Contract: `src/playground/README.md`. Default-equal props stripped from generated JSX; JSX-valued props use preset map (no in-browser eval).

NOT a Storybook replacement — stories remain source of truth for canonical variants + interaction tests.

## Print

Every info page (tables, charts, dashboards, read-only forms) prints cleanly: no sidebar/topbar/palette/overlays/action buttons. Stylesheet `src/styles/print.css` (imported from `globals.css`). Verify at `/print-preview`.

### `data-print` attribute contract

Tag the **root** of affected element:

| Value                  | Effect                                                                                                                                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-print="hide"`    | Removed from print (`display: none`). Chrome (Sidebar, Topbar), portaled overlays, action rows, pagination, switchers.                                                                                      |
| `data-print="expand"`  | Host renders all collapsed content during print (DataTable all rows; Tabs all panels). Print CSS un-hides `[hidden]` descendants. Compose `usePrintMode()` to flip rendering on `beforeprint`/`afterprint`. |
| `data-print="no-href"` | Suppress auto-appended `(href)` after link. In-page anchors, decorative links.                                                                                                                              |

`data-print-block` = boolean, `break-inside: avoid`. Auto on `Card`, `Stat`. Add to any block root that should stay together.

### Color strategy

`@media print` in `print.css` overrides **neutral** tokens only (`--color-background`, `--color-surface*`, `--color-foreground*`, `--color-border*`, `--shadow-*`) to grayscale — both `:root` + `html.dark` flipped. **Accent tokens** (`--color-primary/success/warning/danger/info`) preserved so charts keep meaning.

Also strips shadows/gradients/`backdrop-filter`, collapses `sticky`/`fixed` to `static`, restores scrolling overflow, appends `(href)` after external links.

### New component checklist

- Page chrome or portaled overlay → root `data-print="hide"` (overlays: the portaled panel, not the trigger)
- Collapses content behind state (Accordion, paginated lists, Stepper-with-history): root `data-print="expand"`, read `usePrintMode()` to render every sub-region, internal chrome `data-print="hide"`
- Block root to stay together → `data-print-block`
- Never write per-component `@media print` rules

Verify: open `/print-preview`, Ctrl/⌘ P. Acceptance: chrome gone, every DataTable row + Tabs panel visible, charts keep colors/legends, links show `(href)`, no card/row split. No Playwright suite — browser preview only.

## Positioning — known limitations

`usePosition` / `usePositionAtPoint` handle viewport flip + perpendicular shift. NOT handled (mostly irrelevant since we portal to `document.body`):

1. Transformed ancestors of portal container
2. `position: fixed` parents on trigger (one-frame drift on scroll)
3. `transform: scale` on trigger/ancestors (no cumulative transform divide)
4. Element-level scrollers without window resize (no ResizeObserver on trigger/content)
5. Iframes (no ownerDocument traversal)
6. Alignment fallback in flip (axis-flip only, not bottom-start → top-end)
7. Arrow-glyph component (data-side exposed, no renderer)
8. Split placement (flip OR shift, never partial-place)
9. `pos.placement` may lie when both sides overflow

### When to take @floating-ui/react-dom

Deferred at Prompt 17. Reconsider when:

1. Popover arrow pointing at trigger after shift (arrow middleware)
2. Portal into transformed subtree (proper offset-parent walk)
3. Element-level scroll auto-update
4. Alignment-fallback flip requested
5. Specific prod bug in 1–9 above

Migration ≈ 1 day: rewrite `resolvePosition` to call `computePosition` with `[offset, flip, shift, arrow?]`, keep `{ x, y, ready, placement }` return shape, add ResizeObserver polyfill to `setupTests.ts`.
