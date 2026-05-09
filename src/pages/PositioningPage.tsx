import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/feedback';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/navigation/ContextMenu';

interface Point {
  x: number;
  y: number;
}

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
function DraggableTooltip({ initial }: { initial: Point }) {
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

function EdgeDropdownGrid() {
  const cells: Array<{
    label: string;
    placement: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  }> = [
    { label: 'Top-left', placement: 'bottom-start' },
    { label: 'Top-right', placement: 'bottom-end' },
    { label: 'Bottom-left', placement: 'top-start' },
    { label: 'Bottom-right', placement: 'top-end' },
  ];

  return (
    <div className="relative grid h-72 grid-cols-2 gap-2 rounded-lg border border-dashed border-border bg-surface-muted/40 p-3">
      {cells.map((cell) => (
        <div key={cell.label} className="flex items-start justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="sm">
                {cell.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side={cell.placement}>
              <DropdownMenuLabel>Resolved side appears in data-side</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}

function ContextMenuArea() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          tabIndex={0}
          role="button"
          aria-label="Right-click anywhere — even at corners"
          className="grid h-48 place-items-center rounded-lg border border-dashed border-border bg-surface-muted/40 text-sm text-foreground-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Right-click anywhere — including the corners — and the menu will clamp to the viewport.
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Open</ContextMenuItem>
        <ContextMenuItem>Duplicate</ContextMenuItem>
        <ContextMenuItem>Rename</ContextMenuItem>
        <ContextMenuItem>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function CustomBoundaryDemo() {
  const boundaryRef = useRef<HTMLDivElement>(null);
  // Stable getter — read inside the hook's effect, never during render.
  const getBoundary = useCallback(() => boundaryRef.current ?? document.body, []);

  return (
    <div
      ref={boundaryRef}
      className="relative h-48 w-full overflow-hidden rounded-lg border border-dashed border-border bg-surface-muted/40 p-3"
    >
      <p className="text-xs text-foreground-subtle">
        Boundary is this dashed box, not the viewport. The dropdown shifts to stay inside.
      </p>
      <div className="absolute right-2 top-10">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline" size="sm" leftIcon={<MoreVertical className="h-4 w-4" />}>
              Bounded menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom-start" boundary={getBoundary} padding={4}>
            <DropdownMenuLabel>Inside the dashed box</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>One</DropdownMenuItem>
            <DropdownMenuItem>Two</DropdownMenuItem>
            <DropdownMenuItem>Three</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function PositioningPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Positioning</h1>
        <p className="mt-1 text-sm text-foreground-subtle">
          Manual verification page for <code>usePosition</code>: flip on placement-axis overflow,
          shift on perpendicular-axis overflow, custom boundaries, and cursor-anchored menus.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Tooltip flip</h2>
        <DraggableTooltip initial={{ x: 50, y: 50 }} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">DropdownMenu near edges</h2>
        <p className="text-sm text-foreground-subtle">
          Open each menu and try scrolling the viewport — placements adapt automatically.
        </p>
        <EdgeDropdownGrid />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">ContextMenu at cursor</h2>
        <ContextMenuArea />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Custom boundary</h2>
        <CustomBoundaryDemo />
      </section>
    </div>
  );
}
