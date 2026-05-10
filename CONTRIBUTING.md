# Contributing

Welcome. This is the in-house admin UI template — a fully owned component library
built from scratch on React 19, TypeScript 6, Tailwind v4, and Vite 8. The full
rules of the road live in [CLAUDE.md](./CLAUDE.md). This file is the
contributor-friendly summary plus a walkthrough for adding a new component.

## TL;DR

- We do **not** depend on any UI kit or headless component library
  (no MUI, Chakra, Mantine, Radix, shadcn, Headless UI, NextUI,
  React Aria Components). Every primitive is written in this repo.
- We do not depend on third-party CSS frameworks beyond Tailwind, animation
  libraries, or icon sets other than `lucide-react`.
- All visuals are Tailwind utility classes wired to design tokens. No CSS
  modules, no styled-components, no inline `style={{}}` (except for truly
  dynamic numeric values like positioning coordinates).
- All interactive behavior — focus traps, click-outside, scroll lock,
  roving focus, popover positioning — composes hooks from `src/hooks/`.

If you would reach for a banned dependency, raise it in review instead.
The answer is almost always: **extend our hooks**.

## Quickstart

```bash
pnpm install
pnpm dev            # Vite
pnpm storybook      # Storybook
pnpm typecheck
pnpm lint
pnpm test
pnpm format         # prettier --write .
pnpm build
```

`pnpm prepare` installs the Husky pre-commit hook automatically after
`pnpm install`.

## Quality pipeline

A pre-commit hook runs:

1. `pnpm typecheck` — full TypeScript check (incremental, fast on subsequent runs).
2. `lint-staged` — `eslint --fix --max-warnings=0` + `prettier --write` on
   staged `*.ts` / `*.tsx`, and `prettier --write` on other supported files.

CI (GitHub Actions, `.github/workflows/ci.yml`) runs the full bar on push and
PR to `main`:

- Typecheck
- Lint
- Test with coverage
- Production build
- Storybook build

If the pre-commit hook fails, fix the underlying issue and re-stage.
**Do not commit with `--no-verify`** unless you have explicit approval — every
hook failure represents a real problem.

## Code style

### Components

- One folder per component. Five files: `<Name>.tsx`, `<Name>.types.ts`
  (only if non-trivial), `<Name>.test.tsx`, `<Name>.stories.tsx`,
  `index.ts`.
- **Named exports only.** Default exports are blocked by ESLint inside
  `src/components/` and `src/hooks/`. Stories files are exempt — Storybook
  needs a default export for the meta object.
- **React 19 ref-as-prop pattern.** Accept `ref` as a regular prop typed
  with `Ref<...>`. Do not use `forwardRef` — it is legacy in React 19.
- Variants via `cva`. Combine classes with `cn()` from `@/lib/cn`.
- Spread `...rest` to the root element. Always merge `className` via `cn()`.
- Strict TypeScript everywhere. No `any`, no `as unknown as`,
  no `@ts-ignore` (without a justifying comment), no implicit returns
  on non-component utilities.

### Styling

- Tailwind utility classes only. No CSS modules, no styled-components,
  no Emotion.
- All colors, spacing, radii come from semantic tokens in
  `src/styles/tokens.css` exposed to Tailwind v4 via `@theme`. Use
  `bg-primary`, `text-foreground-muted`, `border-border`, etc. — never raw
  hex / rgb.
- Dark mode is the `class` strategy on `<html>`. With semantic tokens you
  almost never need `dark:` variants — the tokens already swap.

### Accessibility

- Visible focus indicator on every interactive element:
  `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
- Keyboard navigation: Tab, Enter, Space, Escape, arrow keys where relevant.
- Correct ARIA roles, labels, and states (`aria-disabled`, `aria-invalid`,
  `aria-expanded`, `aria-controls`, `aria-haspopup`, `aria-current`).
- Compose our hooks instead of inlining behavior:
  `useFocusTrap`, `useFocusReturn`, `useEscapeKey`, `useClickOutside`,
  `useScrollLock`, `useRovingFocus`.
- For composite ARIA patterns (Combobox, Listbox, Tree, etc.) follow the
  [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) and
  extend our hooks. Do **not** reach for an external library.

## Accessibility testing

Every component test runs `axe-core` (via `vitest-axe`) against the rendered
DOM. The runner is `runAxe(container, options?)` from
`@/test-utils/a11y`, and the matcher is `toHaveNoViolations()` (extended onto
`expect` in `src/setupTests.ts`).

### When to add an axe assertion

Add **one** axe assertion per component test file:

- **Simple primitives / display components** — assert against the default
  render with the most prop-rich combination you reasonably care about
  (variants, with description, with required marker, etc.).
- **Interactive / overlay components** — assert against **two** states:
  default (closed) and the key interactive state (open dialog, expanded
  combobox, opened menu, focused tooltip). Use `runAxe(document.body)` for
  the open state because portaled overlays mount outside the test container.
- **Composed components** (`AppLayout`, `PageShell`, `DataTable`, etc.) —
  assert against the composed render, not just the leaf.

Do **not** loop axe across every variant. Each axe run is the slowest part
of a unit test (axe walks the DOM and applies ~70 rules); one or two
representative renders catch real regressions without bloating CI.

### How

```tsx
import { runAxe } from '@/test-utils/a11y';

