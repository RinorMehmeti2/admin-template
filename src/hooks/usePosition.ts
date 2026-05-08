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

export interface UsePositionOptions {
  placement: Placement;
  offset?: number;
  enabled?: boolean;
}

export interface PositionResult {
  x: number;
  y: number;
  ready: boolean;
}

function compute(
  trigger: DOMRect,
  content: DOMRect,
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
  return { x: x + window.scrollX, y: y + window.scrollY };
}

export function usePosition(
  triggerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  options: UsePositionOptions,
): PositionResult {
  const { placement, offset = 8, enabled = true } = options;
  const [pos, setPos] = useState<PositionResult>({ x: 0, y: 0, ready: false });

  useEffect(() => {
    if (!enabled) return;
    const trigger = triggerRef.current;
    const content = contentRef.current;
    if (trigger === null || content === null) return;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const tRect = trigger.getBoundingClientRect();
        const cRect = content.getBoundingClientRect();
        const { x, y } = compute(tRect, cRect, placement, offset);
        setPos({ x, y, ready: true });
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
  }, [enabled, placement, offset, triggerRef, contentRef]);

  return pos;
}
