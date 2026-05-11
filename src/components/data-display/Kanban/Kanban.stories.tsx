import { useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { KanbanBoard } from './Kanban';
import type { KanbanColumnDef } from './Kanban.types';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';

export default { title: 'Data Display/Kanban', component: KanbanBoard };

interface Task {
  id: string;
  col: string;
  title: string;
  assignee?: { name: string };
  due?: string;
  tags?: ReadonlyArray<string>;
  type?: string;
}

const DEFAULT_COLUMNS: ReadonlyArray<KanbanColumnDef> = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'In progress' },
  { id: 'done', title: 'Done' },
];

const DEFAULT_TASKS: ReadonlyArray<Task> = [
  { id: 't1', col: 'todo', title: 'Draft Q3 OKRs' },
  { id: 't2', col: 'todo', title: 'Review onboarding doc' },
  { id: 't3', col: 'todo', title: 'Schedule design review' },
  { id: 't4', col: 'doing', title: 'Refactor billing webhook' },
  { id: 't5', col: 'doing', title: 'Polish empty states' },
  { id: 't6', col: 'doing', title: 'Investigate flaky e2e' },
  { id: 't7', col: 'doing', title: 'Write Kanban tests' },
  { id: 't8', col: 'done', title: 'Ship notifications inbox' },
  { id: 't9', col: 'done', title: 'Add timeline component' },
  { id: 't10', col: 'done', title: 'Carve drag-and-drop hook out of POC' },
];

function moveItems(
  prev: ReadonlyArray<Task>,
  itemId: string,
  to: string,
  toIndex: number,
): ReadonlyArray<Task> {
  const moving = prev.find((p) => p.id === itemId);
  if (moving === undefined) return prev;
  const without = prev.filter((p) => p.id !== itemId);
  const targetList = without.filter((p) => p.col === to);
  const otherCols = without.filter((p) => p.col !== to);
  const next = [...targetList];
  next.splice(toIndex, 0, { ...moving, col: to });
  return [...otherCols, ...next];
}

/* -------------------------------------------------------------------------- */
/*  Default 3-column board                                                    */
/* -------------------------------------------------------------------------- */

function DefaultBoard() {
  const [items, setItems] = useState<ReadonlyArray<Task>>(DEFAULT_TASKS);
  return (
    <div className="h-[600px]">
      <KanbanBoard<Task>
        columns={DEFAULT_COLUMNS}
        items={items}
        getItemId={(it) => it.id}
        getItemColumn={(it) => it.col}
        getCardLabel={(it) => it.title}
        renderCard={(it) => <div className="font-medium">{it.title}</div>}
        onItemMove={(id, _from, to, idx) => setItems((prev) => moveItems(prev, id, to, idx))}
      />
    </div>
  );
}

export const Default = { render: () => <DefaultBoard /> };

/* -------------------------------------------------------------------------- */
/*  Custom card rendering: avatar + chips + due date                          */
/* -------------------------------------------------------------------------- */

const RICH_TASKS: ReadonlyArray<Task> = [
  {
    id: 'r1',
    col: 'todo',
    title: 'Spec the audit log filters',
    assignee: { name: 'Ada Lovelace' },
    due: 'Mar 18',
    tags: ['backend', 'spec'],
  },
  {
    id: 'r2',
    col: 'todo',
    title: 'Wire SSO redirect path',
    assignee: { name: 'Diego Vega' },
    due: 'Mar 20',
    tags: ['auth'],
  },
  {
    id: 'r3',
    col: 'doing',
    title: 'Refactor billing webhook handler',
    assignee: { name: 'Cher' },
    due: 'Mar 12',
    tags: ['backend', 'billing'],
  },
  {
    id: 'r4',
    col: 'doing',
    title: 'Polish empty-state copy',
    assignee: { name: 'Bob Marley' },
    tags: ['design'],
  },
  {
    id: 'r5',
    col: 'done',
    title: 'Ship notifications inbox',
    assignee: { name: 'Eve Polastri' },
    tags: ['frontend'],
  },
];

