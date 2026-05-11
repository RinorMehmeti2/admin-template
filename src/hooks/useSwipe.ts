import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

/*
 * Pointer-driven swipe gesture. Tracks the active pointer via setPointerCapture
 * so move events keep firing after the cursor leaves the originating element.
 * Locks to an axis once the pointer crosses `lockThreshold`, then fires a
 * directional `onSwipe` if `dismissThreshold` or `velocityThreshold` is
 * exceeded by pointer release.
 *
 * No external deps. Composed by BottomSheet (axis='y') and Toast
 * (axis='x', touchOnly).
 */

export type SwipeAxis = 'x' | 'y' | 'both';
export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

export interface SwipeState {
  dx: number;
  dy: number;
  axis: 'x' | 'y' | null;
}

export interface UseSwipeOptions {
  axis?: SwipeAxis;
  /** Pixels travelled before isSwiping flips true and axis locks. Default 6. */
  lockThreshold?: number;
  /** Pixels past start needed for onSwipe to fire on release. Default 60. */
  dismissThreshold?: number;
  /** px/s velocity that also triggers onSwipe regardless of distance. Default 600. */
  velocityThreshold?: number;
  /** Limit to touch / coarse pointers. Default false. */
  touchOnly?: boolean;
  enabled?: boolean;
  onSwipeStart?: () => void;
  onSwipeMove?: (state: SwipeState) => void;
  onSwipe?: (direction: SwipeDirection, state: SwipeState) => void;
  /** Always fires on release; `committed` is true if onSwipe also fired. */
  onSwipeEnd?: (committed: boolean, state: SwipeState) => void;
}

export interface UseSwipeReturn {
  isSwiping: boolean;
  axis: 'x' | 'y' | null;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
}

function isCoarsePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

export function useSwipe(options: UseSwipeOptions = {}): UseSwipeReturn {
  const {
    axis: axisOpt = 'both',
    lockThreshold = 6,
    dismissThreshold = 60,
    velocityThreshold = 600,
    touchOnly = false,
    enabled = true,
  } = options;

  const optsRef = useRef(options);
  useEffect(() => {
    optsRef.current = options;
  });

  const [armed, setArmed] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [lockedAxis, setLockedAxis] = useState<'x' | 'y' | null>(null);

  const stateRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    startTime: number;
    target: HTMLElement | null;
    axis: 'x' | 'y' | null;
  }>({
    pointerId: null,
    startX: 0,
    startY: 0,
    startTime: 0,
    target: null,
    axis: null,
  });

  const reset = useCallback((committed: boolean, state: SwipeState) => {
    const s = stateRef.current;
    if (s.pointerId !== null && s.target !== null) {
      try {
        s.target.releasePointerCapture(s.pointerId);
      } catch {
        /* noop */
      }
    }
    stateRef.current = {
      pointerId: null,
      startX: 0,
      startY: 0,
      startTime: 0,
      target: null,
      axis: null,
    };
    setArmed(false);
    setIsSwiping(false);
    setLockedAxis(null);
    optsRef.current.onSwipeEnd?.(committed, state);
  }, []);

  useEffect(() => {
    if (!armed) return;

    const handleMove = (event: PointerEvent) => {
      const s = stateRef.current;
      if (s.pointerId === null || event.pointerId !== s.pointerId) return;
      const dx = event.clientX - s.startX;
      const dy = event.clientY - s.startY;

      if (s.axis === null) {
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        if (absX < lockThreshold && absY < lockThreshold) return;
        let locked: 'x' | 'y' = absX > absY ? 'x' : 'y';
        if (axisOpt === 'x') locked = 'x';
        else if (axisOpt === 'y') locked = 'y';
        if (axisOpt !== 'both' && locked !== axisOpt) return;
        s.axis = locked;
        setLockedAxis(locked);
        setIsSwiping(true);
        optsRef.current.onSwipeStart?.();
      }

      optsRef.current.onSwipeMove?.({ dx, dy, axis: s.axis });
    };

    const handleUp = (event: PointerEvent) => {
      const s = stateRef.current;
      if (s.pointerId === null || event.pointerId !== s.pointerId) return;
      const dx = event.clientX - s.startX;
      const dy = event.clientY - s.startY;
      const elapsed = Math.max(1, (event.timeStamp || performance.now()) - s.startTime);
      const state: SwipeState = { dx, dy, axis: s.axis };

      let committed = false;
      if (s.axis !== null) {
        const distance = s.axis === 'x' ? Math.abs(dx) : Math.abs(dy);
        const velocity = (distance / elapsed) * 1000;
        if (distance >= dismissThreshold || velocity >= velocityThreshold) {
          const direction: SwipeDirection =
            s.axis === 'x' ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
          optsRef.current.onSwipe?.(direction, state);
          committed = true;
        }
      }
      reset(committed, state);
    };

    const handleCancel = (event: PointerEvent) => {
      const s = stateRef.current;
      if (s.pointerId === null || event.pointerId !== s.pointerId) return;
      reset(false, { dx: 0, dy: 0, axis: s.axis });
    };

    window.addEventListener('pointermove', handleMove, { capture: true });
    window.addEventListener('pointerup', handleUp, { capture: true });
    window.addEventListener('pointercancel', handleCancel, { capture: true });
    return () => {
      window.removeEventListener('pointermove', handleMove, { capture: true });
      window.removeEventListener('pointerup', handleUp, { capture: true });
      window.removeEventListener('pointercancel', handleCancel, { capture: true });
    };
  }, [armed, axisOpt, lockThreshold, dismissThreshold, velocityThreshold, reset]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled) return;
      if (touchOnly && event.pointerType !== 'touch' && !isCoarsePointer()) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const target = event.currentTarget;
      try {
        target.setPointerCapture(event.pointerId);
      } catch {
        /* noop */
      }
      const now = event.timeStamp || performance.now();
      stateRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startTime: now,
        target,
        axis: null,
      };
      setArmed(true);
    },
    [enabled, touchOnly],
  );

  return { isSwiping, axis: lockedAxis, onPointerDown };
}
