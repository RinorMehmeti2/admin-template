import type { KanbanColumnDef } from '@/components/data-display/Kanban';
import type { KanbanTask } from './model';

export const COLUMNS: ReadonlyArray<KanbanColumnDef> = [
  { id: 'backlog', title: 'Backlog', allowAddCard: true },
  { id: 'progress', title: 'In progress', allowAddCard: true },
  { id: 'review', title: 'In review' },
  { id: 'done', title: 'Done' },
];

export const INITIAL: ReadonlyArray<KanbanTask> = [
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

export const PRIORITY_VARIANT: Record<KanbanTask['priority'], 'neutral' | 'warning' | 'danger'> = {
  low: 'neutral',
  medium: 'warning',
  high: 'danger',
};
