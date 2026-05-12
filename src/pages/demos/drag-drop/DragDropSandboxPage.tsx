import { useState } from 'react';
import { DragDropProvider, type DragEventInfo } from '@/hooks/useDragAndDrop';
import { Bucket, DragDropHeader } from './components';
import { INITIAL } from './data';
import type { CardItem } from './model';

/*
 * Sandbox proving the useDragAndDrop hook end-to-end before the full Kanban
 * lift in Phase 2. Two buckets, four cards; pointer drag + keyboard drag
 * (Space → Arrow keys → Enter / Escape) both move cards across buckets.
 */

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
      <DragDropHeader />

      <DragDropProvider>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Bucket id="b1" label="Bucket A" items={b1Items} onDrop={handleDrop('b1')} />
          <Bucket id="b2" label="Bucket B" items={b2Items} onDrop={handleDrop('b2')} />
        </div>
      </DragDropProvider>
    </div>
  );
}
