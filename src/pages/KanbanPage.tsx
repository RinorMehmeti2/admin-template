import { useCallback, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { KanbanBoard, type KanbanColumnDef } from '@/components/data-display/Kanban';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { useToast } from '@/context/ToastProvider';

interface KanbanTask {
  id: string;
  col: string;
  title: string;
  assignee: string;
  due?: string;
  tags: ReadonlyArray<string>;
  priority: 'low' | 'medium' | 'high';
}

const COLUMNS: ReadonlyArray<KanbanColumnDef> = [
  { id: 'backlog', title: 'Backlog', allowAddCard: true },
  { id: 'progress', title: 'In progress', allowAddCard: true },
  { id: 'review', title: 'In review' },
  { id: 'done', title: 'Done' },
];

const INITIAL: ReadonlyArray<KanbanTask> = [
  {
    id: 'k1',
    col: 'backlog',
    title: 'Spec the audit log filters',
    assignee: 'Ada Lovelace',
    due: 'Mar 18',
    tags: ['backend', 'spec'],
    priority: 'medium',
  },
  {
    id: 'k2',
    col: 'backlog',
    title: 'Wire SSO redirect path',
    assignee: 'Diego Vega',
    due: 'Mar 20',
    tags: ['auth'],
    priority: 'high',
  },
  {
    id: 'k3',
    col: 'backlog',
    title: 'Add CSV importer to settings',
    assignee: 'Bob Marley',
    tags: ['feature'],
    priority: 'low',
  },
  {
    id: 'k4',
    col: 'progress',
    title: 'Refactor billing webhook handler',
    assignee: 'Cher',
    due: 'Mar 12',
    tags: ['backend', 'billing'],
    priority: 'high',
  },
  {
    id: 'k5',
    col: 'progress',
    title: 'Polish empty-state copy',
    assignee: 'Bob Marley',
    tags: ['design'],
    priority: 'low',
  },
  {
    id: 'k6',
    col: 'progress',
    title: 'Investigate flaky checkout e2e',
    assignee: 'Eve Polastri',
    due: 'Mar 14',
    tags: ['qa'],
    priority: 'medium',
  },
  {
    id: 'k7',
    col: 'review',
    title: 'Kanban component PR',
    assignee: 'Ada Lovelace',
    due: 'Mar 11',
    tags: ['frontend'],
    priority: 'high',
  },
  {
    id: 'k8',
    col: 'review',
    title: 'Notifications inbox follow-ups',
    assignee: 'Cher',
    tags: ['frontend'],
    priority: 'medium',
  },
  {
    id: 'k9',
    col: 'review',
    title: 'Tighten 401 retry policy',
    assignee: 'Diego Vega',
    tags: ['backend'],
    priority: 'medium',
  },
  {
    id: 'k10',
    col: 'done',
    title: 'Ship notifications inbox',
    assignee: 'Eve Polastri',
    tags: ['frontend'],
    priority: 'high',
  },
  {
    id: 'k11',
    col: 'done',
    title: 'Add Timeline component',
    assignee: 'Bob Marley',
    tags: ['frontend'],
    priority: 'low',
  },
  {
    id: 'k12',
    col: 'done',
    title: 'Carve drag-and-drop hook out of POC',
    assignee: 'Ada Lovelace',
    tags: ['hooks'],
    priority: 'medium',
  },
];

const PRIORITY_VARIANT: Record<KanbanTask['priority'], 'neutral' | 'warning' | 'danger'> = {
  low: 'neutral',
  medium: 'warning',
  high: 'danger',
};

export function KanbanPage() {
  const [items, setItems] = useState<ReadonlyArray<KanbanTask>>(INITIAL);
  const { toast } = useToast();

  const handleMove = useCallback(
    (itemId: string, _from: string, to: string, toIndex: number) => {
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
    },
    [],
  );

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
    <div className="flex h-full flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Kanban</h1>
        <p className="mt-1 text-foreground-muted">
          Realistic task board built on the <code>useDragAndDrop</code> hook. Pointer drag to move
          a card; or focus a card and press Space, then ←/→ to switch column, ↑/↓ to reorder
          within a column, Enter to drop, Esc to cancel.
        </p>
      </header>

      <div className="min-h-0 flex-1">
        <KanbanBoard<KanbanTask>
          columns={COLUMNS}
          items={items}
          getItemId={(it) => it.id}
          getItemColumn={(it) => it.col}
          getCardLabel={(it) => it.title}
          onItemMove={handleMove}
          onAddCard={handleAdd}
          renderCard={(it) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium leading-snug">{it.title}</span>
                <Badge variant={PRIORITY_VARIANT[it.priority]} size="sm">
                  {it.priority}
                </Badge>
              </div>
              {it.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {it.tags.map((tag) => (
                    <Badge key={tag} variant="primary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-2 text-xs text-foreground-muted">
                <span className="flex items-center gap-1.5">
                  <Avatar name={it.assignee} size="xs" />
                  <span>{it.assignee.split(' ')[0]}</span>
                </span>
                {it.due !== undefined ? (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {it.due}
                  </span>
                ) : null}
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
