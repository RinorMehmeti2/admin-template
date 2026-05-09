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
- **date-fns** for date utilities (no Moment, no Day.js)
- **Vitest 4 + @testing-library/react** for tests
- **Storybook 10** for component documentation (the Vite 8 builder requires Storybook 10+; lower versions peer Vite ≤ 6)
- **pnpm** as package manager

These are all behavior / utility / state libraries — none of them ship visual components. Do not install any UI library, headless component library, CSS framework, animation library, or icon set without checking first.

## Directory structure

```
src/
  components/
    primitives/       # Button, IconButton, Badge, Avatar, Spinner, Skeleton, Kbd, Separator
    layout/           # Container, PageShell, PageHeader, Sidebar, Topbar
    feedback/         # Alert, Toast, Dialog, Drawer, ConfirmDialog, Tooltip, Progress
    navigation/       # Tabs, Breadcrumbs, Pagination, Stepper, Menu, DropdownMenu
    data-display/     # Card, Stat, List, EmptyState, Table, DataTable
    forms/            # Label, Input, Textarea, Select, Checkbox, Radio, Switch, FormField, Form
    overlays/         # Popover, ContextMenu, Sheet, CommandPalette, Portal
  hooks/              # Behavioral primitives — see "Behavioral hooks" below
  lib/                # cn.ts, formatters, validators, constants
  styles/             # globals.css, tokens.css
  context/            # ThemeProvider, ToastProvider
  pages/              # Demo / showcase pages
  types/              # Shared TS types
  App.tsx
  main.tsx
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
- **`useId(prefix?)`** → wrapper around React 18's `useId` adding an optional prefix.
- **`useMediaQuery(query)`** → SSR-safe media query hook. Used by Sidebar (mobile/desktop switch).
- **`usePosition(triggerRef, contentRef, { placement, offset })`** → returns `{ x, y, ready }` (document-absolute coords) for content positioned relative to trigger. Works for both `style={{ left: x, top: y }}` and transform-based positioning. Initial implementation: simple placements (`bottom-start`, `bottom-end`, `bottom`, `top-start`, `top-end`, `top`, `right`, `left`) with no edge-flipping. Edge handling can be added later if needed.
- **`useDebouncedValue(value, delay)`** → debounces a value.

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
- Set `displayName` after `forwardRef`

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
- **Cross-component UI state** (theme, sidebar collapsed, toasts): React Context in `src/context/`
- **Server state:** TanStack Query when added — no Redux, no Zustand unless agreed
- **Forms:** react-hook-form, validation always via zod schemas

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
```

## Definition of done for a component

A component is complete only when ALL of these are true:

1. Implementation file with proper types, `ref` accepted as a regular prop (React 19 pattern), and `cn()` for className merging
2. All variants defined via `cva` and reflected in props
3. Composes the appropriate behavioral hooks (no inline focus-trap, click-outside, scroll-lock, or keyboard-nav logic — use the hooks)
4. `*.test.tsx` covers default render, every variant, interactions, a11y attributes, edge states, and (for overlays) focus management
5. `*.stories.tsx` shows every variant + at least one realistic composition
6. Exported from `components/<category>/index.ts`
7. Uses semantic tokens — zero raw colors / hex / rgb
8. Light AND dark mode both look correct without per-component dark variants
9. Keyboard navigation tested manually
10. No new dependencies added

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
- ❌ Build a "Custom Combobox" or "Custom Select" before the behavioral hooks they need exist

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

## Positioning — known limitations

`usePosition` (and `usePositionAtPoint`) handle viewport flip + perpendicular
shift, but explicitly do NOT handle:

- Transformed ancestors of the portal container (we portal to document.body —
  if a future change moves portals into a transformed subtree, coordinates
  will be wrong).
- Element-level scrollers without window resize (no ResizeObserver on
  trigger/content — add one if a real case appears).
- Arrow-glyph offset (`data-side` is exposed; no arrow component exists yet).
- Split placement (we flip OR shift, not partial-place).

@floating-ui/react-dom was evaluated and deferred. Revisit when building
Popover with arrows, virtual-trigger overlays, or if portaling targets change.
