# SETUP

> **Historical snapshot.** This file documents the original foundation
> commit (build, styling, tooling skeleton — no components yet) and the
> initial decisions taken at project start. The repo has moved on
> considerably since: see [PROJECT.md](./PROJECT.md) for the current
> state, [CLAUDE.md](./CLAUDE.md) for the rule book, and
> [CONTRIBUTING.md](./CONTRIBUTING.md) for the workflow. Notable drift:
> the dark-mode palette is now Framer neutral-grays (no blue tint),
> a dedicated `src/data/` server-state layer + MSW mocks ship, and
> Playwright E2E + vitest-axe gate CI alongside the original commands.

## Run

```bash
pnpm install
pnpm dev          # Vite dev server
pnpm typecheck    # tsc -b --noEmit
pnpm test         # vitest run (jsdom)
pnpm test:watch   # vitest watch
pnpm build        # tsc -b && vite build
pnpm preview
pnpm lint
pnpm format
```

Open the dev server and click **Toggle dark/light** to verify tokens, surfaces, focus ring, and chips look right in both modes.

## Decisions

### Palette

- **Neutrals (light):** Tailwind `slate` (cool, slightly blue). Fits the admin/SaaS aesthetic better than `gray`/`zinc`. Tweak in `src/styles/tokens.css` if you want warmer.
- **Neutrals (dark):** Framer-template neutral grays — `hsl(0 0% 9–22%)` for backgrounds/surfaces/borders, `hsl(0 0% 49–96%)` for foregrounds. **No blue tint** in dark mode (the original slate-900 base was swapped out — see commit `1a726a3 adopt Framer neutral-gray dark palette`). Both modes still live in `src/styles/tokens.css`.
- **Primary:** `indigo` (`hsl(238 75% 58%)` light, `hsl(238 85% 66%)` dark). High contrast on both surfaces, distinct from danger/info.
- **Accents:** emerald (success), amber (warning), red (danger), sky (info). Each has a `-foreground` pair for text on the accent. Accent tokens are deliberately preserved inside `@media print` so chart series stay distinguishable.
- All values are in HSL for easy manual tuning.

### Tokens

- Defined as CSS custom properties in `src/styles/tokens.css`. `:root` = light, `html.dark` = dark overrides.
- Mapped to Tailwind v4 via the `@theme` block in `src/styles/globals.css` so they become utilities (`bg-primary`, `text-foreground-muted`, `rounded-md`, `shadow-sm`, etc.).
- **Shadows are darker in dark mode** — cleaner separation against the dark background.

### Dark mode

- Class strategy on `<html>`. `App.tsx` toggles by adding/removing `dark` and persists to `localStorage`. Initial value reads `localStorage` then falls back to `prefers-color-scheme`.
- Tailwind v4's `@custom-variant dark (&:where(.dark, .dark *))` is declared in `globals.css` so `dark:` variants work if ever needed — but **components should not need them**, since semantic tokens already swap.

### TypeScript

- `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride` all on (per CLAUDE.md).
- Path alias `@/*` -> `./src/*` set in **both** `tsconfig.json`/`tsconfig.app.json` and `vite.config.ts`. No `baseUrl` (deprecated in TS 6); modern `paths` use the project root automatically.
- `tsconfig.app.json` adds `"vitest/globals"` and `"@testing-library/jest-dom"` to `types` so test globals + matchers resolve without per-file imports.

### Vitest

- Lives in `vitest.config.ts` (separate from `vite.config.ts`) and `mergeConfig`s the Vite base. Vite 8's `UserConfig` type does not accept a `test` field, so a split config is required.
- `environment: 'jsdom'`, `globals: true`, `setupFiles: ['./src/setupTests.ts']`.
- `setupTests.ts` imports `@testing-library/jest-dom/vitest` and runs `cleanup()` after each test.

### `cn()`

- `src/lib/cn.ts` — `clsx` + `tailwind-merge`. Single helper, used everywhere.

## Files created or replaced

**New**

- `src/styles/tokens.css`
- `src/styles/globals.css`
- `src/lib/cn.ts`
- `src/setupTests.ts`
- `vitest.config.ts`
- `src/components/{primitives,layout,feedback,navigation,data-display,forms,overlays}/.gitkeep`
- `src/{hooks,hooks/__tests__,context,pages,types}/.gitkeep`
- `SETUP.md`

**Replaced**

- `vite.config.ts` — added `@tailwindcss/vite`, `@/*` alias, Vitest config
- `tsconfig.json` — added `baseUrl` + `paths`
- `tsconfig.app.json` — strict flags, paths, test/jest-dom types, added `DOM.Iterable`
- `tsconfig.node.json` — strict flags, includes `vitest.config.ts` for forward-compat
- `src/main.tsx` — imports `@/styles/globals.css`, named `App` import, null-checked root
- `src/App.tsx` — replaced demo with token verification page + theme toggle
- `package.json` — added `typecheck`, `format`, `test`, `test:watch` scripts; reordered

**Untouched (still present, no longer wired in)**

- `src/index.css`, `src/App.css`, `src/assets/*` — Vite starter leftovers. Safe to delete; left in place since the task scope was foundation only.

## Things to review

1. **React 19 vs CLAUDE.md "React 18.x".** `package.json` has `react@^19.2.5`. CLAUDE.md says 18.x. I left React 19 in place because downgrading is a separate decision (touches `@types/react`, `@testing-library/react` peer ranges, etc.). If you want strict 18, say so and I'll downgrade and re-test.
2. **Vite 8 / TypeScript ~6 / Vitest 4 / React Router 7 / lucide ^1.14.** Ahead of CLAUDE.md's listed stack. Same call as above — left as-is. Flag if you want pinning.
3. **`erasableSyntaxOnly: true`** is on. Forbids enums, namespaces, parameter properties. Fine for a UI library, but mention if anyone leans on those.
4. **Palette intensity.** Indigo primary is fairly saturated. Easy to swap to violet, blue, or a brand color in `tokens.css` — only two values per accent.
5. **Stale starter files** (`src/index.css`, `src/App.css`, `src/assets/*`) — delete on next pass?
6. **`dark:` custom variant uses `:where(.dark, .dark *)`** — zero-specificity, matches html.dark + descendants. Standard pattern but worth a glance.

## Not done (intentionally — out of scope per task)

- ESLint config not touched. Existing `eslint.config.js` left as-is. May need `eslint-plugin-jsx-a11y` rules + path-alias resolver later.
- Prettier config file not added — `pnpm format` will use Prettier defaults until one is created.
- Storybook 8 not installed/configured.
- No behavioral hooks built yet.
- No components built yet.
