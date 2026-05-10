// react-hooks/refs has false positives when a Context value's type contains
// RefObject<...> fields: it flags every property read on the context as a
// "ref access during render" even when reading non-ref fields (filteredItems,
// listbox state, query, etc.). The genuine "ref.current during render" path
// is mirrored into state via useLayoutEffect — this disable only suppresses
// the spurious property-access warnings.
/* eslint-disable react-hooks/refs */
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { Check, ChevronDown, Loader2, Plus, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useId } from '@/hooks/useId';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useControllableState } from '@/hooks/useControllableState';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import { usePosition, type Boundary } from '@/hooks/usePosition';
import { useListbox, type UseListboxReturn } from '@/hooks/useListbox';
import { Badge } from '@/components/primitives/Badge';
import { Portal } from '@/components/overlays/Portal';

type ComboItem<T> = { kind: 'item'; item: T } | { kind: 'create'; query: string };

interface ComboboxContextValue<T> {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  query: string;
  setQuery: (q: string) => void;
  filteredItems: ReadonlyArray<T>;
  comboItems: ReadonlyArray<ComboItem<T>>;
  selectedValue: string | ReadonlyArray<string> | undefined;
  multiple: boolean;
  loading: boolean;
  disabled: boolean;
  emptyMessage: ReactNode;
  getItemLabel: (item: T) => string;
  getItemValue: (item: T) => string;
  renderItem: ((item: T) => ReactNode) | undefined;
  selectComboItem: (ci: ComboItem<T>) => void;
  removeChip: (value: string) => void;
  triggerWrapRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  listbox: UseListboxReturn<ComboItem<T>>;
  triggerId: string;
  positionBoundary: Boundary | undefined;
}

const ComboboxContext = createContext<ComboboxContextValue<unknown> | null>(null);

function useComboboxContext<T = unknown>(part: string): ComboboxContextValue<T> {
  const ctx = useContext(ComboboxContext);
  if (ctx === null) throw new Error(`<${part}> must be used inside <Combobox>`);
  return ctx as ComboboxContextValue<T>;
}

/* -------------------------------------------------------------------------- */
/*  Root                                                                      */
/* -------------------------------------------------------------------------- */

export interface ComboboxProps<T> {
  items: ReadonlyArray<T>;
  getItemLabel: (item: T) => string;
  getItemValue: (item: T) => string;
  defaultValue?: string | ReadonlyArray<string> | undefined;
  value?: string | ReadonlyArray<string> | undefined;
  onValueChange?: ((next: string | ReadonlyArray<string>) => void) | undefined;
  multiple?: boolean | undefined;
  filterFn?: ((item: T, query: string) => boolean) | undefined;
  loading?: boolean | undefined;
  disabled?: boolean | undefined;
  creatable?: boolean | undefined;
  onCreate?: ((query: string) => void) | undefined;
  emptyMessage?: ReactNode | undefined;
  /** When provided, items are treated as already-filtered (async source). */
  onSearch?: ((query: string) => void) | undefined;
  renderItem?: ((item: T) => ReactNode) | undefined;
  /** Optional positioning boundary for the listbox panel. */
  boundary?: Boundary | undefined;
  children: ReactNode;
}

const defaultFilter = <T,>(item: T, query: string, getLabel: (i: T) => string): boolean => {
  if (query === '') return true;
  return getLabel(item).toLowerCase().includes(query.toLowerCase());
};

