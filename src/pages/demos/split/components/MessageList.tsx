import { Inbox, Search, Star } from 'lucide-react';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Input } from '@/components/forms/Input';
import { MESSAGES } from '../data';

export function MessageList({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-3">
        <Inbox className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
        <span className="text-sm font-semibold">Inbox</span>
        <Badge variant="primary" size="sm">
          {MESSAGES.filter((m) => m.unread).length}
        </Badge>
      </div>
      <div className="shrink-0 border-b border-border p-2">
        <Input
          inputSize="sm"
          placeholder="Search mail…"
          leftIcon={<Search className="h-3.5 w-3.5" />}
          aria-label="Search mail"
        />
      </div>
      <ul className="flex-1 overflow-auto">
        {MESSAGES.map((m) => {
          const isSelected = m.id === selectedId;
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => onSelect(m.id)}
                aria-current={isSelected ? 'true' : undefined}
                className={
                  'flex w-full items-start gap-3 border-b border-border px-3 py-3 text-left transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset' +
                  (isSelected ? ' bg-surface-muted' : '')
                }
              >
                <Avatar size="sm" name={m.from} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={
                        'min-w-0 flex-1 truncate text-sm ' +
                        (m.unread ? 'font-semibold text-foreground' : 'text-foreground-muted')
                      }
                    >
                      {m.from}
                    </p>
                    {m.starred ? (
                      <Star className="h-3.5 w-3.5 shrink-0 text-warning" aria-label="Starred" />
                    ) : null}
                    <span className="shrink-0 text-xs text-foreground-subtle">{m.receivedAt}</span>
                  </div>
                  <p className="truncate text-sm text-foreground">{m.subject}</p>
                  <p className="truncate text-xs text-foreground-muted">{m.preview}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
