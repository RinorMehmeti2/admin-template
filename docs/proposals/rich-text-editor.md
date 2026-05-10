# Proposal: RichTextEditor

**Status:** Draft — awaiting approval
**Author:** Engineering
**Date:** 2026-05-09
**Scope:** Add a `RichTextEditor` component to `src/components/forms/` for long-form rich content (notes, descriptions, internal docs, comment threads).

---

## 1. Library choice — why TipTap

Rich text on the web is too hard to write from scratch correctly. Selection, IME composition, undo/redo, paste sanitisation, schema enforcement, and clipboard interop are years of edge-case work. CLAUDE.md bans **UI / headless component libraries** — TipTap ships **no UI**. It is a thin React wrapper over **ProseMirror**, a battle-tested editor framework. We keep full visual ownership.

| Library        | Verdict         | Notes                                                                                                                                                                                                                 |
| -------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TipTap**     | **Recommended** | Headless, React-first API, schema is declarative, large extension catalogue, well-typed, active maintenance. Renders semantic HTML we can style with Tailwind + tokens. We keep 100% visual ownership.                |
| Slate          | Reject          | Lower-level, very flexible, but historically frequent breaking changes and you write much more glue (toolbar wiring, history, paste handling). Forces us to own problems that ProseMirror has solved.                 |
| Lexical (Meta) | Reject for v1   | Excellent perf and architecture, but smaller mature-extension catalogue (no link/underline/bubble-menu drop-ins as polished as TipTap's), heavier learning curve. Reconsider if we hit perf ceilings or build collab. |
| Quill          | Reject          | Not React-first, Delta format leaks into storage, less semantic, weaker schema, slower release cadence.                                                                                                               |
| Draft.js       | Reject          | Effectively unmaintained.                                                                                                                                                                                             |

**TipTap tradeoffs we accept:**

- ProseMirror complexity leaks when we build advanced extensions (custom node views, schema mods).
- Bundle adds ~60–80 KB gz at v1 scope (see §6).
- Chains of `editor.chain().focus().toggleBold().run()` are TipTap-specific. We isolate them inside the toolbar.

---

## 2. Packages to install

All `@tiptap/*` packages are behaviour-only (no styles, no DOM components beyond the contenteditable host). Versions pinned at install time — not yet pulled.

**Core (required):**

- `@tiptap/react` — React bindings (`useEditor`, `EditorContent`, `BubbleMenu` component).
- `@tiptap/pm` — ProseMirror peer bundle. TipTap requires this as a single peer dep (replaces the dozen prosemirror-\* packages it used to require).
- `@tiptap/starter-kit` — bundles the core nodes/marks: Document, Paragraph, Text, Bold, Italic, Strike, Code, Heading, BulletList, OrderedList, ListItem, Blockquote, CodeBlock, HardBreak, HorizontalRule, Dropcursor, Gapcursor, History.

**Extensions for v1 (not in starter-kit):**

- `@tiptap/extension-underline` — Underline mark.
- `@tiptap/extension-link` — Link mark with click-through and edit affordances.
- `@tiptap/extension-placeholder` — Empty-state placeholder text.
- `@tiptap/extension-bubble-menu` — Floating selection menu primitive (positions a node we render via portal).

**Total: 7 packages.**

No CSS files imported from any of these — we style the rendered HTML ourselves (§5).

---

## 3. Component API

### 3.1 Storage format — recommend **HTML**

Two options TipTap supports natively:

| Format           | Pros                                                                                                                                       | Cons                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **HTML string**  | Trivial to render anywhere (server, emails, exports). Already what most admin backends store. Easy migration in/out. Diff-friendly in PRs. | Ambiguous round-trip for some marks (TipTap normalises). Slightly more parse cost on init. |
| ProseMirror JSON | Lossless round-trip. Faster to load. Required for collab / OT / CRDT.                                                                      | Storage bespoke. Renderer required to display. Harder to debug.                            |

**Recommendation: HTML.** No collab requirement on the roadmap. HTML matches existing admin-tool storage. We can migrate to JSON later — TipTap supports `getJSON()` / `setContent()` symmetrically.

### 3.2 Root component

```tsx
// src/components/forms/RichTextEditor/RichTextEditor.tsx
export interface RichTextEditorProps {
  ref?: React.Ref<RichTextEditorHandle>;
  value?: string; // controlled HTML
  defaultValue?: string; // uncontrolled HTML
  onChange?: (html: string) => void;
  onBlur?: () => void;
  readOnly?: boolean;
  placeholder?: string;
  name?: string; // for FormField/RHF integration
  id?: string;
  className?: string;
  autoFocus?: boolean;
  minHeight?: number; // px; default 160
  maxHeight?: number; // px; default unlimited
  error?: boolean; // styling hook for FormField
  toolbar?: 'full' | 'minimal' | false; // default 'full'
  bubbleMenu?: boolean; // default true
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export interface RichTextEditorHandle {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  getHTML: () => string;
  getJSON: () => unknown;
  /** Escape hatch for advanced cases — prefer the methods above. */
  getEditor: () => Editor | null;
}
```

Controlled/uncontrolled is wired via our existing `useControllableState` hook, then mirrored into the editor via `editor.commands.setContent(value, false)` only when `value` differs from `editor.getHTML()` (avoid feedback loops).

### 3.3 Toolbar

`EditorToolbar` is a sibling component composed entirely of **existing primitives** — no new visual deps:

- **IconButton** for each command (Bold, Italic, Underline, Strike, Code, Quote, UL, OL, Link, CodeBlock, HR, Undo, Redo). `aria-pressed` reflects `editor.isActive(...)`.
- **DropdownMenu** for the heading picker (Paragraph, H1, H2, H3).
- **Tooltip** wraps each IconButton with the command name + shortcut hint.
- **Separator** between groups.
- **Kbd** inside Tooltip body for shortcut display.

Toolbar receives the `editor` instance via context (`EditorContext`) so individual buttons subscribe to active-mark state without prop-drilling. Re-renders are scoped via `useEditorState({ editor, selector })` — TipTap's official hook for this exact problem.

### 3.4 BubbleMenu (selection-based)

When the user has a non-empty text selection, render a floating menu with a subset: Bold, Italic, Underline, Code, Link. Built on `@tiptap/extension-bubble-menu`, which positions a portaled node we control. We **do not** use TipTap's example CSS — we render our own panel using existing primitive classes (`bg-surface-elevated`, `border-border`, `shadow-md`, `rounded-md`).

The bubble menu is hidden when `readOnly` or when the selection is inside a code block (per UX convention — code blocks shouldn't get inline formatting).

### 3.5 Link editing

Link insertion + editing uses our existing **Popover** anchored to the toolbar Link button (or the BubbleMenu Link button). Inside: an Input (URL) + Button (Apply) + Button (Remove, when editing existing link). Validation: zod URL schema. No new dialog primitive needed.

### 3.6 readOnly

`readOnly: true` calls `editor.setEditable(false)`, hides the toolbar, disables the bubble menu, and sets `aria-readonly="true"` on the editable region. The component still renders the styled content — same wrapper class, same prose styles, just non-interactive.

---

## 4. v1 feature scope

**In scope:**

- **Marks:** bold, italic, underline, strikethrough, inline code.
- **Blocks:** paragraph, heading 1–3, bullet list, ordered list, code block, blockquote, horizontal rule.
- **Inline:** link (insert / edit / remove via Popover, validated URL).
- **History:** undo / redo (from starter-kit's History extension; toolbar buttons + native Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z).
- **Placeholder** when empty.
- **BubbleMenu** for selection-based marks.
- **readOnly** mode.

**Out of scope — flagged as v2:**

- Tables (`@tiptap/extension-table` + 3 sub-extensions; significant UX work).
- Images / file upload (needs storage backend integration).
- Mentions / @-suggestions (needs popup framework integration with our Menu primitives).
- Slash commands.
- Collaboration / multi-cursor (needs JSON storage + Y.js + websockets).
- Custom embed nodes (YouTube, etc.).
- Markdown shortcuts beyond what starter-kit ships (already get `**bold**`, `# heading`, etc. for free).

---

## 5. Styling approach

TipTap renders **semantic HTML** into a contenteditable `<div>`. We style it via a single CSS class on the wrapper, with all colours/spacing pulled from our token layer.

### 5.1 Wrapper structure

```tsx
<div className={cn(rteWrapperStyles({ error }), className)}>
  {toolbar !== false && <EditorToolbar editor={editor} variant={toolbar} />}
  <EditorContent editor={editor} className="rte-content" />
  {bubbleMenu && <RichTextBubbleMenu editor={editor} />}
</div>
```

### 5.2 Wrapper classes (sketch)

```ts
const rteWrapperStyles = cva(
  'rounded-md border bg-surface focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background transition-colors',
  {
    variants: {
      error: {
        true: 'border-danger',
        false: 'border-border',
      },
    },
    defaultVariants: { error: false },
  },
);
```

The editable region (`.rte-content` → `.ProseMirror`) gets sized via `min-h-[--rte-min] max-h-[--rte-max] overflow-auto p-3 outline-none text-sm text-foreground`, with `--rte-min` / `--rte-max` set inline from the `minHeight`/`maxHeight` props (allowed inline-style exception per CLAUDE.md — truly dynamic numeric values).

### 5.3 Prose styles — own them, don't pull `@tailwindcss/typography`

Adding `@tailwindcss/typography` is tempting but it's a **new visual dependency** and ships its own opinionated palette/spacing. We write our own typography rules in `src/styles/globals.css` under `.rte-content`, using only semantic tokens:

```css
.rte-content :where(h1) {
  @apply text-2xl font-semibold mt-4 mb-2 text-foreground;
}
.rte-content :where(h2) {
  @apply text-xl font-semibold mt-4 mb-2 text-foreground;
}
.rte-content :where(h3) {
  @apply text-lg font-semibold mt-3 mb-1 text-foreground;
}
.rte-content :where(p) {
  @apply my-2 leading-6;
}
.rte-content :where(ul) {
  @apply list-disc pl-6 my-2;
}
.rte-content :where(ol) {
  @apply list-decimal pl-6 my-2;
}
.rte-content :where(li) {
  @apply my-1;
}
.rte-content :where(blockquote) {
  @apply border-l-2 border-border pl-3 my-2 text-foreground-muted italic;
}
.rte-content :where(code) {
  @apply rounded bg-surface-muted px-1 py-0.5 text-[0.9em] font-mono;
}
.rte-content :where(pre) {
  @apply rounded-md bg-surface-muted p-3 my-2 overflow-x-auto font-mono text-sm;
}
.rte-content :where(pre code) {
  @apply bg-transparent p-0;
}
.rte-content :where(hr) {
  @apply my-4 border-t border-border;
}
.rte-content :where(a) {
  @apply text-primary underline-offset-2 hover:underline cursor-pointer;
}
.rte-content :where(strong) {
  @apply font-semibold;
}
.rte-content :where(em) {
  @apply italic;
}
.rte-content :where(s) {
  @apply line-through;
}
.rte-content :where(u) {
  @apply underline underline-offset-2;
}
.rte-content.is-empty:before {
  /* @tiptap/extension-placeholder injects this attribute */
  content: attr(data-placeholder);
  @apply text-foreground-subtle pointer-events-none float-left h-0;
}
```

`:where()` keeps specificity at zero so consumers can override per-instance via `className`. Dark mode comes for free — every value is a token.

---

## 6. Bundle size impact

Estimates from npm-published min+gz sizes (approximate, current TipTap v3 line):

| Package                                            |        min+gz |
| -------------------------------------------------- | ------------: |
| `@tiptap/pm` (ProseMirror bundle)                  |        ~40 KB |
| `@tiptap/core` (transitive)                        |        ~10 KB |
| `@tiptap/react`                                    |         ~2 KB |
| `@tiptap/starter-kit` (sum of marks/nodes/history) |        ~12 KB |
| `@tiptap/extension-underline`                      |       ~0.5 KB |
| `@tiptap/extension-link`                           |         ~2 KB |
| `@tiptap/extension-placeholder`                    |         ~1 KB |
| `@tiptap/extension-bubble-menu`                    |         ~3 KB |
| **v1 total**                                       | **~70 KB gz** |

**Tree-shaking gotchas:**

- Starter-kit imports every node/mark eagerly. Cheap but if we ever want to drop, e.g., CodeBlock, we must replace starter-kit with explicit imports of the remaining extensions. Acceptable for v1.
- **Always import from the package root** (`@tiptap/starter-kit`, `@tiptap/extension-link`). Importing from `dist/` or internal paths breaks tree-shaking and types.
- Lazy-load: the editor is only used on a few admin pages. Code-split `RichTextEditor` via `React.lazy` at the page boundary so the 70 KB doesn't hit pages that don't use it. Document this in the component README.
- ProseMirror's bundle is the floor — there is no smaller subset. If 70 KB gz is unacceptable, the whole proposal is wrong and we should reconsider scope (e.g., a textarea + markdown preview).

---

## 7. Accessibility

ProseMirror's contenteditable foundation is generally well-behaved with assistive tech. Specifics:

**What we get for free from ProseMirror:**

- Standard contenteditable announcement model.
- Native arrow-key / selection / clipboard behaviour.
- IME composition handled.
- Native browser undo/redo overridden by History extension cleanly.

**What we have to do:**

- Set `role="textbox"`, `aria-multiline="true"`, `aria-readonly` on the editable region. TipTap exposes `editorProps.attributes` for this.
- Wire `aria-labelledby` / `aria-describedby` from the `RichTextEditor` props to the editable region — required for FormField composition.
- Toolbar: `<div role="toolbar" aria-label="Text formatting">`. Buttons reflect state via `aria-pressed={editor.isActive('bold')}`.
- Toolbar keyboard nav: use our existing **`useRovingFocus`** so Tab moves focus _out_ of the toolbar, Arrow Left/Right moves between toolbar buttons.
- BubbleMenu: needs `role="toolbar"` too, and `aria-hidden` while not visible. Make sure it never steals focus from the editor (TipTap's BubbleMenu doesn't by default — verify in tests).
- Link Popover: focus moves to the URL Input on open, Esc closes, focus returns to the trigger button — already handled by our Popover + `useFocusReturn`.

**Known gotchas (document in component README):**

- VoiceOver historically loses position on rapid contenteditable mutations. Same problem afflicts every web rich editor. Acceptable.
- Screen readers announce mark toggles inconsistently. Toolbar `aria-pressed` is the canonical signal; we don't try to inject live-region announcements (regresses more than it helps).
- Cmd/Ctrl+B / I / U / K shortcuts conflict with screen-reader passthrough modes on some setups. We don't intercept beyond what TipTap defaults do.
- `placeholder` is rendered as a `:before` pseudo-element on the empty doc. Pseudo-content is reliably announced by modern AT but we also expose `aria-placeholder` on the editable region as a belt-and-braces measure.

We meet WCAG AA contrast through token usage (toolbar buttons inherit our existing IconButton focus ring + colour set).

---

## 8. Test strategy

TipTap mounts a real ProseMirror in jsdom. Most operations work; selection-heavy tests are unreliable in jsdom. Approach:

**What we test in `RichTextEditor.test.tsx`:**

1. Renders empty with placeholder text visible.
2. Renders with `defaultValue` HTML and the editable region contains the parsed content (via `screen.getByRole('textbox')`).
3. Typing into the textbox fires `onChange` with new HTML containing the typed text. (`userEvent.type`.)
4. Toolbar Bold button toggles the `bold` mark — assert `editor.isActive('bold')` via the imperative ref OR assert `<strong>` appears in the produced HTML when text is selected and the button clicked.
5. Heading dropdown switches block type — output HTML contains `<h2>` after picking H2.
6. Link toolbar opens the Popover; submitting a URL produces an `<a href="...">` in the HTML.
7. `readOnly` hides the toolbar, the textbox has `contenteditable="false"`, and clicks on toolbar elements (if forced visible) do nothing.
8. `aria-pressed` on each format button reflects the active state at the cursor.
9. Imperative `ref.current.focus()` / `clear()` / `getHTML()` work.
10. Controlled mode: external `value` change updates the editor; uncontrolled mode: `defaultValue` does not respond to later changes (parity with `<input>`).

**What we do NOT test in jsdom (cover later via Storybook play tests / Playwright):**

- Selection-based BubbleMenu visibility (jsdom's Selection API is incomplete).
- Drag-drop, paste from external sources.
- IME composition.

**Tools:**

- `@testing-library/react`, `userEvent`. No `fireEvent`. No snapshots.
- For HTML assertions, normalise via `editor.getHTML()` from the imperative ref instead of reading `innerHTML` directly — avoids whitespace/attribute-order flakiness.

**Behavioural hooks added (if any) get their own tests in `src/hooks/__tests__/`.** v1 should not require new hooks — Toolbar uses existing `useRovingFocus`, link Popover uses existing `useClickOutside`/`useEscapeKey`/`useFocusTrap`/`useFocusReturn`/`usePosition`.

---

## 9. ESLint impact

`eslint.config.js` `BANNED_UI_LIBS` covers UI / headless component libraries (Radix, MUI, Chakra, Mantine, Headless UI, React Aria Components, shadcn). **TipTap is not in that list and should not be added** — TipTap is a behaviour/state library (same classification as `react-hook-form`, `@tanstack/react-table`, `date-fns`).

**No changes required to `eslint.config.js`.** No `no-restricted-imports` allowlist entries needed because no rule blocks `@tiptap/*` today.

For documentation hygiene we should:

- Add a one-liner in `CLAUDE.md`'s "Tech stack" section once approved: `@tiptap/* for the RichTextEditor (ProseMirror; behaviour only, all visuals are ours)`.
- Add a comment near `BANNED_UI_LIBS` clarifying that `@tiptap/*` is intentionally allowed and _why_ (behaviour library, no UI ships from it), to forestall future PRs that try to add it.

---

## Open questions for review

1. **HTML vs JSON storage** — locking in HTML (§3.1). Confirm OK or flag a use case that requires JSON.
2. **Lazy-loading boundary** — do we want `React.lazy` on `RichTextEditor` itself, or expect callers to lazy-load the page that uses it? Recommendation: lazy-load at the page level; the component file stays a normal export.
3. **Toolbar variants** — `'full' | 'minimal' | false` enough, or should `minimal` be definable per consumer (pass an array of command IDs)? Recommendation: ship the two presets first; add custom command list in v2 if asked.
4. **Markdown shortcuts** — starter-kit ships `**bold**`, `*italic*`, `# heading`, `> quote`, `- list`, `1. list`, ` ```code``` `, `---` for free. Keep them on (default) or off? Recommendation: keep on — consistent with how engineers type in chat tools.
5. **Sanitisation** — TipTap parses input HTML via ProseMirror's schema, which already strips unknown nodes/attrs. For _output_ HTML we trust the schema. Do we also need DOMPurify on whatever the backend stores → renders elsewhere? That's a backend/render-target concern, not this component's. Flagging it so it doesn't become a surprise.

---

## Build order (after approval — not part of this session)

1. Add packages, pin versions, run `pnpm typecheck` clean.
2. Land prose styles in `src/styles/globals.css` (no component yet).
3. Build `RichTextEditor` core with `value`/`onChange`/`readOnly`, no toolbar — verify ProseMirror mounts, HTML round-trips, controlled mode works.
4. Build `EditorToolbar` (full preset), wire commands, add `aria-pressed`, integrate `useRovingFocus`.
5. Add `BubbleMenu`.
6. Add Link Popover flow.
7. Add Placeholder, history-button wiring, heading dropdown.
8. Tests (§8). Stories: empty, prefilled, readOnly, error, full toolbar, minimal toolbar, with bubble menu.
9. Demo page in `src/pages/`.
10. Update Introduction.mdx to list it under Forms.
