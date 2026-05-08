import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useId } from '@/hooks/useId';

describe('useId', () => {
  it('returns a stable id across renders', () => {
    const { result, rerender } = renderHook(() => useId());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('applies the prefix when provided', () => {
    const { result } = renderHook(() => useId('btn'));
    expect(result.current.startsWith('btn-')).toBe(true);
  });

  it('returns unique ids for separate hook instances', () => {
    const a = renderHook(() => useId());
    const b = renderHook(() => useId());
    expect(a.result.current).not.toBe(b.result.current);
  });
});
