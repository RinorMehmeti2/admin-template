import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useControllableState } from '@/hooks/useControllableState';
import { useDrag } from '@/hooks/useDrag';

const DEFAULT_LEFT_WIDTH = 320;
const DEFAULT_MIN = 200;
const DEFAULT_MAX = 600;
const KEYBOARD_STEP_SMALL = 8;
const KEYBOARD_STEP_LARGE = 32;

export interface SplitLayoutProps {
  ref?: Ref<HTMLDivElement>;
  left: ReactNode;
  right: ReactNode;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  /** Width applied while collapsed. 0 hides the pane entirely. Default 0. */
  collapsedLeftWidth?: number;
  resizable?: boolean;
  collapsible?: boolean;
  /** Controlled collapsed state. */
  collapsed?: boolean;
  /** Uncontrolled initial collapsed state. */
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * localStorage key. When set, width + collapsed state are read on mount
   * and written on change. SSR-safe (key is read in an effect).
   */
  persistKey?: string;
  /** Aria label for the divider/separator. Default: "Resize panes". */
  separatorLabel?: string;
  className?: string;
}

interface PersistedState {
  width: number;
  collapsed: boolean;
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function readPersisted(key: string | undefined): PersistedState | null {
  if (key === undefined) return null;
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (typeof parsed.width !== 'number') return null;
    return {
      width: parsed.width,
      collapsed: parsed.collapsed === true,
    };
  } catch {
    return null;
  }
}

function writePersisted(key: string, state: PersistedState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Storage quota / privacy mode — silently ignore.
  }
}

export function SplitLayout({
  ref,
  left,
  right,
  defaultLeftWidth = DEFAULT_LEFT_WIDTH,
  minLeftWidth = DEFAULT_MIN,
  maxLeftWidth = DEFAULT_MAX,
  collapsedLeftWidth = 0,
  resizable = true,
  collapsible = true,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  persistKey,
  separatorLabel = 'Resize panes',
  className,
}: SplitLayoutProps) {
  // Read persisted snapshot eagerly so first paint shows the saved width.
  // Done lazily inside useState's initializer so it runs once.
  const [width, setWidth] = useState<number>(() => {
    const saved = readPersisted(persistKey);
    return clamp(saved?.width ?? defaultLeftWidth, minLeftWidth, maxLeftWidth);
  });

  const [collapsedState, setCollapsedState] = useControllableState<boolean>({
    value: collapsed,
    defaultValue: (() => {
      const saved = readPersisted(persistKey);
      if (saved !== null) return saved.collapsed;
      return defaultCollapsed;
    })(),
    onChange: onCollapsedChange,
  });
  const isCollapsed = collapsedState ?? false;

  // Persist on change.
  useEffect(() => {
    if (persistKey === undefined) return;
    writePersisted(persistKey, { width, collapsed: isCollapsed });
  }, [persistKey, width, isCollapsed]);

  const widthAtDragStartRef = useRef<number>(width);

  const drag = useDrag({
    enabled: resizable && !isCollapsed,
    onStart: () => {
      widthAtDragStartRef.current = width;
      // Suppress text selection while dragging — set on body since the
      // pointer can leave the divider once dragging starts.
      document.body.style.userSelect = 'none';
    },
    onMove: ({ dx }) => {
      const next = clamp(widthAtDragStartRef.current + dx, minLeftWidth, maxLeftWidth);
      setWidth(next);
    },
    onEnd: () => {
      document.body.style.userSelect = '';
    },
  });

  const onSeparatorKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>): void => {
      if (!resizable && !collapsible) return;
      if (collapsible && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        setCollapsedState(!isCollapsed);
        return;
      }
      if (!resizable || isCollapsed) return;
      const isShift = e.shiftKey;
      const step = isShift ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP_SMALL;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setWidth((w) => clamp(w - step, minLeftWidth, maxLeftWidth));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setWidth((w) => clamp(w + step, minLeftWidth, maxLeftWidth));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setWidth(minLeftWidth);
      } else if (e.key === 'End') {
        e.preventDefault();
        setWidth(maxLeftWidth);
      }
    },
    [resizable, collapsible, isCollapsed, minLeftWidth, maxLeftWidth, setCollapsedState],
  );

  const effectiveWidth = isCollapsed ? collapsedLeftWidth : width;
  const showDivider = resizable || collapsible;

  return (
    <div
      ref={ref}
      className={cn('relative flex h-full min-h-0 w-full overflow-hidden bg-background', className)}
    >
      <aside
        id="split-layout-left"
        className={cn(
          'relative flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-border bg-surface transition-[width] duration-150 ease-out',
          isCollapsed && collapsedLeftWidth === 0 && 'border-r-0',
        )}
        style={{ width: `${effectiveWidth}px` }}
        aria-hidden={isCollapsed && collapsedLeftWidth === 0 ? true : undefined}
      >
        {/* Hide content when fully collapsed so tab order skips it. */}
        {isCollapsed && collapsedLeftWidth === 0 ? null : left}
      </aside>

      {showDivider ? (
        /* ARIA "separator" with aria-valuenow IS focusable and interactive
           per WAI-ARIA 1.2 (window-splitter pattern). jsx-a11y treats
           role=separator as non-interactive — disable for this element. */
        /* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={separatorLabel}
          aria-valuenow={effectiveWidth}
          aria-valuemin={isCollapsed ? collapsedLeftWidth : minLeftWidth}
          aria-valuemax={isCollapsed ? collapsedLeftWidth : maxLeftWidth}
          aria-controls="split-layout-left"
          tabIndex={0}
          onPointerDown={drag.onPointerDown}
          onKeyDown={onSeparatorKeyDown}
          data-dragging={drag.isDragging}
          data-collapsed={isCollapsed}
          className={cn(
            'group relative flex w-1 shrink-0 cursor-col-resize items-center justify-center bg-border',
            'hover:bg-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
            !resizable && 'cursor-default',
            drag.isDragging && 'bg-primary',
          )}
        >
          {collapsible ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                setCollapsedState(!isCollapsed);
              }}
              onPointerDown={(e) => {
                // Don't start a drag when clicking the toggle.
                e.stopPropagation();
              }}
              aria-label={isCollapsed ? 'Expand left pane' : 'Collapse left pane'}
              aria-expanded={!isCollapsed}
              aria-controls="split-layout-left"
              className={cn(
                'absolute top-3 -left-3 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-foreground-muted shadow-sm',
                'opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 hover:text-foreground hover:bg-surface-muted',
                isCollapsed && 'left-1 opacity-100',
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          ) : null}
        </div>
      ) : /* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
      null}

      <main className="min-w-0 flex-1 overflow-auto bg-background">{right}</main>
    </div>
  );
}
