import { CalendarDays } from 'lucide-react';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { PRIORITY_VARIANT } from '../data';
import type { KanbanTask } from '../model';

export function TaskCard({ it }: { it: KanbanTask }) {
  return (
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
  );
}
