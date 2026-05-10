import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

export interface DragDelta {
  /** Pixels moved on x since the drag started. */
  dx: number;
  /** Pixels moved on y since the drag started. */
  dy: number;
  /** Current client x. */
  x: number;
  /** Current client y. */
  y: number;
}

export interface UseDragOptions {
  /** Called on every pointer move while dragging. */
  onMove: (delta: DragDelta, event: PointerEvent) => void;
  /** Called once at drag start (pointerdown that captured the pointer). */
  onStart?: (event: ReactPointerEvent<HTMLElement>) => void;
  /** Called once when the drag ends (pointerup or pointercancel). */
  onEnd?: (event: PointerEvent | undefined) => void;
  /** When false, the returned onPointerDown is a no-op. Default true. */
  enabled?: boolean;
}

export interface UseDragReturn {
  isDragging: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
}

/**
 * Pointer-based drag tracker. Uses pointer capture on the originating element
 * so move events keep firing even if the cursor leaves the target. Reports
 * deltas relative to the drag start, not absolute coords — consumers compose
 * those into element positions however they like (clamped to a parent rect,
 * snapped to a grid, etc.).
 *
 * No external deps — we don't pull react-dnd or @dnd-kit.
 */
export function useDrag(options: UseDragOptions): UseDragReturn {
  const { enabled = true } = options;
  const [isDragging, setIsDragging] = useState(false);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const stateRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    target: HTMLElement | null;
  }>({ pointerId: null, startX: 0, startY: 0, target: null });

  const endDrag = useCallback((event: PointerEvent | undefined): void => {
    const s = stateRef.current;
    if (s.pointerId !== null && s.target !== null) {
      try {
        s.target.releasePointerCapture(s.pointerId);
      } catch {
        // Pointer may already be released (e.g. element unmounted).
      }
    }
    stateRef.current = { pointerId: null, startX: 0, startY: 0, target: null };
    setIsDragging(false);
    optionsRef.current.onEnd?.(event);
  }, []);

  const handleWindowMove = useCallback(
    (event: PointerEvent): void => {
      const s = stateRef.current;
      if (s.pointerId === null || event.pointerId !== s.pointerId) return;
      const delta: DragDelta = {
        dx: event.clientX - s.startX,
        dy: event.clientY - s.startY,
        x: event.clientX,
        y: event.clientY,
      };
      optionsRef.current.onMove(delta, event);
    },
    [],
  );

  const handleWindowUp = useCallback(
    (event: PointerEvent): void => {
      const s = stateRef.current;
      if (s.pointerId === null || event.pointerId !== s.pointerId) return;
      endDrag(event);
    },
    [endDrag],
  );

  // Bind window listeners only while dragging. Capture phase so a stopPropagation
  // somewhere downstream can't strand a drag in flight.
  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener('pointermove', handleWindowMove, { capture: true });
    window.addEventListener('pointerup', handleWindowUp, { capture: true });
    window.addEventListener('pointercancel', handleWindowUp, { capture: true });
    return () => {
      window.removeEventListener('pointermove', handleWindowMove, { capture: true });
      window.removeEventListener('pointerup', handleWindowUp, { capture: true });
      window.removeEventListener('pointercancel', handleWindowUp, { capture: true });
    };
  }, [isDragging, handleWindowMove, handleWindowUp]);

  // End any in-flight drag on unmount.
  useEffect(
    () => () => {
      if (stateRef.current.pointerId !== null) endDrag(undefined);
    },
    [endDrag],
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>): void => {
      if (!enabled) return;
      // Only react to primary button / primary pointer.
      if (event.button !== undefined && event.button !== 0) return;
      const target = event.currentTarget;
      try {
        target.setPointerCapture(event.pointerId);
      } catch {
        // Some test envs throw — non-fatal.
      }
      stateRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        target,
      };
      setIsDragging(true);
      optionsRef.current.onStart?.(event);
    },
    [enabled],
  );

  return { isDragging, onPointerDown };
}
