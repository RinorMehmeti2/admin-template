# CLAUDE.md — Admin UI Template

This file is the source of truth for how this codebase is built. Read it fully before making changes. If something here conflicts with a user request, surface the conflict rather than silently breaking the rule.

## Mission

This repository is an in-house admin UI template built with React, TypeScript, and Tailwind CSS. We do **not** depend on any prebuilt UI kit or headless component library — no MUI, Chakra, Mantine, shadcn, Radix, Headless UI, React Aria Components, NextUI, or similar. Every component, including focus traps, popovers, dialogs, and menus, is written from scratch in this repo. The goal is one consistent, fully owned component library used across all our internal admin tools.

## Tech stack (locked in — do not introduce alternatives without explicit approval)

- **React 19.x** with TypeScript 6.x (strict mode enabled, `erasableSyntaxOnly: true` — no enums, namespaces, or parameter properties)
- **Vite 8** for build tooling
- **Tailwind CSS v4** for styling, configured via `@tailwindcss/vite`
- **class-variance-authority (cva)** for variant management
- **clsx + tailwind-merge** combined into a single `cn()` helper
- **lucide-react** for icons (no other icon set)
- **react-router-dom v7** for routing
- **react-hook-form + zod + @hookform/resolvers** for forms and validation
- **@tanstack/react-table v8** for the DataTable (state/headless behavior only — we provide all visuals)
- **@tanstack/react-query v5** for server state — wrapped in `src/data/` (`useApiQuery`, `useApiSuspenseQuery`, `useApiMutation`, `useInvalidate`)
- **MSW (Mock Service Worker)** for fetch mocking in dev (`VITE_USE_MSW=true`) and tests (`src/mocks/`)
- **date-fns** for date utilities (no Moment, no Day.js)
- **recharts 3** for chart rendering primitives — explicit carve-out, see "Pragmatic carve-outs" below. Contained behind `src/components/data-display/charts/ChartContainer/`.
- **@tiptap/\* + ProseMirror** for the rich text editor — explicit carve-out, see "Pragmatic carve-outs" below. Toolbar / bubble menu are 100% ours.
- **i18next + react-i18next + i18next-browser-languagedetector** for internationalization (behavior only — no visual surface)
- **Vitest 4 + @testing-library/react + vitest-axe** for tests (axe-core a11y assertions on every component test — see CONTRIBUTING.md § "Accessibility testing")
- **Playwright** for E2E (`e2e/` specs, `playwright.config.ts`) — runs against `pnpm dev` with MSW enabled
- **Storybook 10** for component documentation (the Vite 8 builder requires Storybook 10+; lower versions peer Vite ≤ 6)
- **pnpm** as package manager

These are all behavior / utility / state libraries — none of them ship visual components for our component library to consume. The two visual exceptions (Recharts, TipTap) are isolated carve-outs documented below. Do not install any UI library, headless component library, CSS framework, animation library, or icon set without checking first.

## Directory structure

```
src/
  components/
    primitives/       # Avatar, AvatarGroup, Badge, Button, IconButton, Kbd, Separator,
                      # Skeleton, Spinner
    layout/           # AppLayout, Container, FocusMode, FullscreenWorkspace, LocaleSwitcher,
                      # PageHeader, PageShell, Sidebar, SplitLayout, ThemeToggle, Topbar
    feedback/         # Alert, ConfirmDialog, Dialog, Drawer, ErrorBoundary, LoadingBoundary,
                      # NotificationsCenter (Bell + Panel + Item), Progress, Toast, Tooltip
    navigation/       # Breadcrumbs, ContextMenu, DropdownMenu, Menu, Pagination, Stepper, Tabs
    data-display/     # Card, DataTable, EmptyState, List, Stat, Table, Timeline, TreeView
      charts/         # AreaChart, BarChart, ChartContainer, ComposedChart, DonutChart,
                      # LineChart, PieChart, RadialChart, StackedBarChart  (Recharts-backed)
    forms/            # Calendar, Checkbox, ColorPicker, Combobox, DatePicker, DateRangePicker,
                      # DateTimePicker, Form, FormField, Input, Label, NumberInput, OtpInput,
                      # PhoneInput, Radio, RadioGroup, RangeSlider, Rating, RichTextEditor,
                      # Select, Slider, Switch, TagInput, Textarea, TimePicker
    overlays/         # CommandPalette, Portal
  hooks/              # Behavioral primitives — see "Behavioral hooks" below
  context/            # ThemeProvider, ToastProvider, LocaleProvider
  auth/               # AuthClient, AuthProvider, useAuth, ProtectedRoute, PublicOnlyRoute,
                      # RoleGate, mockAuthClient, types  — see "Auth" below
  notifications/      # NotificationsClient interface + mockNotificationsClient,
                      # NotificationsProvider, useNotifications, types — same
                      # swap-the-client pattern as auth. See "Notifications" in
                      # CONTRIBUTING.md.
  data/               # api.ts, queryClient, QueryProvider, ApiAuthBridge, ErrorBridge,
                      # errorHandler, keys, useApiQuery, useApiSuspenseQuery, useApiMutation,
                      # useApiFormSubmit, useInvalidate  — see "Data fetching" in CONTRIBUTING.md
  mocks/              # MSW handlers + browser/node servers + fixtures
  i18n/               # i18next init + locales/<lng>.json — see "Internationalization" below
  lib/                # cn.ts, date.ts, errorReporter.ts, formatters, validators, constants
  styles/             # globals.css, tokens.css, print.css
  pages/              # Demo / showcase pages
  test-utils/         # a11y.ts (runAxe + toHaveNoViolations matcher)
  types/              # Shared TS types
  App.tsx
  main.tsx
  setupTests.ts       # jsdom polyfills for ProseMirror + axe matcher install
e2e/                  # Playwright specs + fixtures (loginAs, gotoSignedIn)
```

