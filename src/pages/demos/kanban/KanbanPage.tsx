import { useCallback, useState } from 'react';
import { ExampleBlock } from '@/components/data-display';
import { KanbanBoard } from '@/components/data-display/Kanban';
import { useToast } from '@/context/ToastProvider';
import { KanbanHeader, TaskCard } from './components';
import { COLUMNS, INITIAL } from './data';
import type { KanbanTask } from './model';

const code = `<KanbanBoard<KanbanTask>
  columns={COLUMNS}
  items={items}
  getItemId={(it) => it.id}
  getItemColumn={(it) => it.col}
  getCardLabel={(it) => it.title}
  onItemMove={(itemId, _from, to, toIndex) => {
    setItems((prev) => {
      const moving = prev.find((p) => p.id === itemId);
      if (moving === undefined) return prev;
      const without = prev.filter((p) => p.id !== itemId);
      const targetList = without.filter((p) => p.col === to);
      const otherCols = without.filter((p) => p.col !== to);
      const next = [...targetList];
      next.splice(toIndex, 0, { ...moving, col: to });
      return [...otherCols, ...next];
    });
  }}
  onAddCard={(columnId) => {
    const nextId = \`k-\${Date.now()}\`;
    setItems((prev) => [
      ...prev,
      {
        id: nextId,
        col: columnId,
        title: 'New task',
        assignee: 'Unassigned',
        tags: [],
        priority: 'low',
      },
    ]);
    toast.info('Card added.');
  }}
  renderCard={(it) => <TaskCard it={it} />}
/>`;

export function KanbanPage() {
  const [items, setItems] = useState<ReadonlyArray<KanbanTask>>(INITIAL);
  const { toast } = useToast();

  const handleMove = useCallback((itemId: string, _from: string, to: string, toIndex: number) => {
    setItems((prev) => {
      const moving = prev.find((p) => p.id === itemId);
      if (moving === undefined) return prev;
      const without = prev.filter((p) => p.id !== itemId);
      const targetList = without.filter((p) => p.col === to);
      const otherCols = without.filter((p) => p.col !== to);
      const next = [...targetList];
      next.splice(toIndex, 0, { ...moving, col: to });
      return [...otherCols, ...next];
    });
  }, []);

  const handleAdd = useCallback(
    (columnId: string) => {
      const nextId = `k-${Date.now()}`;
      setItems((prev) => [
        ...prev,
        {
          id: nextId,
          col: columnId,
          title: 'New task',
          assignee: 'Unassigned',
          tags: [],
          priority: 'low',
        },
      ]);
      toast.info('Card added.');
    },
    [toast],
  );

  return (
    <div className="mx-auto flex h-full max-w-[1400px] flex-col">
      <KanbanHeader />
      <ExampleBlock
        title="Task board"
        description="Drag-and-drop columns with keyboard support — Space picks up, Arrows move, Enter drops, Esc cancels."
        code={code}
        className="min-h-0 flex-1"
      >
        <KanbanBoard<KanbanTask>
          columns={COLUMNS}
          items={items}
          getItemId={(it) => it.id}
          getItemColumn={(it) => it.col}
          getCardLabel={(it) => it.title}
          onItemMove={handleMove}
          onAddCard={handleAdd}
          renderCard={(it) => <TaskCard it={it} />}
        />
      </ExampleBlock>
    </div>
  );
}
