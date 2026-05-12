import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/feedback';
import type { Point } from '../model';

function clampPercent(p: number): number {
  if (p < 0) return 0;
  if (p > 100) return 100;
  return p;
}

/**
 * Draggable trigger inside a relative container. Coords are stored as
 * percentages of the container so they survive resize and look reasonable
 * on different viewports.
 */
export function DraggableTooltip({ initial }: { initial: Point }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Point>(initial);
  const drag = useRef<{ active: boolean; offsetX: number; offsetY: number }>({
    active: false,
    offsetX: 0,
    offsetY: 0,
  });

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    const r = target.getBoundingClientRect();
    drag.current = {
      active: true,
      offsetX: e.clientX - r.left,
      offsetY: e.clientY - r.top,
    };
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag.current.active) return;
    const container = containerRef.current;
    if (container === null) return;
    const c = container.getBoundingClientRect();
    const x = ((e.clientX - drag.current.offsetX - c.left) / c.width) * 100;
    const y = ((e.clientY - drag.current.offsetY - c.top) / c.height) * 100;
    setPos({ x: clampPercent(x), y: clampPercent(y) });
  }, []);

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    drag.current.active = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-72 w-full overflow-hidden rounded-lg border border-dashed border-border bg-surface-muted/40"
    >
      <p className="absolute left-3 top-2 text-xs text-foreground-subtle">
        Drag the button toward an edge — the tooltip flips to stay on screen.
      </p>
      <Tooltip defaultOpen open>
        <TooltipTrigger>
          <button
            type="button"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-md active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Drag me
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">Tooltip stays in view</TooltipContent>
      </Tooltip>
    </div>
  );
}
