import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { Portal } from '@/components/overlays/Portal';
import { useDrag } from './useDrag';
import { useEscapeKey } from './useEscapeKey';

/*
 * Pointer + keyboard drag-and-drop coordinator.
 *
 * Composes the existing pointer-only `useDrag` for the mouse/pen path and
 * layers a WAI-ARIA APG keyboard model on top (Space to pick up, Arrow keys
 * to cycle drop targets / slots, Enter to drop, Escape to cancel).
 *
 * Targets register themselves; the provider hit-tests pointer coords against
 * each target's bounding rect (deepest-wins) instead of relying on
 * elementFromPoint, so it works in jsdom and through pointer-events:none
 * overlays.
 *
 * For ordered insertion (Kanban column → between-card slots), a target
 * exposes `getSlotCount()` and `resolvePointerSlot(localX, localY)`.
 *
 * Re-render note: `state` updates on enter/leave/slot-change/start/end,
 * NOT on every pointer move. Consumers needing the live pointer position
 * (e.g. a follow-cursor overlay) can subscribe via `useDragPointer()`.
 */

export type DropAccept = string | ReadonlyArray<string> | ((type: string) => boolean);

export interface DragSource<TData = unknown> {
  id: string;
  type: string;
  data: TData;
}

export interface DragEventInfo<TData = unknown> {
  source: DragSource<TData>;
  targetId: string;
  slotIndex: number;
  pointer: { x: number; y: number } | null;
  mode: 'pointer' | 'keyboard';
}

export interface DragState<TData = unknown> {
  source: DragSource<TData>;
  mode: 'pointer' | 'keyboard';
  overTargetId: string | null;
  overSlotIndex: number | null;
}

interface SourceDef {
  id: string;
  type: string;
  getData: () => unknown;
  getElement: () => HTMLElement | null;
  getDisabled: () => boolean;
  getLabel: () => string;
}

interface TargetDef {
  id: string;
  getAccept: () => DropAccept;
  getElement: () => HTMLElement | null;
  getDisabled: () => boolean;
  getSlotCount: () => number;
  resolvePointerSlot: (localX: number, localY: number) => number;
  getLabel: () => string;
  onDragEnter?: (event: DragEventInfo) => void;
  onDragLeave?: (event: DragEventInfo) => void;
  onDragOver?: (event: DragEventInfo) => void;
  onDrop?: (event: DragEventInfo) => void;
}

export type AnnouncementEvent =
  | { kind: 'pickup'; sourceLabel: string }
  | { kind: 'over'; sourceLabel: string; targetLabel: string; slotIndex: number }
  | { kind: 'drop'; sourceLabel: string; targetLabel: string; slotIndex: number }
  | { kind: 'cancel'; sourceLabel: string };

function defaultAnnounce(event: AnnouncementEvent): string {
  switch (event.kind) {
    case 'pickup':
      return `Picked up ${event.sourceLabel}.`;
    case 'over':
      return `Over ${event.targetLabel}, position ${event.slotIndex + 1}.`;
    case 'drop':
      return `Dropped ${event.sourceLabel} on ${event.targetLabel} at position ${event.slotIndex + 1}.`;
    case 'cancel':
      return `Cancelled drag of ${event.sourceLabel}.`;
  }
}

function matchesAccept(accept: DropAccept, type: string): boolean {
  if (typeof accept === 'function') return accept(type);
  if (typeof accept === 'string') return accept === type;
  return accept.includes(type);
}

interface DragDropContextValue {
  state: DragState | null;
  registerSource: (def: SourceDef) => () => void;
  registerTarget: (def: TargetDef) => () => void;
  startPointerDrag: (sourceId: string, pointer: { x: number; y: number }) => void;
  updatePointer: (pointer: { x: number; y: number }) => void;
  endPointerDrag: (pointer: { x: number; y: number }) => void;
  startKeyboardDrag: (sourceId: string) => void;
  keyboardMove: (direction: 'prev' | 'next' | 'prevTarget' | 'nextTarget') => void;
  keyboardDrop: () => void;
  cancelDrag: () => void;
  pointerRef: RefObject<{ x: number; y: number } | null>;
}

const DragDropContext = createContext<DragDropContextValue | null>(null);

function useDragDropCtx(): DragDropContextValue {
  const ctx = useContext(DragDropContext);
  if (ctx === null) {
    throw new Error('useDraggable / useDropTarget must be used inside <DragDropProvider>');
  }
  return ctx;
}

