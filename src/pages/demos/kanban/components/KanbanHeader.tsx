import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';

export function KanbanHeader() {
  return (
    <SimsPageHeader
      title="Kanban"
      description={
        <>
          Realistic task board built on the <code>useDragAndDrop</code> hook. Pointer drag to move a
          card; or focus a card and press Space, then ←/→ to switch column, ↑/↓ to reorder within a
          column, Enter to drop, Esc to cancel.
        </>
      }
    />
  );
}
