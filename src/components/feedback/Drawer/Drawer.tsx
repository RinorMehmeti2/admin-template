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
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useId } from '@/hooks/useId';
import { useControllableState } from '@/hooks/useControllableState';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useFocusReturn } from '@/hooks/useFocusReturn';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useSwipe } from '@/hooks/useSwipe';
import { Portal } from '@/components/overlays/Portal';
import { IconButton } from '@/components/primitives/IconButton';

/*
 * Drawer mirrors Dialog's architecture (composition + every hook). Only the
 * panel position + entry animation differ. We intentionally duplicate rather
 * than parameterize Dialog because:
 *   - the part components (Title/Description/Body/Footer/Close) are 5 lines
 *     each; abstraction would cost more than copying
 *   - Drawer may grow side-specific behaviors (snap points, swipe-to-close)
 *     that Dialog doesn't need.
 */

interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  hasTitle: boolean;
  hasDescription: boolean;
  registerTitle: () => () => void;
  registerDescription: () => () => void;
  triggerRef: RefObject<HTMLElement | null>;
  side: 'left' | 'right' | 'top' | 'bottom';
  responsive: boolean;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

function useDrawerContext(part: string): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (ctx === null) throw new Error(`<${part}> must be used inside <Drawer>`);
  return ctx;
}

export interface DrawerProps {
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  side?: 'left' | 'right' | 'top' | 'bottom';
  /**
   * When true (default), on viewports smaller than `md` the drawer renders
   * as a bottom sheet (anchored to the bottom, grab handle, swipe-down
   * dismiss) regardless of `side`. Set to false for navigation drawers and
   * other cases where the desktop side anchoring should be preserved on
   * mobile.
   */
  responsive?: boolean;
  children: ReactNode;
}

export function Drawer({
  open,
  defaultOpen,
  onOpenChange,
  side = 'right',
  responsive = true,
  children,
}: DrawerProps) {
  const [isOpen, setOpenInternal] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const titleId = useId('drawer-title');
  const descriptionId = useId('drawer-desc');
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const registerTitle = useCallback(() => {
    setHasTitle(true);
    return () => setHasTitle(false);
  }, []);
  const registerDescription = useCallback(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, []);
  const setOpen = useCallback((next: boolean) => setOpenInternal(next), [setOpenInternal]);

  const value = useMemo<DrawerContextValue>(
    () => ({
      open: isOpen ?? false,
      setOpen,
      titleId,
      descriptionId,
      hasTitle,
      hasDescription,
      registerTitle,
      registerDescription,
      triggerRef,
      side,
      responsive,
    }),
    [
      isOpen,
      setOpen,
      titleId,
      descriptionId,
      hasTitle,
      hasDescription,
      registerTitle,
      registerDescription,
      side,
      responsive,
    ],
  );

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

interface TriggerChildProps {
  ref?: Ref<HTMLElement>;
  onClick?: (e: ReactMouseEvent) => void;
  'aria-haspopup'?: 'dialog';
  'aria-expanded'?: boolean;
}

export interface DrawerTriggerProps {
  children: ReactElement<TriggerChildProps>;
}

export function DrawerTrigger({ children }: DrawerTriggerProps) {
  const ctx = useDrawerContext('DrawerTrigger');
  const child = Children.only(children);
  const childRef = child.props.ref;
  const merged = useMergedRefs<HTMLElement>(ctx.triggerRef, childRef);
  const childOnClick = child.props.onClick;
  return cloneElement<TriggerChildProps>(child, {
    ref: merged,
    onClick: (e) => {
      childOnClick?.(e);
      if (!e.defaultPrevented) ctx.setOpen(true);
    },
    'aria-haspopup': 'dialog',
    'aria-expanded': ctx.open,
  });
}

export interface DrawerOverlayProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export function DrawerOverlay({ ref, className, ...rest }: DrawerOverlayProps) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-print="hide"
      className={cn(
        'fixed inset-0 z-50 bg-foreground/70 motion-safe:animate-overlay-in',
        className,
      )}
      {...rest}
    />
  );
}

const sideStyles = {
  left: 'inset-y-0 left-0 h-full w-80 max-w-[85vw] border-r motion-safe:animate-drawer-in-left',
  right: 'inset-y-0 right-0 h-full w-80 max-w-[85vw] border-l motion-safe:animate-drawer-in-right',
  top: 'inset-x-0 top-0 w-full max-h-[80vh] border-b motion-safe:animate-drawer-in-top',
  bottom: 'inset-x-0 bottom-0 w-full max-h-[80vh] border-t motion-safe:animate-drawer-in-bottom',
} as const;

