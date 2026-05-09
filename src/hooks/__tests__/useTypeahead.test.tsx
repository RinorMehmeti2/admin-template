import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTypeahead } from '@/hooks/useTypeahead';

interface KeyOpts {
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
}
function k(key: string, opts: KeyOpts = {}): React.KeyboardEvent {
  return {
    key,
    ctrlKey: opts.ctrlKey === true,
    metaKey: opts.metaKey === true,
    altKey: opts.altKey === true,
  } as unknown as React.KeyboardEvent;
}

describe('useTypeahead', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('matches the first item starting with the typed character', () => {
    const onMatch = vi.fn();
    const items = ['Apple', 'Banana', 'Cherry'];
    const { result } = renderHook(() => useTypeahead({ items, getItemValue: (s) => s, onMatch }));
    result.current.onKeyDown(k('b'));
    expect(onMatch).toHaveBeenCalledWith(1);
  });

  it('accumulates characters within the reset window', () => {
    const onMatch = vi.fn();
    const items = ['Cat', 'Car', 'Cup'];
    const { result } = renderHook(() =>
      useTypeahead({ items, getItemValue: (s) => s, onMatch, resetMs: 500 }),
    );
    result.current.onKeyDown(k('c'));
    result.current.onKeyDown(k('a'));
    result.current.onKeyDown(k('r'));
    expect(onMatch).toHaveBeenLastCalledWith(1);
  });

  it('resets the buffer after resetMs of inactivity', () => {
    const onMatch = vi.fn();
    const items = ['Cat', 'Car', 'Dog'];
    const { result } = renderHook(() =>
      useTypeahead({ items, getItemValue: (s) => s, onMatch, resetMs: 500 }),
    );
    result.current.onKeyDown(k('c'));
    vi.advanceTimersByTime(600);
    result.current.onKeyDown(k('d'));
    expect(onMatch).toHaveBeenLastCalledWith(2);
  });

  it('cycles through matches when the same single key is pressed', () => {
    const onMatch = vi.fn();
    const items = ['Apple', 'Avocado', 'Apricot'];
    let current = -1;
    const { result } = renderHook(() =>
      useTypeahead({
        items,
        getItemValue: (s) => s,
        onMatch: (i) => {
          current = i;
          onMatch(i);
        },
        getCurrentIndex: () => current,
      }),
    );
    result.current.onKeyDown(k('a'));
    expect(onMatch).toHaveBeenLastCalledWith(0);
    vi.advanceTimersByTime(600);
    result.current.onKeyDown(k('a'));
    expect(onMatch).toHaveBeenLastCalledWith(1);
    vi.advanceTimersByTime(600);
    result.current.onKeyDown(k('a'));
    expect(onMatch).toHaveBeenLastCalledWith(2);
  });

  it('is case-insensitive', () => {
    const onMatch = vi.fn();
    const { result } = renderHook(() =>
      useTypeahead({ items: ['BANANA'], getItemValue: (s) => s, onMatch }),
    );
    result.current.onKeyDown(k('b'));
    expect(onMatch).toHaveBeenCalledWith(0);
  });

  it('ignores modifier-key combos and non-printables', () => {
    const onMatch = vi.fn();
    const { result } = renderHook(() =>
      useTypeahead({ items: ['Apple'], getItemValue: (s) => s, onMatch }),
    );
    result.current.onKeyDown(k('a', { ctrlKey: true }));
    result.current.onKeyDown(k('ArrowDown'));
    result.current.onKeyDown(k(' '));
    expect(onMatch).not.toHaveBeenCalled();
  });

  it('does nothing when items is empty', () => {
    const onMatch = vi.fn();
    const { result } = renderHook(() =>
      useTypeahead({ items: [], getItemValue: (s) => s, onMatch }),
    );
    result.current.onKeyDown(k('a'));
    expect(onMatch).not.toHaveBeenCalled();
  });

  it('respects enabled=false', () => {
    const onMatch = vi.fn();
    const { result } = renderHook(() =>
      useTypeahead({
        items: ['Apple'],
        getItemValue: (s) => s,
        onMatch,
        enabled: false,
      }),
    );
    result.current.onKeyDown(k('a'));
    expect(onMatch).not.toHaveBeenCalled();
  });
});
