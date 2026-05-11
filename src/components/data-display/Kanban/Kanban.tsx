import { Fragment, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  DragDropProvider,
  useDraggable,
  useDropTarget,
  type DragEventInfo,
  type DropAccept,
} from '@/hooks/useDragAndDrop';
import { Badge } from '@/components/primitives/Badge';
import { IconButton } from '@/components/primitives/IconButton';
import { EmptyState } from '@/components/data-display/EmptyState';
import type {
  KanbanBoardProps,
  KanbanColumnDef,
  KanbanRenderCardContext,
} from './Kanban.types';

/*
 * Re-render note (Phase 1 carry-over #1):
 * `DragDropProvider` re-renders every subscriber whenever the global drag
 * state changes (pickup, leave/enter, slot change, drop). For a board with
 * <100 cards this is unmeasurable. If a real-world board with hundreds of
 * cards becomes sluggish during pointer drags, switch the provider's `state`
 * to a `useSyncExternalStore`-backed store + per-card selector subscriptions
 * so only the source card and the over-column re-render. Deferred — premature
 * for our actual workloads today.
 */

/* -------------------------------------------------------------------------- */
/*  KanbanCard (internal)                                                     */
/* -------------------------------------------------------------------------- */

/*
 * No "drag overlay clone" is rendered (Phase 1 carry-over #3). The dragged
 * card stays in its original slot at 50% opacity for the duration of the
 * pointer drag, instead of detaching into a follow-cursor portal clone. Pros:
 * simpler implementation, no rect snapshotting, no z-index gymnastics, free
 * for keyboard mode where there is no pointer to follow. Cons: the user does
 * not see an explicit "ghost" tracking the cursor — the drop indicator
 * communicates the insertion point instead. Revisit if UX feedback says the
 * lack of a ghost is disorienting on long columns.
 */

interface KanbanCardProps<T> {
  item: T;
  itemId: string;
  itemType: string;
  cardLabel: string;
  renderCard: (item: T, ctx: KanbanRenderCardContext) => ReactNode;
}

