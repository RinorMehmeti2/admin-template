import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { ChevronDown, ChevronUp, GripHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useDrag } from '@/hooks/useDrag';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import { IconButton } from '@/components/primitives/IconButton';

/* -------------------------------------------------------------------------- */
/*  Canvas context — panels read the canvas rect from here to clamp           */
/* -------------------------------------------------------------------------- */

interface WorkspaceCanvasContextValue {
  canvasRef: RefObject<HTMLDivElement | null>;
}

const WorkspaceCanvasContext = createContext<WorkspaceCanvasContextValue | null>(null);

function useWorkspaceCanvas(): WorkspaceCanvasContextValue {
  const ctx = useContext(WorkspaceCanvasContext);
  if (ctx === null) {
    throw new Error('<WorkspacePanel> must be a descendant of <WorkspaceCanvas>');
  }
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*  FullscreenWorkspace                                                        */
/* -------------------------------------------------------------------------- */

export interface FullscreenWorkspaceProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

/**
 * Root of a true full-viewport canvas. Owns no chrome — consumers decide
 * what (if any) header / status bar to render. Establishes a flex column so
 * an optional `<header>` sibling sits above the canvas, and the canvas itself
 * fills the remaining space.
 */
export function FullscreenWorkspace({
  ref,
  className,
  children,
  ...rest
}: FullscreenWorkspaceProps) {
  return (
    <div
      ref={ref}
      className={cn('fixed inset-0 z-30 flex flex-col bg-background text-foreground', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  WorkspaceCanvas                                                            */
/* -------------------------------------------------------------------------- */

export interface WorkspaceCanvasProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

/**
 * The drawable area. Establishes `position: relative` so floating
 * `<WorkspacePanel>` children position relative to it, and exposes its ref
 * via context so those panels can clamp their position to the canvas rect.
 */
export function WorkspaceCanvas({ ref, className, children, ...rest }: WorkspaceCanvasProps) {
  const internal = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs<HTMLDivElement>(internal, ref);
  const value = useMemo<WorkspaceCanvasContextValue>(() => ({ canvasRef: internal }), []);

  return (
    <WorkspaceCanvasContext.Provider value={value}>
      <div
        ref={merged}
        className={cn('relative min-h-0 flex-1 overflow-hidden bg-surface-muted/40', className)}
        {...rest}
      >
        {children}
      </div>
    </WorkspaceCanvasContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  WorkspacePanel                                                             */
/* -------------------------------------------------------------------------- */

export interface PanelPosition {
  x: number;
  y: number;
}

export interface WorkspacePanelProps {
  ref?: Ref<HTMLDivElement>;
  title: ReactNode;
  /** Initial position relative to the canvas top-left, in pixels. */
  defaultPosition?: PanelPosition;
  /** Panel width in pixels. Default 240. */
  width?: number;
  /** When provided, the close button is rendered. */
  onClose?: () => void;
  /** Initial collapsed state of the panel body. */
  defaultCollapsed?: boolean;
  /** Optional accessible label for the drag handle (defaults to "Move {title}"). */
  dragHandleLabel?: string;
  className?: string;
  children: ReactNode;
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Floating, draggable, collapsible panel. Position is clamped to the canvas
 * bounds — both during drag and whenever the canvas resizes (via
 * ResizeObserver where available). State is local to each panel, so multiple
 * panels move independently.
 */
export function WorkspacePanel({
  ref,
  title,
  defaultPosition = { x: 16, y: 16 },
  width = 240,
  onClose,
  defaultCollapsed = false,
  dragHandleLabel,
  className,
  children,
}: WorkspacePanelProps) {
  const { canvasRef } = useWorkspaceCanvas();
  const panelRef = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs<HTMLDivElement>(panelRef, ref);

  const body = useDisclosure(!defaultCollapsed);
  const [position, setPosition] = useState<PanelPosition>(defaultPosition);

  const clampToCanvas = useCallback(
    (x: number, y: number): PanelPosition => {
      const canvas = canvasRef.current;
      const panel = panelRef.current;
      if (canvas === null || panel === null) return { x, y };
      const cb = canvas.getBoundingClientRect();
      const pb = panel.getBoundingClientRect();
      const maxX = Math.max(0, cb.width - pb.width);
      const maxY = Math.max(0, cb.height - pb.height);
      return { x: clamp(x, 0, maxX), y: clamp(y, 0, maxY) };
    },
    [canvasRef],
  );

  const startPosRef = useRef<PanelPosition>(position);

  const drag = useDrag({
    onStart: () => {
      startPosRef.current = position;
      document.body.style.userSelect = 'none';
    },
    onMove: ({ dx, dy }) => {
      const next = clampToCanvas(startPosRef.current.x + dx, startPosRef.current.y + dy);
      setPosition(next);
    },
    onEnd: () => {
      document.body.style.userSelect = '';
    },
  });

  // Re-clamp when the canvas resizes (panel sticks inside the new bounds).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      setPosition((p) => clampToCanvas(p.x, p.y));
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [canvasRef, clampToCanvas]);

  // No explicit initial clamp effect: ResizeObserver fires on first observe
  // in real browsers (handles out-of-bounds defaultPosition), and drag /
  // resize callbacks clamp from then on. Consumers passing valid defaults
  // see no flicker; bad defaults snap on first observer tick.

  const titleText = typeof title === 'string' ? title : 'panel';

  return (
    <section
      ref={merged}
      role="dialog"
      aria-label={titleText}
      data-collapsed={!body.isOpen}
      data-dragging={drag.isDragging}
      style={{ left: `${position.x}px`, top: `${position.y}px`, width: `${width}px` }}
      className={cn(
        'absolute z-10 flex max-h-[calc(100%-1rem)] flex-col rounded-md border border-border bg-surface-elevated shadow-md',
        drag.isDragging && 'shadow-lg',
        className,
      )}
    >
      <header
        role="toolbar"
        aria-label={dragHandleLabel ?? `Move ${titleText}`}
        onPointerDown={drag.onPointerDown}
        className={cn(
          'flex h-9 shrink-0 cursor-move items-center gap-1 border-b border-border px-2 select-none',
          drag.isDragging && 'cursor-grabbing bg-surface-muted',
        )}
      >
        <GripHorizontal className="h-3.5 w-3.5 text-foreground-subtle" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">
          {title}
        </span>
        <IconButton
          aria-label={body.isOpen ? 'Collapse panel' : 'Expand panel'}
          aria-expanded={body.isOpen}
          variant="ghost"
          size="sm"
          onClick={body.toggle}
          // Don't start a drag when clicking the toggle button.
          onPointerDown={(e) => e.stopPropagation()}
          className="h-6 w-6"
        >
          {body.isOpen ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </IconButton>
        {onClose !== undefined ? (
          <IconButton
            aria-label="Close panel"
            variant="ghost"
            size="sm"
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            className="h-6 w-6"
          >
            <X className="h-3.5 w-3.5" />
          </IconButton>
        ) : null}
      </header>
      {body.isOpen ? (
        <div className="min-h-0 flex-1 overflow-auto p-3 text-sm text-foreground">{children}</div>
      ) : null}
    </section>
  );
}
