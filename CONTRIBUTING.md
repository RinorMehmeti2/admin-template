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

## Pull request checklist

Before opening a PR:

- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean (no errors, ideally no new warnings)
- [ ] `pnpm test` green
- [ ] `pnpm build` produces a clean bundle
- [ ] `pnpm build-storybook` succeeds
- [ ] New components have tests + stories + are exported from their
      category's `index.ts`
- [ ] No new dependencies added (or they are flagged in the PR description)
- [ ] Light + dark mode both look correct (no `dark:` variants needed if
      you used semantic tokens)
- [ ] Keyboard navigation manually verified for interactive components

Thanks for keeping the bar high.
