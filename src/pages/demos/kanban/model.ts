export interface KanbanTask {
  id: string;
  col: string;
  title: string;
  assignee: string;
  due?: string;
  tags: ReadonlyArray<string>;
  priority: 'low' | 'medium' | 'high';
}