it('has no a11y violations (default + open)', async () => {
  const { container } = render(<MyDialog />);
  expect(await runAxe(container)).toHaveNoViolations();

  await userEvent.click(screen.getByRole('button', { name: 'Open' }));
  expect(await runAxe(document.body)).toHaveNoViolations();
});
```

When a test uses **fake timers** (`vi.useFakeTimers()` — Toast, Tooltip),
switch to real timers around the axe call. axe-core's internal scheduling
does not co-operate with mocked time and the test will hang until timeout:

```tsx
it('has no a11y violations', async () => {
  vi.useRealTimers();
  // … render, trigger, assert …
});
```

### A11y exceptions

Two rules are disabled **globally** in `src/test-utils/a11y.ts`:

- **`color-contrast`** — jsdom cannot compute layout, so every element
  resolves to `rgba(0,0,0,0)` and the rule is a guaranteed false positive.
  Contrast is enforced by the design tokens (which already meet WCAG AA)
  and reviewed in Storybook with `@storybook/addon-a11y`.
- **`region`** — landmark coverage is a page-level concern. Component
  tests render a single primitive in isolation, so requiring it to sit
  inside `<main>`/`<nav>`/etc. is a structural false positive. Whole-app
  composition is verified by `AppLayout` and `PageShell` tests, where the
  landmarks do exist.

The following rules are disabled **per-test** (each call site has an inline
comment pointing here):

- **Charts** (`AreaChart`, `BarChart`, `ComposedChart`, `DonutChart`,
  `LineChart`, `PieChart`, `RadialChart`, `StackedBarChart`) disable
  `nested-interactive`. Charts intentionally place an interactive legend
  inside a `role="img"` container — the chart is described by its
  `aria-label`, the legend is supplemental. axe's rule does not model this
  pattern; the design is the WAI-ARIA recommendation for accessible
  charts.
- **`SplitLayout`** disables `nested-interactive`. The window-splitter
  pattern (WAI-ARIA APG) puts a collapse button inside a focusable
  separator — axe's heuristic doesn't cover the documented pattern.
- **`FocusMode`** disables `landmark-banner-is-top-level` and
  `landmark-main-is-top-level`. `FocusMode` IS the top-level surface when
  used (full-page takeover); the test container wraps it in a `<div>`,
  which makes axe see its `<header>` + `<main>` as nested. Verified
  correct in real composition.

To add a new exception: prefer fixing the underlying DOM if reasonable.
If the violation is genuinely a rule mismatch with a documented pattern,
disable the rule **per-call** (`runAxe(container, { rules: { 'rule-id':
{ enabled: false } } })`), add an inline comment explaining why, and add
an entry to this section.

## How to add a component

This is the workflow we want every contributor to follow.

### 1. Identify the category

Pick the right folder under `src/components/`:

- `primitives/` — Button, IconButton, Badge, Avatar, Spinner, Skeleton, Kbd, Separator
- `forms/` — Label, Input, Textarea, Select, Checkbox, Radio, Switch, FormField, Form
- `feedback/` — Alert, Toast, Dialog, Drawer, ConfirmDialog, Tooltip, Progress
- `navigation/` — Tabs, Breadcrumbs, Pagination, Stepper, Menu, DropdownMenu
- `data-display/` — Card, Stat, List, EmptyState, Table, DataTable
- `layout/` — Container, PageShell, PageHeader, Sidebar, Topbar
- `overlays/` — Popover, ContextMenu, Sheet, CommandPalette, Portal

### 2. Check `src/hooks/` _before_ writing any UI code

Open `src/hooks/` and look for behavioral primitives that match your needs.
Examples of things you should compose, not reinvent:

- Open/close state → `useDisclosure`
- Controlled + uncontrolled support → `useControllableState`
- Focus trap inside an overlay → `useFocusTrap`
- Returning focus on close → `useFocusReturn`
- Dismiss on outside click → `useClickOutside`
- Dismiss on Escape → `useEscapeKey`
- Body scroll lock for modal overlays → `useScrollLock`
- Arrow-key navigation in a menu, tablist, or radio group → `useRovingFocus`
- Trigger-anchored positioning for popovers / menus → `usePosition`
- Reactive viewport queries → `useMediaQuery`
- Merging multiple refs → `useMergedRefs`
- Stable IDs → `useId`
- Debounced values → `useDebouncedValue`

### 3. If a hook you need does not exist, build the hook _first_

Add the hook to `src/hooks/` with its own test file under
`src/hooks/__tests__/`. Cover every documented behavior — call counts,
returned values across re-renders, cleanup on unmount.

The hook's API should be small and composable. Don't bake component-specific
concerns into it; if it's only useful for one component, it's not a hook —
it's a component-internal helper.

### 4. Scaffold the component folder

```
src/components/<category>/<Name>/
  <Name>.tsx
  <Name>.types.ts        # optional — inline types into <Name>.tsx if simple
  <Name>.test.tsx
  <Name>.stories.tsx
  index.ts
