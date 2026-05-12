export function KanbanHeader() {
  return (
    <header>
      <h1 className="text-2xl font-semibold tracking-tight">Kanban</h1>
      <p className="mt-1 text-foreground-muted">
        Realistic task board built on the <code>useDragAndDrop</code> hook. Pointer drag to move
        a card; or focus a card and press Space, then ←/→ to switch column, ↑/↓ to reorder
        within a column, Enter to drop, Esc to cancel.
      </p>
    </header>
  );
}