The path alias `@/*` maps to `src/*`. Always use it for non-relative imports.

## Behavioral hooks (the foundation we build everything on)

Because we don't use Radix or any headless library, we maintain our own set of behavioral primitives in `src/hooks/`. Every overlay, menu, form control, and interactive component composes these. **Build them once, use them everywhere — no inlined focus-trap or click-outside logic anywhere in component files.**

Required hooks:

- **`useDisclosure(initial?)`** → `{ isOpen, open, close, toggle, setOpen }`. Standard open/close pattern.
- **`useControllableState({ value, defaultValue, onChange })`** → `[state, setState]`. Lets a component support both controlled and uncontrolled modes.
- **`useFocusTrap(ref, { active, initialFocus?, returnFocus? })`** → traps Tab/Shift+Tab focus inside `ref`. Used by Dialog, Drawer, Popover, DropdownMenu, CommandPalette.
- **`useFocusReturn(active)`** → captures the active element on activate, returns focus to it on deactivate.
- **`useClickOutside(ref, handler, { enabled? })`** → calls `handler` when a pointerdown fires outside `ref`.
- **`useEscapeKey(handler, { enabled? })`** → calls `handler` on Escape keydown.
- **`useScrollLock(active)`** → locks `<body>` scroll while `active` is true, preserving scroll position. Used by Dialog/Drawer.
- **`useMergedRefs(...refs)`** → returns a single ref callback that updates all provided refs.
- **`useRovingFocus({ items, orientation, loop })`** → manages roving tabindex + arrow-key navigation. Used by Menu, Tabs, DropdownMenu, RadioGroup.
- **`useRovingFocusGrid(...)`** → 2-D variant of `useRovingFocus` (arrow-key nav across rows + columns). Used by Calendar / DataTable cells.
- **`useTypeahead(...)`** → ARIA APG menu typeahead — accumulates printable keystrokes, jumps to next item starting with the buffer, resets after 500ms inactivity. Used by DropdownMenu, Menu, Combobox.
- **`useListbox(...)`** → ARIA listbox keyboard model (Up/Down/Home/End/PageUp/PageDown, optional typeahead, single + multi-select). Used by Combobox and Select. The reusable engine is the reason we don't reach for an external listbox library.
- **`useDrag({ onDragStart, onDrag, onDragEnd })`** → pointer-event drag with `setPointerCapture`, axis lock, and cancel-on-Escape. Used by SplitLayout resizer and any draggable canvas surfaces.
- **`useId(prefix?)`** → wrapper around React 18's `useId` adding an optional prefix.
- **`useMediaQuery(query)`** → SSR-safe media query hook. Used by Sidebar (mobile/desktop switch).
- **`usePosition(triggerRef, contentRef, { placement, offset, boundary })`** → returns `{ x, y, ready, placement }` (document-absolute coords) for content anchored to a trigger. Handles viewport flip and perpendicular shift. Companion `usePositionAtPoint` does the same anchored to a `{ x, y }` point (used by ContextMenu). Known unhandled cases — see "Positioning — known limitations" at the bottom of this file.
- **`useDebouncedValue(value, delay)`** → debounces a value.
- **`usePrintMode()`** → returns `true` while the browser is preparing/rendering for print. Subscribes to `beforeprint` / `afterprint` and the `print` media query. Used by DataTable (render every filtered row) and Tabs (render every panel) so the print stylesheet sees the full content. Compose this in any new component that hides content behind state and would be expected to print in full.
- **`useErrorHandler()`** → returns a `(err) => void` that re-throws on the next render so the nearest `<ErrorBoundary>` catches it. Use to bridge async / event-handler errors (which boundaries do NOT catch natively) into the boundary tree.
- **`useIntersectionObserver(ref, onIntersect, opts?)`** → fires `onIntersect` when `ref.current` enters the root viewport. Used by `NotificationsPanel` for an infinite-scroll sentinel. SSR-safe (no-ops without `IntersectionObserver`).

