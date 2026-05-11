import {
  Children,
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type Ref,
} from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useId } from '@/hooks/useId';
import { useControllableState } from '@/hooks/useControllableState';
import { useFocusReturn } from '@/hooks/useFocusReturn';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import { useSwipe } from '@/hooks/useSwipe';
import { Portal } from '@/components/overlays/Portal';
import { IconButton } from '@/components/primitives/IconButton';
import type { BottomSheetContentProps, BottomSheetProps } from './BottomSheet.types';

/*
 * BottomSheet — mobile-first dialog anchored to the bottom of the viewport.
 * Snap points (vh %) drive height; the grab handle (or any element with
 * useBottomSheetDrag()) lets the user pull between snaps. Past the lowest
 * snap by `dismissThreshold` px, swipe-down closes the sheet.
 *
 * Uses the same accessibility primitives as Dialog/Drawer (focus trap,
 * escape, scroll lock, click outside). Spring-like easing is plain CSS —
 * no animation library.
 */

interface BottomSheetContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  snap: number;
  setSnap: (next: number) => void;
  snapPoints: ReadonlyArray<number>;
  titleId: string;
  hasTitle: boolean;
  registerTitle: () => () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  /** Live pixel offset while dragging (positive = pulled down). */
  dragOffset: number;
  setDragOffset: (next: number) => void;
  isDragging: boolean;
  setIsDragging: (next: boolean) => void;
}

const BottomSheetContext = createContext<BottomSheetContextValue | null>(null);

function useBottomSheet(part: string): BottomSheetContextValue {
  const ctx = useContext(BottomSheetContext);
  if (ctx === null) throw new Error(`<${part}> must be used inside <BottomSheet>`);
  return ctx;
}

export function BottomSheet({
  open,
  defaultOpen,
  onOpenChange,
  snapPoints = [50, 90],
  snap,
  defaultSnap,
  onSnapChange,
  children,
}: BottomSheetProps) {
  const [isOpen, setOpenInternal] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const initialSnap = defaultSnap ?? snapPoints[0] ?? 50;
  const [activeSnap, setSnapInternal] = useControllableState<number>({
    value: snap,
    defaultValue: initialSnap,
    onChange: onSnapChange,
  });
  const titleId = useId('bottomsheet-title');
  const [hasTitle, setHasTitle] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const setOpen = useCallback((next: boolean) => setOpenInternal(next), [setOpenInternal]);
  const setSnap = useCallback((next: number) => setSnapInternal(next), [setSnapInternal]);
  const registerTitle = useCallback(() => {
    setHasTitle(true);
    return () => setHasTitle(false);
  }, []);

  const value = useMemo<BottomSheetContextValue>(
    () => ({
      open: isOpen ?? false,
      setOpen,
      snap: activeSnap ?? initialSnap,
      setSnap,
      snapPoints,
      titleId,
      hasTitle,
      registerTitle,
      triggerRef,
      dragOffset,
      setDragOffset,
      isDragging,
      setIsDragging,
    }),
    [
      isOpen,
      setOpen,
      activeSnap,
      initialSnap,
      setSnap,
      snapPoints,
      titleId,
      hasTitle,
      registerTitle,
      dragOffset,
      isDragging,
    ],
  );

  return <BottomSheetContext.Provider value={value}>{children}</BottomSheetContext.Provider>;
}

/* -------------------------------------------------------------------------- */
/*  Overlay + Content                                                          */
/* -------------------------------------------------------------------------- */

function BottomSheetOverlay({ onClick }: { onClick: () => void }) {
  return (
    <div
      aria-hidden="true"
      data-print="hide"
      onClick={onClick}
      className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm motion-safe:animate-overlay-in"
    />
  );
}

