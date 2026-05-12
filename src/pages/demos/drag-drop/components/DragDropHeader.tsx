export function DragDropHeader() {
  return (
    <header>
      <h1 className="text-2xl font-semibold tracking-tight">Drag &amp; drop sandbox</h1>
      <p className="mt-1 text-foreground-muted">
        Two buckets, four cards. Pointer drag with mouse, or focus a card and press{' '}
        <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-xs">
          Space
        </kbd>
        , then{' '}
        <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-xs">
          ←
        </kbd>
        /
        <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-xs">
          →
        </kbd>{' '}
        to switch bucket,{' '}
        <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-xs">
          Enter
        </kbd>{' '}
        to drop, or{' '}
        <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-xs">
          Esc
        </kbd>{' '}
        to cancel.
      </p>
    </header>
  );
}
