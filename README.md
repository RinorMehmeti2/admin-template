# Admin UI Template

In-house admin UI template. React 19 + TypeScript 6 + Tailwind v4 + Vite 8.
Every visible component — Button, Dialog, Combobox, DataTable, CommandPalette,
DatePicker, RichTextEditor, Kanban, FileExplorer, Charts — is written from
scratch in this repo. We do **not** depend on any prebuilt UI kit or headless
component library (no MUI, Chakra, Mantine, shadcn, Radix, Headless UI, NextUI,
React Aria Components). Behavior libraries (state, forms, query, headless table,
charts engine, editor engine) are allowed and explicitly carved out.

## Highlights

- **140+ components** across 7 categories (primitives, forms, feedback,
  navigation, layout, data-display, overlays) — all owned, all themable.
- **Runtime-swappable theme** — 7 built-in palettes (Default, Teal, Rose,
  Forest, Claude, PayPal, Mono) + 8 typography presets. Custom palettes/fonts
  saved to `localStorage`. Live editors at `/settings/theme` and
  `/settings/typography`.
- **Responsive + mobile-first** — collapsible sidebar with tooltip rail,
  bottom-sheet dialogs, mobile-native primitives (FilterableSearch,
  BottomSheet, etc.).
- **Accessibility-first** — every interactive component composes our own
  behavioral hooks (focus trap, roving focus, listbox, typeahead, scroll
  lock). Every test ships ≥1 `runAxe` assertion.
- **Print-ready** — `data-print` contract collapses chrome and expands tables
  / tabs / accordions on print. Preview at `/print-preview`.
- **Live playground** — `/playground` route lets you tweak props on every
  component without writing code. Searchable, copy-to-JSX, theme + locale
  switchers built in.
- **i18n + RTL** — i18next with EN + ES out of the box, RTL locale switching
  flips `<html dir>`.

## Quickstart

```bash
pnpm install
pnpm dev               # Vite dev server (http://localhost:5173)
pnpm storybook         # Storybook (http://localhost:6006)
pnpm test              # Vitest (with vitest-axe a11y assertions)
pnpm e2e               # Playwright (one-time: pnpm e2e:install)
pnpm typecheck
pnpm lint
pnpm build
pnpm analyze           # bundle treemap → dist/stats.html
```

`VITE_USE_MSW=true pnpm dev` boots the dev server with MSW mocking
`/api/*`. Default off — most contributors hit the real backend.

## Where things live

| Folder                                | What's there                                                                                                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/components/{primitives,forms,…}` | The component library (one folder per component, 5 files each).                                                                                                                |
| `src/hooks/`                          | Behavioral primitives (`useFocusTrap`, `usePosition`, `useListbox`, `useDrag`, `useErrorHandler`, …). Compose these — never inline focus traps or click-outside in components. |
| `src/auth/`                           | `AuthClient` interface + `mockAuthClient` + provider + route guards (`ProtectedRoute`, `PublicOnlyRoute`, `RoleGate`).                                                         |
| `src/data/`                           | `@tanstack/react-query` v5 wrapper layer (`useApiQuery`, `useApiSuspenseQuery`, `useApiMutation`, `useInvalidate`, `keys`, `mapApiError`).                                     |
| `src/mocks/`                          | MSW handlers + browser/node servers + fixtures.                                                                                                                                |
| `src/i18n/`                           | i18next init + `locales/<lng>.json`. EN + ES out of the box. RTL-aware via `<LocaleProvider>`.                                                                                 |
| `src/playground/`                     | `/playground` route registry: live prop tweaking + auto controls + copy-to-JSX. Not a Storybook replacement — stories still own canonical variants.                            |
| `src/styles/`                         | `tokens.css` (semantic tokens, light + dark) + `globals.css` + `print.css`.                                                                                                    |
| `src/lib/themeTokens.ts`              | Color palette schema + 7 built-in palettes (Default / Teal / Rose / Forest / Claude / PayPal / Mono) + apply/clear + localStorage CRUD. Editor at `/settings/theme`.           |
| `src/lib/typography.ts`               | Typography config schema (font stacks + size scale) + 8 built-in presets using OS-available fonts. Editor at `/settings/typography`.                                           |
| `src/test-utils/a11y.ts`              | `runAxe()` + `toHaveNoViolations` matcher. Call it in every test.                                                                                                              |
| `e2e/`                                | Playwright specs + `loginAs` / `gotoSignedIn` fixtures.                                                                                                                        |

## Reading order

1. **[CLAUDE.md](./CLAUDE.md)** — the rule book. Read before changing anything. Tech stack, component anatomy, behavioral hooks, accessibility, print contract, positioning limits, data fetching + error boundaries.
2. **[CONTRIBUTING.md](./CONTRIBUTING.md)** — the workflow for adding a component, hook, page, or E2E spec. Includes the data-fetching recipe, suspense vs. classic decision tree, error-handling dispatcher, MSW pattern, bundle budgets, and PR checklist.
3. **[PROJECT.md](./PROJECT.md)** — descriptive snapshot: what's been built, every dependency we took and why, the carve-outs, and a frank record of the hard parts.
4. **[SETUP.md](./SETUP.md)** — historical foundation snapshot from project start. Useful for context on the original tooling decisions; superseded by the documents above for current state.
5. **[docs/proposals/](./docs/proposals/)** — design decisions captured in writing.