function RichBoard() {
  const [items, setItems] = useState<ReadonlyArray<Task>>(RICH_TASKS);
  return (
    <div className="h-[600px]">
      <KanbanBoard<Task>
        columns={DEFAULT_COLUMNS}
        items={items}
        getItemId={(it) => it.id}
        getItemColumn={(it) => it.col}
        getCardLabel={(it) => it.title}
        renderCard={(it) => (
          <div className="flex flex-col gap-2">
            <div className="font-medium leading-snug">{it.title}</div>
            {it.tags !== undefined && it.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {it.tags.map((tag) => (
                  <Badge key={tag} variant="primary" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-2 text-xs text-foreground-muted">
              {it.assignee !== undefined ? (
                <span className="flex items-center gap-1.5">
                  <Avatar name={it.assignee.name} size="xs" />
                  <span>{it.assignee.name.split(' ')[0]}</span>
                </span>
              ) : (
                <span />
              )}
              {it.due !== undefined ? (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  {it.due}
                </span>
              ) : null}
            </div>
          </div>
        )}
        onItemMove={(id, _from, to, idx) => setItems((prev) => moveItems(prev, id, to, idx))}
      />
    </div>
  );
}

export const RichCards = { render: () => <RichBoard /> };

/* -------------------------------------------------------------------------- */
/*  Four columns with accept restriction                                      */
/* -------------------------------------------------------------------------- */

const ACCEPT_COLUMNS: ReadonlyArray<KanbanColumnDef> = [
  { id: 'inbox', title: 'Inbox', accept: ['feature', 'bug'] },
  { id: 'features', title: 'Features', accept: 'feature' },
  { id: 'bugs', title: 'Bugs', accept: 'bug' },
  { id: 'archive', title: 'Archive' },
];

const ACCEPT_TASKS: ReadonlyArray<Task> = [
  { id: 'a1', col: 'inbox', title: 'Multi-region failover', type: 'feature' },
  { id: 'a2', col: 'inbox', title: 'Login throws on Safari', type: 'bug' },
  { id: 'a3', col: 'features', title: 'Bulk CSV import', type: 'feature' },
  { id: 'a4', col: 'bugs', title: 'Stat tile mis-aligned on FF', type: 'bug' },
];

function AcceptBoard() {
  const [items, setItems] = useState<ReadonlyArray<Task>>(ACCEPT_TASKS);
  return (
    <div className="h-[600px]">
      <KanbanBoard<Task>
        columns={ACCEPT_COLUMNS}
        items={items}
        getItemId={(it) => it.id}
        getItemColumn={(it) => it.col}
        getItemType={(it) => it.type ?? 'card'}
        getCardLabel={(it) => it.title}
        renderCard={(it) => (
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">{it.title}</span>
            <Badge variant={it.type === 'bug' ? 'danger' : 'info'} size="sm">
              {it.type}
            </Badge>
          </div>
        )}
        onItemMove={(id, _from, to, idx) => setItems((prev) => moveItems(prev, id, to, idx))}
      />
    </div>
  );
}

export const AcceptRestriction = { render: () => <AcceptBoard /> };

/* -------------------------------------------------------------------------- */
/*  Empty board                                                               */
/* -------------------------------------------------------------------------- */

function EmptyBoardImpl() {
  const [items, setItems] = useState<ReadonlyArray<Task>>([]);
  return (
    <div className="h-[400px]">
      <KanbanBoard<Task>
        columns={DEFAULT_COLUMNS}
        items={items}
        getItemId={(it) => it.id}
        getItemColumn={(it) => it.col}
        renderCard={(it) => <span>{it.title}</span>}
        onItemMove={(id, _from, to, idx) => setItems((prev) => moveItems(prev, id, to, idx))}
        emptyColumnMessage="No tasks yet"
      />
    </div>
  );
}

export const EmptyBoard = { render: () => <EmptyBoardImpl /> };

/* -------------------------------------------------------------------------- */
/*  With Add card affordance                                                  */
/* -------------------------------------------------------------------------- */

function AddCardBoard() {
  const ADD_COLUMNS = useMemo<ReadonlyArray<KanbanColumnDef>>(
    () => [
      { id: 'todo', title: 'To do', allowAddCard: true },
      { id: 'doing', title: 'In progress', allowAddCard: true },
      { id: 'done', title: 'Done' },
    ],
    [],
  );
  const [items, setItems] = useState<ReadonlyArray<Task>>(DEFAULT_TASKS);
  return (
    <div className="h-[600px]">
      <KanbanBoard<Task>
        columns={ADD_COLUMNS}
        items={items}
        getItemId={(it) => it.id}
        getItemColumn={(it) => it.col}
        getCardLabel={(it) => it.title}
        renderCard={(it) => <div className="font-medium">{it.title}</div>}
        onAddCard={(columnId) => {
          const nextId = `n-${Date.now()}`;
          setItems((prev) => [...prev, { id: nextId, col: columnId, title: 'New task' }]);
        }}
        onItemMove={(id, _from, to, idx) => setItems((prev) => moveItems(prev, id, to, idx))}
      />
    </div>
  );
}

export const WithAddCard = { render: () => <AddCardBoard /> };
