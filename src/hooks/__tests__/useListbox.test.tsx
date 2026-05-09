import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useListbox } from '@/hooks/useListbox';

interface KeyOpts {
  shiftKey?: boolean;
}
function k(key: string, opts: KeyOpts = {}): React.KeyboardEvent {
  return {
    key,
    shiftKey: opts.shiftKey === true,
    preventDefault: vi.fn(),
  } as unknown as React.KeyboardEvent;
}

describe('useListbox', () => {
  it('exposes a listboxId and option ids derived from it', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useListbox({
        items: ['a', 'b'],
        getItemValue: (s) => s,
        onSelect,
      }),
    );
    const lb = result.current.getListboxProps();
    expect(lb.role).toBe('listbox');
    expect(lb.id).toMatch(/listbox/);
    expect(result.current.getItemProps(0).id).toBe(`${lb.id}-option-0`);
  });

  it('reports the active option via aria-activedescendant', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useListbox({
        items: ['a', 'b', 'c'],
        getItemValue: (s) => s,
        onSelect,
      }),
    );
    expect(result.current.getListboxProps()['aria-activedescendant']).toBe(
      result.current.getItemProps(0).id,
    );
    act(() => result.current.setActiveIndex(2));
    expect(result.current.getListboxProps()['aria-activedescendant']).toBe(
      result.current.getItemProps(2).id,
    );
  });

  it('marks data-active on the focused option only', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useListbox({ items: ['a', 'b', 'c'], getItemValue: (s) => s, onSelect }),
    );
    act(() => result.current.setActiveIndex(1));
    expect(result.current.getItemProps(0)['data-active']).toBe(false);
    expect(result.current.getItemProps(1)['data-active']).toBe(true);
    expect(result.current.getItemProps(2)['data-active']).toBe(false);
  });

  it('isSelected works for single-value mode', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useListbox({
        items: ['a', 'b'],
        getItemValue: (s) => s,
        selectedValue: 'b',
        onSelect,
      }),
    );
    expect(result.current.isSelected('a')).toBe(false);
    expect(result.current.isSelected('b')).toBe(true);
  });

  it('isSelected works for multi-value mode', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useListbox({
        items: ['a', 'b', 'c'],
        getItemValue: (s) => s,
        selectedValue: ['a', 'c'],
        multiple: true,
        onSelect,
      }),
    );
    expect(result.current.isSelected('a')).toBe(true);
    expect(result.current.isSelected('b')).toBe(false);
    expect(result.current.isSelected('c')).toBe(true);
  });

  it('arrow keys move active and wrap', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useListbox({ items: ['a', 'b', 'c'], getItemValue: (s) => s, onSelect }),
    );
    act(() => result.current.onKeyDown(k('ArrowDown')));
    expect(result.current.activeIndex).toBe(1);
    act(() => result.current.onKeyDown(k('ArrowDown')));
    act(() => result.current.onKeyDown(k('ArrowDown')));
    // wraps from 2 → 0
    expect(result.current.activeIndex).toBe(0);
    act(() => result.current.onKeyDown(k('ArrowUp')));
    // wraps from 0 → 2
    expect(result.current.activeIndex).toBe(2);
  });

  it('Home / End jump to first / last', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useListbox({ items: ['a', 'b', 'c'], getItemValue: (s) => s, onSelect }),
    );
    act(() => result.current.onKeyDown(k('End')));
    expect(result.current.activeIndex).toBe(2);
    act(() => result.current.onKeyDown(k('Home')));
    expect(result.current.activeIndex).toBe(0);
  });

  it('Enter calls onSelect with the active item', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useListbox({ items: ['a', 'b', 'c'], getItemValue: (s) => s, onSelect }),
    );
    act(() => result.current.setActiveIndex(2));
    act(() => result.current.onKeyDown(k('Enter')));
    expect(onSelect).toHaveBeenCalledWith('c');
  });

  it('Space also selects (consumer can filter for inputs)', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useListbox({ items: ['a', 'b'], getItemValue: (s) => s, onSelect }),
    );
    act(() => result.current.onKeyDown(k(' ')));
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('clamps active index when items shrink', () => {
    const onSelect = vi.fn();
    const { result, rerender } = renderHook(
      ({ items }: { items: string[] }) => useListbox({ items, getItemValue: (s) => s, onSelect }),
      { initialProps: { items: ['a', 'b', 'c'] } },
    );
    act(() => result.current.setActiveIndex(2));
    expect(result.current.activeIndex).toBe(2);
    rerender({ items: ['a'] });
    expect(result.current.activeIndex).toBe(0);
  });

  it('returns -1 active and no aria-activedescendant when items is empty', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useListbox({ items: [] as string[], getItemValue: (s) => s, onSelect }),
    );
    expect(result.current.activeIndex).toBe(-1);
    expect(result.current.getListboxProps()['aria-activedescendant']).toBeUndefined();
  });
});
