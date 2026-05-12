import { useRef } from 'react';
import { useDraggable } from '@/hooks/useDragAndDrop';
import { cn } from '@/lib/cn';
import type { CardItem } from '../model';

interface CardProps {
  item: CardItem;
}

export function Card({ item }: CardProps) {
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
