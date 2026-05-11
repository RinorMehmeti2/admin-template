import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useFilterableSearch,
  type FilterDef,
} from '@/hooks/useFilterableSearch';

const FILTERS: ReadonlyArray<FilterDef> = [
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'archived', label: 'Archived' },
    ],
  },
  {
    id: 'tags',
    label: 'Tags',
    type: 'multi-select',
    options: [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ],
  },
  { id: 'note', label: 'Note', type: 'text' },
  { id: 'created', label: 'Created', type: 'date-range' },
];

describe('useFilterableSearch', () => {
  it('seeds query and activeFilters from defaults', () => {
    const { result } = renderHook(() =>
      useFilterableSearch({
        filters: FILTERS,
        defaultQuery: 'hello',
        defaultActiveFilters: [{ id: 'status', value: 'active' }],
      }),
    );
    expect(result.current.query).toBe('hello');
    expect(result.current.activeFilters).toEqual([{ id: 'status', value: 'active' }]);
  });

  it('debounces query updates', () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() =>
        useFilterableSearch({ filters: FILTERS, debounceMs: 100 }),
      );
      expect(result.current.debouncedQuery).toBe('');
      act(() => result.current.setQuery('ab'));
      expect(result.current.query).toBe('ab');
      expect(result.current.debouncedQuery).toBe('');
      act(() => {
        vi.advanceTimersByTime(99);
      });
      expect(result.current.debouncedQuery).toBe('');
      act(() => {
        vi.advanceTimersByTime(2);
      });
      expect(result.current.debouncedQuery).toBe('ab');
    } finally {
      vi.useRealTimers();
    }
  });

  it('addFilter seeds an empty value per type', () => {
    const { result } = renderHook(() => useFilterableSearch({ filters: FILTERS }));
    act(() => result.current.addFilter('status'));
    act(() => result.current.addFilter('tags'));
    act(() => result.current.addFilter('note'));
    act(() => result.current.addFilter('created'));
    expect(result.current.activeFilters).toEqual([
      { id: 'status', value: '' },
      { id: 'tags', value: [] },
      { id: 'note', value: '' },
      { id: 'created', value: { from: null, to: null } },
    ]);
  });

  it('addFilter ignores unknown id and duplicates', () => {
    const { result } = renderHook(() => useFilterableSearch({ filters: FILTERS }));
    act(() => result.current.addFilter('status'));
    act(() => result.current.addFilter('status'));
    act(() => result.current.addFilter('does-not-exist'));
    expect(result.current.activeFilters).toHaveLength(1);
  });

  it('removeFilter and updateFilter work', () => {
    const { result } = renderHook(() => useFilterableSearch({ filters: FILTERS }));
    act(() => result.current.addFilter('status'));
    act(() => result.current.updateFilter('status', 'active'));
    expect(result.current.activeFilters).toEqual([{ id: 'status', value: 'active' }]);
    act(() => result.current.removeFilter('status'));
    expect(result.current.activeFilters).toEqual([]);
  });

  it('availableFilters excludes active', () => {
    const { result } = renderHook(() => useFilterableSearch({ filters: FILTERS }));
    expect(result.current.availableFilters).toHaveLength(4);
    act(() => result.current.addFilter('status'));
    expect(result.current.availableFilters.map((f) => f.id)).toEqual(['tags', 'note', 'created']);
  });

  it('editor open/close/toggle', () => {
    const { result } = renderHook(() => useFilterableSearch({ filters: FILTERS }));
    expect(result.current.editorOpenId).toBeNull();
    act(() => result.current.openEditor('status'));
    expect(result.current.editorOpenId).toBe('status');
    act(() => result.current.toggleEditor('status'));
    expect(result.current.editorOpenId).toBeNull();
    act(() => result.current.toggleEditor('tags'));
    expect(result.current.editorOpenId).toBe('tags');
    act(() => result.current.closeEditor());
    expect(result.current.editorOpenId).toBeNull();
  });

  it('controlled activeFilters notifies onActiveFiltersChange', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ active }: { active: { id: string; value: unknown }[] }) =>
        useFilterableSearch({
          filters: FILTERS,
          activeFilters: active as never,
          onActiveFiltersChange: onChange,
        }),
      { initialProps: { active: [] as { id: string; value: unknown }[] } },
    );
    act(() => result.current.addFilter('status', 'active'));
    expect(onChange).toHaveBeenCalledWith([{ id: 'status', value: 'active' }]);
    rerender({ active: [{ id: 'status', value: 'active' }] });
    expect(result.current.activeFilters).toEqual([{ id: 'status', value: 'active' }]);
  });

  it('controlled query notifies onQueryChange after debounce', () => {
    vi.useFakeTimers();
    try {
      const onChange = vi.fn();
      const { result, rerender } = renderHook(
        ({ q }: { q: string }) =>
          useFilterableSearch({
            filters: FILTERS,
            query: q,
            onQueryChange: onChange,
            debounceMs: 50,
          }),
        { initialProps: { q: '' } },
      );
      act(() => result.current.setQuery('x'));
      expect(result.current.query).toBe('x');
      expect(onChange).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(60);
      });
      expect(onChange).toHaveBeenCalledWith('x');
      rerender({ q: 'x' });
      expect(result.current.query).toBe('x');
    } finally {
      vi.useRealTimers();
    }
  });
});
