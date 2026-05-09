import { useEffect, useState, type RefObject } from 'react';

export type Placement =
  | 'bottom-start'
  | 'bottom-end'
  | 'bottom'
  | 'top-start'
  | 'top-end'
  | 'top'
  | 'right'
  | 'left';

export type Boundary = 'viewport' | HTMLElement | (() => HTMLElement);

export interface UsePositionOptions {
  placement: Placement;
  offset?: number;
  enabled?: boolean;
  flip?: boolean;
  shift?: boolean;
  padding?: number;
  boundary?: Boundary;
}

export interface PositionResult {
  x: number;
  y: number;
  ready: boolean;
  placement: Placement;
}

interface DocRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

function isVerticalSide(p: Placement): boolean {
  return p.startsWith('top') || p.startsWith('bottom');
}

function flipPlacement(p: Placement): Placement {
  if (p === 'left') return 'right';
  if (p === 'right') return 'left';
  if (p.startsWith('top')) return p.replace('top', 'bottom') as Placement;
  return p.replace('bottom', 'top') as Placement;
}

function compute(
  trigger: DocRect,
  content: DocRect,
  placement: Placement,
  offset: number,
): { x: number; y: number } {
  let x = 0;
  let y = 0;
  switch (placement) {
    case 'bottom-start':
      x = trigger.left;
      y = trigger.bottom + offset;
      break;
    case 'bottom-end':
      x = trigger.right - content.width;
      y = trigger.bottom + offset;
      break;
    case 'bottom':
      x = trigger.left + (trigger.width - content.width) / 2;
      y = trigger.bottom + offset;
      break;
    case 'top-start':
      x = trigger.left;
      y = trigger.top - content.height - offset;
      break;
    case 'top-end':
      x = trigger.right - content.width;
      y = trigger.top - content.height - offset;
      break;
    case 'top':
      x = trigger.left + (trigger.width - content.width) / 2;
      y = trigger.top - content.height - offset;
      break;
    case 'right':
      x = trigger.right + offset;
      y = trigger.top + (trigger.height - content.height) / 2;
      break;
    case 'left':
      x = trigger.left - content.width - offset;
      y = trigger.top + (trigger.height - content.height) / 2;
      break;
  }
  return { x, y };
}

function rectToDoc(rect: DOMRect): DocRect {
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
    right: rect.right + window.scrollX,
    bottom: rect.bottom + window.scrollY,
    width: rect.width,
    height: rect.height,
  };
}

