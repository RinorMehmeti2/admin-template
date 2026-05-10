import { lazy, Suspense, type Ref } from 'react';
import type { RichTextEditorHandle, RichTextEditorProps } from './RichTextEditor.types';

/*
 * Lazy entry point for RichTextEditor. TipTap + ProseMirror dwarf the rest of
 * the form bundle, and most pages don't render the editor on first paint —
 * splitting it out keeps /login and the lighter form pages cheap.
 *
 * `React.lazy` is used here (not the react-router lazy route option) because
 * the editor lives mid-component, not at a route boundary. The Suspense
 * boundary swaps in a placeholder of the same min-height so the surrounding
 * layout doesn't shift when the chunk lands.
 *
 * Important: this module imports RichTextEditor.types via `import type`
 * only — types are erased at build time so this file doesn't pull TipTap
 * into the main bundle. Don't change to a value import.
 */

const LoadedRichTextEditor = lazy(() =>
  import('./RichTextEditor').then((m) => ({ default: m.RichTextEditor })),
);

export interface LazyRichTextEditorProps extends RichTextEditorProps {
  /** Ref forwarded to the underlying editor handle. */
  ref?: Ref<RichTextEditorHandle>;
}

function EditorFallback({ minHeight }: { minHeight: number }) {
  return (
    <div
      aria-busy="true"
      className="rounded-md border border-border bg-surface-muted/40"
      style={{ minHeight }}
    />
  );
}

export function LazyRichTextEditor(props: LazyRichTextEditorProps) {
  return (
    <Suspense fallback={<EditorFallback minHeight={props.minHeight ?? 140} />}>
      <LoadedRichTextEditor {...props} />
    </Suspense>
  );
}