export function BottomSheetContent({
  ref,
  className,
  children,
  showHandle = true,
  swipeToDismiss = true,
  dismissThreshold = 60,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  ...rest
}: BottomSheetContentProps) {
  const ctx = useBottomSheet('BottomSheetContent');
  const internal = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs<HTMLDivElement>(internal, ref);

  useFocusReturn(ctx.open);
  useFocusTrap(internal, { active: ctx.open, returnFocus: false });
  useScrollLock(ctx.open);
  useEscapeKey(
    () => {
      if (closeOnEscape) ctx.setOpen(false);
    },
    { enabled: ctx.open },
  );
  useClickOutside(
    internal,
    () => {
      if (closeOnOverlayClick) ctx.setOpen(false);
    },
    { enabled: ctx.open },
  );

  // Pick nearest snap to a given pull-down delta.
  const handleRelease = useCallback(
    (dy: number) => {
      const current = ctx.snap;
      // dy positive = sheet pulled down (height shrinks); negative = pulled up.
      const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800;
      const currentPx = (current / 100) * viewportH;
      const targetPx = currentPx - dy;
      const targetPct = Math.max(0, Math.min(100, (targetPx / viewportH) * 100));
      const sorted = ctx.snapPoints.slice().sort((a, b) => a - b);
      const lowest = sorted[0] ?? 25;

      // Dismiss if pulled below lowest snap by more than threshold.
      if (
        swipeToDismiss &&
        dy > 0 &&
        targetPct < lowest &&
        (lowest / 100) * viewportH - targetPx > dismissThreshold
      ) {
        ctx.setOpen(false);
        return;
      }

      let nearest = sorted[0] ?? current;
      let best = Infinity;
      for (const s of sorted) {
        const d = Math.abs(s - targetPct);
        if (d < best) {
          best = d;
          nearest = s;
        }
      }
      ctx.setSnap(nearest);
    },
    [ctx, swipeToDismiss, dismissThreshold],
  );

  const swipe = useSwipe({
    axis: 'y',
    lockThreshold: 4,
    dismissThreshold: 0, // handleRelease owns the decision
    velocityThreshold: 1_000_000, // disable velocity commit; handleRelease handles it
    enabled: ctx.open,
    onSwipeStart: () => {
      ctx.setIsDragging(true);
    },
    onSwipeMove: ({ dy }) => {
      ctx.setDragOffset(Math.max(-200, dy));
    },
    onSwipeEnd: (_committed, { dy }) => {
      ctx.setIsDragging(false);
      ctx.setDragOffset(0);
      handleRelease(dy);
    },
  });

  if (!ctx.open) return null;

  // Compute height: snap% minus current drag offset (clamped to 0..vh).
  const heightStyle: React.CSSProperties = {
    height: ctx.isDragging
      ? `calc(${ctx.snap}vh - ${ctx.dragOffset}px)`
      : `${ctx.snap}vh`,
    // Spring-ish easing — only animate when NOT dragging (otherwise it lags
    // the pointer). Pure CSS, no library.
    transition: ctx.isDragging
      ? 'none'
      : 'height 220ms cubic-bezier(0.22, 1, 0.36, 1)',
  };

  return (
    <Portal>
      <BottomSheetOverlay onClick={() => closeOnOverlayClick && ctx.setOpen(false)} />
      <div
        ref={merged}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ctx.hasTitle ? ctx.titleId : undefined}
        data-print="hide"
        data-snap={ctx.snap}
        tabIndex={-1}
        style={heightStyle}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex max-h-[95vh] flex-col overflow-hidden rounded-t-2xl border-t border-border bg-surface shadow-2xl',
          'motion-safe:animate-drawer-in-bottom touch-none',
          className,
        )}
        {...rest}
      >
        {showHandle ? (
          <button
            type="button"
            aria-label="Drag to resize"
            aria-controls={ctx.titleId}
            onPointerDown={swipe.onPointerDown}
            className="mx-auto mt-2 inline-flex h-6 w-16 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            data-bottomsheet-handle
          >
            <span className="block h-1.5 w-10 rounded-full bg-border" aria-hidden="true" />
          </button>
        ) : null}
        {children}
      </div>
    </Portal>
  );
}

/* -------------------------------------------------------------------------- */
/*  Header / Body / Footer / Title                                            */
/* -------------------------------------------------------------------------- */

export function BottomSheetHeader({
  ref,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  const ctx = useBottomSheet('BottomSheetHeader');
  return (
    <div
      ref={ref}
      className={cn('flex items-start justify-between gap-4 px-5 py-3', className)}
      {...rest}
    >
      <div className="min-w-0 flex-1">{children}</div>
      <IconButton
        aria-label="Close"
        variant="ghost"
        size="md"
        onClick={() => ctx.setOpen(false)}
        className="-mr-1 -mt-1"
        data-touch-target
      >
        <X className="h-4 w-4" />
      </IconButton>
    </div>
  );
}

export function BottomSheetTitle({
  ref,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLHeadingElement> & { ref?: Ref<HTMLHeadingElement> }) {
  const ctx = useBottomSheet('BottomSheetTitle');
  useEffect(() => ctx.registerTitle(), [ctx]);
  return (
    <h2
      ref={ref}
      id={ctx.titleId}
      className={cn('text-base font-semibold leading-tight text-foreground', className)}
      {...rest}
    >
      {children}
    </h2>
  );
}

export function BottomSheetBody({
  ref,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex-1 overflow-y-auto overscroll-contain px-5 py-2',
        '[-webkit-overflow-scrolling:touch]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function BottomSheetFooter({
  ref,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn('flex items-center justify-end gap-2 border-t border-border px-5 py-3', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

/* Optional trigger (mirrors DrawerTrigger pattern). */

interface BottomSheetTriggerChildProps {
  ref?: Ref<HTMLElement> | undefined;
  onClick?: ((e: ReactMouseEvent) => void) | undefined;
  'aria-haspopup'?: 'dialog' | undefined;
  'aria-expanded'?: boolean | undefined;
}

export interface BottomSheetTriggerProps {
  children: ReactElement<BottomSheetTriggerChildProps>;
}

export function BottomSheetTrigger({ children }: BottomSheetTriggerProps) {
  const ctx = useBottomSheet('BottomSheetTrigger');
  const child = Children.only(children);
  const merged = useMergedRefs<HTMLElement>(ctx.triggerRef, child.props.ref);
  const childOnClick = child.props.onClick;
  return cloneElement<BottomSheetTriggerChildProps>(child, {
    ref: merged,
    onClick: (e) => {
      childOnClick?.(e);
      if (!e.defaultPrevented) ctx.setOpen(true);
    },
    'aria-haspopup': 'dialog',
    'aria-expanded': ctx.open,
  });
}

export { useBottomSheet };
