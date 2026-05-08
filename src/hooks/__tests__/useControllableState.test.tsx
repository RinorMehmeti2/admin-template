import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useControllableState } from '@/hooks/useControllableState';

describe('useControllableState', () => {
  it('uncontrolled: uses defaultValue and updates internally', () => {
    const { result } = renderHook(() => useControllableState<number>({ defaultValue: 5 }));
    expect(result.current[0]).toBe(5);
    act(() => result.current[1](10));
    expect(result.current[0]).toBe(10);
  });

  it('controlled: reflects value prop and calls onChange', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useControllableState<number>({ value, onChange }),
      { initialProps: { value: 1 } },
    );
    expect(result.current[0]).toBe(1);
    act(() => result.current[1](2));
    expect(onChange).toHaveBeenCalledWith(2);
    expect(result.current[0]).toBe(1);
    rerender({ value: 2 });
    expect(result.current[0]).toBe(2);
  });

  it('updater function works in uncontrolled mode', () => {
    const { result } = renderHook(() => useControllableState<number>({ defaultValue: 1 }));
    act(() => result.current[1]((v) => (v ?? 0) + 1));
    expect(result.current[0]).toBe(2);
  });

  it('updater function works in controlled mode', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState<number>({ value: 5, onChange }),
    );
    act(() => result.current[1]((v) => (v ?? 0) + 1));
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('latest onChange is used (ref-based)', () => {
    const a = vi.fn();
    const b = vi.fn();
    const { result, rerender } = renderHook(
      ({ onChange }: { onChange: (v: number) => void }) =>
        useControllableState<number>({ defaultValue: 0, onChange }),
      { initialProps: { onChange: a } },
    );
    rerender({ onChange: b });
    act(() => result.current[1](7));
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledWith(7);
  });
});