/** Read the current global drag state (re-renders on identity / target / slot changes). */
export function useDragDropState<TData = unknown>(): DragState<TData> | null {
  return useDragDropCtx().state as DragState<TData> | null;
}

export interface DragDropProviderProps {
  children: ReactNode;
  /** Scroll container for autoscroll. Default: document.scrollingElement. */
  scrollContainerRef?: RefObject<HTMLElement | null>;
  /** Edge distance (px) at which autoscroll kicks in. Default 48. */
  autoscrollThreshold?: number;
  /** Max scroll speed (px / frame). Default 16. */
  autoscrollSpeed?: number;
  /** Override default screen-reader announcements. */
  announce?: (event: AnnouncementEvent) => string;
}

export function DragDropProvider({
  children,
  scrollContainerRef,
  autoscrollThreshold = 48,
  autoscrollSpeed = 16,
  announce,
}: DragDropProviderProps): JSX.Element {
  const [state, setStateRaw] = useState<DragState | null>(null);
  const stateRef = useRef<DragState | null>(null);
  // Keep ref in sync with state SYNCHRONOUSLY — multiple coordinator calls
  // can fire inside a single event handler (start → updatePointer), and we
  // need each one to read the latest dispatched state without waiting for a
  // commit-phase effect to run.
  const setState = useCallback((next: DragState | null) => {
    stateRef.current = next;
    setStateRaw(next);
  }, []);

  const sourcesRef = useRef<Map<string, SourceDef>>(new Map());
  const targetsRef = useRef<Map<string, TargetDef>>(new Map());
  const pointerRef = useRef<{ x: number; y: number } | null>(null);

  const announceRef = useRef(announce ?? defaultAnnounce);
  useEffect(() => {
    announceRef.current = announce ?? defaultAnnounce;
  });

  const [liveMessage, setLiveMessage] = useState('');
  const emit = useCallback((event: AnnouncementEvent) => {
    setLiveMessage(announceRef.current(event));
  }, []);

  const registerSource = useCallback((def: SourceDef) => {
    sourcesRef.current.set(def.id, def);
    return () => {
      sourcesRef.current.delete(def.id);
    };
  }, []);

  const registerTarget = useCallback((def: TargetDef) => {
    targetsRef.current.set(def.id, def);
    return () => {
      targetsRef.current.delete(def.id);
    };
  }, []);

  /** Targets in document order, filtered by enabled + accept. */
  const getOrderedTargets = useCallback((sourceType: string): TargetDef[] => {
    const arr = Array.from(targetsRef.current.values()).filter((t) => {
      if (t.getDisabled()) return false;
      if (!matchesAccept(t.getAccept(), sourceType)) return false;
      return t.getElement() !== null;
    });
    arr.sort((a, b) => {
      const ae = a.getElement();
      const be = b.getElement();
      if (ae === null || be === null) return 0;
      const pos = ae.compareDocumentPosition(be);
      if ((pos & Node.DOCUMENT_POSITION_FOLLOWING) !== 0) return -1;
      if ((pos & Node.DOCUMENT_POSITION_PRECEDING) !== 0) return 1;
      return 0;
    });
    return arr;
  }, []);

  /** Deepest accepting target whose bounding rect contains the point. */
  const findTargetAtPoint = useCallback(
    (x: number, y: number, sourceType: string): TargetDef | null => {
      const candidates = Array.from(targetsRef.current.values()).filter((t) => {
        if (t.getDisabled()) return false;
        if (!matchesAccept(t.getAccept(), sourceType)) return false;
        const el = t.getElement();
        if (el === null) return false;
        const r = el.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      });
      if (candidates.length === 0) return null;
      candidates.sort((a, b) => {
        const ae = a.getElement();
        const be = b.getElement();
        if (ae === null || be === null) return 0;
        if (be.contains(ae)) return -1; // a is deeper
        if (ae.contains(be)) return 1; // b is deeper
        return 0;
      });
      return candidates[0] ?? null;
    },
    [],
  );

  const startPointerDrag = useCallback(
    (sourceId: string, pointer: { x: number; y: number }) => {
      const source = sourcesRef.current.get(sourceId);
      if (source === undefined || source.getDisabled()) return;
      pointerRef.current = pointer;
      const next: DragState = {
        source: { id: source.id, type: source.type, data: source.getData() },
        mode: 'pointer',
        overTargetId: null,
        overSlotIndex: null,
      };
      setState(next);
      emit({ kind: 'pickup', sourceLabel: source.getLabel() });
    },
    [emit],
  );

  const updatePointer = useCallback(
    (pointer: { x: number; y: number }) => {
      pointerRef.current = pointer;
      const s = stateRef.current;
      if (s === null || s.mode !== 'pointer') return;
      const target = findTargetAtPoint(pointer.x, pointer.y, s.source.type);
      const prevTargetId = s.overTargetId;
      let slotIndex = 0;
      if (target !== null) {
        const el = target.getElement();
        if (el !== null) {
          const r = el.getBoundingClientRect();
          slotIndex = target.resolvePointerSlot(pointer.x - r.left, pointer.y - r.top);
        }
      }
      const nextOverId = target !== null ? target.id : null;
      const nextOverSlot = target !== null ? slotIndex : null;

      if (prevTargetId !== nextOverId) {
        if (prevTargetId !== null) {
          const prev = targetsRef.current.get(prevTargetId);
          prev?.onDragLeave?.({
            source: s.source,
            targetId: prevTargetId,
            slotIndex: s.overSlotIndex ?? 0,
            pointer,
            mode: 'pointer',
          });
        }
        if (target !== null && nextOverSlot !== null) {
          target.onDragEnter?.({
            source: s.source,
            targetId: target.id,
            slotIndex: nextOverSlot,
            pointer,
            mode: 'pointer',
          });
          const src = sourcesRef.current.get(s.source.id);
          emit({
            kind: 'over',
            sourceLabel: src?.getLabel() ?? '',
            targetLabel: target.getLabel(),
            slotIndex: nextOverSlot,
          });
        }
        setState({ ...s, overTargetId: nextOverId, overSlotIndex: nextOverSlot });
        return;
      }

      if (target !== null && nextOverSlot !== null && nextOverSlot !== s.overSlotIndex) {
        target.onDragOver?.({
          source: s.source,
          targetId: target.id,
          slotIndex: nextOverSlot,
          pointer,
          mode: 'pointer',
        });
        setState({ ...s, overSlotIndex: nextOverSlot });
      }
    },
    [findTargetAtPoint, emit],
  );

  const endPointerDrag = useCallback(
    (pointer: { x: number; y: number }) => {
      const s = stateRef.current;
      if (s === null) return;
      const src = sourcesRef.current.get(s.source.id);
      if (s.overTargetId !== null && s.overSlotIndex !== null) {
        const target = targetsRef.current.get(s.overTargetId);
        if (target !== undefined && !target.getDisabled()) {
          target.onDrop?.({
            source: s.source,
            targetId: target.id,
            slotIndex: s.overSlotIndex,
            pointer,
            mode: 'pointer',
          });
          emit({
            kind: 'drop',
            sourceLabel: src?.getLabel() ?? '',
            targetLabel: target.getLabel(),
            slotIndex: s.overSlotIndex,
          });
          setState(null);
          pointerRef.current = null;
          return;
        }
      }
      emit({ kind: 'cancel', sourceLabel: src?.getLabel() ?? '' });
      setState(null);
      pointerRef.current = null;
    },
    [emit],
  );

  const startKeyboardDrag = useCallback(
    (sourceId: string) => {
      const source = sourcesRef.current.get(sourceId);
      if (source === undefined || source.getDisabled()) return;
      const ordered = getOrderedTargets(source.type);
      const first = ordered[0];
      const next: DragState = {
        source: { id: source.id, type: source.type, data: source.getData() },
        mode: 'keyboard',
        overTargetId: first?.id ?? null,
        overSlotIndex: first !== undefined ? 0 : null,
      };
      setState(next);
      emit({ kind: 'pickup', sourceLabel: source.getLabel() });
      if (first !== undefined) {
        first.onDragEnter?.({
          source: next.source,
          targetId: first.id,
          slotIndex: 0,
          pointer: null,
          mode: 'keyboard',
        });
        emit({
          kind: 'over',
          sourceLabel: source.getLabel(),
          targetLabel: first.getLabel(),
          slotIndex: 0,
        });
      }
    },
    [getOrderedTargets, emit],
  );

  const keyboardMove = useCallback(
    (direction: 'prev' | 'next' | 'prevTarget' | 'nextTarget') => {
      const s = stateRef.current;
      if (s === null || s.mode !== 'keyboard') return;
      const ordered = getOrderedTargets(s.source.type);
      if (ordered.length === 0) return;

      const currentIdx = s.overTargetId !== null
        ? ordered.findIndex((t) => t.id === s.overTargetId)
        : -1;
      const current = currentIdx >= 0 ? ordered[currentIdx] : undefined;

      let nextTargetIdx = currentIdx >= 0 ? currentIdx : 0;
      let nextSlot = s.overSlotIndex ?? 0;

      if (direction === 'nextTarget') {
        nextTargetIdx = Math.min(nextTargetIdx + 1, ordered.length - 1);
        nextSlot = 0;
      } else if (direction === 'prevTarget') {
        nextTargetIdx = Math.max(nextTargetIdx - 1, 0);
        nextSlot = 0;
      } else if (direction === 'next') {
        const slotCount = current !== undefined ? current.getSlotCount() : 1;
        if (nextSlot + 1 < slotCount) {
          nextSlot += 1;
        } else if (nextTargetIdx + 1 < ordered.length) {
          nextTargetIdx += 1;
          nextSlot = 0;
        }
      } else {
        if (nextSlot > 0) {
          nextSlot -= 1;
        } else if (nextTargetIdx > 0) {
          nextTargetIdx -= 1;
          const newCount = ordered[nextTargetIdx]?.getSlotCount() ?? 1;
          nextSlot = Math.max(newCount - 1, 0);
        }
      }

      const nextTarget = ordered[nextTargetIdx];
      if (nextTarget === undefined) return;

      if (nextTarget.id !== s.overTargetId) {
        if (s.overTargetId !== null) {
          const prev = targetsRef.current.get(s.overTargetId);
          prev?.onDragLeave?.({
            source: s.source,
            targetId: s.overTargetId,
            slotIndex: s.overSlotIndex ?? 0,
            pointer: null,
            mode: 'keyboard',
          });
        }
        nextTarget.onDragEnter?.({
          source: s.source,
          targetId: nextTarget.id,
          slotIndex: nextSlot,
          pointer: null,
          mode: 'keyboard',
        });
      } else if (nextSlot !== s.overSlotIndex) {
        nextTarget.onDragOver?.({
          source: s.source,
          targetId: nextTarget.id,
          slotIndex: nextSlot,
          pointer: null,
          mode: 'keyboard',
        });
      } else {
        return; // no change
      }

      setState({ ...s, overTargetId: nextTarget.id, overSlotIndex: nextSlot });
      const src = sourcesRef.current.get(s.source.id);
      emit({
        kind: 'over',
        sourceLabel: src?.getLabel() ?? '',
        targetLabel: nextTarget.getLabel(),
        slotIndex: nextSlot,
      });
    },
    [getOrderedTargets, emit],
  );

  const keyboardDrop = useCallback(() => {
    const s = stateRef.current;
    if (s === null || s.mode !== 'keyboard') return;
    const src = sourcesRef.current.get(s.source.id);
    if (s.overTargetId !== null && s.overSlotIndex !== null) {
      const target = targetsRef.current.get(s.overTargetId);
      if (target !== undefined && !target.getDisabled()) {
        target.onDrop?.({
          source: s.source,
          targetId: target.id,
          slotIndex: s.overSlotIndex,
          pointer: null,
          mode: 'keyboard',
        });
        emit({
          kind: 'drop',
          sourceLabel: src?.getLabel() ?? '',
          targetLabel: target.getLabel(),
          slotIndex: s.overSlotIndex,
        });
        setState(null);
        // Return focus to source after commit.
        if (src !== undefined) {
          queueMicrotask(() => {
            const el = src.getElement();
            if (el !== null) el.focus();
          });
        }
        return;
      }
    }
    emit({ kind: 'cancel', sourceLabel: src?.getLabel() ?? '' });
    setState(null);
  }, [emit]);

  const cancelDrag = useCallback(() => {
    const s = stateRef.current;
    if (s === null) return;
    const src = sourcesRef.current.get(s.source.id);
    if (s.overTargetId !== null) {
      const target = targetsRef.current.get(s.overTargetId);
      target?.onDragLeave?.({
        source: s.source,
        targetId: s.overTargetId,
        slotIndex: s.overSlotIndex ?? 0,
        pointer: pointerRef.current,
        mode: s.mode,
      });
    }
    emit({ kind: 'cancel', sourceLabel: src?.getLabel() ?? '' });
    const wasKeyboard = s.mode === 'keyboard';
    setState(null);
    pointerRef.current = null;
    if (wasKeyboard && src !== undefined) {
      queueMicrotask(() => {
        const el = src.getElement();
        if (el !== null) el.focus();
      });
    }
  }, [emit]);

  useEscapeKey(() => cancelDrag(), { enabled: state !== null });

  // Autoscroll loop while pointer dragging near edges. rAF-based so a
  // stationary cursor near the edge keeps scrolling.
  useEffect(() => {
    if (state === null || state.mode !== 'pointer') return;
    let raf = 0;
    const step = (): void => {
      const pt = pointerRef.current;
      if (pt !== null) {
        const container: HTMLElement | null =
          scrollContainerRef?.current ??
          (typeof document !== 'undefined'
            ? (document.scrollingElement as HTMLElement | null)
            : null);
        if (container !== null) {
          let rect: { left: number; top: number; right: number; bottom: number };
          if (container === document.scrollingElement) {
            rect = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
          } else {
            rect = container.getBoundingClientRect();
          }
          let dx = 0;
          let dy = 0;
          const t = autoscrollThreshold;
          if (pt.x < rect.left + t) dx = -autoscrollSpeed;
          else if (pt.x > rect.right - t) dx = autoscrollSpeed;
          if (pt.y < rect.top + t) dy = -autoscrollSpeed;
          else if (pt.y > rect.bottom - t) dy = autoscrollSpeed;
          if (dx !== 0 || dy !== 0) {
            container.scrollBy(dx, dy);
            // Re-run hit-test since rects shifted relative to pointer.
            updatePointer(pt);
          }
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [state, scrollContainerRef, autoscrollThreshold, autoscrollSpeed, updatePointer]);

  const value = useMemo<DragDropContextValue>(
    () => ({
      state,
      registerSource,
      registerTarget,
      startPointerDrag,
      updatePointer,
      endPointerDrag,
      startKeyboardDrag,
      keyboardMove,
      keyboardDrop,
      cancelDrag,
      pointerRef,
    }),
    [
      state,
      registerSource,
      registerTarget,
      startPointerDrag,
      updatePointer,
      endPointerDrag,
      startKeyboardDrag,
      keyboardMove,
      keyboardDrop,
      cancelDrag,
    ],
  );

  return (
    <DragDropContext.Provider value={value}>
      {children}
      <Portal>
        <div
          role="status"
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
          data-dnd-live-region=""
        >
          {liveMessage}
        </div>
      </Portal>
    </DragDropContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  useDraggable                                                              */
/* -------------------------------------------------------------------------- */

export interface UseDraggableOptions<TData = unknown> {
  id: string;
  type: string;
  data: TData;
  disabled?: boolean;
  /** Used in SR announcements. Defaults to `id`. */
  label?: string;
  /** Disable Space-to-pick-up keyboard activation. Default false. */
  disableKeyboard?: boolean;
  /** Minimum pointer travel (px) before a drag begins. Default 4. */
  activationDistance?: number;
}

export interface UseDraggableReturn {
  isDragging: boolean;
  dragMode: 'pointer' | 'keyboard' | null;
  handleProps: {
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
    onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
    'aria-grabbed': boolean | undefined;
    'aria-roledescription': string;
    tabIndex: number;
    'data-draggable-id': string;
    'data-dragging': boolean | undefined;
  };
}

export function useDraggable<TData = unknown>(
  ref: RefObject<HTMLElement | null>,
  options: UseDraggableOptions<TData>,
): UseDraggableReturn {
  const ctx = useDragDropCtx();
  const { id, type } = options;

  const optsRef = useRef(options);
  useEffect(() => {
    optsRef.current = options;
  });

  useEffect(() => {
    return ctx.registerSource({
      id,
      type,
      getData: () => optsRef.current.data,
      getElement: () => ref.current,
      getDisabled: () => optsRef.current.disabled === true,
      getLabel: () => optsRef.current.label ?? id,
    });
  }, [ctx, id, type, ref]);

  const startedRef = useRef(false);

  const drag = useDrag({
    enabled: options.disabled !== true,
    onStart: () => {
      startedRef.current = false;
    },
    onMove: (delta, event) => {
      const threshold = optsRef.current.activationDistance ?? 4;
      if (!startedRef.current) {
        if (Math.hypot(delta.dx, delta.dy) < threshold) return;
        startedRef.current = true;
        ctx.startPointerDrag(id, { x: event.clientX, y: event.clientY });
      }
      ctx.updatePointer({ x: event.clientX, y: event.clientY });
    },
    onEnd: (event) => {
      if (!startedRef.current) return; // click, not drag
      startedRef.current = false;
      if (event === undefined || event.type === 'pointercancel') {
        ctx.cancelDrag();
        return;
      }
      ctx.endPointerDrag({ x: event.clientX, y: event.clientY });
    },
  });

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      if (optsRef.current.disabled === true || optsRef.current.disableKeyboard === true) return;
      const s = ctx.state;
      const inKeyboardDrag = s !== null && s.mode === 'keyboard' && s.source.id === id;

      if (!inKeyboardDrag) {
        if (e.key === ' ') {
          e.preventDefault();
          ctx.startKeyboardDrag(id);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          ctx.keyboardMove('next');
          return;
        case 'ArrowUp':
          e.preventDefault();
          ctx.keyboardMove('prev');
          return;
        case 'ArrowRight':
          e.preventDefault();
          ctx.keyboardMove('nextTarget');
          return;
        case 'ArrowLeft':
          e.preventDefault();
          ctx.keyboardMove('prevTarget');
          return;
        case 'Enter':
        case ' ':
          e.preventDefault();
          ctx.keyboardDrop();
          return;
        // Escape handled globally by provider's useEscapeKey
      }
    },
    [ctx, id],
  );

  const isDragging = ctx.state !== null && ctx.state.source.id === id;
  const dragMode = isDragging ? (ctx.state as DragState).mode : null;

  return {
    isDragging,
    dragMode,
    handleProps: {
      onPointerDown: drag.onPointerDown,
      onKeyDown,
      'aria-grabbed': ctx.state !== null ? isDragging : undefined,
      'aria-roledescription': 'draggable',
      tabIndex: options.disabled === true ? -1 : 0,
      'data-draggable-id': id,
      'data-dragging': isDragging || undefined,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  useDropTarget                                                             */
/* -------------------------------------------------------------------------- */

export interface UseDropTargetOptions {
  id: string;
  accept: DropAccept;
  disabled?: boolean;
  /** Used in SR announcements. Defaults to `id`. */
  label?: string;
  /** Number of insert positions inside this target (ordered targets). Default 1. */
  getSlotCount?: () => number;
  /**
   * Map a pointer position (local to the target's bounding rect) to a slot
   * index. Default returns 0. For a vertical column with N cards, return
   * 0..N where each integer is the gap above the matching card and N is the
   * "end of list" gap.
   */
  resolvePointerSlot?: (localX: number, localY: number) => number;
  onDragEnter?: (event: DragEventInfo) => void;
  onDragLeave?: (event: DragEventInfo) => void;
  onDragOver?: (event: DragEventInfo) => void;
  onDrop?: (event: DragEventInfo) => void;
}

export interface UseDropTargetReturn {
  isOver: boolean;
  canDrop: boolean;
  overSlotIndex: number | null;
  targetProps: {
    'data-drop-target-id': string;
    'data-drop-over': true | undefined;
    'data-drop-can': true | undefined;
  };
}

export function useDropTarget(
  ref: RefObject<HTMLElement | null>,
  options: UseDropTargetOptions,
): UseDropTargetReturn {
  const ctx = useDragDropCtx();
  const { id } = options;

  const optsRef = useRef(options);
  useEffect(() => {
    optsRef.current = options;
  });

  useEffect(() => {
    return ctx.registerTarget({
      id,
      getAccept: () => optsRef.current.accept,
      getElement: () => ref.current,
      getDisabled: () => optsRef.current.disabled === true,
      getSlotCount: () => optsRef.current.getSlotCount?.() ?? 1,
      resolvePointerSlot: (x, y) => optsRef.current.resolvePointerSlot?.(x, y) ?? 0,
      getLabel: () => optsRef.current.label ?? id,
      onDragEnter: (ev) => optsRef.current.onDragEnter?.(ev),
      onDragLeave: (ev) => optsRef.current.onDragLeave?.(ev),
      onDragOver: (ev) => optsRef.current.onDragOver?.(ev),
      onDrop: (ev) => optsRef.current.onDrop?.(ev),
    });
  }, [ctx, id, ref]);

  const isOver = ctx.state?.overTargetId === id;
  const canDrop =
    ctx.state !== null &&
    !(options.disabled === true) &&
    matchesAccept(options.accept, ctx.state.source.type);

  return {
    isOver,
    canDrop,
    overSlotIndex: isOver ? (ctx.state as DragState).overSlotIndex : null,
    targetProps: {
      'data-drop-target-id': id,
      'data-drop-over': isOver ? true : undefined,
      'data-drop-can': canDrop ? true : undefined,
    },
  };
}
