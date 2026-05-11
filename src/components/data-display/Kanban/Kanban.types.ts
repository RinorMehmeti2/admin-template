import type { ReactNode } from 'react';

/*
 * Touch-activation tuning (Phase 1 carry-over #2) is a follow-up. Today the
 * board picks up touch drags via the same pointerdown threshold as mouse
 * (~4px). That is fine on desktop with a stylus or external pointer but on a
 * scrollable mobile column it can race with the browser's vertical scroll
 * gesture. The plan is to layer an activation delay (press-and-hold ~200ms)
 * on touch pointers inside useDraggable. Not in this phase.
 */

export interface KanbanColumnDef {
  id: string;
  title: string;
  /**
   * Restrict which card `type`s can be dropped here. Omit to accept everything.
   * String matches exact; array matches any.
   */
  accept?: string | ReadonlyArray<string>;
  /** Show an "Add card" affordance in the column header (requires `onAddCard`). */
  allowAddCard?: boolean;
}

export interface KanbanRenderCardContext {
  isDragging: boolean;
}

export interface KanbanBoardProps<T> {
  columns: ReadonlyArray<KanbanColumnDef>;
  items: ReadonlyArray<T>;
  getItemId: (item: T) => string;
  getItemColumn: (item: T) => string;
  /** Defaults to `'card'`. Combined with `KanbanColumnDef.accept` to filter drops. */
  getItemType?: (item: T) => string;
  /** Used for the SR drag announcements ("Picked up …"). Defaults to the item id. */
  getCardLabel?: (item: T) => string;
  renderCard: (item: T, ctx: KanbanRenderCardContext) => ReactNode;
  renderColumnHeader?: (column: KanbanColumnDef, ctx: { count: number }) => ReactNode;
  onItemMove: (itemId: string, fromColId: string, toColId: string, toIndex: number) => void;
  onAddCard?: (columnId: string) => void;
  /** Default true. When false, drops where source col === target col are ignored. */
  allowReorderWithinColumn?: boolean;
  /** Default "Drop cards here". Rendered as the EmptyState title for an empty column. */
  emptyColumnMessage?: ReactNode;
  className?: string;
  'aria-label'?: string;
}
