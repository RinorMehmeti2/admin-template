import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  useRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '@/lib/cn';
import { useId } from '@/hooks/useId';
import { useControllableState } from '@/hooks/useControllableState';
import { usePrintMode } from '@/hooks/usePrintMode';
import { RovingFocusGroup, useRovingFocusItem } from '@/hooks/useRovingFocus';

export type TabsVariant = 'underline' | 'pills' | 'segmented';
export type TabsOrientation = 'horizontal' | 'vertical';

interface TabsContextValue {
  value: string | undefined;
  setValue: (value: string) => void;
  baseId: string;
  orientation: TabsOrientation;
  variant: TabsVariant;
  isPrinting: boolean;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(part: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (ctx === null) throw new Error(`<${part}> must be used inside <Tabs>`);
  return ctx;
}

export interface TabsProps {
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  orientation?: TabsOrientation;
  variant?: TabsVariant;
  children: ReactNode;
  className?: string;
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  variant = 'underline',
  children,
  className,
}: TabsProps) {
  const [val, setVal] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const baseId = useId('tabs');
  const isPrinting = usePrintMode();

  const ctx = useMemo<TabsContextValue>(
    () => ({
      value: val,
      setValue: (v: string) => setVal(v),
      baseId,
      orientation,
      variant,
      isPrinting,
    }),
    [val, setVal, baseId, orientation, variant, isPrinting],
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div
        className={cn(orientation === 'vertical' && 'flex gap-6', className)}
        data-orientation={orientation}
        data-print="expand"
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/* --------------- TabsList --------------- */

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export function TabsList({ ref, className, children, ...rest }: TabsListProps) {
  const ctx = useTabsContext('TabsList');
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <RovingFocusGroup orientation={ctx.orientation} loop>
      <div
        ref={ref}
        role="tablist"
        data-print="hide"
        aria-orientation={ctx.orientation}
        className={cn(
          'flex',
          ctx.variant === 'underline' &&
            (ctx.orientation === 'horizontal'
              ? 'border-b border-border'
              : 'flex-col border-r border-border'),
          ctx.variant === 'pills' && 'gap-1',
          ctx.variant === 'segmented' && 'gap-1 rounded-md bg-surface-muted p-1',
          ctx.orientation === 'vertical' && ctx.variant !== 'underline' && 'flex-col',
          className,
        )}
        {...rest}
      >
        {items.map((child, i) =>
          cloneElement(child as ReactElement<{ __rovingIndex?: number }>, {
            __rovingIndex: i,
          }),
        )}
      </div>
    </RovingFocusGroup>
  );
}

/* --------------- TabsTrigger --------------- */

export interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  /** @internal — set by TabsList */
  __rovingIndex?: number;
}

export function TabsTrigger({
  value,
  disabled,
  children,
  className,
  __rovingIndex = 0,
}: TabsTriggerProps) {
  const ctx = useTabsContext('TabsTrigger');
  const ref = useRef<HTMLButtonElement>(null);
  const { onKeyDown, onFocus } = useRovingFocusItem(__rovingIndex, ref);

  const isActive = ctx.value === value;
  const triggerId = `${ctx.baseId}-trigger-${value}`;
  const panelId = `${ctx.baseId}-panel-${value}`;

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={triggerId}
      aria-selected={isActive}
      aria-controls={panelId}
      // tabindex follows aria-selected, not roving's activeIndex
      tabIndex={isActive ? 0 : -1}
      disabled={disabled === true}
      onClick={() => {
        if (disabled !== true) ctx.setValue(value);
      }}
      onKeyDown={onKeyDown}
      onFocus={() => {
        onFocus();
        // Automatic activation pattern: focus = activate.
        if (disabled !== true) ctx.setValue(value);
      }}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        ctx.variant === 'underline' &&
          (ctx.orientation === 'horizontal'
            ? cn(
                'border-b-2 px-4 py-2 -mb-px',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-foreground-muted hover:text-foreground',
              )
            : cn(
                'border-r-2 px-4 py-2 -mr-px',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-foreground-muted hover:text-foreground',
              )),
        ctx.variant === 'pills' &&
          cn(
            'rounded-md px-3 py-1.5',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground',
          ),
        ctx.variant === 'segmented' &&
          cn(
            'rounded px-3 py-1',
            isActive
              ? 'bg-surface text-foreground shadow-sm'
              : 'text-foreground-muted hover:text-foreground',
          ),
        className,
      )}
    >
      {children}
    </button>
  );
}

/* --------------- TabsContent --------------- */

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  value: string;
  /** Render even when inactive (kept hidden via `hidden`). Default: unmount. */
  forceMount?: boolean;
}

export function TabsContent({
  ref,
  value,
  forceMount,
  className,
  children,
  ...rest
}: TabsContentProps) {
  const ctx = useTabsContext('TabsContent');
  const isActive = ctx.value === value;
  const panelId = `${ctx.baseId}-panel-${value}`;
  const triggerId = `${ctx.baseId}-trigger-${value}`;

  if (!isActive && forceMount !== true && !ctx.isPrinting) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      id={panelId}
      aria-labelledby={triggerId}
      tabIndex={0}
      hidden={!isActive && !ctx.isPrinting}
      className={cn(
        'flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md',
        ctx.orientation === 'horizontal' ? 'mt-4' : '',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