```

`index.ts` re-exports the component and its public types only.

### 5. Implement the component

Follow the reference skeleton in CLAUDE.md ("Component anatomy"). Highlights:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonStyles = cva(/* base */, { variants: { /* ... */ } });

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  ref?: React.Ref<HTMLButtonElement>;
  isLoading?: boolean;
}

export function Button({ ref, className, variant, size, ...rest }: ButtonProps) {
  return (
    <button
      ref={ref}
      className={cn(buttonStyles({ variant, size }), className)}
      {...rest}
    />
  );
}
```

### 6. Write tests

`*.test.tsx` should cover:

1. Default render
2. Each variant (behavior or class signal — not a snapshot)
3. User interactions (click, type, keyboard) via `userEvent`
4. Required ARIA attributes
5. Disabled / loading / error states
6. For overlays: focus trap, Escape, click-outside, focus return on close
7. **One axe assertion** — `runAxe(container)` against the default render
   (and a second one against the open/expanded state for overlays). See
   [Accessibility testing](#accessibility-testing).

Query order: **role → label → text**. Avoid querying by class name.
**No snapshot tests.**

### 7. Write stories

`*.stories.tsx` should show every variant plus at least one realistic
composition (e.g., a Button inside a real Dialog footer).

### 8. Wire it up

- Export from `src/components/<category>/index.ts`.
- Add a usage example to the relevant demo page in `src/pages/`.

### 9. Run the full pipeline locally

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm build-storybook
```

All must be green. The pre-commit hook will run typecheck + lint-staged
automatically.

## Banned dependencies

The following imports are blocked by ESLint and will fail CI. They are
listed here so it is obvious what we will _not_ take a PR for:

- `@radix-ui/*`
- `@mui/*`
- `@chakra-ui/*`
- `@mantine/*`
- `@headlessui/*`
- `react-aria-components`
- `shadcn/*`, `shadcn-ui/*`

If you hit a hard accessibility problem and feel one of these would help,
flag it in your PR description rather than working around the ban — we
will extend our own hooks rather than take the dependency.

## Auth: swap the client

Auth scaffolding lives in `src/auth/`. The provider, route guards, and
`useAuth` hook depend on a single interface — `AuthClient` — and we ship an
in-memory `mockAuthClient` that reads/writes `localStorage`. To wire a real
backend, implement the interface once and pass it in.

```ts
// src/auth/AuthClient.ts
export interface AuthClient {
  login(credentials: LoginCredentials): Promise<User>;
  logout(): Promise<void>;
  refresh(): Promise<User | null>;
  getCurrentUser(): Promise<User | null>;
}
```

### One-file replacement pattern

```ts
// src/auth/myBackendClient.ts
import type { AuthClient } from '@/auth';
import type { LoginCredentials, User } from '@/auth';

export const myBackendClient: AuthClient = {
  async login({ email, password }: LoginCredentials): Promise<User> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw { code: 'invalid_credentials', message: 'Login failed.' };
    return (await res.json()) as User;
  },
  async logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
  },
  async refresh(): Promise<User | null> {
    const res = await fetch('/api/auth/me');
    if (res.status === 401) return null;
    if (!res.ok) throw { code: 'network', message: 'Refresh failed.' };
    return (await res.json()) as User;
  },
  async getCurrentUser(): Promise<User | null> {
    return this.refresh();
  },
};
```

Then in `App.tsx`:

```tsx
<AuthProvider client={myBackendClient}>…</AuthProvider>
```

That's the entire integration surface. Component code that calls `useAuth()`
does not change. Tests can pass any object satisfying `AuthClient`, so unit
tests stay fast and offline.

### Roles

`Role` is a string-literal union with `'admin' | 'editor' | 'viewer'` plus
`(string & {})` so any string is also accepted. Two ways to extend:

1. **Add roles inline** at call sites — `<RoleGate roles={['billing']}>` is
   already valid; the literal widens to `Role`.
2. **Replace the union project-wide** by re-declaring the type in your own
   `.d.ts` (e.g. `src/auth/roles.d.ts`):

   ```ts
   declare module '@/auth' {
     export type Role = 'admin' | 'manager' | 'support' | 'billing';
   }
   ```

   This is purely a type-level change — no runtime impact, and the rest of
   the auth code keeps working without modification.

## i18n

Translations live in `src/i18n/`. We use **react-i18next** with
`i18next-browser-languagedetector` (querystring → localStorage → navigator,
fallback `en`). The init is imported in `main.tsx` before `<App />` mounts.

### Where keys live

- `src/i18n/locales/<lng>.json` — one flat JSON object per locale.
- Keys are dot-separated and **flat**; we do not use nested objects.
- Naming convention: `feature.subfeature.key` —
  `auth.login.emailLabel`, `common.save`, `users.table.empty`.
- Validation messages live alongside their feature:
  `auth.login.validation.emailRequired`.

Add the same key to **every** locale file. Missing keys fall back to the
`fallbackLng` (`en`) resource; in dev a missing key shows the key string —
treat that as a bug, not a feature.

### Reading keys in components

```tsx
import { useTranslation } from 'react-i18next';

export function Greeting({ name }: { name: string }) {
  const { t } = useTranslation();
  return <p>{t('greeting', { name })}</p>;
}
```

- **Interpolation:** `t('greeting', { name })` with `{{name}}` in the
  resource. We disable HTML escaping (`escapeValue: false`) because React
  already escapes values.
- **Pluralization:** pass `count` —
  `t('items', { count })` with resource keys `items_one` / `items_other`.
- **Switching locale:** use `useLocale()` from `@/context/LocaleProvider`.
  The choice is persisted via the detector's `localStorage` cache.

### Dates and numbers — do NOT use i18next formatting

Use the platform Intl APIs (or our `date-fns` wrappers). i18next's
`format` interpolation is opinionated and ships extra weight we do not
need.

```tsx
const { locale } = useLocale();
const formatted = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d);
const price = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(n);
```

### Adding a locale

1. Create `src/i18n/locales/<code>.json` with every key from `en.json`.
2. Add the code to `SUPPORTED_LOCALES` in `src/i18n/index.ts`.
3. Add a `LocaleOption` (label + flag) in `src/context/LocaleProvider.tsx`.
4. If RTL, add the language code to `RTL_LOCALES` in `src/i18n/index.ts` —
   the provider sets `<html dir>` accordingly.

## Data fetching

Server state lives in `@tanstack/react-query`. The data layer is `src/data/`:

```
src/data/
  api.ts                 # fetch wrapper + ApiError + 401 retry
  queryClient.ts         # QueryClient factory + default options
  QueryProvider.tsx      # mounts QueryClientProvider + dev devtools
  ApiAuthBridge.tsx      # wires useAuth() ↔ api singleton (getToken/refresh/logout)
  keys.ts                # query key factory (users, …)
  useApiQuery.ts         # typed useQuery wrapper (TError = ApiError)
  useApiSuspenseQuery.ts # typed useSuspenseQuery wrapper (pairs with LoadingBoundary)
  useApiMutation.ts      # typed useMutation wrapper (TError = ApiError)
  useInvalidate.ts       # invalidate-by-prefix helper
  __tests__/             # queryClient defaults, ApiError, 401 retry, hook inference
```

### Reading from the API

```tsx
import { api, keys, useApiQuery } from '@/data';

interface UsersResponse {
  data: User[];
  total: number;
}

function UsersTable() {
  const filters = { page: 1, search: '' };
  const { data, isLoading, isError, error, refetch } = useApiQuery<UsersResponse>(
    keys.users.list(filters),
    () => api<UsersResponse>('/api/users', { query: filters }),
  );
  // …
}
```

The fetcher returns whatever the endpoint produces; `useApiQuery` infers
`TData` from it. Errors are always `ApiError` — read `error.status` and
`error.code` directly.

### Reading from the API — suspense mode

`useApiSuspenseQuery` is the suspense counterpart. While loading it throws
a Promise (caught by the nearest `<Suspense>`); on failure it throws
`ApiError` (caught by the surrounding `<ErrorBoundary>`). The component
itself only ever sees the resolved data — no `isLoading` / `isError`
branching.

```tsx
import { api, keys, useApiSuspenseQuery } from '@/data';
import { LoadingBoundary, SkeletonTable } from '@/components/feedback/LoadingBoundary';

function UsersTable() {
  const { data } = useApiSuspenseQuery<UsersResponse>(keys.users.list({}), () =>
    api<UsersResponse>('/api/users'),
  );
  return <DataTable data={data.data} columns={userColumns} />;
}

function UsersTableSection() {
  return (
    <LoadingBoundary fallback={<SkeletonTable count={8} columns={4} />}>
      <UsersTable />
    </LoadingBoundary>
  );
}
```

`<LoadingBoundary>` lives in `src/components/feedback/LoadingBoundary/` and
composes `<Suspense>` + our `<ErrorBoundary>`. Its `fallback` prop defaults
to `<PageLoader />` (full-area centered spinner). For content-shaped
loading states it ships four skeleton presets — all take a `count` prop:

- `<SkeletonGrid count columns={1|2|3|4} />` — card grid placeholder.
- `<SkeletonList count />` — avatar + two-line list rows.
- `<SkeletonTable count columns />` — table header + N rows.
- `<SkeletonForm count />` — N labelled fields + a button row.

Pass `errorFallback` to override the default error UI:

```tsx
<LoadingBoundary
  fallback={<SkeletonTable count={8} columns={4} />}
  errorFallback={({ error, reset }) => (
    <Alert
      variant="danger"
      title="Couldn't load users"
      description={error.message}
      actions={
        <Button size="sm" variant="outline" onClick={reset}>
          Retry
        </Button>
      }
    />
  )}
>
  <UsersTable />
</LoadingBoundary>
```

`<InlineLoader />` and `<PageLoader />` are also exported from the same
folder for cases that don't need a boundary at all (e.g., a button's
in-flight state).

### useQuery vs useSuspenseQuery — which one?

Use this decision tree:

```
Does this read need to render any UI BEFORE the data resolves?
│
├─ YES → useApiQuery
│       (you'll branch on isLoading / isError yourself; the component
│        keeps rendering chrome, error states, and previous data
│        through refetches)
│
│   sub-cases that force useApiQuery:
│     • You want `keepPreviousData` for paginated tables
│       (suspense always suspends on key change).
│     • You want manual `refetch()` UI without re-suspending.
│     • Loading and error are inline (e.g., a small Alert above
│       a still-rendered list).
│     • The query is conditional / `enabled: false` is needed —
│       suspense can't be conditionally disabled cleanly.
│     • The fetcher is fire-and-forget telemetry the UI doesn't
│       depend on.
│
└─ NO  → useApiSuspenseQuery + <LoadingBoundary>
        (data is required to render; loading and error are handled
         by the boundary, the component only sees resolved data)

         sub-cases that favour useApiSuspenseQuery:
           • Whole-route data dependency (the page can't render
             without it).
           • You want one declarative skeleton across multiple
             child reads (parallel queries all suspend, the
             boundary shows the skeleton until everything is
             ready).
           • The route already pairs with an ErrorBoundary at a
             parent level.
```

Rule of thumb: **route segments suspense, leaf widgets useApiQuery**.

The `/tables` route documents the pattern: `UsersTableSection` keeps
header chrome + ConfirmDialog around a `<LoadingBoundary>` that wraps
the suspending `<UsersTableContent>`. The `OrdersTableSection` on the
same page still uses static data; when teammates touch a route they
can migrate it incrementally — `useApiQuery` callsites continue to
work unchanged.

### Writing (mutations + optimistic updates)

```tsx
import { api, keys, useApiMutation, useInvalidate } from '@/data';

function useUpdateUser() {
  const invalidate = useInvalidate();
  const queryClient = useQueryClient();
  return useApiMutation<User, { id: string; patch: Partial<User> }>(
    ({ id, patch }) => api<User>(`/api/users/${id}`, { method: 'PATCH', json: patch }),
    {
      onMutate: async ({ id, patch }) => {
        // 1. Cancel any in-flight reads for this key.
        await queryClient.cancelQueries({ queryKey: keys.users.detail(id) });
        // 2. Snapshot previous value.
        const previous = queryClient.getQueryData<User>(keys.users.detail(id));
        // 3. Optimistically apply.
        if (previous) {
          queryClient.setQueryData<User>(keys.users.detail(id), { ...previous, ...patch });
        }
        return { previous };
      },
      onError: (_err, { id }, context) => {
        // 4. Roll back.
        if (context?.previous) queryClient.setQueryData(keys.users.detail(id), context.previous);
      },
      onSettled: (_data, _err, { id }) => {
        // 5. Refetch to reconcile.
        void invalidate(keys.users.detail(id));
        void invalidate(keys.users.lists());
      },
    },
  );
}
```

### Query key conventions

- Keys come from the `keys` factory in `src/data/keys.ts` — never hand-roll
  string-array keys at call sites.
- Each resource exposes a hierarchy: `keys.users.all` → `keys.users.lists()`
  → `keys.users.list(filters)` and `keys.users.details()` →
  `keys.users.detail(id)`.
- Lists carry their full filter object as the trailing segment so different
  filter combinations cache independently.

### Invalidation rules

- After a mutation, invalidate the **smallest correct prefix**: a detail
  patch invalidates that detail + its lists; a "create user" invalidates
  only the lists.
- Use `useInvalidate()` for the common case — it calls
  `invalidateQueries({ exact: false })` so any descendant key matches.
- Reach for `queryClient.removeQueries` (not invalidate) only when a record
  has been deleted and you do not want a refetch.

### Error handling

- `ApiError` carries `status`, `code`, `message`, `payload`. Render
  user-facing copy from `error.message`; switch on `error.status` /
  `error.code` for branching (e.g., 422 → show inline form errors).
- Network failures (no response) come back with `status: 0` and
  `code: 'network'`.
- `queryClient` defaults skip retries for 4xx and retry once on 5xx /
  network. Mutations never retry.

#### One classifier, one dispatcher

Every API failure goes through `mapApiError(err)` in
`src/data/errorHandler.ts`, which returns one of:

| `kind`     | When                                                        | Side effect                                |
| ---------- | ----------------------------------------------------------- | ------------------------------------------ |
| `toast`    | 403, generic 4xx, 5xx, network                              | `toast.<severity>(message)`                |
| `redirect` | 401 (refresh already failed in `api.ts`)                    | `navigate(action.to)` — defaults `/login`  |
| `inline`   | 422, or any 4xx with `payload.fields` / `payload.errors`    | Caller calls `form.setError` per field     |
| `fatal`    | Unmapped (e.g. 3xx) — likely a bug                          | Re-thrown so an error boundary catches it  |

`<ErrorBridge>` (mounted in `RootShell`) registers `navigate` + `toast`
with the error module so the QueryCache / MutationCache global handlers
can dispatch without taking a context dependency.

#### What an endpoint should return

| Server response                                                   | Maps to                                        |
| ----------------------------------------------------------------- | ---------------------------------------------- |
| `200/204 …`                                                       | success                                        |
| `401 { message }`                                                 | redirect to `/login`                           |
| `403 { message }`                                                 | warning toast                                  |
| `422 { message, fields: { <name>: <msg \| msg[]> } }`             | inline — per-field `setError`                  |
| `422 { message }`                                                 | inline — `root.serverError`                    |
| `400-499 { message, errors: { <name>: <msg[]> } }`                | inline — per-field (Rails / DRF shape)         |
| `400-499 { message }` (no fields)                                 | error toast                                    |
| `500-599 { message }`                                             | error toast (server's `message` is shown)      |
| Network failure / DNS / timeout                                   | error toast with a generic "check connection"  |

The fields normalizer accepts:

```jsonc
// zod-style — either string or string[]
{ "fields": { "email": "Invalid", "password": ["Too short"] } }
// rails / drf-style
{ "errors": { "email": ["Invalid"] } }
```

For a field, the first non-empty string wins. Other keys (`code`,
extra metadata) are passed through on `error.payload`.

#### Opting out of global dispatch

Set `meta: { handlesErrors: true }` on the query / mutation when the
caller wants full ownership of error handling — e.g., a form using
`useApiFormSubmit`:

```tsx
const mutation = useApiMutation(saveSettings, {
  meta: { handlesErrors: true },
});
const handleSubmit = useApiFormSubmit(form, mutation, {
  onSuccess: () => navigate('/settings/saved'),
});
return <Form form={form} onSubmit={handleSubmit}>…</Form>;
```

Without the meta flag the global handler will toast every failure
(including 422s) before `useApiFormSubmit` ever sees it. The
`SettingsForm` on `/forms` is the canonical example — see
`src/pages/FormsPage.tsx` for the three integration points.

### Auth integration

`<ApiAuthBridge>` is mounted in `App.tsx` inside `<AuthProvider>`. It calls
`configureApi()` whenever the auth user changes, wiring:

- `getToken` — reads `user.token` if your `User` type carries one (the
  shipped mock `User` doesn't, so no `Authorization` header is sent).
- `refresh` — delegates to `AuthClient.refresh()` for the one-shot retry
  on 401.
- `onAuthFailure` — calls `logout()` after the retry also fails, flipping
  the UI back to `/login`.

Swapping in a real backend usually means: extend `User` with `token`,
implement your own `AuthClient`, and pass it to both `<AuthProvider client>`
and `<ApiAuthBridge client>`.

### Mocking with MSW

The dev server and tests both use [MSW](https://mswjs.io). Handlers live in
`src/mocks/handlers.ts`; a browser worker is in `src/mocks/browser.ts` and a
node server (for tests) in `src/mocks/node.ts`. The worker script is at
`public/mockServiceWorker.js` (generated by `pnpm dlx msw init public/`).

- **Dev server (opt-in).** `VITE_USE_MSW=true pnpm dev` mounts the worker
  via `src/main.tsx`. Default off — most contributors hit the real backend.
- **Tests.** Suites that need network mocking import `server` from
  `@/mocks/node` and call `server.listen()` / `server.resetHandlers()` /
  `server.close()` in `beforeAll` / `afterEach` / `afterAll`. The data-layer
  unit tests don't use MSW because they stub `fetch` directly via
  `createApiClient({ fetchImpl })`.
- **Storybook.** Not wired yet — add the `msw-storybook-addon` if needed.

To add a handler, write it in `handlers.ts`. Both worker and server pick it
up automatically.

## Error boundaries

`src/components/feedback/ErrorBoundary/` ships a class-based React error
boundary plus two fallbacks and a router adapter. Catches happen at three
levels:

1. **App root** — `<ErrorBoundary>` wraps `<App>` in `main.tsx`. Last line
   of defense. Renders `<DefaultErrorFallback>` (full-page chrome).
2. **Router root + per-route** — `errorElement: <RootRouterErrorElement />`
   on the router's root and `<RouterErrorElement />` on data-heavy routes
   (`/tables`, `/charts`, `/admin`). React Router intercepts before the
   class boundary fires.
3. **Per-feature** — wrap any subtree in `<ErrorBoundary fallback={…}>`.
   See `src/pages/errors/ErrorsDemoPage.tsx` for three side-by-side
   feature-level boundaries.

### What boundaries DO NOT catch

- Event handler errors
- Async errors (promises, `setTimeout`, fetch chains)
- Server-rendering errors
- Errors thrown inside the boundary itself

For event/async errors, bridge through `useErrorHandler` from
`@/hooks/useErrorHandler`:

```tsx
const handleError = useErrorHandler();
async function onClick() {
  try {
    await doThing();
  } catch (err) {
    handleError(err);
  }
}
```

The hook re-throws the error during the next render, which the nearest
ancestor boundary then catches normally.

### Resetting

- `reset` (passed to render-prop fallbacks) clears the boundary's error
  state. Pair with state changes that fix the underlying cause.
- `resetKeys` auto-resets when any value identity-changes — typically
  `[location.pathname]` for route boundaries.
- `<RouterErrorElement>`'s reset reloads the page; React Router has no
  first-class API to clear a route error in place.

### Reporting

`src/lib/errorReporter.ts` exports a single `reportError(error, context)`
function called by every caught error (boundary + router-element).
Production deployments must swap the body of `reportError` for a real
reporter (Sentry, Bugsnag, Datadog). The `context` shape is:

```ts
interface ErrorContext {
  componentStack?: string; // present for boundary catches
  source?: string; // 'app-root', 'route:/tables', 'event:invite-user', …
  extra?: Record<string, unknown>;
}
```

Keep the structured payload shape (`{ name, message, stack,
componentStack, source, extra, timestamp }`) so log search stays
consistent across the swap.

## Bundle size

Visibility is half the battle. We track size at every PR by running the
analyzer and eyeballing the treemap; CI does not gate on size today.

### Running the analyzer

```bash
pnpm analyze   # vite build --mode analyze, writes dist/stats.html
```

Open `dist/stats.html` in a browser. The treemap is grouped by chunk;
click a chunk to drill into its modules. `gzip` and `brotli` columns are
the numbers that matter.

### Budgets (guardrails, not hard gates)

- **First-paint bundle: < 200 KB gzipped.** Everything not behind a lazy
  route. Includes React, react-router, the AppLayout, primitives,
  feedback, data-display (no `DataTable`), forms shell (no
  `RichTextEditor`), theme, i18n, and auth.
- **Per-route chunk: < 100 KB gzipped each.** Routes that pull a heavy
  dependency (Recharts, TipTap, TanStack Table) are exempt — but the
  carve-out chunk should be alone and not duplicated across routes.
- **Total app: < 1 MB gzipped.** Sum of all chunks served on a fully
  exercised session.

If a PR pushes the first-paint bundle over budget, the reviewer should
expect either (a) a justification (e.g., a deliberate new top-level
feature) or (b) a split.

### Code splitting strategy

Routes are split via [react-router v7's `lazy` route option][rr-lazy] —
no `React.lazy` + `<Suspense>` boundary at the route level (the router
handles it). Currently lazy:

| Route        | Why                                                  |
| ------------ | ---------------------------------------------------- |
| `/charts`    | Pulls Recharts.                                      |
| `/tables`    | Pulls TanStack Table + the heavy `DataTable` shell.  |
| `/workspace` | `FullscreenWorkspace` + demo data is rarely needed.  |
| `/admin`     | Hidden behind a role check anyway.                   |

Component-level split (mid-component, not at a route boundary):

- `LazyRichTextEditor` (`src/components/forms/RichTextEditor/lazy.tsx`)
  uses `React.lazy` + `Suspense` to defer TipTap + ProseMirror until the
  editor actually renders. The barrel `src/components/forms/RichTextEditor/index.ts`
  intentionally does **not** re-export the eager `RichTextEditor` — that
  would put it back on the static import graph and Rollup would refuse
  to split (`INEFFECTIVE_DYNAMIC_IMPORT`). Tests / stories that need the
  eager component import it directly via `./RichTextEditor`.

[rr-lazy]: https://reactrouter.com/en/main/route/lazy

### Adding a new lazy route

```tsx
{
  path: 'reports',
  lazy: async () => {
    const { ReportsPage } = await import('@/pages/ReportsPage');
    return { Component: ReportsPage };
  },
  errorElement: <RouterErrorElement source="route:/reports" />,
},
```

If the route needs `<ProtectedRoute>` / `<RoleGate>`, return a wrapping
component instead of `Component: ReportsPage` directly. See `/admin` in
`src/App.tsx` for the canonical wrapper pattern.

### Adding a new component-level split

Use `React.lazy` + `<Suspense>`. Import the types via `import type` only
so the static graph stays free of the heavy module. Provide a fallback
that matches the loaded component's footprint to avoid layout shift.

### Adding a CI size gate (optional, future)

When budgets become a hard requirement, add [size-limit][sl]:

```bash
pnpm add -D size-limit @size-limit/preset-app
```

Configure via `.size-limit.json` with one entry per chunk pattern. Wire
into CI as `pnpm size`. Today this is intentionally not enabled — the
first-paint number lives in PR review.

[sl]: https://github.com/ai/size-limit

## Pragmatic carve-outs

A small set of lint rules are scoped or downgraded from their out-of-the-box
defaults. They are documented inline in `eslint.config.js`. Summary:

- `@typescript-eslint/explicit-module-boundary-types` — required in
  `src/hooks/` and `src/lib/`, **not** required in `src/components/` or
  `src/pages/`. JSX components return inferred `JSX.Element`; explicit
  types add boilerplate without payoff.
- `@typescript-eslint/no-non-null-assertion` — `warn`, not `error`.
  `arr[0]!` after a length check, or `screen.getByX()!` in tests, is
  intentional.
- `react-refresh/only-export-components` — `warn`. The Provider + `useX`
  context hook colocation pattern is intentional. Pure HMR DX rule.
- `jsx-a11y/label-has-associated-control` — `controlComponents` includes
  our own form primitives so wrapping a `<Switch>` / `<Checkbox>` in a
  `<label>` does not trigger a false positive.
- A handful of `react-hooks` plugin v7 (react-compiler-aware) rules are
  disabled per-line in specific spots where the pattern is
  intentional and the rule's heuristic is too strict (e.g., refs on a
  callable-with-attached-helpers Toast API, mutable `RefObject.current`
  assignments by design).

If you hit one of these in new code, prefer fixing the underlying pattern
over adding another disable. Disables should be the exception.

## E2E tests

End-to-end tests run a real browser against the running app via
[Playwright](https://playwright.dev). Specs live in `e2e/`, the runner is
configured in `playwright.config.ts`, and the shared fixtures
(`loginAs(role)`, `gotoSignedIn(path, role?)`) are in `e2e/fixtures.ts`.

### What's covered

The initial suites cover the critical flows the unit tests can't:

- `e2e/auth.spec.ts` — login success, login failure, validation,
  ProtectedRoute redirect, RoleGate hide-from-non-admin, logout.
- `e2e/forms.spec.ts` — settings form interaction, validation messages
  in the active locale, locale-switch re-translation.
- `e2e/tables.spec.ts` — DataTable sort, search, paginate, select rows,
  bulk action.
- `e2e/overlays.spec.ts` — Dialog focus trap + Escape + focus return,
  Drawer same, Tooltip on hover/focus.
- `e2e/keyboard.spec.ts` — Cmd/Ctrl+K opens the command palette,
  filter + Enter navigates, "/" opens, Escape closes.
- `e2e/theme-locale.spec.ts` — theme + locale persist across reload.

### When to add an E2E test

Add a new spec when you ship a **new top-level user flow** — anything that
spans more than one component and needs a real navigation/network/storage
round-trip to verify. Examples: a new auth flow (SSO, password reset),
a new persisted setting, a new role gate, a new top-level route.

Do **not** add an E2E test for variant coverage, render correctness, or
hook behavior — that belongs in unit tests, which are an order of magnitude
faster and less flaky.

### Running locally

```bash
pnpm e2e:install   # one-time: download browser binaries (~700MB)
pnpm e2e           # run the suite headless
pnpm e2e:ui        # open the Playwright UI for interactive debugging
pnpm e2e --project chromium                    # one project only
pnpm e2e e2e/auth.spec.ts                      # one spec file only
pnpm e2e --headed --project chromium --workers 1   # watch a browser
```

The config starts the app via `pnpm dev --port 5173 --strictPort` with
`VITE_USE_MSW=true`, so `/api/users` is mocked. With `reuseExistingServer`
enabled (everywhere except CI), an already-running dev server on 5173 is
used as-is — saves a 5-second cold start every run.

### Authoring a spec

Use the fixtures, not raw `test` from `@playwright/test`:

```ts
import { test, expect } from './fixtures';

test('admins can open /admin', async ({ gotoSignedIn, page }) => {
  await gotoSignedIn('/admin', 'admin');
  await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
});
```

`gotoSignedIn` seeds `localStorage` (the storage key the shipped
`mockAuthClient` reads from) before the page loads, so the app boots
already authenticated. There is no need to drive the login form unless
you are testing the login form itself.

### Debugging a failed CI trace

CI uploads two artifacts on `e2e` failure:

- **`playwright-report`** — the HTML report. Download it, unzip, open
  `index.html`, click into the failing test. Each retry has its own
  trace + screenshot section.
- **`playwright-test-results`** — raw trace files (`*.zip`). Open
  locally with:
  ```bash
  pnpm exec playwright show-trace <path-to-trace.zip>
  ```
  The trace viewer scrubs through every action, network request, console
  log, and DOM snapshot.

`trace: 'on-first-retry'` (in `playwright.config.ts`) means traces are
only captured on the retry, not the initial attempt — that keeps the
artifact size bounded but means a one-shot pass leaves no trace. If you
need a trace for a passing run, set `trace: 'on'` locally.

### Flake policy

E2E suites are inherently flakier than unit tests (real browser, real
timers, real network mocks, real fonts). The mitigations baked in:

- **2 retries in CI.** Most flakes are first-attempt timing issues that
  pass on retry. Locally, retries are off so flake is loud.
- **Locator-first assertions** (`expect(locator).toBeVisible()`) over
  manual `page.waitForSelector` — Playwright auto-waits up to the
  expect timeout (5s).
- **Role/label-first queries** (same convention as unit tests) — these
  are the most stable across copy and DOM changes.

If a test becomes consistently flaky (fails > 1 in 10 retries on
unrelated PRs), **quarantine it** by adding `.fixme` to the title:

```ts
test.fixme('temporarily quarantined: investigating hover delay', async ({ page }) => {
  // …
});
```

`.fixme` skips the test in CI and prints a reminder. The PR that adds
the `.fixme` MUST also open a bug ticket linking back to a recent
failure trace, and unflake-or-delete is on whoever added it. **Do not
add `.skip` for this — `.skip` is for genuinely-disabled-by-design
specs, `.fixme` is for "this should pass and currently doesn't."**

## Pull request checklist

Before opening a PR:

- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean (no errors, ideally no new warnings)
- [ ] `pnpm test` green
- [ ] `pnpm build` produces a clean bundle
- [ ] `pnpm build-storybook` succeeds
- [ ] New components have tests + stories + are exported from their
      category's `index.ts`
- [ ] New tests include an axe assertion (`runAxe`) against the default
      render and any key interactive state
- [ ] If the PR introduces a new top-level user flow, an `e2e/*.spec.ts`
      covers it
- [ ] No new dependencies added (or they are flagged in the PR description)
- [ ] Light + dark mode both look correct (no `dark:` variants needed if
      you used semantic tokens)
- [ ] Keyboard navigation manually verified for interactive components

Thanks for keeping the bar high.