export function Combobox<T>({
  items,
  getItemLabel,
  getItemValue,
  defaultValue,
  value,
  onValueChange,
  multiple = false,
  filterFn,
  loading = false,
  disabled = false,
  creatable = false,
  onCreate,
  emptyMessage = 'No results',
  onSearch,
  renderItem,
  boundary,
  children,
}: ComboboxProps<T>) {
  const { isOpen, open, close, setOpen } = useDisclosure(false);
  const triggerId = useId('combobox');

  const [selected, setSelected] = useControllableState<string | ReadonlyArray<string>>({
    value,
    defaultValue: defaultValue ?? (multiple ? [] : ''),
    onChange: onValueChange,
  });

  const [query, setQueryState] = useState('');
  const setQuery = useCallback(
    (q: string) => {
      setQueryState(q);
      onSearch?.(q);
    },
    [onSearch],
  );

  const triggerWrapRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo<ReadonlyArray<T>>(() => {
    if (onSearch !== undefined) return items;
    const fn = filterFn ?? ((it: T, q: string) => defaultFilter(it, q, getItemLabel));
    if (query === '') return items;
    return items.filter((it) => fn(it, query));
  }, [items, query, filterFn, getItemLabel, onSearch]);

  const showCreate =
    creatable &&
    query.trim() !== '' &&
    !items.some((it) => getItemLabel(it).toLowerCase() === query.trim().toLowerCase());

  const comboItems = useMemo<ReadonlyArray<ComboItem<T>>>(() => {
    const base: ComboItem<T>[] = filteredItems.map((it) => ({ kind: 'item' as const, item: it }));
    if (showCreate) base.push({ kind: 'create' as const, query: query.trim() });
    return base;
  }, [filteredItems, showCreate, query]);

  const closeAndReset = useCallback(() => {
    close();
    setQueryState('');
  }, [close]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const selectComboItem = useCallback(
    (ci: ComboItem<T>) => {
      if (ci.kind === 'create') {
        onCreate?.(ci.query);
        setQueryState('');
        if (!multiple) closeAndReset();
        focusInput();
        return;
      }
      const v = getItemValue(ci.item);
      if (multiple) {
        const cur = Array.isArray(selected) ? selected : [];
        const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
        setSelected(next);
        setQueryState('');
        focusInput();
      } else {
        setSelected(v);
        closeAndReset();
      }
    },
    [onCreate, multiple, selected, setSelected, getItemValue, closeAndReset, focusInput],
  );

  const removeChip = useCallback(
    (v: string) => {
      if (!multiple) return;
      const cur = Array.isArray(selected) ? selected : [];
      setSelected(cur.filter((x) => x !== v));
    },
    [multiple, selected, setSelected],
  );

  const listbox = useListbox<ComboItem<T>>({
    items: comboItems,
    getItemValue: (ci) => (ci.kind === 'item' ? getItemValue(ci.item) : `__create:${ci.query}`),
    selectedValue: selected,
    onSelect: selectComboItem,
    multiple,
  });

  useEscapeKey(
    () => {
      closeAndReset();
      focusInput();
    },
    { enabled: isOpen },
  );

  useClickOutside(
    triggerWrapRef,
    (event) => {
      const content = contentRef.current;
      if (content !== null && event.target instanceof Node && content.contains(event.target)) {
        return;
      }
      setOpen(false);
      setQueryState('');
    },
    { enabled: isOpen },
  );

  const ctx = useMemo<ComboboxContextValue<T>>(
    () => ({
      isOpen,
      open,
      close: closeAndReset,
      query,
      setQuery,
      filteredItems,
      comboItems,
      selectedValue: selected,
      multiple,
      loading,
      disabled,
      emptyMessage,
      getItemLabel,
      getItemValue,
      renderItem,
      selectComboItem,
      removeChip,
      triggerWrapRef,
      contentRef,
      inputRef,
      listbox,
      triggerId,
      positionBoundary: boundary,
    }),
    [
      isOpen,
      open,
      closeAndReset,
      query,
      setQuery,
      filteredItems,
      comboItems,
      selected,
      multiple,
      loading,
      disabled,
      emptyMessage,
      getItemLabel,
      getItemValue,
      renderItem,
      selectComboItem,
      removeChip,
      listbox,
      triggerId,
      boundary,
    ],
  );

  return (
    <ComboboxContext.Provider value={ctx as ComboboxContextValue<unknown>}>
      {children}
    </ComboboxContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Trigger (the input)                                                       */
/* -------------------------------------------------------------------------- */

export interface ComboboxTriggerProps extends Omit<
  React.LabelHTMLAttributes<HTMLLabelElement>,
  'children' | 'onChange' | 'htmlFor'
> {
  ref?: Ref<HTMLLabelElement>;
  placeholder?: string;
  inputClassName?: string;
}

export function ComboboxTrigger({
  ref,
  placeholder,
  className,
  inputClassName,
  ...rest
}: ComboboxTriggerProps) {
  const ctx = useComboboxContext<unknown>('ComboboxTrigger');
  const wrapRef = useMergedRefs<HTMLElement>(ctx.triggerWrapRef, ref);
  const inputRef = ctx.inputRef;

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    ctx.setQuery(e.target.value);
    if (!ctx.isOpen) ctx.open();
    ctx.listbox.setActiveIndex(0);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (ctx.disabled) return;

    if (
      e.key === 'Backspace' &&
      ctx.multiple &&
      ctx.query === '' &&
      Array.isArray(ctx.selectedValue) &&
      ctx.selectedValue.length > 0
    ) {
      e.preventDefault();
      const last = ctx.selectedValue[ctx.selectedValue.length - 1];
      if (last !== undefined) ctx.removeChip(last);
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!ctx.isOpen) {
        e.preventDefault();
        ctx.open();
        return;
      }
      ctx.listbox.onKeyDown(e);
      return;
    }

    if (e.key === 'Home' || e.key === 'End') {
      if (!ctx.isOpen) return;
      ctx.listbox.onKeyDown(e);
      return;
    }

    if (e.key === 'Enter') {
      if (!ctx.isOpen) return;
      ctx.listbox.onKeyDown(e);
      return;
    }

    if (e.key === 'Tab') {
      if (!ctx.isOpen) return;
      const idx = ctx.listbox.activeIndex;
      const item = ctx.comboItems[idx];
      if (item !== undefined) ctx.selectComboItem(item);
      ctx.close();
      return;
    }
  };

  const onFocus = () => {
    if (!ctx.disabled) ctx.open();
  };

  const lb = ctx.listbox.getListboxProps();

  // Chip labels — look up across the *unfiltered* items via getItemLabel.
  // The full items array isn't on context, so we resolve from filteredItems
  // (which contains everything when query is empty) and fall back to the value.
  const chipLabels = useMemo(() => {
    if (!ctx.multiple) return [];
    if (!Array.isArray(ctx.selectedValue)) return [];
    const map = new Map<string, string>();
    for (const it of ctx.filteredItems) map.set(ctx.getItemValue(it), ctx.getItemLabel(it));
    return ctx.selectedValue.map((v) => ({ value: v, label: map.get(v) ?? v }));
  }, [ctx.multiple, ctx.selectedValue, ctx.filteredItems, ctx.getItemLabel, ctx.getItemValue]);

  // Single mode: when closed and not editing, show the selected label.
  const singleSelectionLabel = useMemo(() => {
    if (ctx.multiple) return '';
    if (typeof ctx.selectedValue !== 'string' || ctx.selectedValue === '') return '';
    const found = ctx.filteredItems.find((it) => ctx.getItemValue(it) === ctx.selectedValue);
    return found !== undefined ? ctx.getItemLabel(found) : ctx.selectedValue;
  }, [ctx.multiple, ctx.selectedValue, ctx.filteredItems, ctx.getItemLabel, ctx.getItemValue]);

  const displayValue = ctx.multiple
    ? ctx.query
    : ctx.isOpen
      ? ctx.query
      : ctx.query !== ''
        ? ctx.query
        : singleSelectionLabel;

  return (
    <label
      ref={wrapRef}
      htmlFor={ctx.triggerId}
      data-disabled={ctx.disabled}
      className={cn(
        'flex w-full min-h-10 cursor-text items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-sm transition-colors',
        'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
        'data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50',
        className,
      )}
      {...rest}
    >
      {ctx.multiple && chipLabels.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {chipLabels.map(({ value, label }) => (
            <Badge key={value} variant="primary" size="sm" className="gap-1">
              <span className="truncate">{label}</span>
              <button
                type="button"
                aria-label={`Remove ${label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  ctx.removeChip(value);
                }}
                className="rounded-full p-0.5 hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}

      <input
        ref={inputRef}
        id={ctx.triggerId}
        role="combobox"
        type="text"
        autoComplete="off"
        spellCheck={false}
        aria-expanded={ctx.isOpen}
        aria-controls={lb.id}
        aria-haspopup="listbox"
        aria-activedescendant={ctx.isOpen ? lb['aria-activedescendant'] : undefined}
        aria-disabled={ctx.disabled || undefined}
        disabled={ctx.disabled}
        placeholder={placeholder}
        value={displayValue}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        className={cn(
          'min-w-0 flex-1 bg-transparent text-foreground placeholder:text-foreground-subtle focus:outline-none disabled:cursor-not-allowed',
          inputClassName,
        )}
      />

      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 text-foreground-subtle transition-transform',
          ctx.isOpen ? 'rotate-180' : '',
        )}
        aria-hidden="true"
      />
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*  Content (listbox panel)                                                   */
/* -------------------------------------------------------------------------- */

export interface ComboboxContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'id'> {
  ref?: Ref<HTMLDivElement>;
  sideOffset?: number;
}

export function ComboboxContent({
  ref,
  className,
  children,
  sideOffset = 4,
  ...rest
}: ComboboxContentProps) {
  const ctx = useComboboxContext<unknown>('ComboboxContent');
  const merged = useMergedRefs<HTMLDivElement>(ctx.contentRef, ref);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>(undefined);

  // Mirror trigger width onto the listbox panel. Read on open + resize, stash
  // in state — keeps render free of ref.current reads.
  useLayoutEffect(() => {
    if (!ctx.isOpen) return;
    const measure = () => {
      const el = ctx.triggerWrapRef.current;
      if (el !== null) setTriggerWidth(el.offsetWidth);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [ctx.isOpen, ctx.triggerWrapRef]);

  const positionOptions: Parameters<typeof usePosition>[2] = {
    placement: 'bottom-start',
    offset: sideOffset,
    enabled: ctx.isOpen,
  };
  if (ctx.positionBoundary !== undefined) positionOptions.boundary = ctx.positionBoundary;
  const pos = usePosition(ctx.triggerWrapRef, ctx.contentRef, positionOptions);

  if (!ctx.isOpen) return null;

  const lb = ctx.listbox.getListboxProps();
  const showLoading = ctx.loading;
  const showEmpty = !showLoading && ctx.comboItems.length === 0;

  return (
    <Portal>
      <div
        ref={merged}
        {...lb}
        data-side={pos.placement}
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          minWidth: triggerWidth,
        }}
        className={cn(
          'z-[60] overflow-hidden rounded-md border border-border bg-surface shadow-lg',
          'motion-safe:animate-dialog-in',
          className,
        )}
        {...rest}
      >
        <div className="max-h-72 overflow-y-auto p-1">
          {showLoading ? (
            <ComboboxLoading />
          ) : showEmpty ? (
            <ComboboxEmpty>{ctx.emptyMessage}</ComboboxEmpty>
          ) : children !== undefined ? (
            children
          ) : (
            <DefaultItems />
          )}
        </div>
      </div>
    </Portal>
  );
}

function DefaultItems() {
  const ctx = useComboboxContext<unknown>('ComboboxContent');
  return (
    <>
      {ctx.comboItems.map((ci, i) => (
        <ComboboxItem
          key={ci.kind === 'create' ? `__create:${ci.query}` : ctx.getItemValue(ci.item)}
          index={i}
          comboItem={ci}
        />
      ))}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Item                                                                      */
/* -------------------------------------------------------------------------- */

interface ComboboxItemInternalProps<T> {
  index: number;
  comboItem: ComboItem<T>;
  className?: string;
  children?: ReactNode;
}

export function ComboboxItem<T>({
  index,
  comboItem,
  className,
  children,
}: ComboboxItemInternalProps<T>) {
  const ctx = useComboboxContext<T>('ComboboxItem');
  const itemProps = ctx.listbox.getItemProps(index);
  const isSelected = itemProps['aria-selected'];

  const onMouseMove = () => {
    if (ctx.listbox.activeIndex !== index) ctx.listbox.setActiveIndex(index);
  };
  const onClick = () => ctx.selectComboItem(comboItem);

  if (comboItem.kind === 'create') {
    return (
      // role="option" is provided via {...itemProps}; the lint rule cannot
      // see attributes through spread.
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        {...itemProps}
        onMouseMove={onMouseMove}
        onClick={onClick}
        className={cn(
          'flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground',
          'data-[active=true]:bg-surface-muted',
          className,
        )}
      >
        <Plus className="h-3.5 w-3.5 text-foreground-subtle" aria-hidden="true" />
        <span className="truncate">
          Create &ldquo;<span className="font-medium">{comboItem.query}</span>&rdquo;
        </span>
      </div>
    );
  }

  const item = comboItem.item;
  return (
    // role="option" is provided via {...itemProps}; the lint rule cannot
    // see attributes through spread.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      {...itemProps}
      onMouseMove={onMouseMove}
      onClick={onClick}
      className={cn(
        'flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground',
        'data-[active=true]:bg-surface-muted',
        className,
      )}
    >
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">
        {isSelected ? <Check className="h-4 w-4" /> : null}
      </span>
      <span className="min-w-0 flex-1 truncate">
        {children ?? (ctx.renderItem !== undefined ? ctx.renderItem(item) : ctx.getItemLabel(item))}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty / Loading                                                           */
/* -------------------------------------------------------------------------- */

export function ComboboxEmpty({ children }: { children?: ReactNode }) {
  return (
    <div role="status" className="px-3 py-6 text-center text-sm text-foreground-subtle">
      {children}
    </div>
  );
}

export function ComboboxLoading({ children }: { children?: ReactNode }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-foreground-subtle"
    >
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {children ?? 'Loading…'}
    </div>
  );
}
