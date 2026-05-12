import {
  Children,
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type FocusEvent as ReactFocusEvent,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { useId } from '@/hooks/useId';
import { useControllableState } from '@/hooks/useControllableState';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import { usePosition, type Boundary, type Placement } from '@/hooks/usePosition';
import { Portal } from '@/components/overlays/Portal';

/* -------------------------------------------------------------------------- */
/*  TooltipProvider — app-root config                                          */
/* -------------------------------------------------------------------------- */

interface TooltipConfig {
  delayDuration: number;
}

const TooltipConfigContext = createContext<TooltipConfig>({ delayDuration: 300 });

export interface TooltipProviderProps {
  delayDuration?: number;
  children: ReactNode;
}

export function TooltipProvider({ delayDuration = 300, children }: TooltipProviderProps) {
  const value = useMemo<TooltipConfig>(() => ({ delayDuration }), [delayDuration]);
  return <TooltipConfigContext.Provider value={value}>{children}</TooltipConfigContext.Provider>;
}

/* -------------------------------------------------------------------------- */
/*  Per-Tooltip context                                                        */
/* -------------------------------------------------------------------------- */

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  triggerRef: RefObject<HTMLElement | null>;
  show: () => void;
  hide: () => void;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext(part: string): TooltipContextValue {
  const ctx = useContext(TooltipContext);
  if (ctx === null) throw new Error(`<${part}> must be used inside <Tooltip>`);
  return ctx;
}

export interface TooltipProps {
  children: ReactNode;
  delayDuration?: number;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
}

export function Tooltip({
  children,
  delayDuration,
  open,
  defaultOpen,
  onOpenChange,
}: TooltipProps) {
  const config = useContext(TooltipConfigContext);
  const effectiveDelay = delayDuration ?? config.delayDuration;

  const [isOpen, setOpenInternal] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });

  const contentId = useId('tooltip');
  const triggerRef = useRef<HTMLElement | null>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setOpen = useCallback((next: boolean) => setOpenInternal(next), [setOpenInternal]);

  const clearTimers = useCallback(() => {
    if (showTimer.current !== null) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    if (hideTimer.current !== null) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const show = useCallback(() => {
    if (hideTimer.current !== null) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    showTimer.current = setTimeout(() => setOpen(true), effectiveDelay);
  }, [effectiveDelay, setOpen]);

  const hide = useCallback(() => {
    if (showTimer.current !== null) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    // Small grace period so a brief mouse exit doesn't yank it away
    hideTimer.current = setTimeout(() => setOpen(false), 100);
  }, [setOpen]);

  useEffect(() => clearTimers, [clearTimers]);

  const value = useMemo<TooltipContextValue>(
    () => ({
      open: isOpen ?? false,
      setOpen,
      contentId,
      triggerRef,
      show,
      hide,
    }),
    [isOpen, setOpen, contentId, show, hide],
  );

  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
}

/* -------------------------------------------------------------------------- */
/*  Trigger                                                                   */
/* -------------------------------------------------------------------------- */

interface TriggerChildProps {
  ref?: Ref<HTMLElement> | undefined;
  onMouseEnter?: ((e: ReactMouseEvent) => void) | undefined;
  onMouseLeave?: ((e: ReactMouseEvent) => void) | undefined;
  onFocus?: ((e: ReactFocusEvent) => void) | undefined;
  onBlur?: ((e: ReactFocusEvent) => void) | undefined;
  'aria-describedby'?: string | undefined;
}

export interface TooltipTriggerProps {
  children: ReactElement<TriggerChildProps>;
}

export function TooltipTrigger({ children }: TooltipTriggerProps) {
  const ctx = useTooltipContext('TooltipTrigger');
  const child = Children.only(children);
  const childRef = child.props.ref;
  const merged = useMergedRefs<HTMLElement>(ctx.triggerRef, childRef);

  const childOnMouseEnter = child.props.onMouseEnter;
  const childOnMouseLeave = child.props.onMouseLeave;
  const childOnFocus = child.props.onFocus;
  const childOnBlur = child.props.onBlur;
  const childAriaDescribedBy = child.props['aria-describedby'];

  return cloneElement<TriggerChildProps>(child, {
    ref: merged,
    onMouseEnter: (e) => {
      childOnMouseEnter?.(e);
      ctx.show();
    },
    onMouseLeave: (e) => {
      childOnMouseLeave?.(e);
      ctx.hide();
    },
    onFocus: (e) => {
      childOnFocus?.(e);
      // Focus shows immediately (no delay) — keyboard users shouldn't wait
      ctx.setOpen(true);
    },
    onBlur: (e) => {
      childOnBlur?.(e);
      ctx.setOpen(false);
    },
    'aria-describedby': ctx.open
      ? [childAriaDescribedBy, ctx.contentId].filter(Boolean).join(' ')
      : childAriaDescribedBy,
  });
}

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const tooltipContentStyles = cva(
  'pointer-events-none z-[60] max-w-xs rounded-md shadow-md select-none',
  {
    variants: {
      variant: {
        default: 'bg-foreground text-background',
        light: 'bg-surface text-foreground border border-border',
        primary: 'bg-primary text-primary-foreground',
        success: 'bg-success text-success-foreground',
        warning: 'bg-warning text-warning-foreground',
        danger: 'bg-danger text-danger-foreground',
        info: 'bg-info text-info-foreground',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-[11px]',
        md: 'px-2 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

export interface TooltipContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role'>, VariantProps<typeof tooltipContentStyles> {
  ref?: Ref<HTMLDivElement>;
  side?: Placement;
  sideOffset?: number;
  flip?: boolean;
  shift?: boolean;
  padding?: number;
  boundary?: Boundary;
}

export function TooltipContent({
  ref,
  className,
  children,
  side = 'top',
  sideOffset = 6,
  flip,
  shift,
  padding,
  boundary,
  variant,
  size,
  ...rest
}: TooltipContentProps) {
  const ctx = useTooltipContext('TooltipContent');
  const internal = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs<HTMLDivElement>(internal, ref);

  useEscapeKey(() => ctx.setOpen(false), { enabled: ctx.open });

  // Hide on any scroll (capture, so it catches scroll inside ancestors too)
  useEffect(() => {
    if (!ctx.open) return;
    const onScroll = () => ctx.setOpen(false);
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [ctx.open, ctx.setOpen]);

  const positionOptions: Parameters<typeof usePosition>[2] = {
    placement: side,
    offset: sideOffset,
    enabled: ctx.open,
  };
  if (flip !== undefined) positionOptions.flip = flip;
  if (shift !== undefined) positionOptions.shift = shift;
  if (padding !== undefined) positionOptions.padding = padding;
  if (boundary !== undefined) positionOptions.boundary = boundary;
  const pos = usePosition(ctx.triggerRef, internal, positionOptions);

  if (!ctx.open) return null;

  return (
    <Portal>
      <div
        ref={merged}
        role="tooltip"
        id={ctx.contentId}
        data-side={pos.placement}
        data-print="hide"
        // Keep in DOM before first measurement (tests can query it without
        // advancing rAF) but hide visually so users don't see a (0,0) flash
        // on the way to the resolved position.
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          opacity: pos.ready ? 1 : 0,
        }}
        className={cn(tooltipContentStyles({ variant, size }), className)}
        {...rest}
      >
        {children}
      </div>
    </Portal>
  );
}
