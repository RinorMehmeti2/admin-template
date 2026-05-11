import {
  useEffect,
  useRef,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type Ref,
} from 'react';
import { Plus, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  useFilterableSearch,
  type ActiveFilter,
  type FilterDef,
  type FilterValue,
} from '@/hooks/useFilterableSearch';
import { useId } from '@/hooks/useId';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import { usePosition } from '@/hooks/usePosition';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/primitives/Button';
import { Checkbox } from '@/components/forms/Checkbox';
import { DateRangePicker, type DateRange } from '@/components/forms/DateRangePicker';
import { Portal } from '@/components/overlays/Portal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';
import { formatDate } from '@/lib/date';
import type {
  FilterableSearchProps,
  FilterChipProps,
  FilterMenuProps,
} from './FilterableSearch.types';

/*
 * Compositional API. <FilterableSearch> renders the standard composition
 * (search input + chips + add menu). For custom layouts compose the parts
 * yourself with `useFilterableSearch`.
 */

export function FilterableSearch({
  query,
  defaultQuery,
  onQueryChange,
  debounceMs,
  filters,
  activeFilters,
  defaultActiveFilters,
  onActiveFiltersChange,
  placeholder,
  onSubmit,
  hideAddFilter = false,
  className,
  'aria-label': ariaLabel = 'Search',
}: FilterableSearchProps) {
  const state = useFilterableSearch({
    query,
    defaultQuery,
    onQueryChange,
    debounceMs,
    filters,
    activeFilters,
    defaultActiveFilters,
    onActiveFiltersChange,
  });

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit?.(state.query);
    }
  };

  return (
    <div
      role="search"
      aria-label={ariaLabel}
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      <Input
        type="search"
        inputSize="sm"
        aria-label={ariaLabel}
        placeholder={placeholder ?? 'Search…'}
        leftIcon={<Search className="h-4 w-4" />}
        value={state.query}
        onChange={(e: ChangeEvent<HTMLInputElement>) => state.setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        className="min-w-[12rem] max-w-sm flex-1"
      />

      {state.activeFilters.map((f) => {
        const def = state.getFilterDef(f.id);
        if (def === undefined) return null;
        return (
          <FilterChip
            key={f.id}
            filter={f}
            def={def}
            open={state.editorOpenId === f.id}
            onOpen={() => state.openEditor(f.id)}
            onClose={() => state.closeEditor()}
            onChange={(v) => state.updateFilter(f.id, v)}
            onRemove={() => state.removeFilter(f.id)}
          />
        );
      })}

      {!hideAddFilter ? (
        <FilterMenu
          filters={state.availableFilters}
          onSelect={(id) => {
            state.addFilter(id);
            state.openEditor(id);
          }}
          disabled={state.availableFilters.length === 0}
        />
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  FilterMenu                                                                */
/* -------------------------------------------------------------------------- */

export function FilterMenu({ filters, onSelect, disabled, trigger }: FilterMenuProps) {
  if (filters.length === 0 && trigger === undefined) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        leftIcon={<Plus className="h-4 w-4" />}
        disabled
        aria-label="Add filter"
      >
        Filter
      </Button>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {trigger ?? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            disabled={disabled}
            aria-label="Add filter"
          >
            Filter
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom-end">
        {filters.map((f) => (
          <DropdownMenuItem key={f.id} onSelect={() => onSelect(f.id)}>
            {f.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* -------------------------------------------------------------------------- */
/*  FilterChip                                                                */
/* -------------------------------------------------------------------------- */

function summarize(def: FilterDef, value: FilterValue): string {
  if (def.type === 'select') {
    if (typeof value !== 'string' || value === '') return 'any';
    const opt = def.options?.find((o) => o.value === value);
    return opt?.label ?? value;
  }
  if (def.type === 'multi-select') {
    if (!Array.isArray(value) || value.length === 0) return 'any';
    if (value.length === 1) {
      const opt = def.options?.find((o) => o.value === value[0]);
      return opt?.label ?? String(value[0]);
    }
    return `${value.length} selected`;
  }
  if (def.type === 'text') {
    if (typeof value !== 'string' || value === '') return 'any';
    return value;
  }
  if (def.type === 'date-range') {
    if (value === null || value === undefined || typeof value !== 'object' || Array.isArray(value)) {
      return 'any';
    }
    const range = value as { from: Date | null; to: Date | null };
    const f = range.from !== null ? formatDate(range.from, 'PP') : '…';
    const t = range.to !== null ? formatDate(range.to, 'PP') : '…';
    if (range.from === null && range.to === null) return 'any';
    return `${f} – ${t}`;
  }
  return 'any';
}

export function FilterChip({
  filter,
  def,
  open,
  onOpen,
  onClose,
  onChange,
  onRemove,
}: FilterChipProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const summary = summarize(def, filter.value);

  return (
    <span className="inline-flex">
      <span
        className={cn(
          'inline-flex items-center rounded-full border border-border bg-surface-muted text-xs font-medium',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
        )}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`Edit ${def.label} filter`}
          onClick={() => (open ? onClose() : onOpen())}
          className="flex items-center gap-1 rounded-full py-1 pl-3 pr-1 focus-visible:outline-none"
        >
          <span className="text-foreground-muted">{def.label}:</span>
          <span className="max-w-[14rem] truncate text-foreground">{summary}</span>
        </button>
        <button
          type="button"
          aria-label={`Remove ${def.label} filter`}
          onClick={onRemove}
          className="ml-0.5 mr-1 rounded-full p-0.5 text-foreground-muted hover:bg-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      </span>

      {open ? (
        <FilterEditorPopover
          triggerRef={triggerRef}
          def={def}
          value={filter.value}
          onChange={onChange}
          onClose={onClose}
        />
      ) : null}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Editor popover                                                            */
/* -------------------------------------------------------------------------- */

interface FilterEditorPopoverProps {
  triggerRef: React.RefObject<HTMLElement | null>;
  def: FilterDef;
  value: FilterValue;
  onChange: (next: FilterValue) => void;
  onClose: () => void;
  ref?: Ref<HTMLDivElement>;
}

function FilterEditorPopover({
  triggerRef,
  def,
  value,
  onChange,
  onClose,
  ref,
}: FilterEditorPopoverProps) {
  const internal = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs<HTMLDivElement>(internal, ref);
  const labelId = useId('filter-editor-label');

  const pos = usePosition(triggerRef, internal, {
    placement: 'bottom-start',
    offset: 6,
    enabled: true,
  });

  useEscapeKey(
    () => {
      onClose();
      (triggerRef.current as HTMLElement | null)?.focus();
    },
    { enabled: true },
  );

  useClickOutside([triggerRef, internal], () => onClose(), { enabled: true });

  // Focus first interactive element on open.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = internal.current?.querySelector<HTMLElement>(
        'input, [role="option"], button, [tabindex]:not([tabindex="-1"])',
      );
      el?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <Portal>
      <div
        ref={merged}
        role="dialog"
        aria-modal="false"
        aria-labelledby={labelId}
        data-side={pos.placement}
        style={{ position: 'absolute', left: pos.x, top: pos.y }}
        className="z-[60] w-64 rounded-md border border-border bg-surface p-3 shadow-lg motion-safe:animate-dialog-in"
      >
        <p id={labelId} className="mb-2 text-xs font-semibold text-foreground-subtle">
          {def.label}
        </p>
        <FilterEditorBody def={def} value={value} onChange={onChange} onClose={onClose} />
      </div>
    </Portal>
  );
}

function FilterEditorBody({
  def,
  value,
  onChange,
  onClose,
}: {
  def: FilterDef;
  value: FilterValue;
  onChange: (next: FilterValue) => void;
  onClose: () => void;
}) {
  if (def.type === 'select') {
    const current = typeof value === 'string' ? value : '';
    return (
      <div role="radiogroup" aria-label={def.label} className="flex flex-col gap-1">
        {(def.options ?? []).map((o) => {
          const checked = current === o.value;
          return (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-surface-muted"
            >
              <input
                type="radio"
                name={`filter-${def.id}`}
                checked={checked}
                onChange={() => {
                  onChange(o.value);
                  onClose();
                }}
                className="h-3.5 w-3.5"
              />
              <span>{o.label}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (def.type === 'multi-select') {
    const current = Array.isArray(value) ? value : [];
    const toggle = (v: string) => {
      const next = current.includes(v)
        ? current.filter((x) => x !== v)
        : [...current, v];
      onChange(next);
    };
    return (
      <div className="flex flex-col gap-1">
        {(def.options ?? []).map((o) => {
          const checked = current.includes(o.value);
          return (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-surface-muted"
            >
              <Checkbox checked={checked} onChange={() => toggle(o.value)} />
              <span>{o.label}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (def.type === 'text') {
    const current = typeof value === 'string' ? value : '';
    return (
      <Input
        inputSize="sm"
        aria-label={def.label}
        placeholder={def.placeholder}
        value={current}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onClose();
          }
        }}
      />
    );
  }

  // date-range
  const range: DateRange =
    value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value)
      ? (value as DateRange)
      : { from: null, to: null };
  return (
    <DateRangePicker
      value={range}
      onChange={(next) => onChange(next)}
      aria-label={def.label}
    />
  );
}

export type {
  ActiveFilter,
  FilterDef,
  FilterValue,
  FilterableSearchProps,
  FilterChipProps,
  FilterMenuProps,
};
