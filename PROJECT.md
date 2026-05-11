# Admin UI Template — Project Overview

A from-scratch React 19 + TypeScript + Tailwind v4 admin UI template. The
goal is one consistent, fully owned component library reused across our
internal admin tools, with **no dependency on prebuilt UI kits or headless
component libraries**. This document captures everything that has been
built, the directory layout, every external dependency we did take and
why, and the challenges encountered along the way.

For contributor-facing rules see [CLAUDE.md](./CLAUDE.md) and
[CONTRIBUTING.md](./CONTRIBUTING.md). This file is descriptive — a
snapshot of the project as-built, not a style guide.

---

## 1. Project mission

> Build an in-house admin UI template where every visible component —
> button, dialog, focus trap, popover, dropdown, command palette — is
> written from scratch in this repo. Use libraries only for behavior,
> state, or build tooling, never for visuals.

Concretely, that means we banned the entire class of headless and
visual UI libraries (Radix, Headless UI, MUI, Chakra, Mantine, shadcn,
NextUI, React Aria Components) at the lint level. Instead we built our
own behavioral hook layer (focus traps, click-outside, scroll lock,
roving focus, popover positioning, listbox keyboard nav, drag) and
composed every component on top of it.

## 2. What has been built

The repository delivers a complete admin shell plus a wide component
library, an auth scaffold, theming, internationalization, and several
showcase / demo pages.

### 2.1 Component library

