import { ChevronRight } from 'lucide-react';
import type { TreeRenderItemContext } from '@/components/data-display/TreeView';
import { cn } from '@/lib/cn';
import { meta } from '../model';
import type { FileMeta } from '../model';
import { FileIcon } from './FileIcon';

export function Row({ ctx }: { ctx: TreeRenderItemContext<FileMeta> }) {
  const { node, level, isExpanded, isSelected, isFocused, hasChildren } = ctx;
  const m = meta(node);
  return (
    <div
      className={cn(
        'group flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm transition-colors',
        'hover:bg-surface-muted',
        isSelected && 'bg-primary/10',
        isFocused && 'ring-2 ring-ring ring-offset-1 ring-offset-background',
      )}
      style={{ paddingInlineStart: `${(level - 1) * 16 + 6}px` }}
    >
      {hasChildren ? (
        <ChevronRight
          aria-hidden="true"
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-foreground-muted transition-transform',
            isExpanded && 'rotate-90',
          )}
        />
      ) : (
        <span aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      )}
      <FileIcon kind={m?.kind ?? 'json'} isExpanded={isExpanded} />
      <span className="min-w-0 flex-1 truncate">{node.label}</span>
      {m?.size !== undefined ? (
        <span className="shrink-0 text-xs text-foreground-subtle">{m.size}</span>
      ) : null}
    </div>
  );
}