Plus one component utility:

- **`<Portal>`** in `src/components/overlays/Portal/` — wraps `createPortal` with a default container (`document.body`), SSR-safe, accepts a `container` prop override.

## Component anatomy

Every component lives in its own folder with exactly five files:

```
components/primitives/Button/
  Button.tsx           # Implementation
  Button.types.ts      # Props and variant types (only if non-trivial; otherwise inline)
  Button.test.tsx      # Vitest tests
  Button.stories.tsx   # Storybook stories
  index.ts             # Public re-export
```

Every component file MUST:

- Use **named exports only** — never `export default`
- **Accept `ref` as a regular prop** (React 19 pattern — do NOT use `forwardRef`, it is legacy)
- Accept and merge a **`className` prop** via `cn()`
- **Spread `...rest` props** to the root element so consumers can pass HTML attributes
- Define variants with **`cva`** when there is more than one visual variant
- Be fully typed — no `any`, no `as unknown as`, no implicit returns
- Use the React 19 ref-as-prop pattern. Do NOT call `forwardRef` and do NOT set `displayName` (function name is the displayName under React 19).

Reference skeleton:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-surface-muted text-foreground hover:bg-surface-muted/80',
        ghost: 'text-foreground hover:bg-surface-muted',
        outline: 'border border-border bg-transparent hover:bg-surface-muted',
        danger: 'bg-danger text-danger-foreground hover:bg-danger/90',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonStyles> {
  ref?: React.Ref<HTMLButtonElement>;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  ref,
  className,
  variant,
  size,
  isLoading,
  leftIcon,
  rightIcon,
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
      {isLoading ? <Spinner size="sm" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
```

## Styling rules

- Tailwind utilities only. **No CSS modules, no styled-components, no Emotion, no inline `style={{}}`** — except for truly dynamic values that cannot be expressed as classes (e.g., a progress bar `width: ${pct}%`, or absolute coordinates from `usePosition`).
- All colors, spacing, radii, typography come from **design tokens** in `src/styles/tokens.css` as CSS custom properties, exposed to Tailwind v4 via `@theme`.
- **Never hardcode hex colors** in components. Use semantic tokens: `bg-surface`, `text-foreground`, `border-border`, `bg-primary`, `text-danger-foreground`, etc.
- **Dark mode** uses the `class` strategy on `<html>`. Tokens have light + dark values, so component code does NOT need `dark:` variants when it consumes semantic tokens correctly.
- Use the **`cn()`** helper for class composition. Never concatenate class strings manually.

## Design tokens (semantic)

Defined in `src/styles/tokens.css`. Always reference these, never raw palette values.

**Backgrounds & surfaces:** `--color-background`, `--color-surface`, `--color-surface-muted`, `--color-surface-elevated`
**Foregrounds:** `--color-foreground`, `--color-foreground-muted`, `--color-foreground-subtle`
**Borders:** `--color-border`, `--color-border-strong`
**Focus ring:** `--color-ring`
**Accents (each with `-foreground` pair):** `--color-primary`, `--color-secondary`, `--color-success`, `--color-warning`, `--color-danger`, `--color-info`
**Radii:** `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`
**Shadows:** `--shadow-sm`, `--shadow-md`, `--shadow-lg`

## Accessibility (non-negotiable)

Every interactive component MUST:

- Show a **visible focus indicator**: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Support **keyboard navigation**: Tab, Enter, Space, Escape, Arrow keys where relevant
- Have correct **ARIA roles, labels, states** (`aria-disabled`, `aria-invalid`, `aria-expanded`, `aria-current`, `aria-controls`, `aria-haspopup`, etc.)
- Compose our **behavioral hooks** for non-trivial interaction: `useFocusTrap` for overlays, `useRovingFocus` for menus/tablists, `useEscapeKey` and `useClickOutside` for dismissable surfaces, `useScrollLock` for full-screen overlays
- Maintain **WCAG AA color contrast** (4.5:1 normal text, 3:1 large text and UI components)
- Trap and restore focus on overlays
- Close overlays on Escape

For form controls (Checkbox, Radio, Switch), prefer **styling the native input** with `peer` + `peer-checked:` / `peer-focus-visible:` modifiers over building fully custom controls. Native inputs are accessible by default and the visible "control" element is a sibling element styled via peer modifiers. This is simpler, smaller, and harder to break.

For complex composite widgets where native semantics aren't enough (Combobox, Listbox, Tree, etc.), follow the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) patterns and compose our behavioral hooks. **Don't reach for an external library when we hit a hard accessibility problem — extend our hooks instead.**

## State management

- **Local state:** `useState`, `useReducer`
- **Cross-component UI state** (theme, locale, sidebar collapsed, toasts): React Context in `src/context/`
- **Server state:** `@tanstack/react-query` v5, wrapped in `src/data/`. Components call `useApiQuery` / `useApiSuspenseQuery` / `useApiMutation` (typed against `ApiError`), build keys from the `keys` factory, and invalidate via `useInvalidate()`. No Redux, no Zustand. See CONTRIBUTING.md § "Data fetching" for the full recipe (suspense vs. classic, optimistic updates, error dispatcher).
- **Forms:** react-hook-form, validation always via zod schemas. `useApiFormSubmit(form, mutation)` handles the RHF ↔ mutation glue (success path + per-field error mapping). Mutations that opt out of the global error dispatcher must set `meta: { handlesErrors: true }`.

## Testing

Every primitive, form, and feedback component has a `*.test.tsx` covering:

1. Renders with default props
2. Each variant produces the expected behavior or class signal
3. User interactions (click, type, keyboard) work correctly
4. Required ARIA attributes are present
5. Disabled/loading/error states behave correctly

Behavioral hooks have their own tests in `src/hooks/__tests__/` covering each documented behavior.

Rules:

- Query order: **role → label → text**. Avoid querying by class name.
- Use `userEvent` (not `fireEvent`) for interactions.
- For overlays, test that focus is trapped, Escape closes, click-outside closes, and focus returns to the trigger on close.
- **No snapshot tests.**
- Use `vi.fn()` for callbacks; assert call count and arguments.
- **Every component test file ships at least one `runAxe` assertion** (`@/test-utils/a11y`) against the default render; overlays add a second one against the open state using `runAxe(document.body)`. Two rules are globally disabled (`color-contrast`, `region`) — see CONTRIBUTING.md § "Accessibility testing" for per-component carve-outs and the fake-timer workaround.
- **E2E.** Top-level user flows (auth, forms, tables, overlays, keyboard nav, theme/locale persistence) live under `e2e/` (Playwright). Use the shared `loginAs(role)` / `gotoSignedIn(path, role?)` fixtures from `e2e/fixtures.ts`; do not import `test` from `@playwright/test` directly. Do not reach for E2E for variant or hook coverage — that's unit territory.

## Commands

```bash
pnpm dev          # Vite dev server
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm format       # prettier --write .
pnpm test         # vitest run
pnpm test:watch   # vitest watch
pnpm storybook    # Storybook dev server
pnpm build-storybook
pnpm analyze      # vite build with bundle-analyzer (writes dist/stats.html)
pnpm e2e          # Playwright headless
pnpm e2e:ui       # Playwright UI mode
pnpm e2e:install  # one-time: download Playwright browser binaries

VITE_USE_MSW=true pnpm dev    # dev server with MSW fetch mocking
```

## Definition of done for a component

A component is complete only when ALL of these are true:

1. Implementation file with proper types, `ref` accepted as a regular prop (React 19 pattern), and `cn()` for className merging
2. All variants defined via `cva` and reflected in props
3. Composes the appropriate behavioral hooks (no inline focus-trap, click-outside, scroll-lock, or keyboard-nav logic — use the hooks)
4. `*.test.tsx` covers default render, every variant, interactions, a11y attributes, edge states, (for overlays) focus management, and **at least one `runAxe` assertion** (two for overlays — closed + open)
5. `*.stories.tsx` shows every variant + at least one realistic composition
6. Exported from `components/<category>/index.ts`
7. Uses semantic tokens — zero raw colors / hex / rgb
8. Light AND dark mode both look correct without per-component dark variants
9. Keyboard navigation tested manually
10. If the component represents a **new top-level user flow**, add an `e2e/<name>.spec.ts` (Playwright) that covers the flow end-to-end. Do not add E2E for variant coverage.
11. No new dependencies added without explicit approval (and if approved, documented as a carve-out — see "Pragmatic carve-outs")

## Anti-patterns — do not do

- ❌ Install any UI or headless component library (MUI, Chakra, Mantine, Headless UI, Radix, shadcn-cli, NextUI, React Aria Components, etc.)
- ❌ Copy-paste shadcn, Radix, or other template code. Components must be written from scratch following this guide.
- ❌ Inline focus-trap, click-outside, scroll-lock, or keyboard-nav logic in a component file — extract / reuse a hook in `src/hooks/`
- ❌ Use `any`, `unknown` casts, or `@ts-ignore` / `@ts-expect-error` (without a comment justifying why)
- ❌ Use `useEffect` to derive state from props — derive during render or with `useMemo`
- ❌ Use default exports
- ❌ Hardcode colors, spacing, radii — always use tokens
- ❌ Put data-fetching or business logic inside primitive components — keep them presentational
- ❌ Use barrel files for the entire `src/` (only at the component-folder level)
- ❌ Inline `style={{}}` except for truly dynamic numeric values (positioning coordinates, percentage widths)
- ❌ Add `dark:` variants when semantic tokens already handle dark mode
- ❌ Reach for `react-i18next`'s date / number formatter — use `Intl.*` (or our `date-fns` wrappers) instead
- ❌ Translate strings with hardcoded English literals or hand-rolled string maps — use `t('feature.subfeature.key')` from `useTranslation()`
- ❌ Add per-component `@media print` rules — print logic is centralized in `src/styles/print.css`. Components opt in via `data-print="hide"` / `data-print="expand"` / `data-print-block` (see "Print" below)

Note: `useListbox` (Combobox, Select) and the chart container (Recharts) already exist. Extend them rather than building parallel implementations.

## Workflow when asked to build something

1. Confirm which **category** it belongs to (primitives, forms, feedback, navigation, layout, data-display, overlays).
2. Check if a related component or **behavioral hook** already exists and reuse / compose where possible.
3. If a needed behavioral hook doesn't exist yet, **build the hook first** (in `src/hooks/`) with its tests, then build the component.
4. Create the **5-file folder structure** for the component.
5. Implement following the reference skeleton above.
6. Add tests + stories.
7. Export from the category's `index.ts`.
8. Add a usage example to the relevant **demo page** in `src/pages/`.
9. If anything is **ambiguous** (variant set, prop names, design choice), ASK before coding rather than guessing.

## Communication style I want from you

- Plan before coding for non-trivial work. List the components/hooks/files you'll create.
- Surface design decisions you had to make and why.
- If a request would violate a rule in this file, say so before writing the code.
- If a task would be drastically simpler with a library we've banned, mention it as info — but build from scratch anyway unless I explicitly approve the dep.
- Keep PR-style summaries terse — what changed, why, what to verify.

## Pragmatic carve-outs

The "no UI library" rule has three explicit, deliberately-scoped exceptions.
Each is contained behind a single integration point and the look-and-feel is
ours. Do not remove them, and do not duplicate their concerns elsewhere.

### Recharts (charts)

- Used by every component under `src/components/data-display/charts/`.
- All chart-type components (`AreaChart`, `BarChart`, `LineChart`,
  `PieChart`, `DonutChart`, `RadialChart`, `StackedBarChart`,
  `ComposedChart`) compose `ChartContainer`, which owns colors (via tokens),
  legend layout, tooltip surface, and SSR-safe sizing.
- New charts MUST go through `ChartContainer`. Do not import from `recharts`
  outside `src/components/data-display/charts/`.

### TipTap / ProseMirror (rich text editor)

- Single component: `src/components/forms/RichTextEditor/`.
- TipTap supplies the editor engine; the toolbar, bubble menu, and styling
  are 100% ours.
- ProseMirror's `Range`/`Node.getClientRects` and `document.elementFromPoint`
  calls are polyfilled in `src/setupTests.ts` for jsdom — do not remove
  those polyfills.
- Design proposal recorded at `docs/proposals/rich-text-editor.md`.

### TanStack Table (DataTable)

- Headless — ships zero visuals.
- Used only inside `src/components/data-display/DataTable/`. Sorting,
  filtering, pagination, and column visibility state come from TanStack;
  every cell, row, header, and pagination control is rendered by us.

If you find yourself wanting another visual library — even a "tiny" one —
flag it before adding. New carve-outs require explicit approval and an entry
in this section.

## Data fetching & error boundaries

- `src/data/` wraps `@tanstack/react-query` v5. Read paths: `useApiQuery` (classic, supports `enabled` / `keepPreviousData` / inline error states) and `useApiSuspenseQuery` (suspends; pair with `<LoadingBoundary>` from `feedback/LoadingBoundary/`). Write path: `useApiMutation` + `useInvalidate()`. Errors are always typed as `ApiError` (`status`, `code`, `message`, `payload`).
- **Rule of thumb:** route segments suspense, leaf widgets `useApiQuery`. See CONTRIBUTING.md § "Data fetching → useQuery vs useSuspenseQuery — which one?" for the decision tree.
- `mapApiError` in `src/data/errorHandler.ts` is the single classifier — every failure routes to one of four kinds: `toast`, `redirect` (401 → `/login`), `inline` (422 → per-field `setError`), or `fatal` (re-throw to a boundary). `<ErrorBridge>` (mounted in `RootShell`) hands `navigate` + `toast` to the dispatcher so the global QueryCache / MutationCache handlers can act without a context dependency. To opt out for a form that owns its own error UX, set `meta: { handlesErrors: true }` on the mutation and pair with `useApiFormSubmit`.
- **Boundaries.** `feedback/ErrorBoundary/` ships a class boundary + two fallbacks + a router adapter. We catch at three levels: app root (in `main.tsx`), router root + per-route (`errorElement: <RouterErrorElement />`), and per-feature subtrees. Boundaries do NOT catch event handlers / async / SSR / errors thrown inside themselves — bridge async + event errors via `useErrorHandler()`.
- **Reporting.** Every boundary catch calls `reportError(error, context)` from `src/lib/errorReporter.ts`. Production swaps the body for Sentry / Bugsnag / Datadog. Keep the structured payload shape (`{ name, message, stack, componentStack, source, extra, timestamp }`) so log search stays consistent across the swap.
- **Mocking.** MSW handlers live in `src/mocks/handlers.ts`; `src/mocks/browser.ts` runs in dev (opt-in via `VITE_USE_MSW=true`), `src/mocks/node.ts` runs in tests. The data-layer unit tests stub `fetch` directly via `createApiClient({ fetchImpl })` — they do not use MSW.

## Auth

Auth scaffolding lives in `src/auth/`. The provider, route guards, and
`useAuth` hook depend on a single interface — `AuthClient` — and we ship an
in-memory `mockAuthClient` that reads/writes `localStorage`. To wire a real
backend, implement the interface once and pass it in via
`<AuthProvider client={...}>`.

```ts
// src/auth/AuthClient.ts
export interface AuthClient {
  login(credentials: LoginCredentials): Promise<User>;
  logout(): Promise<void>;
  refresh(): Promise<User | null>;
  getCurrentUser(): Promise<User | null>;
}
```

State machine: `idle → authenticating → authenticated | unauthenticated`.
Use `<ProtectedRoute>` to require a session, `<PublicOnlyRoute>` for
login-style pages, and `<RoleGate roles={['admin']}>` for role-based
gating. `Role` is `'admin' | 'editor' | 'viewer' | (string & {})` — extend
inline at call sites or replace project-wide via a `.d.ts` redeclaration.
Full recipe in `CONTRIBUTING.md` § "Auth: swap the client".

## Notifications

Persistent notifications inbox lives in `src/notifications/` and the
Topbar component lives in `src/components/feedback/NotificationsCenter/`.
Different from `<Toast>` — Toast is transient feedback for the action you
just took; a Notification is a server-side record surfaced via a Topbar
bell with an unread count badge, openable into a panel that lists
history and exposes per-item read / dismiss / mark-all-read.

State sits in `<NotificationsProvider client={...}>` and depends on a
single interface — `NotificationsClient` — with a shipped in-memory
`mockNotificationsClient` (localStorage-backed, dev-only 30s
fake-emitter to demo the subscribe channel). Swapping in a real
backend (REST + SSE/WebSocket) is a one-file replacement; full
recipe in `CONTRIBUTING.md` § "Notifications: swap the client".

`useNotifications()` returns
`{ notifications, unreadCount, isLoading, hasMore, filter, setFilter, fetchMore, markRead, markAllRead, remove, refresh }`.
Mutations are optimistic with rollback on error. The provider also
subscribes to `client.subscribe(onNew)` and prepends fresh items.

The provider is mounted in `App.tsx` inside `<AuthProvider>`. Adding a
new global Provider requires updating render harnesses (CLAUDE.md
already enforces this for locale/theme): the AppLayout test, the
Storybook preview decorator, and any page-level mounts already include
it. New tests that mount `AppLayout` / `Topbar` need to wrap with
`<NotificationsProvider client={createMockNotificationsClient({ persist: false, emitEveryMs: null, latencyMs: 0 })}>`.

## Internationalization (i18n)

- Init in `src/i18n/index.ts` (imported at the top of `main.tsx` before
  `<App />` mounts).
- `react-i18next` + `i18next-browser-languagedetector`. Detector chain:
  **querystring → localStorage → navigator**, fallback `en`. Persisted
  under `admin-template-locale`.
- Resources live as **flat JSON** at `src/i18n/locales/<lng>.json`. Keys
  are dot-separated, organized by feature: `auth.login.title`,
  `common.save`, `auth.login.validation.emailRequired`. Add the same key
  to **every** locale file. Missing keys fall back to the `fallbackLng`
  (`en`); in dev a missing key shows the key string — treat that as a bug.
- `LocaleProvider` (`src/context/LocaleProvider.tsx`) exposes
  `useLocale()` returning `{ locale, setLocale, availableLocales, dir }`
  and sets `<html lang>` + `<html dir>` based on the resolved locale and
  the `RTL_LOCALES` set.
- `LocaleSwitcher` (`src/components/layout/LocaleSwitcher/`) is mounted
  in `AppLayout`'s topbar next to `ThemeToggle`.
- Read keys with `useTranslation()`:
  ```tsx
  const { t } = useTranslation();
  return <p>{t('greeting', { name })}</p>;
  ```
  Interpolation uses `{{name}}` (we set `escapeValue: false` because React
  already escapes). Pluralization: pass `count`, use `key_one` / `key_other`
  resource keys.
- **Translated zod schemas.** Build the schema inside the component via
  `useMemo([t])` so validation messages re-translate on locale change.
  See `src/pages/auth/login/LoginPage.tsx` for the canonical pattern.
- **Dates and numbers DO NOT use i18next formatting.** Use `Intl.*`
  (or our `date-fns` wrappers in `src/lib/date.ts`).
- Adding a locale: create `src/i18n/locales/<code>.json` with every key
  from `en.json`, append the code to `SUPPORTED_LOCALES` and the locale
  options list, and (if RTL) add it to `RTL_LOCALES`.
- Introducing a new global Provider (locale, theme, etc.) requires
  updating every render harness: tests, story decorators in
  `.storybook/preview.tsx`, and any page-level mounts.

## Bundle size

- Soft budgets (not CI-gated): first-paint < 200 KB gz, per-route chunk < 100 KB gz, total app < 1 MB gz.
- Routes that pull a heavy carve-out are lazy via react-router v7's `lazy` route option: `/charts` (Recharts), `/tables` (TanStack Table + DataTable), `/workspace`, `/admin`. Add new heavy routes the same way — see CONTRIBUTING.md § "Adding a new lazy route".
- `RichTextEditor` is split mid-component via `LazyRichTextEditor` (`forms/RichTextEditor/lazy.tsx`). The barrel intentionally does NOT re-export the eager component — re-exporting it would put TipTap back on the static graph and Rollup would refuse to split (`INEFFECTIVE_DYNAMIC_IMPORT`). Tests / stories import the eager version directly via `./RichTextEditor`.
- Inspect with `pnpm analyze` (writes `dist/stats.html`).

## Print

Every page that contains useful information (tables, charts, dashboards,
read-only forms) prints cleanly: no sidebar, no topbar, no command
palette, no overlays, no action buttons. The print stylesheet lives at
`src/styles/print.css` (imported from `globals.css`). The demo route
`/print-preview` is the verification surface — open it in the browser
and use the platform print preview.

### `data-print` attribute contract

Three values, three meanings. Tag the **root** of the affected element:

| Value                  | Effect                                                                                                                                                                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data-print="hide"`    | Element is removed from print output (`display: none`). Use for chrome (Sidebar, Topbar), portaled overlays (Dialog/Drawer/Tooltip/Popover/DropdownMenu/CommandPalette/Toast), and pure interaction (Pagination, action button rows, column-visibility menu, theme/locale switcher). |
| `data-print="expand"`  | Host component renders all collapsed content during print (DataTable: every filtered row; Tabs: every panel). Print CSS additionally un-hides any `[hidden]` descendants inside the region. Compose `usePrintMode()` to flip internal rendering during `beforeprint`/`afterprint`.   |
| `data-print="no-href"` | Suppresses the auto-appended `(href)` after a link. Use only when the URL would just be noise (in-page anchors, decorative links).                                                                                                                                                   |

A separate boolean attribute, `data-print-block`, marks an element whose
contents should not break across pages (`break-inside: avoid`). Already
applied automatically to `Card` and `Stat`. Add it to any other block
root that should stay together on paper.

### Color strategy

Inside `@media print`, `print.css` overrides only the **neutral** tokens
(`--color-background`, `--color-surface*`, `--color-foreground*`,
`--color-border*`, `--shadow-*`) to a light grayscale palette — both
`:root` and `html.dark` are flipped, so dark mode users get a clean
printable surface. **Accent tokens** (`--color-primary`,
`--color-success`, `--color-warning`, `--color-danger`, `--color-info`)
are intentionally preserved so charts retain meaning.

Print CSS also strips shadows, gradients, and `backdrop-filter`,
collapses `sticky`/`fixed` to `static`, restores scrolling overflow
containers, and appends `(href)` after every external link.

### When you build a new component

- If the component is **page chrome or a portaled overlay**, tag the
  root with `data-print="hide"`. For overlays this means the panel that
  ends up in `document.body`, not the trigger.
- If the component **collapses content behind state** that users would
  expect to see in full when printing (Accordion, paginated lists,
  Stepper-with-history, …), follow the DataTable/Tabs pattern:
  1. Tag the root with `data-print="expand"`.
  2. Read `usePrintMode()` and render every sub-region while it returns
     `true`.
  3. Tag any internal chrome (toolbar, pagination strip, tab strip)
     with `data-print="hide"` so it disappears alongside.
- If the component is a **block root that should stay together on
  paper**, add `data-print-block`.
- Do not write per-component `@media print` rules. The contract is the
  attribute set above plus `print.css` — keep print logic centralized.

### Verifying

Open `/print-preview` (`PrintPreviewPage` in `src/pages/`) and use the
browser's print preview (Ctrl/⌘ P). Acceptance: chrome gone, every
DataTable row visible, every Tabs panel visible, charts keep colors and
legends, links show `(href)`, no card or table row split across pages.
There is no Playwright suite for print today — verification is the
browser preview.

## Positioning — known limitations

`usePosition` (and `usePositionAtPoint`) handle viewport flip + perpendicular
shift. The following edge cases are NOT handled — most don't apply today
because we always portal to `document.body`:

1. Transformed ancestors of the portal container.
2. position: fixed parents on the trigger (one-frame drift on scroll).
3. transform: scale on trigger or ancestors (no cumulative transform divide).
4. Element-level scrollers without window resize (no ResizeObserver on
   trigger/content).
5. Iframes (no ownerDocument traversal).
6. Alignment fallback in flip (only does axis-flip, not bottom-start →
   top-end).
7. Arrow-glyph component (data-side exposed, no arrow renderer yet).
8. Split placement (flip OR shift, never partial-place).
9. pos.placement may lie when both sides overflow ("more room" tiebreaker
   leaves data-side pointing at a clipped side).

### When to take @floating-ui/react-dom

Evaluated and explicitly deferred at the Prompt 17 stage. Reconsider when any
of these becomes real:

1. Building a Popover with an arrow that points at the trigger after shift
   (arrow middleware).
2. Portaling into a transformed subtree (proper offset-parent walk + strategy
   switch).
3. Element-level scroll containers needing auto-update on inner scroll.
4. Designers ask for alignment-fallback flip (bottom-start → top-end).
5. A specific production bug in any of cases 1–9 above.

Migration estimated at one day: rewrite resolvePosition body to call
computePosition with [offset, flip, shift, arrow?] middleware, keep
{ x, y, ready, placement } return shape stable, add ResizeObserver polyfill
to setupTests.ts for jsdom.
