import { ListChecks } from 'lucide-react';
import { PERSIST_KEY } from '../data';

export function DraftHint() {
  return (
    <div className="flex items-center justify-end gap-2 text-xs text-foreground-subtle">
      <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
      <span>
        Draft auto-saves to <code>{PERSIST_KEY}</code> — reload to see the
        restore dialog.
      </span>
    </div>
  );
}