function KanbanCard<T>({ item, itemId, itemType, cardLabel, renderCard }: KanbanCardProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useDraggable(ref, {
    id: itemId,
    type: itemType,
    data: item,
    label: cardLabel,
  });

  return (
    <div
      ref={ref}
      data-kanban-card-id={itemId}
      {...drag.handleProps}
      aria-roledescription="Draggable card"
      aria-label={cardLabel}
      className={cn(
        'rounded-md border border-border bg-surface-elevated p-3 text-sm text-foreground shadow-sm',
        'cursor-grab hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'motion-safe:transition-shadow',
        drag.isDragging && 'opacity-50 outline outline-2 outline-primary',
        drag.dragMode === 'keyboard' && 'ring-2 ring-primary',
      )}
    >
      {renderCard(item, { isDragging: drag.isDragging })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Drop indicator                                                            */
/* -------------------------------------------------------------------------- */

function DropIndicator() {
  return (
    <div
      data-kanban-drop-indicator=""
      aria-hidden="true"
      className="mx-1 h-1 rounded-full bg-primary motion-safe:transition-opacity"
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  KanbanColumn (internal)                                                   */
/* -------------------------------------------------------------------------- */

interface KanbanColumnProps<T> {
  column: KanbanColumnDef;
  items: ReadonlyArray<T>;
  allItems: ReadonlyArray<T>;
  getItemId: (item: T) => string;
  getItemColumn: (item: T) => string;
  getItemType: (item: T) => string;
  getCardLabel: (item: T) => string;
  renderCard: (item: T, ctx: KanbanRenderCardContext) => ReactNode;
  renderColumnHeader: ((col: KanbanColumnDef, ctx: { count: number }) => ReactNode) | undefined;
  onItemMove: (itemId: string, fromColId: string, toColId: string, toIndex: number) => void;
  onAddCard: ((columnId: string) => void) | undefined;
  allowReorderWithinColumn: boolean;
  emptyColumnMessage: ReactNode;
}

function KanbanColumn<T>({
  column,
  items,
  allItems,
  getItemId,
  getItemColumn,
  getItemType,
  getCardLabel,
  renderCard,
  renderColumnHeader,
  onItemMove,
  onAddCard,
  allowReorderWithinColumn,
  emptyColumnMessage,
}: KanbanColumnProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  const accept = useMemo<DropAccept>(() => {
    const raw = column.accept;
    if (raw === undefined) return () => true;
    if (typeof raw === 'string') return raw;
    return raw;
  }, [column.accept]);

  // Stable, ref-backed lookups so the resolver / drop callback can read the
  // latest item lists without re-registering the drop target on every change.
  const itemsRef = useRef(items);
  const allItemsRef = useRef(allItems);
  const getItemIdRef = useRef(getItemId);
  const getItemColumnRef = useRef(getItemColumn);
  const onItemMoveRef = useRef(onItemMove);
  useEffect(() => {
    itemsRef.current = items;
    allItemsRef.current = allItems;
    getItemIdRef.current = getItemId;
    getItemColumnRef.current = getItemColumn;
    onItemMoveRef.current = onItemMove;
  });

  const handleDrop = useCallback(
    (ev: DragEventInfo) => {
      const sourceId = ev.source.id;
      const sourceItem = allItemsRef.current.find(
        (it) => getItemIdRef.current(it) === sourceId,
      );
      // Source removed mid-drag (Phase 1 carry-over): cancel silently.
      if (sourceItem === undefined) return;
      const fromColId = getItemColumnRef.current(sourceItem);
      if (fromColId === column.id && !allowReorderWithinColumn) return;
      onItemMoveRef.current(sourceId, fromColId, column.id, ev.slotIndex);
    },
    [column.id, allowReorderWithinColumn],
  );

  const getSlotCount = useCallback(() => itemsRef.current.length + 1, []);

  const resolvePointerSlot = useCallback((_localX: number, localY: number) => {
    const el = ref.current;
    if (el === null) return 0;
    const colRect = el.getBoundingClientRect();
    const cards = el.querySelectorAll<HTMLElement>('[data-kanban-card-id]');
    for (let i = 0; i < cards.length; i += 1) {
      const node = cards[i];
      if (node === undefined) continue;
      const r = node.getBoundingClientRect();
      const midLocal = r.top + r.height / 2 - colRect.top;
      if (localY < midLocal) return i;
    }
    return cards.length;
  }, []);

  const drop = useDropTarget(ref, {
    id: column.id,
    accept,
    label: column.title,
    getSlotCount,
    resolvePointerSlot,
    onDrop: handleDrop,
  });

  const header = renderColumnHeader?.(column, { count: items.length }) ?? (
    <div className="flex items-center justify-between gap-2 px-1">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-foreground">{column.title}</h3>
        <Badge variant="neutral" size="sm" aria-label={`${items.length} cards`}>
          {items.length}
        </Badge>
      </div>
      {column.allowAddCard === true && onAddCard !== undefined ? (
        <IconButton
          aria-label={`Add card to ${column.title}`}
          variant="ghost"
          size="sm"
          onClick={() => onAddCard(column.id)}
        >
          <Plus className="h-4 w-4" />
        </IconButton>
      ) : null}
    </div>
  );

  const showIndicatorAt = (slot: number): boolean =>
    drop.isOver && drop.overSlotIndex === slot;

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="Kanban column"
      aria-label={column.title}
      data-kanban-column-id={column.id}
      className={cn(
        'flex min-w-[280px] max-w-[320px] shrink-0 flex-col gap-3 rounded-lg bg-surface-muted p-3',
        'motion-safe:transition-colors',
        drop.isOver && drop.canDrop && 'bg-surface-muted/70 outline outline-2 outline-primary/40',
      )}
    >
      {header}
      <div className="flex min-h-[2.5rem] flex-1 flex-col gap-2 overflow-y-auto">
        {items.length === 0 ? (
          drop.isOver ? (
            <DropIndicator />
          ) : (
            <EmptyState
              title={emptyColumnMessage ?? 'Drop cards here'}
              className="px-2 py-6"
            />
          )
        ) : (
          <>
            {items.map((item, i) => (
              <Fragment key={getItemId(item)}>
                {showIndicatorAt(i) ? <DropIndicator /> : null}
                <KanbanCard
                  item={item}
                  itemId={getItemId(item)}
                  itemType={getItemType(item)}
                  cardLabel={getCardLabel(item)}
                  renderCard={renderCard}
                />
              </Fragment>
            ))}
            {showIndicatorAt(items.length) ? <DropIndicator /> : null}
          </>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  KanbanBoard (public)                                                      */
/* -------------------------------------------------------------------------- */

export function KanbanBoard<T>({
  columns,
  items,
  getItemId,
  getItemColumn,
  getItemType,
  getCardLabel,
  renderCard,
  renderColumnHeader,
  onItemMove,
  onAddCard,
  allowReorderWithinColumn = true,
  emptyColumnMessage,
  className,
  'aria-label': ariaLabel = 'Kanban board',
}: KanbanBoardProps<T>) {
  const resolveType = useMemo(
    () => (item: T) => getItemType?.(item) ?? 'card',
    [getItemType],
  );
  const resolveLabel = useMemo(
    () => (item: T) => getCardLabel?.(item) ?? getItemId(item),
    [getCardLabel, getItemId],
  );

  return (
    <DragDropProvider>
      <div
        role="group"
        aria-label={ariaLabel}
        className={cn('flex w-full gap-4 overflow-x-auto pb-2', className)}
      >
        {columns.map((col) => {
          const colItems = items.filter((it) => getItemColumn(it) === col.id);
          return (
            <KanbanColumn
              key={col.id}
              column={col}
              items={colItems}
              allItems={items}
              getItemId={getItemId}
              getItemColumn={getItemColumn}
              getItemType={resolveType}
              getCardLabel={resolveLabel}
              renderCard={renderCard}
              renderColumnHeader={renderColumnHeader}
              onItemMove={onItemMove}
              onAddCard={onAddCard}
              allowReorderWithinColumn={allowReorderWithinColumn}
              emptyColumnMessage={emptyColumnMessage}
            />
          );
        })}
      </div>
    </DragDropProvider>
  );
}