| Category          | Components                                                                                                                                                                                                                                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **primitives/**   | `Avatar`, `AvatarGroup`, `Badge`, `Button`, `IconButton`, `Kbd`, `Separator`, `Skeleton`, `Spinner`                                                                                                                                                                                                                        |
| **forms/**        | `Calendar`, `Checkbox`, `ColorPicker`, `Combobox`, `DatePicker`, `DateRangePicker`, `DateTimePicker`, `Form`, `FormField`, `FormWizard`, `Input`, `Label`, `NumberInput`, `OtpInput`, `PhoneInput`, `Radio`, `RadioGroup`, `RangeSlider`, `Rating`, `RichTextEditor`, `Select`, `Slider`, `Switch`, `TagInput`, `Textarea`, `TimePicker` |
| **feedback/**     | `Alert`, `BottomSheet`, `ConfirmDialog`, `Dialog`, `Drawer`, `ErrorBoundary`, `LoadingBoundary`, `NotificationsCenter` (`NotificationsBell` + `NotificationsPanel` + `NotificationItem`), `Progress`, `Toast`, `Tooltip`                                                                                                                |
| **navigation/**   | `Breadcrumbs`, `ContextMenu`, `DropdownMenu`, `Menu`, `Pagination`, `Stepper`, `Tabs`                                                                                                                                                                                                                                                  |
| **data-display/** | `Card`, `DataTable`, `EmptyState`, `FileExplorer`, `FilterableSearch`, `ImageGallery` (+ `Lightbox`), `Kanban`, `List`, `Stat`, `Table`, `Timeline`, `TreeView`, **charts/** (`AreaChart`, `BarChart`, `ChartContainer`, `ComposedChart`, `DonutChart`, `LineChart`, `PieChart`, `RadialChart`, `StackedBarChart`)                       |
| **overlays/**     | `CommandPalette`, `Portal`                                                                                                                                                                                                                                                                                                 |
| **layout/**       | `AppLayout`, `Container`, `FocusMode`, `FullscreenWorkspace`, `LocaleSwitcher`, `PageHeader`, `PageShell`, `Sidebar`, `SplitLayout`, `ThemePicker`, `ThemeToggle`, `Topbar`, `TypographyPicker`                                                                                                                            |

Every component lives in its own folder with the standard 5-file
layout (`<Name>.tsx`, optional `<Name>.types.ts`, `<Name>.test.tsx`,
`<Name>.stories.tsx`, `index.ts`).

### 2.2 Behavioral hooks (`src/hooks/`)

These are the foundation that every interactive component composes:

`useClickOutside`, `useControllableState`, `useDebouncedValue`,
`useDisclosure`, `useDrag`, `useErrorHandler`, `useEscapeKey`,
`useFocusReturn`, `useFocusTrap`, `useId`, `useIntersectionObserver`,
`useListbox`, `useMediaQuery`, `useMergedRefs`,
`usePosition` (incl. flip + shift), `usePrintMode`,
`useRovingFocus`, `useRovingFocusGrid`, `useScrollLock`, `useTypeahead`.

All hooks have test coverage in `src/hooks/__tests__/`.

### 2.3 Subsystems

- **Theming.** `ThemeProvider` owns three orthogonal concerns. (1) **Mode** —
  `light`/`dark`/`system` syncs with `prefers-color-scheme`, persists to
  `localStorage`, toggles a `dark` class on `<html>`. (2) **Palette** —
  runtime-swappable color set defined in `src/lib/themeTokens.ts`. 22
  semantic color tokens × {light, dark}. Built-in palettes:
  `default`, `teal`, `rose`, `claude` (all full-tint — surface, border,
  hover, accent all flip). Custom palettes are user-created at
  `/settings/theme` and persisted to localStorage. Applied as inline
  custom properties on `<html>` so they override the `:root` /
  `html.dark` defaults in `tokens.css`. Topbar UI: `<ThemePicker>`
  (palette dropdown) sits alongside `<ThemeToggle>` (mode dropdown).
- **Typography.** Orthogonal to palette. `src/lib/typography.ts` defines
  a `TypographyConfig = { fonts: FontMap, scale: number }` and 8
  built-in presets (`system`, `compact`, `comfortable`, `serif-heading`,
  `editorial`, `humanist`, `screen`, `mono`) using only OS-available
  fonts (system stacks, Georgia, Trebuchet MS, Verdana, Consolas/Menlo)
  so changes show up without any font install. The `scale` is a 0.85–
  1.20 multiplier on root `font-size`; every rem-based Tailwind size
  flexes proportionally (`text-sm` and `p-4` and `h-10` all scale).
  Topbar UI: `<TypographyPicker>`. Editor at `/settings/typography`.
- **Routing.** `react-router-dom` v7 with `createBrowserRouter`, a
  shared `RootShell`, and the `AppLayout` for chrome.
- **Auth scaffolding.** `AuthProvider` + `useAuth`, a single
  `AuthClient` interface, an in-memory `mockAuthClient`, plus
  `ProtectedRoute`, `PublicOnlyRoute`, and `RoleGate` guards. Swapping
  in a real backend is a one-file replacement.
- **Notifications inbox.** `NotificationsProvider` + `useNotifications`,
  a single `NotificationsClient` interface (mirrors the auth pattern),
  an in-memory `mockNotificationsClient` (localStorage-backed; emits a
  fake new notification every 30s in dev to demonstrate the subscribe
  channel), and a Topbar `NotificationsBell` + `NotificationsPanel`
  (Drawer on mobile, popover on desktop) under
  `feedback/NotificationsCenter/`. Optimistic mark-read / mark-all /
  remove with rollback, infinite scroll via
  `useIntersectionObserver`. Per-session open state via sessionStorage.
  Different from Toast — Toast is transient action feedback,
  Notifications is the persistent inbox.
- **Command palette.** `Cmd/Ctrl+K` and `/` open a fuzzy command
  palette with grouped results, keyboard navigation, and a registry
  hook (`useRegisterCommands`) that lets any subtree contribute
  commands.
- **Toast / dialog / drawer / tooltip / confirm-dialog** with full
  focus management (trap on open, return on close, scroll lock for
  modals, Escape + click-outside dismissal).
- **Data table** built on TanStack Table v8 (state/headless only — all
  visuals are ours): sorting, filtering, column visibility, pagination,
  empty states, skeletons.
- **Charts** family on top of Recharts: 9 chart types sharing a
  `ChartContainer` wrapper that owns tokens, tooltip styling, legend
  layout, and SSR-safe sizing.
- **Rich text editor** using TipTap headless (ProseMirror under the
  hood), with our own toolbar and bubble menu.
- **Date / time pickers.** `Calendar`, `DatePicker`, `DateRangePicker`,
  `DateTimePicker`, `TimePicker` — all built on `date-fns` and our
  positioning + focus hooks. No external picker UI.
- **Combobox / Listbox.** Custom WAI-ARIA combobox using a shared
  `useListbox` keyboard model. No external listbox library.
- **Internationalization.** `react-i18next` + browser language
  detector, `LocaleProvider` exposing `{ locale, setLocale,
availableLocales, dir }`, a `LocaleSwitcher` in the topbar, and a
  flat `feature.subfeature.key` resource layout. Locale persists via
  `localStorage` and switches between `en` / `es` (Spanish) out of the
  box, with `RTL_LOCALES` baked in for future right-to-left work.
- **Print system.** Every page that contains useful information
  (tables, charts, dashboards, read-only forms) prints cleanly: no
  sidebar, no topbar, no command palette, no overlays, no action
  buttons. The print stylesheet (`src/styles/print.css`) is a single
  centralized `@media print` block — components opt in via three
  attributes: `data-print="hide"` (chrome / overlays / pure-interaction
  surfaces), `data-print="expand"` (DataTable + Tabs render every
  filtered row / every panel during print, driven by `usePrintMode()`),
  and `data-print-block` (break-inside-avoid for Card / Stat). Neutral
  tokens flip to grayscale inside `@media print`; accent tokens
  (primary/success/warning/danger/info) are preserved so charts retain
  meaning. The `/print-preview` route is the verification surface.
- **Server state.** `@tanstack/react-query` v5 wrapped in `src/data/`
  with `ApiError` (status / code / message / payload), `useApiQuery` /
  `useApiSuspenseQuery` / `useApiMutation` / `useInvalidate`, a `keys`
  factory, and `<ApiAuthBridge>` wiring `useAuth()` ↔ the api singleton
  (token + refresh + 401 retry + logout). A central error dispatcher
  (`mapApiError` in `src/data/errorHandler.ts`) classifies every failure
  into `toast` / `redirect` / `inline` / `fatal`; `<ErrorBridge>` (in
  `RootShell`) hands `navigate` + `toast` to it so the global
  QueryCache / MutationCache handlers fire without context dependencies.
  `useApiFormSubmit` glues react-hook-form to a mutation (success
  navigation + per-field 422 mapping); mutations that own their own UX
  set `meta: { handlesErrors: true }` to opt out of the global toast.
- **Mocking.** [MSW](https://mswjs.io) handlers in `src/mocks/handlers.ts`,
  a browser worker in `src/mocks/browser.ts` (mounted opt-in via
  `VITE_USE_MSW=true` in dev) and a node server in `src/mocks/node.ts`
  (used by suites that need network mocking).
- **Error boundaries.** `feedback/ErrorBoundary/` with three levels:
  app-root (`main.tsx`), router-root + per-route
  (`<RouterErrorElement>` on `/tables`, `/charts`, `/admin`), and
  per-feature subtrees. Async / event-handler errors bridge through
  `useErrorHandler()`. Every catch calls `reportError(err, context)` in
  `src/lib/errorReporter.ts`; production swaps the body for a real
  reporter (Sentry / Bugsnag / Datadog) with the structured payload
  shape preserved. `<LoadingBoundary>` composes `<Suspense>` +
  `<ErrorBoundary>` for the data-fetching pattern and ships four
  skeleton presets (`SkeletonGrid`, `SkeletonList`, `SkeletonTable`,
  `SkeletonForm`) plus `<InlineLoader>` / `<PageLoader>`.
- **Lazy routes.** Route-level code splitting via react-router v7's
  `lazy` route option for `/charts` (Recharts), `/tables`
  (TanStack Table + DataTable), `/workspace`, and `/admin`.
  Component-level split for `LazyRichTextEditor` (TipTap +
  ProseMirror); the barrel intentionally does NOT re-export the eager
  component so Rollup actually splits.
- **Layout demos.** `/showcase`, `/primitives`, `/forms`, `/feedback`,
  `/data`, `/tables`, `/charts`, `/positioning`, `/layout`, `/split`,
  `/focus`, `/workspace`, `/admin`, `/timeline`, `/tree`, `/kanban`,
  `/files`, `/gallery`, `/wizard`, `/search`, `/mobile-preview`,
  `/playground`, `/settings/theme`, `/settings/typography`, `/errors`,
  `/print-preview` plus the `/login` flow.
- **Playground.** `/playground` is a developer tool for tweaking any
  component's props live (searchable list, auto-generated controls,
  copy-code button, theme + locale toggles). Driven by an explicit
  registry at `src/playground/registry.tsx`; see
  `src/playground/README.md` for how to add entries.

### 2.4 Tooling

- Strict TypeScript (`strict`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noImplicitOverride`,
  `erasableSyntaxOnly`).
- ESLint flat config with React 19, hooks v7, jsx-a11y, and a
  `no-restricted-imports` rule that blocks every banned UI library.
- Prettier (Husky + lint-staged on commit).
- Vitest + Testing Library + jsdom + **vitest-axe** (axe-core a11y
  assertions on every component test via `runAxe(container)` from
  `@/test-utils/a11y`; `color-contrast` and `region` disabled globally
  due to jsdom limitations and the per-component-test scope).
  No snapshots.
- **Playwright** E2E suite (`e2e/`): auth, forms, tables, overlays,
  keyboard nav, theme/locale persistence — all driven through shared
  `loginAs` / `gotoSignedIn` fixtures, run against `pnpm dev` with MSW
  enabled. 2 retries in CI; quarantine via `test.fixme` (never
  `test.skip`).
- Storybook 10 (Vite 8 builder).
- Bundle analyzer wired (`pnpm analyze` → `dist/stats.html`); soft
  budgets documented in CONTRIBUTING.md (no CI gate today).
- GitHub Actions CI: typecheck, lint, test (with coverage), build,
  build-storybook, Playwright E2E.

---

## 3. Directory structure

```
admin-template/
├─ .github/workflows/ci.yml
├─ .husky/                          # pre-commit hook (typecheck + lint-staged)
├─ .storybook/
│  ├─ main.ts
│  └─ preview.tsx                   # ThemeProvider + LocaleProvider + MemoryRouter decorator
├─ docs/
│  ├─ Introduction.mdx              # Storybook docs landing page
│  └─ proposals/rich-text-editor.md
├─ e2e/                              # Playwright specs + fixtures
│  ├─ fixtures.ts                    # loginAs(role), gotoSignedIn(path, role?)
│  ├─ auth.spec.ts
│  ├─ forms.spec.ts
│  ├─ tables.spec.ts
│  ├─ overlays.spec.ts
│  ├─ keyboard.spec.ts
│  └─ theme-locale.spec.ts
├─ playwright.config.ts
├─ public/
│  └─ mockServiceWorker.js           # MSW worker (generated)
├─ src/
│  ├─ assets/
│  ├─ auth/                         # AuthClient, AuthProvider, guards, mock client
│  │  ├─ __tests__/
│  │  ├─ AuthClient.ts
│  │  ├─ AuthProvider.tsx
│  │  ├─ ProtectedRoute.tsx
│  │  ├─ PublicOnlyRoute.tsx
│  │  ├─ RoleGate.tsx
│  │  ├─ mockAuthClient.ts
│  │  ├─ types.ts
│  │  ├─ useAuth.ts
│  │  └─ index.ts
│  ├─ components/
│  │  ├─ primitives/
│  │  ├─ forms/
│  │  ├─ feedback/
│  │  ├─ navigation/
│  │  ├─ data-display/
│  │  │  └─ charts/                  # AreaChart, BarChart, etc.
│  │  ├─ layout/
│  │  └─ overlays/
│  ├─ context/
│  │  ├─ ThemeProvider.tsx
│  │  ├─ ToastProvider.tsx
│  │  └─ LocaleProvider.tsx
│  ├─ data/                          # @tanstack/react-query wrapper layer
│  │  ├─ __tests__/
│  │  ├─ api.ts                      # fetch wrapper + ApiError + 401 retry
│  │  ├─ queryClient.ts
│  │  ├─ QueryProvider.tsx
│  │  ├─ ApiAuthBridge.tsx
│  │  ├─ ErrorBridge.tsx             # registers navigate + toast with errorHandler
│  │  ├─ errorHandler.ts             # mapApiError → toast/redirect/inline/fatal
│  │  ├─ keys.ts                     # query key factory
│  │  ├─ useApiQuery.ts
│  │  ├─ useApiSuspenseQuery.ts
│  │  ├─ useApiMutation.ts
│  │  ├─ useApiFormSubmit.ts         # RHF ↔ mutation glue
│  │  ├─ useInvalidate.ts
│  │  └─ index.ts
│  ├─ mocks/                         # MSW
│  │  ├─ handlers.ts
│  │  ├─ browser.ts                  # dev worker (opt-in via VITE_USE_MSW=true)
│  │  ├─ node.ts                     # test server
│  │  └─ fixtures.ts
│  ├─ notifications/                 # Notifications inbox subsystem
│  │  ├─ __tests__/
│  │  ├─ NotificationsClient.ts      # interface
│  │  ├─ mockNotificationsClient.ts  # in-memory + localStorage + dev 30s emitter
│  │  ├─ NotificationsProvider.tsx
│  │  ├─ useNotifications.ts
│  │  ├─ types.ts
│  │  └─ index.ts
│  ├─ hooks/
│  │  ├─ __tests__/
│  │  └─ <19 behavioral hooks>
│  ├─ i18n/
│  │  ├─ __tests__/i18n.test.tsx
│  │  ├─ locales/
│  │  │  ├─ en.json
│  │  │  └─ es.json
│  │  └─ index.ts                    # i18next + browser-languagedetector init
│  ├─ lib/
│  │  ├─ cn.ts                       # clsx + tailwind-merge
│  │  ├─ date.ts                     # date-fns wrappers
│  │  ├─ date.test.ts
│  │  ├─ errorReporter.ts            # reportError(err, ctx) — swap body for Sentry/etc.
│  │  ├─ themeTokens.ts              # Palette schema, built-ins, apply/clear, storage
│  │  └─ typography.ts               # TypographyConfig schema, presets, apply/clear, storage
│  ├─ pages/                         # demo / showcase pages (incl. playground/,
│  │                                 #   settings/theme, settings/typography)
│  ├─ playground/                    # /playground registry + controls + codegen
│  │  ├─ registry.tsx                # explicit component → propSchema map
│  │  ├─ types.ts
│  │  ├─ PropControls.tsx
│  │  ├─ codegen.ts                  # JSX string generator for "Copy code"
│  │  ├─ preview.ts                  # raw values → live props (resolves jsx presets)
│  │  └─ README.md                   # how to add components
│  ├─ styles/
│  │  ├─ globals.css                 # Tailwind import + base resets + print import
│  │  ├─ print.css                   # @media print rules (data-print contract)
│  │  └─ tokens.css                  # semantic tokens (light + dark)
│  ├─ test-utils/
│  │  └─ a11y.ts                     # runAxe() + toHaveNoViolations matcher
│  ├─ types/
│  ├─ App.tsx
│  ├─ main.tsx                       # imports @/i18n + (opt) MSW worker before <App />
│  └─ setupTests.ts                  # jsdom polyfills for ProseMirror + axe matcher install
├─ CLAUDE.md                         # AI / contributor source-of-truth
├─ CONTRIBUTING.md                   # human-friendly contributor guide
├─ README.md
├─ SETUP.md
├─ PROJECT.md                        # ← this file
├─ eslint.config.js
├─ package.json
├─ tsconfig.json / tsconfig.app.json / tsconfig.node.json
├─ vite.config.ts
└─ vitest.config.ts
```

`@/*` is aliased to `src/*` in both Vite and TypeScript.

---

## 4. Dependencies — what we took, and why

The mission is "no UI library, no headless component library, no icon
set beyond lucide". We still depend on a deliberately small set of
**behavior, state, build, and developer-tooling** packages. Each entry
below explains _what role it plays_ and _why a from-scratch replacement
was not justified_.

### 4.1 Runtime — UI framework

| Package                     | Why it stays                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| `react`, `react-dom` (19.x) | The framework. The ref-as-prop pattern (no `forwardRef`) is a React 19 feature we explicitly use.     |
| `react-router-dom` (7.x)    | Routing only. Does not ship visuals. Replacement would be a multi-week project of zero product value. |

### 4.2 Runtime — styling & utility

| Package                                   | Role                                                                          | Why it stays                                                                                                                                 |
| ----------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `tailwindcss` (4.x) + `@tailwindcss/vite` | Utility CSS engine.                                                           | Tailwind is the styling foundation. It does **not** ship components; it ships utilities.                                                     |
| `class-variance-authority` (`cva`)        | Variant prop → class string mapping.                                          | Tiny, dependency-free, replaces 60+ lines of hand-rolled variant logic per component.                                                        |
| `clsx` + `tailwind-merge`                 | Class composition with last-wins precedence for conflicting Tailwind classes. | Combined into our own `cn()` helper in `src/lib/cn.ts`. The conflict resolution from `tailwind-merge` is non-trivial to reproduce correctly. |
| `lucide-react`                            | Icon set.                                                                     | Allowed by policy. Single icon library across the app. No other icon set may be added.                                                       |

### 4.3 Runtime — behavior & state (no visuals)

| Package                                                                                                                               | Role                                                                       | Why it stays                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `react-hook-form`                                                                                                                     | Form state, validation orchestration, dirty tracking.                      | Pure state management. Reimplementing it is months of work and yields a worse API.                                                               |
| `zod`                                                                                                                                 | Schema-first runtime validation.                                           | Pairs with `react-hook-form` via `@hookform/resolvers`. Validation messages translate via i18n.                                                  |
| `@hookform/resolvers`                                                                                                                 | Glue between RHF and zod.                                                  | Trivially thin — keeping it is easier than a maintained shim.                                                                                    |
| `@tanstack/react-table` (v8)                                                                                                          | DataTable headless engine (sorting/filtering/pagination state).            | **Headless** — ships zero visuals. We provide all rendering.                                                                                     |
| `@tanstack/react-query` (v5) + `@tanstack/react-query-devtools`                                                                       | Server state — caching, deduping, retries, suspense + non-suspense reads.  | Pure state. Replacement is a multi-month project for a worse API. Wrapped in `src/data/` so app code never touches RQ directly.                  |
| `msw`                                                                                                                                 | Service-worker / node-server fetch mocking for dev + tests.                | Only mocking infra in the project; opt-in in dev (`VITE_USE_MSW=true`), used in select test suites. Data-layer unit tests stub `fetch` directly. |
| `date-fns` (4.x)                                                                                                                      | Date arithmetic.                                                           | Functional, tree-shakable, immutable Date in / Date out. We wrap formatters in `src/lib/date.ts`. No Moment. No Day.js.                          |
| `recharts` (3.x)                                                                                                                      | Chart rendering primitives (SVG / responsive container / tooltip surface). | Pragmatic carve-out — see §6. We own the look via `ChartContainer`.                                                                              |
| `@tiptap/*` (`react`, `pm`, `starter-kit`, `extension-link`, `extension-placeholder`, `extension-underline`, `extension-bubble-menu`) | Rich text editor (ProseMirror runtime + a small set of extensions).        | Pragmatic carve-out — see §6. We supply our own toolbar and bubble menu UI.                                                                      |
| `i18next` + `react-i18next` + `i18next-browser-languagedetector`                                                                      | i18n runtime, React bindings, locale detection chain.                      | Behavior library — no visual surface. Resource lookup, plural rules, interpolation — not worth re-implementing.                                  |

### 4.4 Build & dev tooling

| Package                                                                                                                                                                            | Role                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `vite` (8.x), `@vitejs/plugin-react`                                                                                                                                               | Build + dev server.                                           |
| `typescript` (~6.x)                                                                                                                                                                | Strict TS.                                                    |
| `vitest` (4.x) + `@vitest/ui`                                                                                                                                                      | Test runner.                                                  |
| `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`                                                                                               | DOM testing. Role/label-first queries enforced by convention. |
| `vitest-axe` + `axe-core`                                                                                                                                                          | A11y assertions inside unit tests via `runAxe()`.             |
| `@playwright/test`                                                                                                                                                                 | E2E browser tests under `e2e/` against `pnpm dev` + MSW.      |
| `rollup-plugin-visualizer`                                                                                                                                                         | Bundle analysis (`pnpm analyze` writes `dist/stats.html`).    |
| `jsdom`                                                                                                                                                                            | Test environment.                                             |
| `storybook` (10.x), `@storybook/react-vite`, `@storybook/addon-a11y`, `@storybook/addon-docs`, `@storybook/addon-themes`                                                           | Component documentation.                                      |
| `eslint` (9.x), `@typescript-eslint/*`, `eslint-plugin-react`, `eslint-plugin-react-hooks` (v7), `eslint-plugin-react-refresh`, `eslint-plugin-jsx-a11y`, `eslint-config-prettier` | Lint pipeline.                                                |
| `prettier` (3.x)                                                                                                                                                                   | Formatter.                                                    |
| `husky` + `lint-staged`                                                                                                                                                            | Pre-commit gate (typecheck + staged lint).                    |
| `globals`                                                                                                                                                                          | Globals registry for ESLint flat config.                      |
| `@types/*`                                                                                                                                                                         | Type definitions.                                             |

### 4.5 Banned dependencies (lint-blocked)

The following will fail CI on import:

- `@radix-ui/*`
- `@mui/*`
- `@chakra-ui/*`
- `@mantine/*`
- `@headlessui/*`
- `react-aria-components`
- `shadcn/*`, `shadcn-ui/*`

The reasoning: each one ships visual components, which collides
with the "one consistent owned component library" goal. Pulling any
of these in defeats the purpose of the project.

---

## 5. Architecture & conventions

### 5.1 Component anatomy

Every component:

- One folder per component, five files.
- **Named exports only** (default exports blocked under
  `src/components/` and `src/hooks/`; story files exempt because
  Storybook needs a default `meta`).
- **React 19 ref-as-prop pattern** — no `forwardRef`.
- Variants via `cva`. Class composition via our `cn()` helper.
- Spreads `...rest` to the root, merges `className` via `cn()`.
- Strict TS — no `any`, no `as unknown as`, no `@ts-ignore` without a
  justifying comment.

### 5.2 Styling

- Tailwind utilities only. No CSS modules, styled-components, or
  Emotion. `style={{}}` only for truly dynamic numeric values
  (positioning coordinates, percent widths).
- All colors / spacing / radii / shadows come from semantic tokens in
  `src/styles/tokens.css`. Components consume `bg-surface`,
  `text-foreground-muted`, `border-border`, `bg-primary`, etc. — never
  raw hex / rgb.
- Dark mode is the `class` strategy on `<html>`. Tokens swap, so
  components rarely need `dark:` variants.

### 5.3 Accessibility

Non-negotiable for every interactive surface:

- Visible focus indicator
  (`focus-visible:ring-2 focus-visible:ring-ring …`).
- Tab / Enter / Space / Escape / Arrow keys where relevant.
- Correct ARIA roles, labels, states.
- Focus trap on overlays (`useFocusTrap`), focus return on close
  (`useFocusReturn`), scroll lock on full-screen overlays
  (`useScrollLock`), roving tabindex on menus and tablists
  (`useRovingFocus`).
- WCAG AA contrast for text and UI components.
- Form controls (Checkbox, Radio, Switch) style the **native input**
  via `peer` modifiers — native semantics are accessible by default
  and harder to break.

### 5.4 Testing

- Query order: **role → label → text**. No queries by class name.
- `userEvent`, never `fireEvent`.
- No snapshot tests.
- Overlays: assert focus trap, Escape close, click-outside close,
  focus-return on close.
- Hooks have parallel tests in `src/hooks/__tests__/`.

### 5.5 State management

- Local: `useState` / `useReducer`.
- Cross-component UI state (theme, toasts, locale): React Context in
  `src/context/`.
- Server state: TanStack Query when added (not yet) — no Redux, no
  Zustand.
- Forms: `react-hook-form` + `zod`.

### 5.6 Internationalization

- Flat keys, dot-separated, organized by feature
  (`auth.login.title`, `common.save`, `auth.login.validation.emailRequired`).
- Detector chain `querystring → localStorage → navigator`, fallback
  `en`, persisted under `admin-template-locale`.
- `<html lang>` and `<html dir>` set by `LocaleProvider` based on the
  resolved locale and an `RTL_LOCALES` set.
- Validation messages translate via the `t` function passed into a
  `useMemo`-built zod schema.
- Dates and numbers go through `Intl.*`, not i18next's formatter.

---

## 6. Pragmatic carve-outs

A small number of policy-adjacent decisions were made deliberately,
each documented inline at its call site and re-stated here.

### 6.1 Recharts for charts

We took Recharts despite the "no UI library" rule because the
alternative is rolling SVG axes, scales, hit-testing, animation
interpolation, and tooltip positioning across 9 chart types — months
of work for content the product does not differentiate on. We
contained the dependency under
`src/components/data-display/charts/ChartContainer/`, which owns the
look (colors via tokens, our own legend / tooltip surface). Every
chart type re-exports through that container so only one place ever
touches Recharts directly.

### 6.2 TipTap for the rich text editor

ProseMirror is the de-facto standard rich text engine on the web; the
TipTap React wrapper is the smallest and least opinionated way onto
it. Reimplementing collaborative-grade contenteditable handling is
out of scope. The toolbar, bubble menu, and styling are 100% ours,
and the proposal record (`docs/proposals/rich-text-editor.md`) keeps
the "why" auditable.

### 6.3 TanStack Table for DataTable

Headless library — ships zero visuals. The cost of a hand-rolled
table state engine (sort, filter, paginate, column visibility, virt
hooks) outweighs the integration cost of TanStack Table.

### 6.4 react-hook-form + zod

Same logic — pure state. We do not own the form state machine; we
own the visual form components on top of it.

### 6.5 i18next family

A behavior library only. Resource lookup, plural rules, language
detection — not worth re-implementing. We disabled its date / number
formatter and route those through `Intl` instead, so the library only
does string lookup + interpolation.

### 6.6 Lint pragmatism

`eslint.config.js` documents a small set of carve-outs:

- `@typescript-eslint/explicit-module-boundary-types` is required in
  `src/hooks/` and `src/lib/`, **not** in `src/components/` or
  `src/pages/` (JSX components return inferred `JSX.Element`; explicit
  annotations are noise).
- `@typescript-eslint/no-non-null-assertion` is `warn`, not `error` —
  `arr[0]!` after a length check or `screen.getByX()!` in tests is
  intentional.
- `react-refresh/only-export-components` is `warn` — colocating a
  Provider and its `useX` hook in the same file is intentional.
- `jsx-a11y/label-has-associated-control` includes our form
  primitives (`Switch`, `Checkbox`) in `controlComponents`.
- A handful of react-hooks v7 (compiler-aware) heuristics are
  disabled per-line where the pattern is intentional (e.g., mutable
  `RefObject.current` assignments by design).

---

## 7. Challenges encountered

A frank record of the hard parts so future contributors do not relearn
them.

### 7.1 Replacing Radix-style behavior wholesale

The single largest cost in the project. Radix and similar libraries
absorb thousands of lines of focus, keyboard, and ARIA logic. To
replace them we built `src/hooks/` first and made every interactive
component compose those hooks. Specific traps:

- **Focus return after close.** Naive `triggerRef.current.focus()` on
  unmount races React's commit phase. `useFocusReturn` snapshots
  `document.activeElement` on activation and restores it after the
  closing render commits.
- **Click-outside vs. focus-trap interaction.** A `pointerdown` outside
  the overlay would fire the dismiss handler before focus had returned
  to the trigger; the resulting focus jump landed on `<body>`. Fixed
  by ordering: dismiss → unmount → focus-return runs in cleanup.
- **Roving focus across composed children.** `DropdownMenu` uses
  `cloneElement`-injected indices on direct children of
  `<DropdownMenuContent>`. Wrapping an item in a non-Item component
  (e.g. a Tooltip) breaks roving focus — the documented workaround is
  to put the Item _inside_ the trigger via `asChild`, not the other
  way around.
- **Submenu key isolation.** Submenus get their own `RovingFocusGroup`
  inside `DropdownMenuSubContent` so arrow keys do not bleed into the
  parent.
- **Typeahead.** Implemented per the WAI-ARIA APG menu pattern —
  500ms inactivity buffer, jumps to next item whose text starts with
  the accumulated prefix.

### 7.2 Popover positioning without floating-ui

`usePosition` and `usePositionAtPoint` handle viewport flip and
perpendicular shift (anchor + boundary aware). Known unhandled cases
are catalogued in CLAUDE.md "Positioning — known limitations":
transformed ancestors, `position: fixed` parents on the trigger,
`transform: scale`, element-level scrollers without window resize,
iframes, alignment-fallback flip, arrow-glyph rendering, split
placement, and `pos.placement` honesty when both sides overflow.

We deferred the `@floating-ui/react-dom` migration explicitly. The
trigger conditions for revisiting (arrow middleware, transformed
portal subtrees, element-level autoupdate, alignment-fallback flip,
or a production bug in any of cases 1–9) are recorded in CLAUDE.md.
Estimated migration cost is one day.

### 7.3 React 19 ref-as-prop migration

React 19 deprecates `forwardRef`. Every component had to accept `ref`
as a regular prop typed as `Ref<T>`. The lint config enforces this —
new code reaching for `forwardRef` is flagged immediately. Storybook
10 was required because the Vite 8 builder peers Vite ≤ 6 in earlier
Storybook majors.

### 7.4 Strict TypeScript settings

`exactOptionalPropertyTypes: true` and `noUncheckedIndexedAccess: true`
combined are unforgiving: `arr[0]` is `T | undefined` everywhere, and
`{ foo?: X }` cannot be passed `foo: undefined` explicitly. We embraced
both — they catch real bugs — but they require explicit `if (item ===
undefined) continue` guards and `arr[i]!` in test files where
intent is clear.

`erasableSyntaxOnly` blocks enums, namespaces, and parameter
properties, which forced a few patterns toward plain const objects /
unions instead.

### 7.5 jsdom limitations for ProseMirror

TipTap (ProseMirror) calls `Range.getClientRects`,
`Range.getBoundingClientRect`, `Node.getClientRects`, and
`document.elementFromPoint` during selection and scroll-into-view.
jsdom omits all four. `src/setupTests.ts` polyfills them with no-op
shapes — enough for editor mount + command dispatch to succeed under
test, without pretending to test layout.

### 7.6 Tailwind v4 + design tokens

Tailwind v4 changed how custom theme values are exposed. We register
all semantic tokens via `@theme` in `globals.css` so utilities like
`bg-surface`, `text-foreground-muted`, `border-border` resolve
correctly. Light values live on `:root`, dark overrides on
`html.dark`. Components consume the semantic tokens — they almost
never need `dark:` variants because the tokens themselves swap.

### 7.7 Form validation that translates

Zod schemas built at module load freeze the language at first import.
The fix: build the schema inside the component via
`useMemo([t])`, so messages re-translate on locale change. Tests
verify both English and Spanish error messages render after a locale
switch.

### 7.8 Storybook 10 + Vite 8

Storybook ≤ 9 peers Vite ≤ 6, which is incompatible with Vite 8.
Storybook 10 was required to make the Vite 8 builder work, which in
turn required a small migration of the preview decorators. The
preview now wraps stories with `MemoryRouter` + `ThemeProvider` +
`LocaleProvider` + `CommandRegistryProvider` + `ToastProvider` +
`TooltipProvider` so any story (including `AppLayout`) renders
in isolation.

### 7.9 Auth as a swappable interface, not a backend

We did not want auth coupled to a specific backend. The single
interface — `AuthClient` with `login` / `logout` / `refresh` /
`getCurrentUser` — is the entire integration surface. The shipped
`mockAuthClient` reads / writes `localStorage` so demos work offline.
Production code drops in a real implementation in one file
without changing any component.

### 7.10 Print without per-component CSS

The naive approach is component-local `@media print` rules. That decays
fast — every new component reinvents the same hide / expand / grayscale
logic, and inconsistencies pile up. We centralized everything in
`src/styles/print.css` and gave components a three-attribute contract
(`data-print="hide"|"expand"|"no-href"` plus `data-print-block`). Two
specific traps:

- **Token override, not utility override.** Forcing every `.bg-surface`
  to `background: white` would have meant chasing every utility class
  used in the app. Instead we override the underlying CSS custom
  properties inside `@media print` (and inside `html.dark` so dark
  users still get a clean surface). Accent tokens are deliberately
  preserved so chart series stay distinguishable.
- **Expanding collapsed content needs JS, not CSS.** TabsContent
  unmounts inactive panels and DataTable only renders the current page
  — neither can be revealed by CSS. `usePrintMode()` subscribes to
  `beforeprint`/`afterprint` (with the `print` MQL as a fallback) and
  flips internal rendering during the print transaction. CSS is the
  cosmetic safety net (un-hide `[hidden]` panels inside an expand
  region); the JS does the real work.

### 7.11 Server state without coupling to a backend

Three concrete decisions:

- **Wrapped, not bare.** App code calls `useApiQuery` /
  `useApiSuspenseQuery` / `useApiMutation` (typed against `ApiError`),
  not `useQuery` from RQ directly. The wrapper enforces a single error
  shape, applies our default retry policy (4xx skip, 5xx retry once),
  and lets us pivot the underlying client if needed without touching
  every caller.
- **One classifier, one dispatcher.** `mapApiError` in
  `src/data/errorHandler.ts` is the only place errors are categorized
  (`toast` / `redirect` / `inline` / `fatal`). `<ErrorBridge>`
  registers `navigate` + `toast` with the dispatcher so the global
  QueryCache / MutationCache handlers can act without taking a context
  dependency. Forms that own their UX opt out via
  `meta: { handlesErrors: true }` and use `useApiFormSubmit` for the
  RHF ↔ mutation glue.
- **Auth is a one-line bridge.** `<ApiAuthBridge>` calls
  `configureApi()` whenever the auth user changes — wires `getToken`
  (reads `user.token` if your `User` carries one), `refresh`
  (delegates to `AuthClient.refresh()` for the one-shot 401 retry),
  and `onAuthFailure` (calls `logout()` after the retry also fails).
  Swapping in a real backend is the same one-file replacement
  documented for `AuthClient`.

### 7.12 Error boundaries that catch what React doesn't

Boundaries don't catch event-handler errors, async errors, or errors
inside the boundary itself. We bridge them with `useErrorHandler()` —
the hook stores the error and re-throws on the next render, where the
nearest ancestor boundary catches it normally. Three boundary levels
are wired by default: app-root in `main.tsx`, router-root +
per-route via React Router's `errorElement`, and per-feature
subtrees. Every catch funnels through `reportError(err, ctx)` in
`src/lib/errorReporter.ts`; production deploys swap that body for a
real reporter while keeping the structured payload shape stable.

### 7.13 A11y assertions in unit tests

Adding `vitest-axe` to every component test file caught a wave of
real violations (missing labels on switches, mis-scoped `aria-controls`,
nested-interactive in charts). The two infrastructural choices:

- **Two rules disabled globally.** `color-contrast` is a guaranteed
  false positive in jsdom (no layout → every element resolves to
  `rgba(0,0,0,0)`); contrast is enforced by the design tokens and
  reviewed in Storybook with `@storybook/addon-a11y`. `region` is a
  page-level concern and component tests render in isolation.
- **Per-component carve-outs are documented inline** with a comment
  pointing to CONTRIBUTING.md § "A11y exceptions". Today: charts and
  `SplitLayout` disable `nested-interactive` (intentional WAI-ARIA
  patterns), `FocusMode` disables landmark uniqueness rules
  (`FocusMode` IS the top-level surface in real composition).
- **Fake timers don't co-operate with axe.** Switch to real timers
  around the axe call in tests that mock the clock (Toast, Tooltip).

### 7.14 E2E without flake

Playwright covers the flows unit tests can't (navigation, network,
storage round-trips). The mitigations baked into the config and
fixtures: 2 CI retries (most flakes pass on retry; locally retries
are off so flake is loud), locator-first assertions over manual
`waitForSelector`, role/label-first queries, traces captured
on first retry only, and `gotoSignedIn(path, role?)` seeds
`localStorage` so most specs skip the login form entirely. Quarantine
flaky specs with `test.fixme` (never `test.skip`) — the PR adding
`.fixme` MUST also open a tracking ticket linking a recent failure.

### 7.15 Bundle splits that actually split

Two non-obvious traps:

- **Route lazy via react-router v7's `lazy` option, not `React.lazy`
  at the route level** — react-router handles the suspense
  internally; wrapping again is wasted work and prevents the router
  from showing its own loading UI.
- **Component-level split needs the eager export OUT of the barrel.**
  `LazyRichTextEditor` lives at `forms/RichTextEditor/lazy.tsx` and
  is the only RTE re-export from `forms/RichTextEditor/index.ts`.
  Keeping the eager `RichTextEditor` in the barrel re-introduced TipTap
  - ProseMirror to the static graph and Rollup refused the split
    with `INEFFECTIVE_DYNAMIC_IMPORT`. Tests / stories that need the
    eager component import it directly via `./RichTextEditor`.

### 7.16 i18n integration without UI bloat

Three concrete decisions:

- **Detector caches under our own key** (`admin-template-locale`),
  parallel to the theme key, so all client-side persistence lives
  under predictable namespaces.
- **No i18next formatting.** We disabled `escapeValue` (React already
  escapes) and route every date / number through `Intl`. This keeps
  the bundle small and avoids depending on i18next's formatter syntax.
- **Translated zod messages.** The schema builds inside the component
  with `useMemo([t])` so a locale change re-runs validation messages.
- **AppLayout test fallout.** Adding `useLocale()` deep in the tree
  meant existing `AppLayout.test.tsx` had to wrap with a
  `LocaleProvider` — a reminder that introducing a new global
  context requires a sweep of every render harness (tests, stories,
  preview decorators).

---

## 8. Quality bar

Every contribution must pass:

```bash
pnpm typecheck       # tsc --noEmit
pnpm lint            # eslint (0 errors)
pnpm test            # vitest (with vitest-axe a11y assertions, all green)
pnpm build           # vite production build
pnpm build-storybook # storybook static build
pnpm e2e             # playwright (run with VITE_USE_MSW=true automatically)
```

All six run in CI on every push and PR to `main`. The pre-commit
hook runs typecheck + lint-staged on staged files. Hooks are not
skipped — every failure is a real problem.

---

## 9. What is intentionally not here

- No animation library — we use Tailwind's `transition-*` utilities
  and `data-state="open|closed"` patterns.
- No i18n machine translation pipeline — translations are committed
  by hand into JSON files. Spanish is the seed locale; more can be
  added per the recipe in `CONTRIBUTING.md`.
- No production error reporter wired — `src/lib/errorReporter.ts`
  exposes the seam (`reportError(error, context)`) and structured
  payload shape; deployments swap the body for Sentry / Bugsnag /
  Datadog. Today it logs in dev and no-ops in prod.
- No CI bundle-size gate — soft budgets documented in
  `CONTRIBUTING.md`, enforced in PR review only.

---

## 10. Where to look next

- **CLAUDE.md** — the rule book. Read it before changing anything.
- **CONTRIBUTING.md** — the workflow for adding a component or hook.
- **src/hooks/** — start here when building anything interactive.
- **src/styles/tokens.css** — start here when adjusting visuals.
- **src/components/&lt;category&gt;/&lt;Component&gt;/** — the canonical
  reference for what a complete component looks like.
- **docs/proposals/** — design decisions captured in writing.
