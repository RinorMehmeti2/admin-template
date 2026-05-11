import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useControllableState } from './useControllableState';
import { useDebouncedValue } from './useDebouncedValue';

export type FilterValue =
  | string
  | ReadonlyArray<string>
  | { from: Date | null; to: Date | null }
  | null
  | undefined;

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDef {
  id: string;
  label: string;
  type: 'select' | 'multi-select' | 'text' | 'date-range';
  options?: ReadonlyArray<FilterOption>;
  placeholder?: string;
}

export interface ActiveFilter {
  id: string;
  value: FilterValue;
}

export interface UseFilterableSearchOptions {
  query?: string | undefined;
  defaultQuery?: string | undefined;
  onQueryChange?: ((q: string) => void) | undefined;
  debounceMs?: number | undefined;
  filters: ReadonlyArray<FilterDef>;
  activeFilters?: ReadonlyArray<ActiveFilter> | undefined;
  defaultActiveFilters?: ReadonlyArray<ActiveFilter> | undefined;
  onActiveFiltersChange?: ((next: ReadonlyArray<ActiveFilter>) => void) | undefined;
}

export interface UseFilterableSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  debouncedQuery: string;

  filters: ReadonlyArray<FilterDef>;
  activeFilters: ReadonlyArray<ActiveFilter>;
  availableFilters: ReadonlyArray<FilterDef>;
  addFilter: (id: string, value?: FilterValue) => void;
  removeFilter: (id: string) => void;
  updateFilter: (id: string, value: FilterValue) => void;
  getFilterDef: (id: string) => FilterDef | undefined;

  editorOpenId: string | null;
  openEditor: (id: string) => void;
  closeEditor: () => void;
  toggleEditor: (id: string) => void;
}

function emptyValueFor(def: FilterDef): FilterValue {
  switch (def.type) {
    case 'multi-select':
      return [];
    case 'date-range':
      return { from: null, to: null };
    case 'select':
    case 'text':
      return '';
  }
}

export function useFilterableSearch(
  options: UseFilterableSearchOptions,
): UseFilterableSearchReturn {
  const {
    query: queryProp,
    defaultQuery = '',
    onQueryChange,
    debounceMs = 250,
    filters,
    activeFilters: activeFiltersProp,
    defaultActiveFilters,
    onActiveFiltersChange,
  } = options;

  // Input echoes immediately via local state. `onQueryChange` is fired
  // debounced (spec). In controlled mode, when `queryProp` changes
  // externally we mirror it into local state.
  const isControlled = queryProp !== undefined;
  const [localQuery, setLocalQuery] = useState<string>(queryProp ?? defaultQuery ?? '');
  const [lastExternal, setLastExternal] = useState<string | undefined>(queryProp);
  if (isControlled && queryProp !== lastExternal) {
    setLastExternal(queryProp);
    setLocalQuery(queryProp ?? '');
  }
  const query = localQuery;
  const setQuery = useCallback((q: string) => setLocalQuery(q), []);
  const debouncedQuery = useDebouncedValue(query, debounceMs);

  // Fire debounced onQueryChange after first settled change (not on mount).
  const firstFire = useRef(true);
  const onQueryChangeRef = useRef(onQueryChange);
  useEffect(() => {
    onQueryChangeRef.current = onQueryChange;
  });
  useEffect(() => {
    if (firstFire.current) {
      firstFire.current = false;
      return;
    }
    onQueryChangeRef.current?.(debouncedQuery);
  }, [debouncedQuery]);

  const [activeFiltersRaw, setActiveFiltersRaw] = useControllableState<
    ReadonlyArray<ActiveFilter>
  >({
    value: activeFiltersProp,
    defaultValue: defaultActiveFilters ?? [],
    onChange: onActiveFiltersChange,
  });
  const activeFilters = activeFiltersRaw ?? [];

  const getFilterDef = useCallback(
    (id: string) => filters.find((f) => f.id === id),
    [filters],
  );

  const availableFilters = useMemo(
    () => filters.filter((f) => !activeFilters.some((a) => a.id === f.id)),
    [filters, activeFilters],
  );

  const addFilter = useCallback(
    (id: string, value?: FilterValue) => {
      const def = filters.find((f) => f.id === id);
      if (def === undefined) return;
      if (activeFilters.some((a) => a.id === id)) return;
      const v = value !== undefined ? value : emptyValueFor(def);
      setActiveFiltersRaw([...activeFilters, { id, value: v }]);
    },
    [filters, activeFilters, setActiveFiltersRaw],
  );

  const removeFilter = useCallback(
    (id: string) => {
      setActiveFiltersRaw(activeFilters.filter((a) => a.id !== id));
    },
    [activeFilters, setActiveFiltersRaw],
  );

  const updateFilter = useCallback(
    (id: string, value: FilterValue) => {
      setActiveFiltersRaw(activeFilters.map((a) => (a.id === id ? { id, value } : a)));
    },
    [activeFilters, setActiveFiltersRaw],
  );

  const [editorOpenId, setEditorOpenId] = useState<string | null>(null);
  const openEditor = useCallback((id: string) => setEditorOpenId(id), []);
  const closeEditor = useCallback(() => setEditorOpenId(null), []);
  const toggleEditor = useCallback(
    (id: string) => setEditorOpenId((prev) => (prev === id ? null : id)),
    [],
  );

  return {
    query,
    setQuery,
    debouncedQuery,
    filters,
    activeFilters,
    availableFilters,
    addFilter,
    removeFilter,
    updateFilter,
    getFilterDef,
    editorOpenId,
    openEditor,
    closeEditor,
    toggleEditor,
  };
}
