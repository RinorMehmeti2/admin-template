import { useRef, useState } from 'react';
import {
  DragDropProvider,
  useDraggable,
  useDropTarget,
  type DragEventInfo,
} from '@/hooks/useDragAndDrop';
import { cn } from '@/lib/cn';

/*
 * Sandbox proving the useDragAndDrop hook end-to-end before the full Kanban
 * lift in Phase 2. Two buckets, four cards; pointer drag + keyboard drag
 * (Space → Arrow keys → Enter / Escape) both move cards across buckets.
 */

interface CardItem {
  id: string;
  bucket: string;
  label: string;
}

const INITIAL: ReadonlyArray<CardItem> = [
  { id: 'c1', bucket: 'b1', label: 'Card one' },
  { id: 'c2', bucket: 'b1', label: 'Card two' },
  { id: 'c3', bucket: 'b2', label: 'Card three' },
  { id: 'c4', bucket: 'b2', label: 'Card four' },
];

interface CardProps {
  item: CardItem;
}

function Card({ item }: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useDraggable(ref, {
    id: item.id,
    type: 'sandbox-card',
    data: item,
    label: item.label,
  });
  return (
    <div
      ref={ref}
      {...drag.handleProps}
      className={cn(
        'cursor-grab rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        drag.isDragging && 'opacity-40',
        drag.dragMode === 'keyboard' && 'ring-2 ring-primary',
      )}
    >
      {item.label}
    </div>
  );
}

interface BucketProps {
  id: string;
  label: string;
  items: ReadonlyArray<CardItem>;
  onDrop: (ev: DragEventInfo) => void;
}

function Bucket({ id, label, items, onDrop }: BucketProps) {
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

export function DragDropSandboxPage() {
  const [items, setItems] = useState<ReadonlyArray<CardItem>>(INITIAL);

  const handleDrop = (bucketId: string) => (ev: DragEventInfo) => {
    const draggedId = ev.source.id;
    setItems((prev) => prev.map((it) => (it.id === draggedId ? { ...it, bucket: bucketId } : it)));
  };

  const b1Items = items.filter((it) => it.bucket === 'b1');
  const b2Items = items.filter((it) => it.bucket === 'b2');

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Drag &amp; drop sandbox</h1>
        <p className="mt-1 text-foreground-muted">
          Two buckets, four cards. Pointer drag with mouse, or focus a card and press{' '}
          <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-xs">
            Space
          </kbd>
          , then{' '}
          <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-xs">
            ←
          </kbd>
          /
          <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-xs">
            →
          </kbd>{' '}
          to switch bucket,{' '}
          <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-xs">
            Enter
          </kbd>{' '}
          to drop, or{' '}
          <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-xs">
            Esc
          </kbd>{' '}
          to cancel.
        </p>
      </header>

      <DragDropProvider>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Bucket id="b1" label="Bucket A" items={b1Items} onDrop={handleDrop('b1')} />
          <Bucket id="b2" label="Bucket B" items={b2Items} onDrop={handleDrop('b2')} />
        </div>
      </DragDropProvider>
    </div>
  );
}
