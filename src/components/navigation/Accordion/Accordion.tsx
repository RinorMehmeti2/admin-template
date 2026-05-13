import { ChevronDown } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { cn } from '@/lib/cn';
import { useControllableState } from '@/hooks/useControllableState';
import { useId } from '@/hooks/useId';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import { usePrintMode } from '@/hooks/usePrintMode';
import type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionProps,
  AccordionTriggerProps,
  AccordionVariant,
} from './Accordion.types';

interface AccordionContextValue {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
  registerTrigger: (value: string, el: HTMLButtonElement | null) => void;
  focusNext: (value: string, dir: 1 | -1) => void;
  focusEdge: (edge: 'first' | 'last') => void;
  variant: AccordionVariant;
  baseId: string;
  isPrinting: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext(part: string): AccordionContextValue {
  const ctx = useContext(AccordionContext);
  if (ctx === null) throw new Error(`<${part}> must be used inside <Accordion>`);
  return ctx;
}

interface ItemContextValue {
  value: string;
  disabled: boolean;
  triggerId: string;
  contentId: string;
  open: boolean;
}

const ItemContext = createContext<ItemContextValue | null>(null);

function useItemContext(part: string): ItemContextValue {
  const ctx = useContext(ItemContext);
  if (ctx === null) throw new Error(`<${part}> must be used inside <AccordionItem>`);
  return ctx;
}

export function Accordion(props: AccordionProps) {
  const { type = 'single', variant = 'default', collapsible = true, className, children } = props;
  const baseId = useId('acc');
  const isPrinting = usePrintMode();

  // Single mode state
  const [singleVal, setSingleVal] = useControllableState<string | null>({
    value: type === 'single' ? (props.value as string | null | undefined) : undefined,
    defaultValue:
      type === 'single' ? ((props.defaultValue as string | null | undefined) ?? null) : undefined,
    onChange: type === 'single' ? (props.onValueChange as (v: string | null) => void) : undefined,
  });

  // Multiple mode state
  const [multiVal, setMultiVal] = useControllableState<string[]>({
    value: type === 'multiple' ? (props.value as string[] | undefined) : undefined,
    defaultValue:
      type === 'multiple' ? ((props.defaultValue as string[] | undefined) ?? []) : undefined,
    onChange: type === 'multiple' ? (props.onValueChange as (v: string[]) => void) : undefined,
  });

  const isOpen = useCallback(
    (v: string) => {
      if (isPrinting) return true;
      if (type === 'multiple') return (multiVal ?? []).includes(v);
      return singleVal === v;
    },
    [type, multiVal, singleVal, isPrinting],
  );

  const toggle = useCallback(
    (v: string) => {
      if (type === 'multiple') {
        setMultiVal((prev) => {
          const set = new Set(prev ?? []);
          if (set.has(v)) set.delete(v);
          else set.add(v);
          return Array.from(set);
        });
      } else {
        setSingleVal((prev) => {
          if (prev === v) return collapsible ? null : (prev ?? null);
          return v;
        });
      }
    },
    [type, collapsible, setMultiVal, setSingleVal],
  );

  // Keyboard navigation across triggers.
  const triggersRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const orderedValuesRef = useRef<string[]>([]);

  const registerTrigger = useCallback((v: string, el: HTMLButtonElement | null) => {
    if (el === null) {
      triggersRef.current.delete(v);
      orderedValuesRef.current = orderedValuesRef.current.filter((x) => x !== v);
    } else {
      triggersRef.current.set(v, el);
      if (!orderedValuesRef.current.includes(v)) orderedValuesRef.current.push(v);
    }
  }, []);

  const focusByOffset = useCallback((current: string, offset: number) => {
    // Re-derive order from DOM each time — children may re-order.
    const order = orderedValuesRef.current.filter((v) => triggersRef.current.has(v));
    const enabled = order.filter((v) => {
      const el = triggersRef.current.get(v);
      return el !== undefined && !el.disabled;
    });
    if (enabled.length === 0) return;
    const idx = enabled.indexOf(current);
    const nextIdx = idx === -1 ? 0 : (idx + offset + enabled.length) % enabled.length;
    const targetVal = enabled[nextIdx];
    if (targetVal === undefined) return;
    triggersRef.current.get(targetVal)?.focus();
  }, []);

  const focusNext = useCallback((v: string, dir: 1 | -1) => focusByOffset(v, dir), [focusByOffset]);

  const focusEdge = useCallback((edge: 'first' | 'last') => {
    const order = orderedValuesRef.current.filter((v) => triggersRef.current.has(v));
    const enabled = order.filter((v) => {
      const el = triggersRef.current.get(v);
      return el !== undefined && !el.disabled;
    });
    const target = edge === 'first' ? enabled[0] : enabled[enabled.length - 1];
    if (target === undefined) return;
    triggersRef.current.get(target)?.focus();
  }, []);

  const ctx = useMemo<AccordionContextValue>(
    () => ({
      isOpen,
      toggle,
      registerTrigger,
      focusNext,
      focusEdge,
      variant,
      baseId,
      isPrinting,
    }),
    [isOpen, toggle, registerTrigger, focusNext, focusEdge, variant, baseId, isPrinting],
  );

  return (
    <AccordionContext.Provider value={ctx}>
      <div
        data-print="expand"
        className={cn(
          variant === 'bordered' && 'rounded-lg border border-border bg-surface',
          variant === 'separated' && 'flex flex-col gap-2',
          className,
        )}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

/* --------------- AccordionItem --------------- */

export function AccordionItem({
  ref,
  value,
  disabled = false,
  className,
  children,
  ...rest
}: AccordionItemProps) {
  const ctx = useAccordionContext('AccordionItem');
  const triggerId = `${ctx.baseId}-trigger-${value}`;
  const contentId = `${ctx.baseId}-content-${value}`;
  const open = ctx.isOpen(value);

  const itemCtx = useMemo<ItemContextValue>(
    () => ({ value, disabled, triggerId, contentId, open }),
    [value, disabled, triggerId, contentId, open],
  );

  return (
    <ItemContext.Provider value={itemCtx}>
      <div
        ref={ref}
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        className={cn(
          ctx.variant === 'default' && 'border-b border-border last:border-b-0',
          ctx.variant === 'bordered' && 'border-b border-border last:border-b-0',
          ctx.variant === 'separated' &&
            'rounded-lg border border-border bg-surface overflow-hidden',
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </ItemContext.Provider>
  );
}

/* --------------- AccordionTrigger --------------- */

export function AccordionTrigger({ ref, className, children, ...rest }: AccordionTriggerProps) {
  const ctx = useAccordionContext('AccordionTrigger');
  const item = useItemContext('AccordionTrigger');
  const innerRef = useRef<HTMLButtonElement>(null);
  const registerRef = useCallback(
    (el: HTMLButtonElement | null) => ctx.registerTrigger(item.value, el),
    [ctx, item.value],
  );
  const setRef = useMergedRefs<HTMLButtonElement>(innerRef, ref, registerRef);

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          ctx.focusNext(item.value, 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          ctx.focusNext(item.value, -1);
          break;
        case 'Home':
          e.preventDefault();
          ctx.focusEdge('first');
          break;
        case 'End':
          e.preventDefault();
          ctx.focusEdge('last');
          break;
        default:
      }
    },
    [ctx, item.value],
  );

  return (
    <h3 className="m-0">
      <button
        ref={setRef}
        type="button"
        id={item.triggerId}
        aria-controls={item.contentId}
        aria-expanded={item.open}
        disabled={item.disabled}
        data-state={item.open ? 'open' : 'closed'}
        onClick={() => {
          if (!item.disabled) ctx.toggle(item.value);
        }}
        onKeyDown={onKeyDown}
        className={cn(
          'flex w-full items-center justify-between gap-3 py-4 px-4 text-left text-sm font-medium text-foreground',
          'transition-colors hover:bg-surface-muted/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          className,
        )}
        {...rest}
      >
        <span className="min-w-0 flex-1">{children}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'h-4 w-4 shrink-0 text-foreground-muted transition-transform duration-200',
            item.open && 'rotate-180',
          )}
        />
      </button>
    </h3>
  );
}

/* --------------- AccordionContent --------------- */

export function AccordionContent({
  ref,
  className,
  forceMount,
  children,
  ...rest
}: AccordionContentProps) {
  const ctx = useAccordionContext('AccordionContent');
  const item = useItemContext('AccordionContent');

  if (!item.open && forceMount !== true && !ctx.isPrinting) return null;

  return (
    <div
      ref={ref}
      id={item.contentId}
      role="region"
      aria-labelledby={item.triggerId}
      hidden={!item.open && !ctx.isPrinting}
      className={cn('px-4 pb-4 pt-0 text-sm text-foreground-muted', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
