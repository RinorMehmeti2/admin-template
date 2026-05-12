import { useRef } from 'react';
import { useDropTarget, type DragEventInfo } from '@/hooks/useDragAndDrop';
import { cn } from '@/lib/cn';
import type { CardItem } from '../model';
import { Card } from './Card';

interface BucketProps {
  id: string;
  label: string;
  items: ReadonlyArray<CardItem>;
  onDrop: (ev: DragEventInfo) => void;
}

export function Bucket({ id, label, items, onDrop }: BucketProps) {
  const ref = useRef<HTMLDivElement>(null);
  const drop = useDropTarget(ref, {
    id,
    accept: 'sandbox-card',
    label,
    onDrop,
  });
  return (
    <div
      ref={ref}
      {...drop.targetProps}
      className={cn(
        'flex min-h-64 flex-col gap-2 rounded-lg border-2 border-dashed border-border bg-surface-muted/40 p-3 transition-colors',
        drop.isOver && 'border-primary bg-primary/10',
        drop.canDrop && !drop.isOver && 'border-border-strong',
      )}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
        {label}
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <Card key={item.id} item={item} />
        ))}
        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-foreground-muted">
            Drop here
          </div>
        ) : null}
      </div>
    </div>
  );
}
