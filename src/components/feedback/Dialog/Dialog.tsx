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
import { Portal } from '@/components/overlays/Portal';
import { IconButton } from '@/components/primitives/IconButton';

/* -------------------------------------------------------------------------- */
/*  Context                                                                   */
/* -------------------------------------------------------------------------- */

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  hasTitle: boolean;
  hasDescription: boolean;
  registerTitle: () => () => void;
  registerDescription: () => () => void;
  triggerRef: RefObject<HTMLElement | null>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext(part: string): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (ctx === null) {
    throw new Error(`<${part}> must be used inside <Dialog>`);
  }
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*  Root                                                                      */
/* -------------------------------------------------------------------------- */

export interface DialogProps {
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  children: ReactNode;
}

export function Dialog({ open, defaultOpen, onOpenChange, children }: DialogProps) {
  const [isOpen, setOpenInternal] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const titleId = useId('dialog-title');
  const descriptionId = useId('dialog-desc');

  // Track presence of Title / Description so aria-labelledby /
  // aria-describedby only point to ids that actually exist.
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

  const value = useMemo<DialogContextValue>(
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
    }),
    [isOpen, setOpen, titleId, descriptionId, hasTitle, hasDescription, registerTitle, registerDescription],
  );

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

/* -------------------------------------------------------------------------- */
/*  Trigger (asChild via cloneElement)                                        */
/* -------------------------------------------------------------------------- */

interface TriggerChildProps {
  ref?: Ref<HTMLElement>;
  onClick?: (e: ReactMouseEvent) => void;
  'aria-haspopup'?: 'dialog';
  'aria-expanded'?: boolean;
}

export interface DialogTriggerProps {
  children: ReactElement<TriggerChildProps>;
}

export function DialogTrigger({ children }: DialogTriggerProps) {
  const ctx = useDialogContext('DialogTrigger');
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

/* -------------------------------------------------------------------------- */
/*  Overlay                                                                   */
/* -------------------------------------------------------------------------- */

export interface DialogOverlayProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export function DialogOverlay({ ref, className, ...rest }: DialogOverlayProps) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        'fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm',
        'motion-safe:animate-overlay-in',
        className,
      )}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const contentSize = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
} as const;

export interface DialogContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  ref?: Ref<HTMLDivElement>;
  size?: keyof typeof contentSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export function DialogContent({
  ref,
  className,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  ...rest
}: DialogContentProps) {
  const ctx = useDialogContext('DialogContent');
  const internal = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs<HTMLDivElement>(internal, ref);

  // Hooks always run; behavior gated by `active`.
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

  if (!ctx.open) return null;

  return (
    <Portal>
      <DialogOverlay />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={merged}
          role="dialog"
          aria-modal="true"
          aria-labelledby={ctx.hasTitle ? ctx.titleId : undefined}
          aria-describedby={ctx.hasDescription ? ctx.descriptionId : undefined}
          tabIndex={-1}
          className={cn(
            'relative w-full overflow-hidden rounded-lg border border-border bg-surface shadow-lg',
            'flex max-h-[calc(100vh-2rem)] flex-col',
            'motion-safe:animate-dialog-in',
            contentSize[size],
            className,
          )}
          {...rest}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
}

/* -------------------------------------------------------------------------- */
/*  Header / Title / Description / Footer / Close                              */
/* -------------------------------------------------------------------------- */

export function DialogHeader({
  ref,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  const ctx = useDialogContext('DialogHeader');
  return (
    <div
      ref={ref}
      className={cn('flex items-start justify-between gap-4 border-b border-border px-6 py-4', className)}
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

export function DialogTitle({
  ref,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLHeadingElement> & { ref?: Ref<HTMLHeadingElement> }) {
  const ctx = useDialogContext('DialogTitle');
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

export function DialogDescription({
  ref,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLParagraphElement> & { ref?: Ref<HTMLParagraphElement> }) {
  const ctx = useDialogContext('DialogDescription');
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

export function DialogBody({
  ref,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn('flex-1 overflow-auto px-6 py-4', className)}
      {...rest}
    />
  );
}

export function DialogFooter({
  ref,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn('flex items-center justify-end gap-2 border-t border-border px-6 py-4', className)}
      {...rest}
    />
  );
}

interface DialogCloseChildProps {
  onClick?: (e: ReactMouseEvent) => void;
}

export interface DialogCloseProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  asChild?: boolean;
  children?: ReactNode;
}

export function DialogClose({
  ref,
  asChild,
  children,
  onClick,
  ...rest
}: DialogCloseProps) {
  const ctx = useDialogContext('DialogClose');
  const close = (e: ReactMouseEvent) => {
    onClick?.(e as ReactMouseEvent<HTMLButtonElement>);
    if (!e.defaultPrevented) ctx.setOpen(false);
  };

  if (asChild === true && children !== undefined) {
    const child = Children.only(children) as ReactElement<DialogCloseChildProps>;
    const childOnClick = child.props.onClick;
    return cloneElement<DialogCloseChildProps>(child, {
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