function resolveBoundary(boundary: Boundary): DocRect {
  if (boundary === 'viewport') {
    return {
      left: window.scrollX,
      top: window.scrollY,
      right: window.scrollX + window.innerWidth,
      bottom: window.scrollY + window.innerHeight,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  const el = typeof boundary === 'function' ? boundary() : boundary;
  return rectToDoc(el.getBoundingClientRect());
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Resolve final coords + placement applying flip and shift against a boundary.
 * Pure — exported so other hooks (e.g. cursor-anchored menus) can reuse it.
 */
export function resolvePosition(
  trigger: DocRect,
  content: DocRect,
  boundary: DocRect,
  options: {
    placement: Placement;
    offset: number;
    flip: boolean;
    shift: boolean;
    padding: number;
  },
): { x: number; y: number; placement: Placement } {
  const { placement: requested, offset, flip, shift, padding } = options;
  let placement = requested;
  let { x, y } = compute(trigger, content, placement, offset);

  if (flip) {
    const minX = boundary.left + padding;
    const maxX = boundary.right - padding;
    const minY = boundary.top + padding;
    const maxY = boundary.bottom - padding;

    if (isVerticalSide(placement)) {
      const overflowsTop = y < minY;
      const overflowsBottom = y + content.height > maxY;
      const isBottom = placement.startsWith('bottom');
      const overflowsMain = isBottom ? overflowsBottom : overflowsTop;
      if (overflowsMain) {
        const flipped = flipPlacement(placement);
        const next = compute(trigger, content, flipped, offset);
        const flippedFits = isBottom ? next.y >= minY : next.y + content.height <= maxY;
        // Flip if the opposite side fits, or has strictly more room.
        const currentRoom = isBottom ? maxY - y - content.height : y - minY;
        const oppositeRoom = isBottom ? next.y - minY : maxY - next.y - content.height;
        if (flippedFits || oppositeRoom > currentRoom) {
          placement = flipped;
          x = next.x;
          y = next.y;
        }
      }
    } else {
      const overflowsLeft = x < minX;
      const overflowsRight = x + content.width > maxX;
      const isRight = placement === 'right';
      const overflowsMain = isRight ? overflowsRight : overflowsLeft;
      if (overflowsMain) {
        const flipped = flipPlacement(placement);
        const next = compute(trigger, content, flipped, offset);
        const flippedFits = isRight ? next.x >= minX : next.x + content.width <= maxX;
        const currentRoom = isRight ? maxX - x - content.width : x - minX;
        const oppositeRoom = isRight ? next.x - minX : maxX - next.x - content.width;
        if (flippedFits || oppositeRoom > currentRoom) {
          placement = flipped;
          x = next.x;
          y = next.y;
        }
      }
    }
  }

  if (shift) {
    const minX = boundary.left + padding;
    const maxX = boundary.right - padding - content.width;
    const minY = boundary.top + padding;
    const maxY = boundary.bottom - padding - content.height;
    if (isVerticalSide(placement)) {
      x = clamp(x, minX, maxX);
    } else {
      y = clamp(y, minY, maxY);
    }
  }

  return { x, y, placement };
}

export function usePosition(
  triggerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  options: UsePositionOptions,
): PositionResult {
  const {
    placement,
    offset = 8,
    enabled = true,
    flip = true,
    shift = true,
    padding = 8,
    boundary = 'viewport',
  } = options;
  const [pos, setPos] = useState<PositionResult>({
    x: 0,
    y: 0,
    ready: false,
    placement,
  });

  useEffect(() => {
    if (!enabled) return;
    const trigger = triggerRef.current;
    const content = contentRef.current;
    if (trigger === null || content === null) return;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const tRect = rectToDoc(trigger.getBoundingClientRect());
        const cRect = rectToDoc(content.getBoundingClientRect());
        const bRect = resolveBoundary(boundary);
        const resolved = resolvePosition(tRect, cRect, bRect, {
          placement,
          offset,
          flip,
          shift,
          padding,
        });
        setPos({ ...resolved, ready: true });
      });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [enabled, placement, offset, flip, shift, padding, boundary, triggerRef, contentRef]);

  return pos;
}

/**
 * Position content relative to a fixed point (e.g., cursor coords from a
 * contextmenu event). Coords must be in document space (clientX + scrollX).
 * Reuses flip/shift logic by treating the point as a 1x1 virtual trigger.
 */
export interface UsePositionAtPointOptions {
  point: { x: number; y: number };
  enabled?: boolean;
  placement?: Placement;
  offset?: number;
  flip?: boolean;
  shift?: boolean;
  padding?: number;
  boundary?: Boundary;
}

export function usePositionAtPoint(
  contentRef: RefObject<HTMLElement | null>,
  options: UsePositionAtPointOptions,
): PositionResult {
  const {
    point,
    enabled = true,
    placement = 'bottom-start',
    offset = 0,
    flip = true,
    shift = true,
    padding = 8,
    boundary = 'viewport',
  } = options;
  const [pos, setPos] = useState<PositionResult>({
    x: point.x,
    y: point.y,
    ready: false,
    placement,
  });

  useEffect(() => {
    if (!enabled) return;
    const content = contentRef.current;
    if (content === null) return;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cRect = rectToDoc(content.getBoundingClientRect());
        const tRect: DocRect = {
          left: point.x,
          top: point.y,
          right: point.x,
          bottom: point.y,
          width: 0,
          height: 0,
        };
        const bRect = resolveBoundary(boundary);
        const resolved = resolvePosition(tRect, cRect, bRect, {
          placement,
          offset,
          flip,
          shift,
          padding,
        });
        setPos({ ...resolved, ready: true });
      });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [enabled, point.x, point.y, placement, offset, flip, shift, padding, boundary, contentRef]);

  return pos;
}