export interface DrawerContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  ref?: Ref<HTMLDivElement>;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export function DrawerContent({
  ref,
  className,
  children,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  ...rest
}: DrawerContentProps) {
  const ctx = useDrawerContext('DrawerContent');
  const internal = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs<HTMLDivElement>(internal, ref);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const useBottomSheetMode = ctx.responsive && isMobile;

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

  // Swipe-down to dismiss when in bottom-sheet mode.
  const [dragDy, setDragDy] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const swipe = useSwipe({
    axis: 'y',
    enabled: useBottomSheetMode && ctx.open,
    dismissThreshold: 80,
    onSwipeStart: () => setIsDragging(true),
    onSwipeMove: ({ dy }) => setDragDy(Math.max(0, dy)),
    onSwipe: (direction) => {
      if (direction === 'down') ctx.setOpen(false);
    },
    onSwipeEnd: () => {
      setIsDragging(false);
      setDragDy(0);
    },
  });

  if (!ctx.open) return null;

  if (useBottomSheetMode) {
    return (
      <Portal>
        <DrawerOverlay />
        <div
          ref={merged}
          role="dialog"
          aria-modal="true"
          data-print="hide"
          data-drawer-mode="bottom-sheet"
          aria-labelledby={ctx.hasTitle ? ctx.titleId : undefined}
          aria-describedby={ctx.hasDescription ? ctx.descriptionId : undefined}
          tabIndex={-1}
          style={{
            transform: isDragging ? `translateY(${dragDy}px)` : undefined,
            transition: isDragging ? 'none' : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col overflow-hidden rounded-t-2xl border-t border-border bg-surface shadow-2xl touch-none',
            'motion-safe:animate-drawer-in-bottom',
            className,
          )}
          {...rest}
        >
          <button
            type="button"
            aria-label="Drag to dismiss"
            onPointerDown={swipe.onPointerDown}
            className="mx-auto mt-2 inline-flex h-6 w-16 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            data-drawer-handle
          >
            <span className="block h-1.5 w-10 rounded-full bg-border" aria-hidden="true" />
          </button>
          {children}
        </div>
      </Portal>
    );
  }

  return (
    <Portal>
      <DrawerOverlay />
      <div
        ref={merged}
        role="dialog"
        aria-modal="true"
        data-print="hide"
        aria-labelledby={ctx.hasTitle ? ctx.titleId : undefined}
        aria-describedby={ctx.hasDescription ? ctx.descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'fixed z-50 flex flex-col overflow-hidden border-border bg-surface shadow-lg',
          sideStyles[ctx.side],
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </Portal>
  );
}

export function DrawerHeader({
  ref,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  const ctx = useDrawerContext('DrawerHeader');
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-start justify-between gap-4 border-b border-border px-6 py-4',
        className,
      )}
      {...rest}
    >
      <div className="min-w-0 flex-1">{children}</div>
      <IconButton
        aria-label="Close"
        variant="ghost"
        size="sm"
        onClick={() => ctx.setOpen(false)}
        className="-mr-1 -mt-1"
      >
        <X className="h-4 w-4" />
      </IconButton>
    </div>
  );
}

export function DrawerTitle({
  ref,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLHeadingElement> & { ref?: Ref<HTMLHeadingElement> }) {
  const ctx = useDrawerContext('DrawerTitle');
  useEffect(() => ctx.registerTitle(), [ctx]);
  return (
    <h2
      ref={ref}
      id={ctx.titleId}
      className={cn('text-lg font-semibold leading-tight text-foreground', className)}
      {...rest}
    >
      {children}
    </h2>
  );
}

export function DrawerDescription({
  ref,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLParagraphElement> & { ref?: Ref<HTMLParagraphElement> }) {
  const ctx = useDrawerContext('DrawerDescription');
  useEffect(() => ctx.registerDescription(), [ctx]);
  return (
    <p
      ref={ref}
      id={ctx.descriptionId}
      className={cn('mt-1 text-sm text-foreground-muted', className)}
      {...rest}
    >
      {children}
    </p>
  );
}

export function DrawerBody({
  ref,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return <div ref={ref} className={cn('flex-1 overflow-auto px-6 py-4', className)} {...rest} />;
}

export function DrawerFooter({
  ref,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-end gap-2 border-t border-border px-6 py-4',
        className,
      )}
      {...rest}
    />
  );
}

interface DrawerCloseChildProps {
  onClick?: (e: ReactMouseEvent) => void;
}

export interface DrawerCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  asChild?: boolean;
  children?: ReactNode;
}

export function DrawerClose({ ref, asChild, children, onClick, ...rest }: DrawerCloseProps) {
  const ctx = useDrawerContext('DrawerClose');
  const close = (e: ReactMouseEvent) => {
    onClick?.(e as ReactMouseEvent<HTMLButtonElement>);
    if (!e.defaultPrevented) ctx.setOpen(false);
  };

  if (asChild === true && children !== undefined) {
    const child = Children.only(children) as ReactElement<DrawerCloseChildProps>;
    const childOnClick = child.props.onClick;
    return cloneElement<DrawerCloseChildProps>(child, {
      onClick: (e) => {
        childOnClick?.(e);
        if (!e.defaultPrevented) ctx.setOpen(false);
      },
    });
  }

  return (
    <button ref={ref} type="button" onClick={close} {...rest}>
      {children}
    </button>
  );
}
