import type { ReactElement } from 'react';
import type {
  ActiveFilter,
  FilterDef,
  FilterValue,
  UseFilterableSearchReturn,
} from '@/hooks/useFilterableSearch';

export type { ActiveFilter, FilterDef, FilterOption, FilterValue } from '@/hooks/useFilterableSearch';

export interface FilterableSearchProps {
  /** Search input controlled value. */
  query?: string | undefined;
  defaultQuery?: string | undefined;
  onQueryChange?: ((q: string) => void) | undefined;
  /** Debounce window for onQueryChange (does not affect input echo). Default 250ms. */
  debounceMs?: number | undefined;

  filters: ReadonlyArray<FilterDef>;
  activeFilters?: ReadonlyArray<ActiveFilter> | undefined;
  defaultActiveFilters?: ReadonlyArray<ActiveFilter> | undefined;
  onActiveFiltersChange?: ((next: ReadonlyArray<ActiveFilter>) => void) | undefined;

  placeholder?: string;
  /** Fires on Enter inside the search input with the current (raw) query. */
  onSubmit?: ((query: string) => void) | undefined;

  /** Hide the "Add filter" button entirely. */
  hideAddFilter?: boolean;
  className?: string;
  /** Aria-label for the search input. */
  'aria-label'?: string;
}

export interface FilterChipProps {
  filter: ActiveFilter;
  def: FilterDef;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onChange: (value: FilterValue) => void;
  onRemove: () => void;
}

export interface FilterMenuProps {
  filters: ReadonlyArray<FilterDef>;
  onSelect: (id: string) => void;
  disabled?: boolean;
  /** Optional custom trigger element (must be a single ReactElement). */
  trigger?: ReactElement;
}

export interface FilterableSearchSlotProps {
  state: UseFilterableSearchReturn;
}
